/* ============================
   CONTACT MODAL - JavaScript
   ============================ */

// API Config
const isLocalDev = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';
const API_URL = isLocalDev ? 'http://localhost:3000/api' : '/api';

// Rate limiting - 30 saniyede bir form
let lastSubmitTime = 0;
const RATE_LIMIT_MS = 30000; // 30 saniye

document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('contactModal');
    const backdrop = modal?.querySelector('.modal-backdrop');
    const closeBtn = modal?.querySelector('.modal-close');
    const tabs = modal?.querySelectorAll('.modal-tab');
    const tabContents = modal?.querySelectorAll('.modal-tab-content');
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');

    // Modal açma - İletişim butonlarını bul
    const contactLinks = document.querySelectorAll('a[href="#contact"], .nav-cta');
    contactLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            openModal();
        });
    });

    // Modal kapatma
    closeBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);

    // ESC tuşu ile kapatma
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            closeModal();
        }
    });

    // Tab değiştirme
    tabs?.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabId = this.dataset.tab;

            // Aktif tab'ı güncelle
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // İçeriği göster
            tabContents?.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Form gönderimi
    contactForm?.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Rate limiting kontrolü
        const now = Date.now();
        const timeSinceLastSubmit = now - lastSubmitTime;

        if (timeSinceLastSubmit < RATE_LIMIT_MS) {
            const remainingSeconds = Math.ceil((RATE_LIMIT_MS - timeSinceLastSubmit) / 1000);
            showMessage(`Lütfen ${remainingSeconds} saniye bekleyin.`, 'error');
            return;
        }

        // Form verilerini al
        const name = document.getElementById('contactName').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();
        const message = document.getElementById('contactMessage').value.trim();

        // Validasyon
        if (!name || !phone || !message) {
            showMessage('Lütfen tüm alanları doldurun.', 'error');
            return;
        }

        // Telefon numarası validasyonu
        const phoneRegex = /^[0-9\s\-\+\(\)]{10,20}$/;
        if (!phoneRegex.test(phone)) {
            showMessage('Geçerli bir telefon numarası girin.', 'error');
            return;
        }

        // Butonu devre dışı bırak
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Gönderiliyor...</span>';

        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, phone, message })
            });

            const result = await response.json();

            if (response.ok) {
                lastSubmitTime = Date.now();
                showMessage('Mesajınız gönderildi! En kısa sürede sizinle iletişime geçeceğiz.', 'success');
                contactForm.reset();

                // 3 saniye sonra modal kapat
                setTimeout(() => {
                    closeModal();
                    formMessage.className = 'form-message';
                    formMessage.style.display = 'none';
                }, 3000);
            } else {
                showMessage(result.error || 'Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
            }
        } catch (error) {
            console.error('Form submit error:', error);
            showMessage('Bağlantı hatası. Lütfen tekrar deneyin.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <span>Gönder</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
            `;
        }
    });

    // Modal açma fonksiyonu
    function openModal() {
        modal?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Modal kapatma fonksiyonu
    function closeModal() {
        modal?.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Mesaj gösterme fonksiyonu
    function showMessage(text, type) {
        if (!formMessage) return;
        formMessage.textContent = text;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';
    }
});
