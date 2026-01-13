// API Base URL - Support localhost, file:// protocol, and production
const isLocalDev = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';
const API_URL = isLocalDev ? 'http://localhost:3000/api' : '/api';

// Auth Header Helper - Tüm korumalı isteklerde kullanılacak
function getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// --- MAIN INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // Page Router (Simple)
    if (document.getElementById('projectsTableBody')) {
        initDashboard();
    } else if (document.getElementById('projectForm')) {
        initProjectForm();
    } else if (document.getElementById('loginForm')) {
        initLogin();
    }
});

// --- DASHBOARD (admin.html) ---
function initDashboard() {
    checkAuth();
    loadProjects();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('adminToken');
            window.location.href = 'admin-login.html';
        });
    }

    // New Project Button is just a link in HTML now, no JS needed
}

async function loadProjects() {
    const tableBody = document.getElementById('projectsTableBody');
    const countEl = document.getElementById('totalProjects');

    try {
        const response = await fetch(`${API_URL}/projects`);
        const projects = await response.json();

        tableBody.innerHTML = '';
        if (countEl) countEl.textContent = projects.length;

        projects.forEach((project) => {
            const row = `
                <tr>
                    <td><img src="${getImageUrl(project.mainImage)}" 
                        style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px; background: #333"></td>
                    <td>${project.title}</td>
                    <td><span class="badge">${project.category}</span></td>
                    <td>${project.client}</td>
                    <td style="display:flex; gap: 0.5rem">
                        <a href="admin-project-form.html?id=${project.id}" class="btn-icon" title="Düzenle">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </a>
                        <button class="btn-icon delete-btn" data-id="${project.id}" title="Sil">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });

        // Delete handlers
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });

    } catch (error) {
        console.error("Error loading projects:", error);
        tableBody.innerHTML = '<tr><td colspan="5">Bağlantı hatası.</td></tr>';
    }
}

async function handleDelete(e) {
    if (!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
    const id = e.currentTarget.dataset.id;
    try {
        const res = await fetch(`${API_URL}/projects/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Silme başarısız');
        loadProjects();
    } catch (error) {
        alert('Silme başarısız: ' + error.message);
    }
}

// --- PROJECT FORM (admin-project-form.html) ---
async function initProjectForm() {
    checkAuth();

    // State
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    let mainImageData = null; // { optimizedUrl, originalUrl }
    let galleryImages = [];   // Array of { optimizedUrl, originalUrl }

    const form = document.getElementById('projectForm');
    const titleEl = document.getElementById('pageTitle');

    // --- DOM Elements (Must be declared before loadProjectData) ---
    const mainDropzone = document.getElementById('mainDropzone');
    const mainInput = document.getElementById('mainImageInput');
    const galleryDropzone = document.getElementById('galleryDropzone');
    const galleryInput = document.getElementById('galleryInput');
    const galleryGrid = document.getElementById('galleryGrid');

    // --- GALLERY FUNCTIONS (Must be declared before loadProjectData uses them) ---
    function renderGallery() {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';
        galleryImages.forEach((img, index) => {
            const url = typeof img === 'string' ? img : img.optimizedUrl;
            const div = document.createElement('div');
            div.className = 'gallery-item-preview';
            div.innerHTML = `
                <img src="${getImageUrl(url)}" alt="">
                <button type="button" class="gallery-remove" data-index="${index}">&times;</button>
            `;
            galleryGrid.appendChild(div);
        });
        document.querySelectorAll('.gallery-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index);
                galleryImages = galleryImages.filter((_, i) => i !== idx);
                renderGallery();
            });
        });
    }

    async function handleGalleryUpload(files) {
        if (!files.length) return;
        document.getElementById('galleryProgress').style.display = 'flex';
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }
        try {
            const response = await fetch(`${API_URL}/upload-multiple`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Galeri yükleme hatası');
            const results = await response.json();
            galleryImages = [...galleryImages, ...results];
            renderGallery();
        } catch (error) {
            alert(error.message);
        } finally {
            document.getElementById('galleryProgress').style.display = 'none';
        }
    }

    // Helper: Load Data for Edit (Defined before call)
    async function loadProjectData(id) {
        try {
            const res = await fetch(`${API_URL}/projects/${id}`);
            const p = await res.json();
            document.getElementById('pTitle').value = p.title;
            document.getElementById('pCategory').value = p.category;
            document.getElementById('pClient').value = p.client;
            document.getElementById('pDescription').value = p.description;

            if (p.mainImage) {
                mainImageData = p.mainImage;
                const url = typeof p.mainImage === 'string' ? p.mainImage : p.mainImage.optimizedUrl;
                document.getElementById('mainPreview').querySelector('img').src = getImageUrl(url);
                document.getElementById('mainPreview').style.display = 'block';
                document.getElementById('mainUploadPlaceholder').style.display = 'none';
            }
            if (p.gallery) {
                galleryImages = p.gallery;
                renderGallery();
            }
        } catch (error) {
            console.error(error);
            alert('Proje verileri yüklenemedi.');
        }
    }

    // Load existing data if editing (AFTER all functions are defined)
    if (projectId) {
        titleEl.textContent = 'Projeyi Düzenle';
        document.getElementById('saveBtn').textContent = 'Değişiklikleri Kaydet';
        await loadProjectData(projectId);
    }

    // --- MAIN IMAGE UPLOAD ---
    setupUploadZone(mainDropzone, mainInput, async (file) => {
        document.getElementById('mainProgress').style.display = 'flex';
        try {
            const result = await uploadFile(file);
            mainImageData = result;
            const preview = document.getElementById('mainPreview');
            const placeholder = document.getElementById('mainUploadPlaceholder');
            preview.querySelector('img').src = getImageUrl(result.optimizedUrl);
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        } catch (e) {
            alert('Yükleme hatası: ' + e.message);
        } finally {
            document.getElementById('mainProgress').style.display = 'none';
        }
    });

    document.getElementById('removeMainBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        mainImageData = null;
        document.getElementById('mainPreview').style.display = 'none';
        document.getElementById('mainUploadPlaceholder').style.display = 'flex';
        mainInput.value = '';
    });

    // --- GALLERY UPLOAD ---
    galleryDropzone.addEventListener('click', () => galleryInput.click());
    galleryInput.addEventListener('change', (e) => handleGalleryUpload(e.target.files));
    galleryDropzone.addEventListener('dragover', (e) => { e.preventDefault(); galleryDropzone.style.borderColor = '#d4af37'; });
    galleryDropzone.addEventListener('dragleave', (e) => { e.preventDefault(); galleryDropzone.style.borderColor = '#2a2a2a'; });
    galleryDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        galleryDropzone.style.borderColor = '#2a2a2a';
        handleGalleryUpload(e.dataTransfer.files);
    });

    // --- SAVE ---
    document.getElementById('saveBtn').addEventListener('click', async () => {
        const title = document.getElementById('pTitle').value;
        const category = document.getElementById('pCategory').value;
        const client = document.getElementById('pClient').value;
        const description = document.getElementById('pDescription').value;

        if (!title || !client || !description) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }

        if (!mainImageData) {
            alert('Lütfen bir kapak görseli yükleyin.');
            return;
        }

        const projectData = {
            title,
            category,
            client,
            description,
            mainImage: mainImageData,
            gallery: galleryImages
        };

        try {
            let res;
            if (projectId) {
                res = await fetch(`${API_URL}/projects/${projectId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(projectData)
                });
            } else {
                res = await fetch(`${API_URL}/projects`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(projectData)
                });
            }

            if (res.ok) {
                window.location.href = 'admin.html';
            } else {
                throw new Error('Kayıt başarısız');
            }
        } catch (error) {
            alert(error.message);
        }
    });
}

// --- LOGIN ---
function initLogin() {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('adminToken', data.token);
                window.location.href = 'admin.html';
            } else {
                document.getElementById('loginError').style.display = 'block';
            }
        } catch (error) {
            console.error(error);
        }
    });
}

// --- UTILS ---
function setupUploadZone(zone, input, callback) {
    zone.addEventListener('click', () => input.click());
    input.addEventListener('change', (e) => {
        if (e.target.files[0]) callback(e.target.files[0]);
    });

    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.style.borderColor = '#d4af37'; });
    zone.addEventListener('dragleave', (e) => { e.preventDefault(); zone.style.borderColor = '#2a2a2a'; });
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.style.borderColor = '#2a2a2a';
        if (e.dataTransfer.files[0]) callback(e.dataTransfer.files[0]);
    });
}

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
    });

    if (!res.ok) throw new Error('Upload failed');
    return await res.json(); // Returns { optimizedUrl, originalUrl }
}

function checkAuth() {
    if (!localStorage.getItem('adminToken')) {
        window.location.href = 'admin-login.html';
    }
}

function getImageUrl(url) {
    if (!url) return 'https://placehold.co/600x400';

    // Handle Object (New format)
    if (typeof url === 'object' && url.optimizedUrl) {
        url = url.optimizedUrl;
    }

    if (typeof url === 'string' && url.startsWith('/uploads/')) {
        return window.location.hostname === 'localhost' ? `http://localhost:3000${url}` : url;
    }

    return url;
}
