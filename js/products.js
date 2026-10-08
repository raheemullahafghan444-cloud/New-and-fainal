// ==========================================
// مدیریت محصولات — کامل و اصلاح شده
// ==========================================
const Products = {
    currentMode: localStorage.getItem('viewMode') || '3d',
    currentCategory: 'all',
    items: [],

    defaultItems: [
        { id: 1, name: 'پیراهن مردانه', price: 850, seller: 'فروشگاه نمونه', category: 'مردانه', icon: '👔' },
        { id: 2, name: 'شلوار زنانه', price: 650, seller: 'فروشگاه نمونه', category: 'زنانه', icon: '👗' },
        { id: 3, name: 'کفش ورزشی بچه', price: 1200, seller: 'فروشگاه ورزش', category: 'بچه', icon: '👟' },
        { id: 4, name: 'گوشی هوشمند', price: 8500, seller: 'تکنو شاپ', category: 'تکنالوژی', icon: '📱' },
    ],

    async init() {
        console.log('📦 بارگذاری محصولات...');
        this.items = [...this.defaultItems];
        this.setupViewMode();
        this.setupCategories();
        this.setupAddProductForm(); // ← فرم ثبت محصول
        await this.loadFromGoogleSheet();
        this.render();
    },

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
        const activeBtn = document.querySelector(`[data-mode="${this.currentMode}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        this.updateGridClass();
    },

    updateGridClass() {
        const grid = document.getElementById('productGrid');
        if (grid) grid.className = `product-grid mode-${this.currentMode}`;
    },

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

    // ✅ فرم افزودن محصول — اصلاح شده
    setupAddProductForm() {
        const form = document.getElementById('addProductForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // بررسی ورود کاربر
            if (!window.Auth || !Auth.currentUser || Auth.currentUser.role !== 'seller') {
                alert('⚠️ فقط فروشندگان می‌توانند محصول اضافه کنند! ابتدا وارد حساب خود شوید.');
                return;
            }

            // گرفتن مقادیر
            const name = document.getElementById('prodName').value.trim();
            const price = parseInt(document.getElementById('prodPrice').value);
            const discount = document.getElementById('prodDiscount').value ? parseInt(document.getElementById('prodDiscount').value) : null;
            const category = document.getElementById('prodCategory').value;
            const desc = document.getElementById('prodDesc').value.trim();

            if (!name || !price || !category) {
                alert('لطفاً تمام فیلدهای الزامی را پر کنید!');
                return;
            }

            const msgEl = document.getElementById('productMsg');
            try {
                if (!App.API_URL) {
                    // حالت تست — بدون اتصال به سرور
                    this.items.unshift({
                        id: Date.now(),
                        name: name,
                        price: price,
                        category: category,
                        seller: Auth.currentUser.shop || 'من',
                        icon: this.getIcon(category)
                    });
                    this.render();
                    form.reset();
                    msgEl.textContent = '✅ محصول اضافه شد (حالت تست)';
                    msgEl.className = 'message success';
                    setTimeout(() => msgEl.style.display = 'none', 4000);
                    return;
                }

                // ارسال به سرور
                const payload = {
                    action: 'addProduct',
                    name: name,
                    price: price,
                    category: category,
                    sellerShop: Auth.currentUser.shop || Auth.currentUser.name,
                    discountPrice: discount,
                    description: desc
                };

                console.log('📤 ارسال محصول:', payload);

                const res = await fetch(App.API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                // به‌روزرسانی لیست
                await this.loadFromGoogleSheet();
                this.render();
                form.reset();

                msgEl.textContent = '✅ محصول با موفقیت ثبت شد!';
                msgEl.className = 'message success';
                setTimeout(() => msgEl.style.display = 'none', 4000);

            } catch (err) {
                console.error('❌ خطا:', err);
                msgEl.textContent = '❌ خطا در ثبت محصول: ' + err.message;
                msgEl.className = 'message error';
            }
        });
    },

    async loadFromGoogleSheet() {
        if (!App.API_URL || App.API_URL === "") {
            console.log('⚠️ آدرس API تنظیم نشده — از داده‌های محلی استفاده می‌شود');
            return;
        }

        try {
            const res = await fetch(`${App.API_URL}?action=getProducts`);
            const result = await res.json();
            
            if (result.success && result.products) {
                const serverItems = result.products.map((p, i) => ({
                    id: 1000 + i,
                    name: p.name || 'نام نامشخص',
                    price: p.price || 0,
                    seller: p.sellerShop || 'فروشنده',
                    category: p.category || 'عمومی',
                    icon: this.getIcon(p.category)
                }));
                this.items = [...serverItems, ...this.defaultItems];
                console.log(`✅ ${serverItems.length} محصول از سرور دریافت شد`);
            }
        } catch (err) {
            console.log('❌ خطا در بارگذاری:', err.message);
        }
    },

    getIcon(category) {
        const icons = {
            'مردانه': '👔', 'زنانه': '👗', 'بچه': '🧸',
            'برقی': '🔌', 'خانه': '🏠', 'تکنالوژی': '📱'
        };
        return icons[category] || '🛍️';
    },

    render() {
        const grid = document.getElementById('productGrid');
        if (!grid) {
            console.log('❌ productGrid پیدا نشد!');
            return;
        }

        const filtered = this.currentCategory === 'all'
            ? this.items
            : this.items.filter(p => p.category === this.currentCategory);

        if (!filtered.length) {
            grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--gray)">محصولی موجود نیست</p>`;
            return;
        }

        grid.innerHTML = filtered.map(p => this.createCard(p)).join('');
        
        grid.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.name;
                const price = parseInt(btn.dataset.price);
                if (window.Cart && Cart.add) {
                    Cart.add({ name, price });
                } else {
                    alert('⚠️ سبد خرید آماده نیست، صفحه را بازخوانی کنید.');
                }
            });
        });
    },

    createCard(product) {
        if (this.currentMode === '2d') {
            return `
                <div class="product-card">
                    <div class="product-img">${product.icon}</div>
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="price">${product.price.toLocaleString('fa-AF')} افغانی</div>
                        <button class="add-to-cart" data-name="${product.name}" data-price="${product.price}">افزودن</button>
                    </div>
                </div>
            `;
        }
        return `
            <div class="product-card">
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

document.addEventListener('DOMContentLoaded', () => Products.init());
