/* ============================
   COMPONENT LOADER
   Modal ve diğer componentleri dinamik yükler
   ============================ */

class ComponentLoader {
    static async loadHTML(componentPath, targetSelector) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) throw new Error(`Component yüklenemedi: ${componentPath}`);

            const html = await response.text();
            const target = document.querySelector(targetSelector);

            if (target) {
                target.insertAdjacentHTML('beforeend', html);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Component Loader Error:', error);
            return false;
        }
    }

    static async loadContactModal() {
        // Modal zaten varsa yükleme
        if (document.getElementById('contactModal')) {
            return true;
        }

        // Modal'ı body'e ekle
        const success = await this.loadHTML('components/contact-modal.html', 'body');

        if (success) {
            // Modal script'ini yeniden başlat
            this.initContactModal();
        }

        return success;
    }

    static initContactModal() {
        const modal = document.getElementById('contactModal');
        if (!modal) return;

        const backdrop = modal.querySelector('.modal-backdrop');
        const closeBtn = modal.querySelector('.modal-close');
        const tabs = modal.querySelectorAll('.modal-tab');
        const tabContents = modal.querySelectorAll('.modal-tab-content');

        // Kapatma
        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeBtn?.addEventListener('click', closeModal);
        backdrop?.addEventListener('click', closeModal);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Tab değiştirme
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === this.dataset.tab) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }
}

// Global erişim
window.ComponentLoader = ComponentLoader;

// Sayfa yüklendiğinde modal'ı otomatik yükle
document.addEventListener('DOMContentLoaded', () => {
    // Eğer sayfada modal placeholder varsa yükle
    if (document.querySelector('[data-component="contact-modal"]')) {
        ComponentLoader.loadContactModal();
    }
});
