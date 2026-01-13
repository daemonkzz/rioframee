/* ============================
   PROJECT DETAIL PAGE JAVASCRIPT
   ============================ */

// Proje verileri
const projectsData = {
    1: {
        title: 'Kurumsal Kimlik',
        category: 'Marka Kimliği',
        description: 'Premium marka için logo ve kurumsal kimlik tasarımı. Modern ve minimal tasarım anlayışıyla oluşturulan bu proje, markanın değerlerini en iyi şekilde yansıtmaktadır.',
        client: 'Premium Marka',
        mainImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=800&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1561070791-36c11f7c3d9f?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=600&fit=crop',
            'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop'
        ],
        prev: { id: 8, title: 'Kampanya Görselleri' },
        next: { id: 2, title: 'E-Ticaret Sitesi' }
    },
    2: {
        title: 'E-Ticaret Sitesi',
        category: 'Web Tasarım',
        description: 'Modern ve kullanıcı dostu e-ticaret web sitesi tasarımı. Temiz arayüz ve sezgisel navigasyon ile kullanıcı deneyimini ön plana çıkardık.',
        client: 'Online Mağaza',
        mainImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop',
            'https://images.unsplash.com/photo-1522542550221-31fd8575f3f7?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=400&fit=crop'
        ],
        prev: { id: 1, title: 'Kurumsal Kimlik' },
        next: { id: 3, title: 'Sosyal Medya' }
    },
    3: {
        title: 'Sosyal Medya',
        category: 'Sosyal Medya',
        description: 'Instagram için özel içerik ve görsel tasarım. Marka sesini yansıtan, etkileşimi artıran ve takipçi kitlesini büyüten stratejik içerikler.',
        client: 'Dijital Ajans',
        mainImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&h=800&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&h=600&fit=crop',
            'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=400&fit=crop'
        ],
        prev: { id: 2, title: 'E-Ticaret Sitesi' },
        next: { id: 4, title: 'Ambalaj Tasarımı' }
    },
    4: {
        title: 'Ambalaj Tasarımı',
        category: 'Ambalaj',
        description: 'Ürün ambalaj ve etiket tasarımı. Rafta dikkat çeken, marka kimliğini yansıtan ve müşteri deneyimini zenginleştiren ambalaj çözümleri.',
        client: 'Üretici Firma',
        mainImage: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&h=800&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&h=600&fit=crop',
            'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=600&h=400&fit=crop'
        ],
        prev: { id: 3, title: 'Sosyal Medya' },
        next: { id: 5, title: 'Logo Tasarımı' }
    },
    5: {
        title: 'Logo Tasarımı',
        category: 'Marka Kimliği',
        description: 'Minimal ve etkileyici logo çalışması. Markanın özünü tek bir sembolde yakalayarak akılda kalıcı bir görsel kimlik oluşturduk.',
        client: 'Startup',
        mainImage: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1200&h=800&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1200&h=600&fit=crop',
            'https://images.unsplash.com/photo-1561070791-36c11f7c3d9f?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=600&h=400&fit=crop'
        ],
        prev: { id: 4, title: 'Ambalaj Tasarımı' },
        next: { id: 6, title: 'Portfolyo Sitesi' }
    },
    6: {
        title: 'Portfolyo Sitesi',
        category: 'Web Tasarım',
        description: 'Kişisel portfolyo web sitesi tasarımı. Yaratıcı çalışmaları en iyi şekilde sergileyen, modern ve etkileyici bir dijital portfolyo.',
        client: 'Kreatif',
        mainImage: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&h=800&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&h=600&fit=crop',
            'https://images.unsplash.com/photo-1522542550221-31fd8575f3f7?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=400&fit=crop'
        ],
        prev: { id: 5, title: 'Logo Tasarımı' },
        next: { id: 7, title: 'Marka Rehberi' }
    },
    7: {
        title: 'Marka Rehberi',
        category: 'Marka Kimliği',
        description: 'Kapsamlı marka kılavuzu hazırlama. Logo kullanımı, renk paleti, tipografi ve görsel standartları içeren detaylı bir marka rehberi.',
        client: 'Kurumsal Firma',
        mainImage: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=800&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=600&fit=crop',
            'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1561070791-36c11f7c3d9f?w=600&h=400&fit=crop'
        ],
        prev: { id: 6, title: 'Portfolyo Sitesi' },
        next: { id: 8, title: 'Kampanya Görselleri' }
    },
    8: {
        title: 'Kampanya Görselleri',
        category: 'Sosyal Medya',
        description: 'Dijital pazarlama kampanya görselleri. Marka mesajını etkili bir şekilde ileten, dikkat çekici ve paylaşılabilir içerikler.',
        client: 'E-Ticaret',
        mainImage: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1200&h=800&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1200&h=600&fit=crop',
            'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600&h=400&fit=crop'
        ],
        prev: { id: 7, title: 'Marka Rehberi' },
        next: { id: 1, title: 'Kurumsal Kimlik' }
    }
};

document.addEventListener('DOMContentLoaded', function () {
    // URL'den proje ID'sini al
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id') || 1;

    const project = projectsData[projectId];

    if (project) {
        // Sayfa içeriğini güncelle
        document.getElementById('projectTitle').textContent = project.title;
        document.getElementById('projectCategory').textContent = project.category;
        document.getElementById('projectDescription').textContent = project.description;
        document.getElementById('projectClient').textContent = project.client;
        document.getElementById('projectCategoryMeta').textContent = project.category;
        document.getElementById('mainImage').src = project.mainImage;

        // Galeri görsellerini güncelle
        const galleryGrid = document.getElementById('galleryGrid');
        galleryGrid.innerHTML = project.gallery.map((img, index) => `
            <div class="gallery-item ${index === 2 ? 'large' : ''}">
                <img src="${img}" alt="Proje Görsel ${index + 1}">
            </div>
        `).join('');

        // Navigasyonu güncelle
        document.querySelector('.nav-project.prev').href = `project-detail.html?id=${project.prev.id}`;
        document.querySelector('.nav-project.prev .nav-title').textContent = project.prev.title;
        document.querySelector('.nav-project.next').href = `project-detail.html?id=${project.next.id}`;
        document.querySelector('.nav-project.next .nav-title').textContent = project.next.title;

        // Sayfa başlığını güncelle
        document.title = `${project.title} | RioFrame`;
    }
});
