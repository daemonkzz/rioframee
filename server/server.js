require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Helmet middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Proxy configuration (Required for rate limiting behind Nginx/Load Balancer)
app.set('trust proxy', 1);

// Security: CORS - Kısıtlı origin'ler
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
    origin: function (origin, callback) {
        // file:// protokolü için origin undefined olabilir
        if (!origin || allowedOrigins.some(allowed => origin.startsWith(allowed) || allowed === 'file://')) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy violation'));
        }
    },
    credentials: true
}));

// Security: Global Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına 100 istek
    message: { error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' }
});
app.use(globalLimiter);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), { maxAge: '30d' }));

// Data File Paths
const DATA_FILE = path.join(__dirname, 'data', 'projects.json');
const CONTACT_FILE = path.join(__dirname, 'data', 'contacts.json');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure directories exist
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Multer Storage Configuration
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir'));
        }
    }
});

// ===== HELPER FUNCTIONS =====

const readData = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const readContacts = () => {
    if (!fs.existsSync(CONTACT_FILE)) return [];
    const data = fs.readFileSync(CONTACT_FILE);
    return JSON.parse(data);
};

const writeContacts = (data) => {
    fs.writeFileSync(CONTACT_FILE, JSON.stringify(data, null, 2));
};

// HTML sanitization helper
const sanitizeHtml = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// ===== SECURITY MIDDLEWARE =====

// JWT Token doğrulama middleware
const authenticateToken = (req, res, next) => {
    console.log('[Auth Debug] All Headers:', JSON.stringify(req.headers, null, 2)); // FULL DEBUG
    const authHeader = req.headers['authorization'];
    console.log('[Auth] Header received:', authHeader); // DEBUG LOG
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Geçersiz veya süresi dolmuş token' });
        }
        req.user = user;
        next();
    });
};

// Login rate limiting - Brute force koruması
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5, // 5 deneme
    message: { error: 'Çok fazla giriş denemesi. 15 dakika bekleyin.' }
});

// Contact form rate limiting
const contactLimiter = rateLimit({
    windowMs: 3 * 1000, // 3 saniye
    max: 1,
    message: { error: 'Lütfen 3 saniye bekleyin.' }
});

// ===== ROUTES =====

// Login
app.post('/api/login', loginLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Geçersiz giriş bilgileri' });
    }

    const { email, password } = req.body;

    // Email kontrolü
    if (email !== process.env.ADMIN_EMAIL) {
        return res.status(401).json({ success: false, error: 'Giriş başarısız' });
    }

    // Şifre kontrolü - bcrypt ile
    const isValidPassword = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

    // Development modunda plain text şifre kontrolü de yap
    const isDevPassword = process.env.NODE_ENV === 'development' && password === 'rioframe2024';

    if (!isValidPassword && !isDevPassword) {
        return res.status(401).json({ success: false, error: 'Giriş başarısız' });
    }

    // JWT Token oluştur
    const token = jwt.sign(
        { email: email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({ success: true, token: token });
});

// Token doğrulama endpoint
app.get('/api/verify-token', authenticateToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// ===== PUBLIC ROUTES =====

// Get All Projects (Public - only active, sorted by order)
app.get('/api/projects', (req, res) => {
    const projects = readData();
    // Sadece aktif projeleri döndür (isActive undefined ise true kabul et)
    const activeProjects = projects.filter(p => p.isActive !== false);
    // Order'a göre sırala (order yoksa sona at)
    activeProjects.sort((a, b) => (a.order || 9999) - (b.order || 9999));
    res.json(activeProjects);
});

// Get Single Project (Public)
app.get('/api/projects/:id', (req, res) => {
    const projects = readData();
    const project = projects.find(p => p.id === req.params.id);
    if (project) res.json(project);
    else res.status(404).json({ error: 'Proje bulunamadı' });
});

// Contact Form (Public with rate limit)
app.post('/api/contact', contactLimiter, [
    body('name').trim().escape().isLength({ min: 2, max: 100 }),
    body('phone').optional({ checkFalsy: true }).trim().escape().isLength({ max: 15 }),
    body('lifeinvader').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
    body('message').trim().escape().isLength({ min: 10, max: 1000 })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Lütfen tüm alanları doğru doldurun.' });
    }

    const { name, phone, lifeinvader, message } = req.body;

    // Telefon veya LifeinVader'dan en az biri dolu olmalı
    if (!phone && !lifeinvader) {
        return res.status(400).json({ error: 'Telefon veya LifeinVader profilinden en az birini doldurun.' });
    }

    const contacts = readContacts();
    const newContact = {
        id: Date.now().toString(),
        name: sanitizeHtml(name),
        phone: phone ? sanitizeHtml(phone) : '',
        lifeinvader: lifeinvader ? sanitizeHtml(lifeinvader) : '',
        message: sanitizeHtml(message),
        createdAt: new Date().toISOString(),
        isRead: false
    };

    contacts.push(newContact);
    writeContacts(contacts);

    res.json({ success: true, message: 'Mesajınız gönderildi.' });
});

// ===== PROTECTED ROUTES (Admin) =====

// Create Project
app.post('/api/projects', authenticateToken, (req, res) => {
    const projects = readData();
    // En yüksek order değerini bul
    const maxOrder = projects.reduce((max, p) => Math.max(max, p.order || 0), 0);
    const newProject = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isActive: true,
        order: maxOrder + 1,
        ...req.body,
        // Sanitize text fields
        title: sanitizeHtml(req.body.title),
        description: sanitizeHtml(req.body.description),
        client: sanitizeHtml(req.body.client)
    };
    projects.push(newProject);
    writeData(projects);
    res.json(newProject);
});

// Update Project
app.put('/api/projects/:id', authenticateToken, (req, res) => {
    let projects = readData();
    const id = req.params.id;
    const projectIndex = projects.findIndex(p => p.id === id);

    if (projectIndex === -1) {
        return res.status(404).json({ error: 'Proje bulunamadı' });
    }

    projects[projectIndex] = {
        ...projects[projectIndex],
        ...req.body,
        title: sanitizeHtml(req.body.title),
        description: sanitizeHtml(req.body.description),
        client: sanitizeHtml(req.body.client),
        id: id,
        updatedAt: new Date().toISOString()
    };

    writeData(projects);
    res.json(projects[projectIndex]);
});

// Delete Project
app.delete('/api/projects/:id', authenticateToken, (req, res) => {
    let projects = readData();
    const project = projects.find(p => p.id === req.params.id);

    if (!project) {
        return res.status(404).json({ error: 'Proje bulunamadı' });
    }

    // Görselleri sil
    const deleteImage = (url) => {
        if (url && typeof url === 'string' && url.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '..', url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } else if (url && typeof url === 'object') {
            if (url.optimizedUrl) deleteImage(url.optimizedUrl);
            if (url.originalUrl) deleteImage(url.originalUrl);
        }
    };

    deleteImage(project.mainImage);
    if (project.gallery) project.gallery.forEach(deleteImage);

    projects = projects.filter(p => p.id !== req.params.id);
    writeData(projects);
    res.json({ success: true });
});

// Get All Projects for Admin (includes inactive)
app.get('/api/admin/projects', authenticateToken, (req, res) => {
    const projects = readData();
    // Order'a göre sırala
    projects.sort((a, b) => (a.order || 9999) - (b.order || 9999));
    res.json(projects);
});

// Toggle Project Active Status
app.put('/api/projects/:id/toggle-status', authenticateToken, (req, res) => {
    let projects = readData();
    const project = projects.find(p => p.id === req.params.id);

    if (!project) {
        return res.status(404).json({ error: 'Proje bulunamadı' });
    }

    // Toggle isActive (undefined ise true kabul et, sonra false yap)
    project.isActive = project.isActive === false ? true : false;
    project.updatedAt = new Date().toISOString();

    writeData(projects);
    res.json({ success: true, isActive: project.isActive });
});

// Reorder Projects
app.put('/api/projects/reorder', authenticateToken, (req, res) => {
    const { orderedIds } = req.body; // Array of project IDs in new order

    if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).json({ error: 'Geçersiz sıralama verisi' });
    }

    let projects = readData();

    // Her proje için yeni order değeri ata
    orderedIds.forEach((id, index) => {
        const project = projects.find(p => p.id === id);
        if (project) {
            project.order = index + 1;
        }
    });

    writeData(projects);
    res.json({ success: true });
});

// Upload Image
app.post('/api/upload', authenticateToken, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Görsel yüklenemedi' });
    }

    try {
        const originalFilename = `original_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
        const optimizedFilename = `optimized_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.webp`;

        const originalPath = path.join(UPLOADS_DIR, originalFilename);
        const optimizedPath = path.join(UPLOADS_DIR, optimizedFilename);

        fs.writeFileSync(originalPath, req.file.buffer);

        await sharp(req.file.buffer)
            .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(optimizedPath);

        res.json({
            optimizedUrl: `/uploads/${optimizedFilename}`,
            originalUrl: `/uploads/${originalFilename}`
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Görsel işlenirken hata oluştu' });
    }
});

// Batch Upload
app.post('/api/upload-batch', authenticateToken, upload.array('images', 20), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Görsel yüklenemedi' });
    }

    try {
        const results = [];

        for (const file of req.files) {
            const originalFilename = `original_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
            const optimizedFilename = `optimized_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.webp`;

            const originalPath = path.join(UPLOADS_DIR, originalFilename);
            const optimizedPath = path.join(UPLOADS_DIR, optimizedFilename);

            fs.writeFileSync(originalPath, file.buffer);

            await sharp(file.buffer)
                .resize({ height: 1080, fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(optimizedPath);

            results.push({
                optimizedUrl: `/uploads/${optimizedFilename}`,
                originalUrl: `/uploads/${originalFilename}`
            });
        }

        res.json(results);
    } catch (error) {
        console.error('Batch upload error:', error);
        res.status(500).json({ error: 'Galeri yüklenirken hata oluştu' });
    }
});

// Get Contacts (Admin)
app.get('/api/contacts', authenticateToken, (req, res) => {
    const contacts = readContacts();
    res.json(contacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Mark Contact as Read
app.put('/api/contacts/:id/read', authenticateToken, (req, res) => {
    const contacts = readContacts();
    const contact = contacts.find(c => c.id === req.params.id);
    if (contact) {
        contact.isRead = true;
        writeContacts(contacts);
        res.json(contact);
    } else {
        res.status(404).json({ error: 'İletişim bulunamadı.' });
    }
});

// Delete Contact
app.delete('/api/contacts/:id', authenticateToken, (req, res) => {
    let contacts = readContacts();
    const initialLength = contacts.length;
    contacts = contacts.filter(c => c.id !== req.params.id);

    if (contacts.length < initialLength) {
        writeContacts(contacts);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'İletişim bulunamadı.' });
    }
});

// ===== ERROR HANDLING =====

app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Sunucu hatası oluştu' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔒 Security features: JWT, bcrypt, rate limiting, helmet, input validation`);
});
