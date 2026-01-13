/* ============================
   PROJECT DETAIL PAGE JAVASCRIPT
   ============================ */

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api';

document.addEventListener('DOMContentLoaded', async function () {
    // URL'den proje ID'sini al
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) return;

    try {
        // Fetch project details
        const response = await fetch(`${API_URL}/projects/${projectId}`);
        if (!response.ok) throw new Error('Proje bulunamadı');

        const project = await response.json();

        // Fetch all projects for Prev/Next navigation
        const allRes = await fetch(`${API_URL}/projects`);
        const allProjects = await allRes.json();

        // Find current index
        const currentIndex = allProjects.findIndex(p => p.id === project.id);
        const prevProject = allProjects[currentIndex - 1] || allProjects[allProjects.length - 1]; // Cycle
        const nextProject = allProjects[currentIndex + 1] || allProjects[0]; // Cycle

        // Update UI
        document.getElementById('projectTitle').textContent = project.title;
        document.getElementById('projectCategory').textContent = project.category;
        document.getElementById('projectDescription').textContent = project.description;
        document.getElementById('projectClient').textContent = project.client;
        document.getElementById('projectCategoryMeta').textContent = project.category;
        document.getElementById('mainImage').src = getImageUrl(project.mainImage);
        document.title = `${project.title} | RioFrame`;

        // Update Gallery
        const galleryGrid = document.getElementById('galleryGrid');
        if (project.gallery && project.gallery.length > 0) {
            galleryGrid.innerHTML = project.gallery.map((img, index) => `
                <div class="gallery-item ${index === 2 ? 'large' : ''}">
                    <img src="${getImageUrl(img)}" alt="Proje Görsel ${index + 1}" loading="lazy">
                </div>
            `).join('');
        } else {
            // If no gallery, just show main image again or hide
            galleryGrid.innerHTML = `
                <div class="gallery-item large">
                    <img src="${getImageUrl(project.mainImage)}" alt="Proje Görsel">
                </div>
             `;
        }

        // Update Navigation
        const prevLink = document.querySelector('.nav-project.prev');
        const nextLink = document.querySelector('.nav-project.next');

        if (prevProject) {
            prevLink.href = `project-detail.html?id=${prevProject.id}`;
            prevLink.querySelector('.nav-title').textContent = prevProject.title;
        }

        if (nextProject) {
            nextLink.href = `project-detail.html?id=${nextProject.id}`;
            nextLink.querySelector('.nav-title').textContent = nextProject.title;
        }

    } catch (error) {
        console.error("Error loading project:", error);
        document.querySelector('main').innerHTML = '<div style="color:white;text-align:center;padding:100px;"><h1>Proje bulunamadı</h1><a href="projects.html" style="color:#d4af37">Projelere Dön</a></div>';
    }
});

function getImageUrl(url) {
    if (!url) return 'https://placehold.co/600x400';
    if (url.startsWith('/uploads/')) return `http://localhost:3000${url}`;
    return url;
}

