/* ============================
   HOME PAGE PROJECTS (API LOADER)
   ============================ */

// API Config - Support localhost, file:// protocol, and production
const isLocalDev = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';
const API_URL = isLocalDev ? 'http://localhost:3000/api' : '/api';

document.addEventListener('DOMContentLoaded', async () => {
    const slider = document.getElementById('homeProjectsSlider');
    if (!slider) return;

    try {
        const response = await fetch(`${API_URL}/projects`);
        const projects = await response.json();

        if (projects.length === 0) {
            slider.innerHTML = '<p style="color: #888; text-align: center; width: 100%;">Henüz proje eklenmedi.</p>';
            return;
        }

        // Take first 6 projects
        const displayProjects = projects.slice(0, 6);

        slider.innerHTML = displayProjects.map(project => `
            <a href="project-detail.html?id=${project.id}" class="project-card">
                <div class="project-image">
                    <span class="project-category">${project.category}</span>
                    <img src="${getImageUrl(project.mainImage)}" alt="${project.title}" loading="lazy">
                </div>
                <div class="project-info">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description ? project.description.substring(0, 60) + '...' : ''}</p>
                </div>
            </a>
        `).join('');

    } catch (error) {
        console.error('Error loading home projects:', error);
        slider.innerHTML = '<p style="color: #888; text-align: center; width: 100%;">Projeler yüklenemedi.</p>';
    }
});

function getImageUrl(url) {
    if (!url) return 'https://placehold.co/400x300';

    // Handle Object (New format)
    if (typeof url === 'object' && url.optimizedUrl) {
        url = url.optimizedUrl;
    }

    if (typeof url === 'string' && url.startsWith('/uploads/')) {
        return window.location.hostname === 'localhost' ? `http://localhost:3000${url}` : url;
    }

    return url;
}
