// API Base URL
// Localhost development: http://localhost:3000/api
// Production: /api (served by same domain or proxy)
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const projectsTableBody = document.getElementById('projectsTableBody');
const loadingCell = document.querySelector('.loading-cell');

// --- AUTHENTICATION ---

// Login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('loginError');

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
                throw new Error(data.message);
            }
        } catch (error) {
            console.error(error);
            errorMsg.style.display = 'block';
            errorMsg.textContent = 'Giriş başarısız: ' + error.message;
        }
    });
}

// Auth State Check & Logout
const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    const isLoginPage = window.location.pathname.includes('admin-login.html');

    if (token) {
        if (isLoginPage) window.location.href = 'admin.html';
        if (!isLoginPage) loadProjects();
    } else {
        if (!isLoginPage) window.location.href = 'admin-login.html';
    }
};

// Run check on load
checkAuth();

if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
    });
}

// --- PROJECTS MANAGEMENT ---

async function loadProjects() {
    if (!projectsTableBody) return;

    try {
        const response = await fetch(`${API_URL}/projects`);
        const projects = await response.json();

        projectsTableBody.innerHTML = '';

        let count = 0;
        projects.forEach((project) => {
            count++;
            const row = `
                <tr>
                    <td><img src="${getImageUrl(project.mainImage)}" alt="${project.title}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
                    <td>${project.title}</td>
                    <td><span class="badge">${project.category}</span></td>
                    <td>${project.client}</td>
                    <td>
                        <button class="btn-icon delete-btn" data-id="${project.id}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </td>
                </tr>
            `;
            projectsTableBody.insertAdjacentHTML('beforeend', row);
        });

        document.getElementById('totalProjects').textContent = count;

        // Delete handlers
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });

    } catch (error) {
        console.error("Error loading projects:", error);
        projectsTableBody.innerHTML = '<tr><td colspan="5">Veriler yüklenirken hata oluştu. Lütfen serverın çalıştığından emin olun.</td></tr>';
    }
}

function getImageUrl(url) {
    if (!url) return 'https://placehold.co/600x400';
    // If it's a relative path from our server, prepend localhost for now
    if (url.startsWith('/uploads/')) {
        return `http://localhost:3000${url}`;
    }
    return url;
}

// --- NEW PROJECT MODAL & FORM ---

const modal = document.getElementById('projectModal');
const newProjectBtn = document.getElementById('newProjectBtn');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const projectForm = document.getElementById('projectForm');
const fileInput = document.getElementById('pMainImage');
const dropzone = document.getElementById('mainImageDropzone');
const previewImg = document.getElementById('mainImagePreview');
const previewContainer = document.querySelector('.preview-container');
const uploadPlaceholder = document.querySelector('.upload-placeholder');
const removeImgBtn = document.querySelector('.remove-image');

// Modal Logic
if (newProjectBtn) {
    newProjectBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });

    [closeModal, cancelBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
            projectForm.reset();
            resetImagePreview();
        });
    });
}

// Image Upload Logic
if (dropzone) {
    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', handleFileSelect);

    // Drag & Drop
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--admin-primary)';
    });

    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--admin-border)';
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--admin-border)';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    });

    removeImgBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetImagePreview();
    });
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewContainer.style.display = 'block';
        uploadPlaceholder.style.display = 'none';

        // Temporarily store file in input for submission
        // But since we can't programmatically set files list easily, we rely on the input's state if user clicked
        // If dropped, we might need a custom handling. For simplicity, assume click upload mostly.
    };
    reader.readAsDataURL(file);
}

function resetImagePreview() {
    fileInput.value = '';
    previewContainer.style.display = 'none';
    uploadPlaceholder.style.display = 'flex';
    previewImg.src = '';
}

// Save Project
if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('saveProjectBtn');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Kaydediliyor...';

        try {
            const title = document.getElementById('pTitle').value;
            const category = document.getElementById('pCategory').value;
            const client = document.getElementById('pClient').value;
            const description = document.getElementById('pDescription').value;
            const file = fileInput.files[0];

            let imageUrl = 'https://placehold.co/600x400';

            // 1. Upload Image First
            if (file) {
                const formData = new FormData();
                formData.append('image', file);

                const uploadRes = await fetch(`${API_URL}/upload`, {
                    method: 'POST',
                    body: formData
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    imageUrl = uploadData.url;
                } else {
                    throw new Error('Görsel yüklenemedi');
                }
            }

            // 2. Save Project Data
            const projectData = {
                title,
                category,
                client,
                description,
                mainImage: imageUrl,
                gallery: [imageUrl] // Demo
            };

            const response = await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });

            if (!response.ok) throw new Error('Kayıt başarısız');

            // Success
            modal.classList.remove('active');
            projectForm.reset();
            resetImagePreview();
            loadProjects();
            alert('Proje başarıyla eklendi!');

        } catch (error) {
            console.error("Error saving project:", error);
            alert('Hata: ' + error.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Kaydet';
        }
    });
}

// Delete Project
async function handleDelete(e) {
    if (!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;

    const btn = e.currentTarget;
    const id = btn.dataset.id;

    try {
        await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
        loadProjects(); // Refresh
    } catch (error) {
        console.error("Error deleting:", error);
        alert('Silme işlemi başarısız.');
    }
}
