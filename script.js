/* ============================
   RioFrame - JavaScript
   3D Logo Animasyonu & Etkileşimler
   ============================ */

// DOM yüklendiğinde
document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    init3DLogo();
    initFloatingFrames();
    initScrollReveal();
});

/* ============================
   SCROLL REVEAL ANIMATIONS
   ============================ */
function initScrollReveal() {
    // Reveal edilecek tüm elementleri seç
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    if (revealElements.length === 0) return;

    // IntersectionObserver options
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px 0px -50px 0px', // Biraz önce tetikle
        threshold: 0.1 // %10 görünür olunca tetikle
    };

    // Observer callback
    const revealOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Bir kez gösterildikten sonra izlemeyi bırak
                observer.unobserve(entry.target);
            }
        });
    };

    // Observer oluştur ve elementleri izlemeye başla
    const observer = new IntersectionObserver(revealOnScroll, observerOptions);
    revealElements.forEach(el => observer.observe(el));
}

/* ============================
   PARTICLE BACKGROUND SYSTEM
   ============================ */
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 50;

    // Canvas boyutlarını ayarla
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle sınıfı
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.fadeDirection = Math.random() > 0.5 ? 1 : -1;
            // Gold renk tonları
            const goldHue = 40 + Math.random() * 10; // 40-50 arası (sarı-gold)
            this.color = `hsla(${goldHue}, 70%, 55%, ${this.opacity})`;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Opacity pulsing
            this.opacity += this.fadeDirection * 0.005;
            if (this.opacity >= 0.6) this.fadeDirection = -1;
            if (this.opacity <= 0.1) this.fadeDirection = 1;

            // Ekran dışına çıkarsa reset
            if (this.x < 0 || this.x > canvas.width ||
                this.y < 0 || this.y > canvas.height) {
                this.reset();
            }

            // Rengi güncelle
            const goldHue = 40 + Math.random() * 10;
            this.color = `hsla(${goldHue}, 70%, 55%, ${this.opacity})`;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();

            // Glow efekti
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(184, 151, 90, 0.3)';
        }
    }

    // Particle'ları oluştur
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Animasyon döngüsü
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // Particle'lar arası çizgiler (bağlantılar)
        connectParticles();

        requestAnimationFrame(animate);
    }

    // Yakın particle'ları birbirine bağla
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(184, 151, 90, ${0.1 * (1 - distance / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    animate();
}

// Particle'ları başlat
document.addEventListener('DOMContentLoaded', initParticles);

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
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll efekti
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Navbar aktif durumunu section'a göre güncelle
        updateActiveNavLink();
    });

    // Mobile menü toggle
    if (navToggle) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Smooth scroll ve menü kapatma
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Hash linkleri için smooth scroll
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    // Smooth scroll
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // URL hash'i güncelle
                    history.pushState(null, null, href);
                }
            }

            // Mobil menüyü kapat
            navMenu.classList.remove('active');
            if (navToggle) navToggle.classList.remove('active');
        });
    });

    // Sayfa yüklendiğinde hash varsa smooth scroll yap
    if (window.location.hash) {
        setTimeout(() => {
            const targetElement = document.getElementById(window.location.hash.substring(1));
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
    }
}

// Görünen section'a göre navbar linkini aktif yap
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let currentSection = 'home';
    const scrollPos = window.scrollY + 150; // Offset

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    // Aktif sınıfı güncelle
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');

        // Hash linkler için
        if (href === `#${currentSection}`) {
            link.classList.add('active');
        }
        // Home için özel kontrol
        if (currentSection === 'home' && (href === '#home' || href === '#')) {
            link.classList.add('active');
        }
    });
}

/* ============================
   3D LOGO ANİMASYONU (Three.js) - MULTI-LAYER
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

    // Logo grubu
    const logoGroup = new THREE.Group();
    scene.add(logoGroup);

    // PARÇA AYARLARI - Derinlik, Z pozisyonu, Yan renk ve Arka renk
    const layers = [
        { name: 'dışbeyaz', depth: 0.30, zOffset: 0, sideColor: 0xf5f5f5, backColor: 0xcccccc },
        { name: 'tamturuncu', depth: 0.40, zOffset: 0.15, sideColor: 0xB8975A, backColor: 0x5a4a2d },
        { name: 'dışyuvarlak', depth: 0.60, zOffset: 0.35, sideColor: 0xB8975A, backColor: 0x5a4a2d },
        { name: 'içyuvarlak', depth: 0.75, zOffset: 0.65, sideColor: 0xf0e6d3, backColor: 0xf5f5f5 },  // Arka beyaz
        { name: 'ortaturuncu', depth: 0.50, zOffset: 1.05, sideColor: 0xB8975A, backColor: 0x5a4a2d }
    ];

    let loadedCount = 0;
    const totalLayers = layers.length;

    // Her layer için mesh oluştur
    layers.forEach((layer, index) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = function () {
            // Canvas'tan texture oluştur
            const canvas2d = document.createElement('canvas');
            canvas2d.width = img.width;
            canvas2d.height = img.height;
            const ctx = canvas2d.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const texture = new THREE.CanvasTexture(canvas2d);
            texture.needsUpdate = true;

            // Logo boyutları
            const aspectRatio = texture.image.width / texture.image.height;
            const planeWidth = 7.5;
            const planeHeight = planeWidth / aspectRatio;

            // 3D BoxGeometry
            const boxGeometry = new THREE.BoxGeometry(planeWidth, planeHeight, layer.depth);

            // Ön yüz texture'lu
            const frontMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                transparent: true,
                metalness: 0.4,
                roughness: 0.3,
                depthWrite: true,
            });

            // Yan yüzler - her layer için özel renk
            const sideMaterial = new THREE.MeshStandardMaterial({
                color: layer.sideColor,
                metalness: 0.6,
                roughness: 0.3,
                transparent: true,
                opacity: 0.95
            });

            // Arka yüz - her layer için özel renk
            const backMaterial = new THREE.MeshStandardMaterial({
                color: layer.backColor,
                metalness: 0.5,
                roughness: 0.4,
                transparent: true,
            });

            const materials = [
                sideMaterial, sideMaterial, sideMaterial, sideMaterial,
                frontMaterial, backMaterial
            ];

            const mesh = new THREE.Mesh(boxGeometry, materials);
            mesh.position.z = layer.zOffset;
            mesh.name = layer.name;
            mesh.renderOrder = index;
            logoGroup.add(mesh);

            loadedCount++;
            console.log(`Loaded: ${layer.name} (${loadedCount}/${totalLayers})`);

            // Tüm parçalar yüklenince animasyonu başlat
            if (loadedCount === totalLayers) {
                startAnimation();
            }
        };

        img.onerror = function () {
            console.error(`Logo parçası yüklenemedi: ${layer.name}`);
            loadedCount++;
        };

        img.src = `logo/${layer.name}.png`;
    });

    // Işıklandırma
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xB8975A, 1.2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-5, -5, 5);
    scene.add(directionalLight2);

    const backLight = new THREE.DirectionalLight(0xB8975A, 0.4);
    backLight.position.set(0, 0, -5);
    scene.add(backLight);

    const pointLight = new THREE.PointLight(0xB8975A, 0.6, 12);
    pointLight.position.set(0, 0, 4);
    scene.add(pointLight);

    // Mouse takibi
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;

    document.addEventListener('mousemove', function (e) {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    // Animasyon başlatıcı
    function startAnimation() {
        let time = 0;

        function animate() {
            requestAnimationFrame(animate);
            time += 0.005;

            targetRotationY = Math.sin(time) * 0.4 + mouseX * 0.3;
            targetRotationX = Math.cos(time * 0.5) * 0.15 + mouseY * 0.15;

            logoGroup.rotation.y += (targetRotationY - logoGroup.rotation.y) * 0.05;
            logoGroup.rotation.x += (targetRotationX - logoGroup.rotation.x) * 0.05;
            logoGroup.position.y = Math.sin(time * 2) * 0.1;

            pointLight.intensity = 0.6 + Math.sin(time * 3) * 0.2;

            renderer.render(scene, camera);
        }

        animate();
    }

    // Resize handler
    window.addEventListener('resize', function () {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}
