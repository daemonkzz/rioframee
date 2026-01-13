/* ============================
   HOME PAGE PROJECTS (API LOADER)
   ============================ */

(function () {
    // API Config - Support localhost, file:// protocol, and production
    const isLocalDev = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:';
    const API_URL = isLocalDev ? 'http://localhost:3000/api' : '/api';

    // Global değişken - tüm projeler
    let allProjects = [];

    document.addEventListener('DOMContentLoaded', async () => {
        const slider = document.getElementById('homeProjectsSlider');
        if (!slider) return;

        try {
            const response = await fetch(`${API_URL}/projects`);
            allProjects = await response.json();

            if (allProjects.length === 0) {
                slider.innerHTML = '<p style="color: #888; text-align: center; width: 100%;">Henüz proje eklenmedi.</p>';
                return;
            }

            // İlk yüklemede tüm projeleri göster
            renderProjects(allProjects);

            // Kategori filtrelerini başlat
            initCategoryFilters();

        } catch (error) {
            console.error('Error loading home projects:', error);
            slider.innerHTML = '<p style="color: #888; text-align: center; width: 100%;">Projeler yüklenemedi.</p>';
        }
    });

    // Projeleri render et
    function renderProjects(projects) {
        const slider = document.getElementById('homeProjectsSlider');
        if (!slider) return;

        const displayProjects = projects.slice(0, 6);

        slider.innerHTML = displayProjects.map(project => `
        <a href="project-detail.html?id=${project.id}" class="project-card" data-category="${project.category}">
            <div class="project-image">
                <span class="project-category ${project.category === 'LifeinVader' ? 'category-lifeinvader' : ''}">${project.category}</span>
                <img src="${getImageUrl(project.mainImage)}" alt="${project.title}" loading="lazy">
            </div>
            <div class="project-info">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description ? project.description.substring(0, 60) + '...' : ''}</p>
            </div>
        </a>
    `).join('');
    }

    // Kategori filtrelerini başlat
    function initCategoryFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');

        filterButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                // Aktif butonu güncelle
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // Kategori filtreleme
                const category = this.dataset.category;

                if (category === 'all') {
                    renderProjects(allProjects);
                } else {
                    const filtered = allProjects.filter(p => p.category === category);
                    renderProjects(filtered);
                }
            });
        });
    }

    function getImageUrl(url) {
        if (!url) return 'https://placehold.co/400x300';

        // Handle Object (New format)
        if (typeof url === 'object' && url.optimizedUrl) {
            url = url.optimizedUrl;
        }

        if (typeof url === 'string' && url.startsWith('/uploads/')) {
            return isLocalDev ? `http://localhost:3000${url}` : url;
        }

        return url;
    }

    /* ============================
       HERO FLOATING FRAMES - Rastgele Proje Galeri Görselleri
       ============================ */
    async function loadHeroFrames() {
        const heroFrames = document.getElementById('heroFrames');
        if (!heroFrames) return;

        try {
            const response = await fetch(`${API_URL}/projects`);
            const projects = await response.json();

            // Galeri görseli olan projeleri filtrele
            const projectsWithGallery = projects.filter(p => p.gallery && p.gallery.length > 0);

            if (projectsWithGallery.length === 0) {
                // Galeri yoksa mainImage kullan
                const projectsWithMain = projects.filter(p => p.mainImage);
                fillFramesWithMainImages(projectsWithMain);
                return;
            }

            // Rastgele 4 proje seç (veya daha az varsa hepsini al)
            const shuffledProjects = projectsWithGallery.sort(() => Math.random() - 0.5);
            const selectedProjects = shuffledProjects.slice(0, 4);

            // Her projeden rastgele 1 galeri görseli seç
            const frameImages = heroFrames.querySelectorAll('.photo-frame img');

            selectedProjects.forEach((project, index) => {
                if (frameImages[index]) {
                    // Galeriden rastgele bir görsel seç
                    const randomGalleryImage = project.gallery[Math.floor(Math.random() * project.gallery.length)];
                    frameImages[index].src = getImageUrl(randomGalleryImage);
                    frameImages[index].alt = project.title;
                }
            });

            // Eğer 4'ten az proje varsa, kalanları mainImage ile doldur
            if (selectedProjects.length < 4) {
                const remaining = projects.filter(p => p.mainImage);
                for (let i = selectedProjects.length; i < 4 && i - selectedProjects.length < remaining.length; i++) {
                    if (frameImages[i]) {
                        frameImages[i].src = getImageUrl(remaining[i - selectedProjects.length].mainImage);
                        frameImages[i].alt = remaining[i - selectedProjects.length].title;
                    }
                }
            }

        } catch (error) {
            console.error('Error loading hero frames:', error);
            // Hata durumunda placeholder göster
            const frameImages = heroFrames.querySelectorAll('.photo-frame img');
            frameImages.forEach(img => {
                img.src = 'https://placehold.co/200x150/1a1a1a/666666?text=Proje';
            });
        }
    }

    function fillFramesWithMainImages(projects) {
        const heroFrames = document.getElementById('heroFrames');
        if (!heroFrames) return;

        const frameImages = heroFrames.querySelectorAll('.photo-frame img');
        const shuffled = projects.sort(() => Math.random() - 0.5).slice(0, 4);

        shuffled.forEach((project, index) => {
            if (frameImages[index]) {
                frameImages[index].src = getImageUrl(project.mainImage);
                frameImages[index].alt = project.title;
            }
        });
    }

    // Sayfa yüklendiğinde hero çerçevelerini de doldur
    document.addEventListener('DOMContentLoaded', loadHeroFrames);

})();
