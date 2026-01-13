const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Data File Path
const DATA_FILE = path.join(__dirname, 'data', 'projects.json');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure directories exist
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

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

// Login (Simple Hardcoded)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    // Simple check - in production use hashed passwords
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

// Delete Project
app.delete('/api/projects/:id', (req, res) => {
    let projects = readData();
    const id = req.params.id;

    // Optional: Delete associated image file
    const project = projects.find(p => p.id === id);
    if (project && project.mainImage && project.mainImage.includes('/uploads/')) {
        const filename = path.basename(project.mainImage);
        const filePath = path.join(UPLOADS_DIR, filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    projects = projects.filter(p => p.id !== id);
    writeData(projects);
    res.json({ success: true });
});

// Upload Image
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (req.file) {
        // Return relative path
        res.json({ url: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).json({ message: 'Dosya yüklenemedi' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
