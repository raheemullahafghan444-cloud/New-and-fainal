// ==========================================
// مدیریت سبد خرید و ثبت سفارش
// ==========================================
const Cart = {
    items: [],

    init() {
        this.load();
        this.bindEvents();
        this.updateUI();
    },

    load() {
        const saved = localStorage.getItem('cart');
        if (saved) this.items = JSON.parse(saved);
    },

    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    },

    bindEvents() {
        // افزودن به سبد
        document.addEventListener('click', e => {
            if (e.target.classList.contains('add-to-cart')) {
                const card = e.target.closest('.product-card');
                this.add({
                    name: card.dataset.name,
                    price: parseInt(card.dataset.price)
                });
            }
        });

        // ثبت سفارش
        document.getElementById('checkoutBtn')?.addEventListener('click', () => {
            if (this.items.length === 0) return;
            const total = this.getTotal();
            document.getElementById('finalTotal').textContent = total.toLocaleString('fa-AF');
            document.getElementById('checkoutModal').classList.remove('hidden');
        });

        // ارسال فرم سفارش
        document.getElementById('checkoutForm')?.addEventListener('submit', e => {
            e.preventDefault();
            alert('✅ سفارش شما با موفقیت ثبت شد!');
            this.clear();
            document.getElementById('checkoutModal').classList.add('hidden');
            e.target.reset();
        });
    },

    add(product) {
        this.items.push(product);
        this.save();
        this.updateUI();
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + item.price, 0);
    },

    clear() {
        this.items = [];
        this.save();
        this.updateUI();
    },

    updateUI() {
        const container = document.getElementById('cartSection');
        const itemsEl = document.getElementById('cartItems');
        const totalEl = document.getElementById('cartTotal');

        if (this.items.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        itemsEl.innerHTML = this.items.map(i => `
            <div class="cart-item">
                <span>${i.name}</span>
                <span>${i.price.toLocaleString('fa-AF')}</span>
            </div>
        `).join('');
        totalEl.textContent = this.getTotal().toLocaleString('fa-AF');
    }
};

document.addEventListener('DOMContentLoaded', () => Cart.init());
