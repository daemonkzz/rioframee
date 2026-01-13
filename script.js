/* ============================
   RioFrame - JavaScript
   3D Logo Animasyonu & Etkileşimler
   ============================ */

// DOM yüklendiğinde
document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    init3DLogo();
    initFloatingFrames();
});

/* ============================
   FLOATING FRAMES - Random Görsel Seçimi
   ============================ */
function initFloatingFrames() {
    // Portfolyo görselleri - Kendi görsellerinizi buraya ekleyin
    // Görselleri 'images/' klasörüne koyun ve yolları güncelleyin
    const portfolioImages = [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=220&fit=crop',
        'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&h=220&fit=crop',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=220&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=220&fit=crop',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=220&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=220&fit=crop',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=220&fit=crop',
        'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&h=220&fit=crop',
        'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&h=220&fit=crop',
        'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=300&h=220&fit=crop'
    ];

    // Fisher-Yates Shuffle - Gerçek rastgele karıştırma
    const shuffleArray = (array) => {
        const arr = [...array]; // Kopya oluştur
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    // Rastgele 4 görsel seç
    const shuffled = shuffleArray(portfolioImages);
    const selectedImages = shuffled.slice(0, 4);

    // Frame'lere görselleri yerleştir
    const frames = document.querySelectorAll('.photo-frame img');
    frames.forEach((img, index) => {
        if (selectedImages[index]) {
            img.src = selectedImages[index];
            img.alt = `Portfolyo Projesi ${index + 1}`;
        }
    });
}

/* ============================
   SAYAÇ ANİMASYONU (Count Up)
   ============================ */
function initCountUp() {
    const statNumbers = document.querySelectorAll('.stat-number');

    const animateValue = (element, start, end, duration) => {
        const startTime = performance.now();
        const suffix = element.textContent.replace(/[0-9]/g, ''); // +, %, etc.

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (end - start) * easeOut);

            element.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    };

    // Intersection Observer ile görünürlük kontrolü
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const text = element.textContent;
                const value = parseInt(text.replace(/\D/g, ''));

                // Biraz gecikme ile başlat
                setTimeout(() => {
                    animateValue(element, 0, value, 2000);
                }, 500);

                observer.unobserve(element);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => observer.observe(stat));
}

// Sayaç animasyonunu başlat
document.addEventListener('DOMContentLoaded', initCountUp);

/* ============================
   NAVBAR İŞLEVLERİ
   ============================ */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Scroll efekti
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menü toggle
    navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Menü linklerine tıklandığında menüyü kapat
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function () {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

/* ============================
   3D LOGO ANİMASYONU (Three.js)
   ============================ */
function init3DLogo() {
    const canvas = document.getElementById('logo3d');
    if (!canvas) return;

    const container = canvas.parentElement;

    // Scene oluştur
    const scene = new THREE.Scene();

    // Camera oluştur
    const camera = new THREE.PerspectiveCamera(
        50,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 6;

    // Renderer oluştur
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Logo texture yükle - CORS için Image objesi kullan
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
        // Canvas'tan texture oluştur (CORS bypass)
        const canvas2d = document.createElement('canvas');
        canvas2d.width = img.width;
        canvas2d.height = img.height;
        const ctx = canvas2d.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const texture = new THREE.CanvasTexture(canvas2d);
        texture.needsUpdate = true;

        // Logo boyutları - %50 DAHA BÜYÜK
        const aspectRatio = texture.image.width / texture.image.height;
        const planeWidth = 7.5; // %50 büyütüldü (önceki: 5)
        const planeHeight = planeWidth / aspectRatio;
        const depth = 0.15; // İnce 3D derinlik (çizgi sorunu düzeltildi)

        // 3D EXTRUDE için BoxGeometry kullan
        const boxGeometry = new THREE.BoxGeometry(planeWidth, planeHeight, depth);

        // Ön yüz için texture'lu material
        const frontMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            metalness: 0.4,
            roughness: 0.3,
        });

        // Yan ve arka yüzler için altın renkli material
        const sideMaterial = new THREE.MeshStandardMaterial({
            color: 0xB8975A,
            metalness: 0.6,
            roughness: 0.3,
        });

        // Arka yüz için koyu material
        const backMaterial = new THREE.MeshStandardMaterial({
            color: 0x5a4a2d,
            metalness: 0.5,
            roughness: 0.4,
        });

        // 6 yüz için material array: [sağ, sol, üst, alt, ön, arka]
        const materials = [
            sideMaterial,  // sağ
            sideMaterial,  // sol
            sideMaterial,  // üst
            sideMaterial,  // alt
            frontMaterial, // ön (logo texture)
            backMaterial   // arka
        ];

        const logoMesh = new THREE.Mesh(boxGeometry, materials);
        scene.add(logoMesh);

        // Işıklandırma
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xB8975A, 1.2);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight2.position.set(-5, -5, 5);
        scene.add(directionalLight2);

        // Arka ışık (derinliği vurgulamak için)
        const backLight = new THREE.DirectionalLight(0xB8975A, 0.4);
        backLight.position.set(0, 0, -5);
        scene.add(backLight);

        // Point light for subtle glow
        const pointLight = new THREE.PointLight(0xB8975A, 0.6, 12);
        pointLight.position.set(0, 0, 4);
        scene.add(pointLight);

        // Mouse takibi için değişkenler
        let mouseX = 0;
        let mouseY = 0;
        let targetRotationX = 0;
        let targetRotationY = 0;

        // Mouse hareketi dinle
        document.addEventListener('mousemove', function (e) {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = (e.clientY / window.innerHeight) * 2 - 1;
        });

        // Animasyon döngüsü
        let time = 0;
        function animate() {
            requestAnimationFrame(animate);
            time += 0.005;

            // Yavaş otomatik dönüş - 3D derinliği göstermek için daha geniş açı
            targetRotationY = Math.sin(time) * 0.4 + mouseX * 0.3;
            targetRotationX = Math.cos(time * 0.5) * 0.15 + mouseY * 0.15;

            // Smooth interpolation
            logoMesh.rotation.y += (targetRotationY - logoMesh.rotation.y) * 0.05;
            logoMesh.rotation.x += (targetRotationX - logoMesh.rotation.x) * 0.05;

            // Hafif yukarı-aşağı salınım
            logoMesh.position.y = Math.sin(time * 2) * 0.1;

            // Point light animasyonu
            pointLight.intensity = 0.6 + Math.sin(time * 3) * 0.2;

            renderer.render(scene, camera);
        }

        animate();

        // Pencere boyutu değiştiğinde
        window.addEventListener('resize', function () {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    };

    img.onerror = function (error) {
        console.log('Logo yüklenemedi:', error);
    };

    // Logo yolunu ayarla
    img.src = 'rioframelogo.png';
}
