/* ============================
   PROJECT DETAIL PAGE JAVASCRIPT
   ============================ */

(function () {
    // API Config - Support localhost, file:// protocol, and production
    const isLocalDev = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:';
    const API_URL = isLocalDev ? 'http://localhost:3000/api' : '/api';

    document.addEventListener('DOMContentLoaded', async function () {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');

        if (!projectId) return;

        try {
            const response = await fetch(`${API_URL}/projects/${projectId}`);
            if (!response.ok) throw new Error('Proje bulunamadı');

            const project = await response.json();
            const allRes = await fetch(`${API_URL}/projects`);
            const allProjects = await allRes.json();

            const currentIndex = allProjects.findIndex(p => p.id === project.id);
            const prevProject = allProjects[currentIndex - 1] || allProjects[allProjects.length - 1];
            const nextProject = allProjects[currentIndex + 1] || allProjects[0];

            // UI Update
            document.getElementById('projectTitle').textContent = project.title;
            document.getElementById('projectCategory').textContent = project.category;
            document.getElementById('projectDescription').innerText = project.description; // Preserve newlines
            document.getElementById('projectClient').textContent = project.client;
            document.getElementById('projectCategoryMeta').textContent = project.category;

            // Proje Hakkında
            const aboutTextEl = document.getElementById('projectAboutText');
            if (aboutTextEl && project.aboutText) {
                // Paragrafları ayır ve <p> tag'leri ile sar
                const paragraphs = project.aboutText.split('\n').filter(p => p.trim());
                aboutTextEl.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
            } else if (aboutTextEl) {
                // Fallback: description kullan
                aboutTextEl.innerHTML = `<p>${project.description}</p>`;
            }

            // Hizmetler
            const servicesEl = document.getElementById('projectServices');
            if (servicesEl && project.services && project.services.length > 0) {
                servicesEl.innerHTML = project.services.map(s => `<li>${s}</li>`).join('');
            } else if (servicesEl) {
                // Varsayılan hizmetler
                servicesEl.innerHTML = '<li>Profesyonel Tasarım</li>';
            }

            // Main Image Handling
            const mainUrlStr = getUrl(project.mainImage, 'optimized');
            const mainOriginal = getUrl(project.mainImage, 'original');

            const mainImgEl = document.getElementById('mainImage');
            mainImgEl.src = mainUrlStr;
            mainImgEl.onclick = () => openLightbox(mainUrlStr, mainOriginal);
            mainImgEl.style.cursor = 'zoom-in';

            document.title = `${project.title} | RioFrame`;

            // Gallery
            const galleryGrid = document.getElementById('galleryGrid');

            if (project.gallery && project.gallery.length > 0) {
                galleryGrid.innerHTML = project.gallery.map((imgObj, index) => {
                    const optUrl = getUrl(imgObj, 'optimized');
                    const origUrl = getUrl(imgObj, 'original');

                    return `
                <div class="gallery-item ${index === 2 ? 'large' : ''}">
                    <img src="${optUrl}" alt="Proje Görsel" loading="lazy" style="cursor: zoom-in" 
                        onclick="openLightbox('${optUrl}', '${origUrl}')">
                </div>
            `;
                }).join('');
            } else {
                galleryGrid.innerHTML = `
                <div class="gallery-item large">
                    <img src="${mainUrlStr}" alt="Proje Görsel" style="cursor: zoom-in" onclick="openLightbox('${mainUrlStr}', '${mainOriginal}')">
                </div>
             `;
            }

            // Nav
            if (prevProject) {
                document.querySelector('.nav-project.prev').href = `project-detail.html?id=${prevProject.id}`;
                document.querySelector('.nav-project.prev .nav-title').textContent = prevProject.title;
            }
            if (nextProject) {
                document.querySelector('.nav-project.next').href = `project-detail.html?id=${nextProject.id}`;
                document.querySelector('.nav-project.next .nav-title').textContent = nextProject.title;
            }

            // İçerik yüklendi - göster
            document.body.classList.add('loaded');

        } catch (error) {
            console.error(error);
            document.body.classList.add('loaded');
            document.querySelector('main').innerHTML = '<h1 style="text-align:center; color:white; padding: 5rem;">Yüklenemedi</h1>';
        }
    });

    // Helper: Extract URL from object or string
    function getUrl(imgData, type = 'optimized') {
        if (!imgData) return 'https://placehold.co/600x400';

        // Legacy support (if string)
        if (typeof imgData === 'string') {
            if (imgData.startsWith('/uploads/'))
                return window.location.hostname === 'localhost' ? `http://localhost:3000${imgData}` : imgData;
            return imgData;
        }

        // New Object support
        // type: 'optimized' or 'original'
        let path = imgData.optimizedUrl;
        if (type === 'original' && imgData.originalUrl) path = imgData.originalUrl;

        if (path.startsWith('/uploads/'))
            return window.location.hostname === 'localhost' ? `http://localhost:3000${path}` : path;

        return path;
    }

    // Lightbox Logic - Global scope'a taşı
    window.openLightbox = function (imageUrl, originalUrl) {
        // Check if exists
        let lightbox = document.getElementById('customLightbox');
        if (!lightbox) {
            const div = document.createElement('div');
            div.id = 'customLightbox';
            div.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.95); z-index: 9999;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.3s;
        `;
            div.innerHTML = `
            <img id="lbImage" src="" style="max-width: 90%; max-height: 80vh; border-radius: 4px; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
            <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                <button id="lbClose" class="btn btn-secondary">Kapat</button>
                <a id="lbOriginal" href="#" target="_blank" class="btn btn-primary">Orijinal Boyut (İndir)</a>
            </div>
        `;
            document.body.appendChild(div);

            // Close events
            div.addEventListener('click', (e) => {
                if (e.target === div || e.target.id === 'lbClose') closeLightbox();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeLightbox();
            });

            lightbox = div;
        }

        const imgInfo = lightbox.querySelector('#lbImage');
        const downloadBtn = lightbox.querySelector('#lbOriginal');

        imgInfo.src = imageUrl;
        downloadBtn.href = originalUrl;

        lightbox.style.display = 'flex';
        requestAnimationFrame(() => lightbox.style.opacity = '1');
    }

    window.closeLightbox = function () {
        const lightbox = document.getElementById('customLightbox');
        if (lightbox) {
            lightbox.style.opacity = '0';
            setTimeout(() => lightbox.style.display = 'none', 300);
        }
    }

})();
