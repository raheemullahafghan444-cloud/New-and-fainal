// ==========================================
// مدیریت محصولات — کامل و بدون نقص
// ==========================================
const Products = {
    currentMode: localStorage.getItem('viewMode') || '3d',
    currentCategory: 'all',
    items: [], // داده‌ها از گوگل شیت هم می‌آیند + داده‌های پیش‌فرض

    // داده‌های پیش‌فرض (تا اتصال گوگل شیت فعال شود)
    defaultItems: [
        { id: 1, name: 'پیراهن مردانه', price: 850, seller: 'فروشگاه نمونه', category: 'مردانه', icon: '👔' },
        { id: 2, name: 'شلوار زنانه', price: 650, seller: 'فروشگاه نمونه', category: 'زنانه', icon: '👗' },
        { id: 3, name: 'کفش ورزشی بچه', price: 1200, seller: 'فروشگاه ورزش', category: 'بچه', icon: '👟' },
        { id: 4, name: 'گوشی هوشمند', price: 8500, seller: 'تکنو شاپ', category: 'تکنالوژی', icon: '📱' },
        { id: 5, name: 'چراغ میز', price: 350, seller: 'لوازم خانه روشن', category: 'خانه', icon: '💡' },
        { id: 6, name: 'کابل شارژ', price: 120, seller: 'تکنو شاپ', category: 'تکنالوژی', icon: '🔌' }
    ],

    async init() {
        console.log('📦 بارگذاری محصولات...');
        this.items = [...this.defaultItems]; // ابتدا داده‌های پیش‌فرض
        this.setupViewMode();
        this.setupCategories();
        await this.loadFromGoogleSheet(); // سپس از سرور
        this.render();
    },

    // تغییر حالت نمایش 2D / 3D
    setupViewMode() {
        const buttons = document.querySelectorAll('.view-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentMode = btn.dataset.mode;
                localStorage.setItem('viewMode', this.currentMode);
                this.updateGridClass();
                this.render();
            });
        });

        // تنظیم اولیه
        const activeBtn = document.querySelector(`[data-mode="${this.currentMode}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        this.updateGridClass();
    },

    updateGridClass() {
        const grid = document.getElementById('productGrid');
        if (grid) grid.className = `product-grid mode-${this.currentMode}`;
    },

    // انتخاب دسته‌بندی
    setupCategories() {
        const categoryList = document.getElementById('categoryList');
        if (!categoryList) return;

        categoryList.addEventListener('click', (e) => {
            const item = e.target.closest('.category-item');
            if (!item) return;
            
            document.querySelectorAll('.category-item').forEach(c => c.classList.remove('active'));
            item.classList.add('active');
            this.currentCategory = item.dataset.cat;
            this.render();
        });
    },

    // بارگذاری از گوگل شیت
    async loadFromGoogleSheet() {
        if (!App.API_URL || App.API_URL === "") {
            console.log('⚠️ آدرس سرور تنظیم نشده — از داده‌های پیش‌فرض استفاده می‌شود');
            return;
        }

        try {
            const res = await fetch(`${App.API_URL}?action=getProducts`);
            const result = await res.json();
            
            if (result.success && result.data) {
                // ادغام داده‌های سرور با داده‌های پیش‌فرض
                const serverItems = result.data.map((p, i) => ({
                    id: 100 + i,
                    name: p.name || 'نام نامشخص',
                    price: p.price || 0,
                    seller: p.seller || 'فروشنده',
                    category: p.category || 'همه',
                    icon: this.getIcon(p.category)
                }));
                this.items = [...serverItems, ...this.defaultItems];
                console.log(`✅ ${serverItems.length} محصول از گوگل شیت دریافت شد`);
            }
        } catch (err) {
            console.log('❌ خطا در اتصال به گوگل شیت:', err.message);
        }
    },

    // انتخاب آیکون بر اساس دسته‌بندی
    getIcon(category) {
        const icons = {
            'مردانه': '👔',
            'زنانه': '👗',
            'بچه': '🧸',
            'برقی': '🔌',
            'خانه': '🏠',
            'تکنالوژی': '📱'
        };
        return icons[category] || '🛍️';
    },

    // نمایش محصولات در صفحه
    render() {
        const grid = document.getElementById('productGrid');
        if (!grid) {
            console.log('❌ المنت productGrid در HTML پیدا نشد!');
            return;
        }

        // فیلتر بر اساس دسته‌بندی
        const filtered = this.currentCategory === 'all'
            ? this.items
            : this.items.filter(p => p.category === this.currentCategory);

        if (!filtered.length) {
            grid.innerHTML = `<p class="text-center" style="grid-column:1/-1;color:var(--gray)">هیچ محصولی در این دسته موجود نیست 😔</p>`;
            return;
        }

        // ساخت کارت‌ها
        grid.innerHTML = filtered.map(p => this.createCard(p)).join('');
        
        // اتصال رویداد دکمه‌های «افزودن به سبد»
        grid.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.name;
                const price = parseInt(btn.dataset.price);
                if (window.Cart && Cart.add) {
                    Cart.add({ name, price });
                } else {
                    alert('سبد خرید بارگذاری نشده! صفحه را مجدداً باز کنید.');
                }
            });
        });
    },

    // ساخت کد HTML یک کارت محصول
    createCard(product) {
        if (this.currentMode === '2d') {
            return `
                <div class="product-card" data-id="${product.id}">
                    <div class="product-img">${product.icon}</div>
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="price">${product.price.toLocaleString('fa-AF')} افغانی</div>
                        <button class="add-to-cart" data-name="${product.name}" data-price="${product.price}">افزودن</button>
                    </div>
                </div>
            `;
        }
        
        // حالت 3D
        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-img">${product.icon}</div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-seller">فروشنده: ${product.seller}</div>
                    <div class="price">${product.price.toLocaleString('fa-AF')} افغانی</div>
                    <button class="add-to-cart" data-name="${product.name}" data-price="${product.price}">افزودن به سبد خرید</button>
                </div>
            </div>
        `;
    }
};

// راه‌اندازی
document.addEventListener('DOMContentLoaded', () => Products.init());
