const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Data File Path
const DATA_FILE = path.join(__dirname, 'data', 'projects.json');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure directories exist
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Multer Storage Configuration (Memory storage for processing)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Helper: Read Data
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

// Helper: Write Data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// --- ROUTES ---

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@rioframe.art' && password === 'rioframe2024') {
        res.json({ success: true, token: 'admin-token-secret' });
    } else {
        res.status(401).json({ success: false, message: 'Giriş başarısız' });
    }
});

// Get All Projects
app.get('/api/projects', (req, res) => {
    const projects = readData();
    res.json(projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Get Single Project
app.get('/api/projects/:id', (req, res) => {
    const projects = readData();
    const project = projects.find(p => p.id === req.params.id);
    if (project) res.json(project);
    else res.status(404).json({ message: 'Proje bulunamadı' });
});

// Create Project
app.post('/api/projects', (req, res) => {
    const projects = readData();
    const newProject = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...req.body
    };
    projects.push(newProject);
    writeData(projects);
    res.json(newProject);
});

// Update Project (PUT)
app.put('/api/projects/:id', (req, res) => {
    let projects = readData();
    const id = req.params.id;
    const projectIndex = projects.findIndex(p => p.id === id);

    if (projectIndex === -1) {
        return res.status(404).json({ message: 'Proje bulunamadı' });
    }

    // Preserve id and createdAt, update other fields
    projects[projectIndex] = {
        ...projects[projectIndex],
        ...req.body,
        id: id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
    };

    writeData(projects);
    res.json(projects[projectIndex]);
});

// Delete Project
app.delete('/api/projects/:id', (req, res) => {
    let projects = readData();
    const id = req.params.id;

    // Note: We are not auto-deleting files to avoid accidental data loss in this version

    projects = projects.filter(p => p.id !== id);
    writeData(projects);
    res.json({ success: true });
});

// Upload Single Image (With Optimization)
app.post('/api/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Dosya yüklenemedi' });
    }

    try {
        const timestamp = Date.now();
        const originalName = req.file.originalname.replace(/\.[^/.]+$/, ""); // remove extension

        // Filenames
        const originalFilename = `${timestamp}-${originalName}-original${path.extname(req.file.originalname)}`;
        const optimizedFilename = `${timestamp}-${originalName}.webp`;

        // Paths
        const originalPath = path.join(UPLOADS_DIR, originalFilename);
        const optimizedPath = path.join(UPLOADS_DIR, optimizedFilename);

        // 1. Save Original
        await fs.promises.writeFile(originalPath, req.file.buffer);

        // 2. Process & Save Optimized (WebP, Max 1920px width, 80% Quality)
        await sharp(req.file.buffer)
            .resize({ width: 1920, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(optimizedPath);

        res.json({
            optimizedUrl: `/uploads/${optimizedFilename}`,
            originalUrl: `/uploads/${originalFilename}`
        });

    } catch (error) {
        console.error('Image processing error:', error);
        res.status(500).json({ message: 'Görsel işlenirken hata oluştu' });
    }
});

// Upload Multiple Images (For Gallery)
app.post('/api/upload-multiple', upload.array('images', 10), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Dosya seçilmedi' });
    }

    try {
        const results = [];

        for (const file of req.files) {
            const timestamp = Date.now() + Math.round(Math.random() * 1000);
            const originalName = file.originalname.replace(/\.[^/.]+$/, "");

            const originalFilename = `${timestamp}-${originalName}-original${path.extname(file.originalname)}`;
            const optimizedFilename = `${timestamp}-${originalName}.webp`;

            const originalPath = path.join(UPLOADS_DIR, originalFilename);
            const optimizedPath = path.join(UPLOADS_DIR, optimizedFilename);

            // Save Original
            await fs.promises.writeFile(originalPath, file.buffer);

            // Save Optimized
            await sharp(file.buffer)
                .resize({ width: 1920, withoutEnlargement: true })
                .resize({ height: 1080, fit: 'inside', withoutEnlargement: true }) // Fit within 1920x1080
                .webp({ quality: 80 })
                .toFile(optimizedPath);

            results.push({
                optimizedUrl: `/uploads/${optimizedFilename}`,
                originalUrl: `/uploads/${originalFilename}`
            });
        }

        res.json(results);

    } catch (error) {
        console.error('Batch processing error:', error);
        res.status(500).json({ message: 'Galeri yüklenirken hata oluştu' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
