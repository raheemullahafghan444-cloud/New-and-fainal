// ==========================================
// مدیریت محصولات و حالت نمایش
// ==========================================
const Products = {
    currentMode: localStorage.getItem('viewMode') || '3d',
    currentCategory: 'all',
    
    // نمونه داده‌ها — بعداً از سرور دریافت می‌شود
    items: [
        { id: 1, name: 'پیراهن مردانه', price: 850, seller: 'فروشگاه نمونه', category: 'مردانه', icon: '👔' },
        { id: 2, name: 'شلوار زنانه', price: 650, seller: 'فروشگاه نمونه', category: 'زنانه', icon: '👗' },
        { id: 3, name: 'کفش ورزشی', price: 1200, seller: 'فروشگاه ورزش', category: 'بچه', icon: '👟' },
        { id: 4, name: 'گوشی هوشمند', price: 8500, seller: 'تکنو شاپ', category: 'تکنالوژی', icon: '📱' },
    ],

    init() {
        this.setupViewMode();
        this.setupCategories();
        this.render();
    },

    setupViewMode() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentMode = btn.dataset.mode;
                localStorage.setItem('viewMode', this.currentMode);
                document.getElementById('productGrid').className = `product-grid mode-${this.currentMode}`;
            });
        });
        document.querySelector(`[data-mode="${this.currentMode}"]`)?.classList.add('active');
        document.getElementById('productGrid').className = `product-grid mode-${this.currentMode}`;
    },

    setupCategories() {
        document.getElementById('categoryList')?.addEventListener('click', e => {
            const item = e.target.closest('.category-item');
            if (!item) return;
            document.querySelectorAll('.category-item').forEach(c => c.classList.remove('active'));
            item.classList.add('active');
            this.currentCategory = item.dataset.cat;
            this.render();
        });
    },

    render() {
        const grid = document.getElementById('productGrid');
        if (!grid) return;

        const filtered = this.currentCategory === 'all' 
            ? this.items 
            : this.items.filter(p => p.category === this.currentCategory);

        if (!filtered.length) {
            grid.innerHTML = '<p class="text-center" style="grid-column:1/-1;color:var(--gray)">محصولی موجود نیست</p>';
            return;
        }

        grid.innerHTML = filtered.map(p => `
            <div class="product-card" data-name="${p.name}" data-price="${p.price}">
                <div class="product-img">${p.icon}</div>
                <div class="product-info">
                    <div class="product-name">${p.name}</div>
                    ${this.currentMode === '3d' ? `<div class="product-seller">${p.seller}</div>` : ''}
                    <div class="price">${p.price.toLocaleString('fa-AF')} افغانی</div>
                    <button class="add-to-cart">افزودن به سبد خرید</button>
                </div>
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => Products.init());
