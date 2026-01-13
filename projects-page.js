/* ============================
   PROJECTS PAGE JAVASCRIPT
   ============================ */

document.addEventListener('DOMContentLoaded', function () {
    // Filtre butonları
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Aktif butonu güncelle
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter;

            // Projeleri filtrele
            projectItems.forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.classList.remove('hidden');
                    // Re-trigger animation
                    item.style.animation = 'none';
                    item.offsetHeight; // Trigger reflow
                    item.style.animation = null;
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
});
