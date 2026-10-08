// ==========================================
// سیستم ورود، ثبت‌نام و تأیید کد
// ==========================================
const Auth = {
    currentUser: null,
    regData: {},
    codeVerified: false,
    timer: null,

    init() {
        this.loadUser();
        this.bindEvents();
    },

    loadUser() {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
            this.currentUser = JSON.parse(saved);
            this.updateUI();
        }
    },

    bindEvents() {
        document.getElementById('registerBtn')?.addEventListener('click', () => this.openRegister());
        document.getElementById('loginBtn')?.addEventListener('click', () => this.openLogin());
        document.getElementById('sendCodeBtn')?.addEventListener('click', () => this.sendCode());
        document.getElementById('verifyCodeBtn')?.addEventListener('click', () => this.checkCode());
        document.getElementById('resendCodeBtn')?.addEventListener('click', () => this.resendCode());
        document.getElementById('finalRegisterBtn')?.addEventListener('click', () => this.completeRegister());
        document.getElementById('doLoginBtn')?.addEventListener('click', () => this.login());
        
        document.addEventListener('click', e => {
            if (e.target.id === 'logoutBtn') this.logout();
            if (e.target.id === 'goRegFromLogin') {
                e.preventDefault();
                document.getElementById('loginModal').classList.add('hidden');
                this.openRegister();
            }
        });
    },

    openRegister() {
        this.regData = {};
        this.codeVerified = false;
        document.getElementById('registerModal').classList.remove('hidden');
        this.showStep(1);
    },

    showStep(n) {
        [1,2,3].forEach(s => {
            document.querySelector(`[data-step="${s}"]`).classList.toggle('active', s === n);
            document.getElementById(`regStep${s}`).classList.toggle('hidden', s !== n);
        });
    },

    sendCode() {
        const role = document.getElementById('regRole').value;
        const phone = document.getElementById('regPhone').value.trim();
        if (!role || !phone) return alert('نقش و شماره تماس را وارد کنید');

        this.regData = { role, phone };
        this.regData.sentCode = '1234'; // کد تست
        
        this.showStep(2);
        this.startTimer();
    },

    startTimer() {
        let sec = 60;
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            sec--;
            if (sec <= 0) { clearInterval(this.timer); return; }
            document.getElementById('codeTimer').textContent = `کد را تا ۰۰:${sec.toString().padStart(2,'0')} وارد کنید`;
        }, 1000);
    },

    checkCode() {
        const entered = document.getElementById('verifyCode').value.trim();
        if (entered === '1234') {
            this.codeVerified = true;
            clearInterval(this.timer);
            this.showStep(3);
            document.getElementById('sellerFields').style.display = this.regData.role === 'seller' ? 'block' : 'none';
            document.getElementById('deliveryFields').style.display = this.regData.role === 'delivery' ? 'block' : 'none';
        } else {
            alert('کد صحیح نیست! کد تست: 1234');
        }
    },

    resendCode() {
        alert('کد جدید ارسال شد! کد تست: 1234');
        this.regData.sentCode = '1234';
        this.startTimer();
    },

    completeRegister() {
        if (!this.codeVerified) return alert('ابتدا کد را تأیید کنید');
        const pass = document.getElementById('regPassword').value;
        const pass2 = document.getElementById('regPassword2').value;
        if (pass.length < 6) return alert('رمز حداقل ۶ کاراکتر باشد');
        if (pass !== pass2) return alert('تکرار رمز مطابقت ندارد');

        alert('✅ ثبت نام کامل شد! اکنون وارد حساب خود شوید.');
        document.getElementById('registerModal').classList.add('hidden');
        this.openLogin();
    },

    openLogin() {
        document.getElementById('loginModal').classList.remove('hidden');
    },

    login() {
        const role = document.getElementById('loginRole').value;
        const id = document.getElementById('loginId').value.trim();
        const phone = document.getElementById('loginPhone').value.trim();
        if (!role || !id || !phone) return alert('همه فیلدها را پر کنید');

        this.currentUser = {
            role,
            name: id,
            shop: role === 'seller' ? id : null,
            phone
        };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.updateUI();
        document.getElementById('loginModal').classList.add('hidden');
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
    },

    updateUI() {
        const area = document.getElementById('userArea');
        const subNav = document.getElementById('subNav');
        const panelLink = document.getElementById('rolePanelLink');

        if (this.currentUser) {
            area.innerHTML = `
                <span class="user-name">خوش آمدی، ${this.currentUser.shop || this.currentUser.name}</span>
                <button class="btn btn-sm btn-outline" id="logoutBtn">خروج</button>
            `;
            subNav.style.display = 'flex';
            panelLink.style.display = 'inline-block';
            panelLink.textContent = this.currentUser.role === 'seller' ? 'پنل فروشنده' : 'پنل دلیور';
        } else {
            area.innerHTML = `
                <button class="btn btn-sm btn-outline" id="loginBtn">ورود</button>
                <button class="btn btn-sm btn-secondary" id="registerBtn">ثبت نام</button>
            `;
            subNav.style.display = 'none';
            panelLink.style.display = 'none';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Auth.init());
