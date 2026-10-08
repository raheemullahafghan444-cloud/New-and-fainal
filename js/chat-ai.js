// ==========================================
// سیستم چت پشتیبانی و دستیار هوش مصنوعی
// ==========================================
const ChatAI = {
    knowledge: {
        'نحوه ثبت سفارش': 'برای ثبت سفارش: محصول را به سبد خرید اضافه → فرم را تکمیل → تأیید کنید ✅',
        'هزینه تحویل': 'هزینه تحویل بسته به منطقه ۵۰ تا ۱۵۰ افغانی است.',
        'زمان رسیدن سفارش': 'سفارش در همان روز یا حداکثر تا ۲۴ ساعت تحویل داده می‌شود ⏱️',
        'ثبت نام فروشنده': 'ثبت نام → انتخاب نقش → تأیید شماره → تنظیم رمز ✅',
        'تغییر یا لغو سفارش': 'از طریق همین چت یا تماس، در صورت عدم ارسال رایگان لغو می‌شود.',
        'پیش‌فرض': 'متشکریم! پیام شما دریافت شد، در کمتر از چند دقیقه پاسخ می‌دهیم 📩'
    },

    init() {
        this.bindEvents();
        this.loadHistory();
    },

    bindEvents() {
        document.getElementById('chatToggleBtn')?.addEventListener('click', () => this.toggle());
        document.getElementById('chatCloseBtn')?.addEventListener('click', () => this.close());
        document.getElementById('chatSendBtn')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput')?.addEventListener('keydown', e => e.key === 'Enter' && this.sendMessage());
        document.querySelectorAll('.ai-reply-btn').forEach(btn => {
            btn.addEventListener('click', () => this.answerQuick(btn.dataset.q));
        });
    },

    toggle() {
        document.getElementById('chatWindow')?.classList.toggle('hidden');
    },

    close() {
        document.getElementById('chatWindow')?.classList.add('hidden');
    },

    sendMessage() {
        const input = document.getElementById('chatInput');
        const text = input?.value.trim();
        if (!text) return;
        
        this.addMessage(text, 'user');
        input.value = '';
        setTimeout(() => this.respondAI(text), 600);
    },

    respondAI(userText) {
        let answer = this.knowledge['پیش‌فرض'];
        for (const [q, a] of Object.entries(this.knowledge)) {
            if (userText.includes(q) || q.includes(userText)) {
                answer = a;
                break;
            }
        }
        this.addMessage(answer, 'ai');
