/* ============================
   PROJECTS PAGE JAVASCRIPT
   ============================ */

// API Config
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api';

document.addEventListener('DOMContentLoaded', async () => {
    const projectsGrid = document.querySelector('.projects-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    let allProjects = [];

    // Load Projects from API
    try {
        const response = await fetch(`${API_URL}/projects`);
        allProjects = await response.json();
        renderProjects('all');
    } catch (error) {
        console.error("Error loading projects:", error);
        if (projectsGrid) {
            projectsGrid.innerHTML = '<p style="color:white; text-align:center; grid-column: 1/-1;">Projeler yüklenirken hata oluştu.</p>';
        }
    }

    // Filter Logic
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            renderProjects(filter);
        });
    });

    function renderProjects(filter) {
        if (!projectsGrid) return;
        projectsGrid.innerHTML = '';

        let filteredProjects = allProjects;

        if (filter !== 'all') {
            filteredProjects = allProjects.filter(project => {
                const categoryMap = {
                    'Marka Kimliği': 'branding',
                    'Web Tasarım': 'web',
                    'Sosyal Medya': 'social',
                    'Ambalaj': 'packaging'
                };
                return categoryMap[project.category] === filter;
            });
        }

        filteredProjects.forEach((project, index) => {
            const card = document.createElement('a');
            card.href = `project-detail.html?id=${project.id}`;
            card.className = 'project-card';
            card.style.animationDelay = `${index * 0.1}s`;

            card.innerHTML = `
                <div class="project-image">
                    <img src="${getImageUrl(project.mainImage)}" alt="${project.title}" loading="lazy">
                    <div class="project-overlay">
                        <div class="project-links">
                            <span class="view-project">Projeyi İncele</span>
                        </div>
                    </div>
                </div>
                <div class="project-info">
                    <span class="project-category">${project.category}</span>
                    <h3 class="project-title">${project.title}</h3>
                </div>
            `;

            projectsGrid.appendChild(card);
        });
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
});
