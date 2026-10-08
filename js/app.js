// ==========================================
// تنظیمات سراسری پروژه
// ==========================================
const App = {
    API_URL: "", // آدرس سرور گوگل شیت را اینجا قرار دهید
    
    init() {
        console.log('✅ پروژه آسان خرید بارگذاری شد');
        this.setupNavigation();
    },

    setupNavigation() {
        // ناوبری اصلی
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
                document.getElementById(btn.dataset.page)?.classList.add('active');
                btn.classList.add('active');
            });
        });

        // ناوبری فرعی پنل‌ها
        document.querySelectorAll('.nav-sub-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-sub-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                document.getElementById(btn.dataset.sub)?.classList.add('active');
            });
        });
    }
};

// راه‌اندازی
document.addEventListener('DOMContentLoaded', () => App.init());
