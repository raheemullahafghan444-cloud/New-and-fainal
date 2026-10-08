// ==========================================
// کد اصلاح‌شده گوگل اپس اسکریپت
// ==========================================
const SHEET = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  let result = { success: false };

  try {
    const action = e.parameter.action;
    let data = {};

    // خواندن داده‌های ارسالی
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    switch (action) {
      case 'getProducts':
        result = { success: true, products: getProducts() };
        break;
      
      case 'addProduct':
        result = { success: addProduct(data) };
        break;
      
      case 'saveOrder':
        result = { success: saveOrder(data) };
        break;
      
      case 'saveChat':
        result = { success: saveChatMessage(data) };
        break;
      
      case 'registerSeller':
        result = { success: registerSeller(data) };
        break;
      
      case 'registerDelivery':
        result = { success: registerDelivery(data) };
        break;
      
      case 'getSellers':
        result = { success: true, sellers: getSellers() };
        break;
      
      case 'login':
        result = handleLogin(e);
        break;
      
      default:
        result = { success: false, error: 'عملیات نامشخص: ' + action };
    }
  } catch (err) {
    result = { success: false, error: err.message };
  }

  // بازگشت پاسخ با فرمت صحیح
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ——— خواندن محصولات ———
function getProducts() {
  let sheet = SHEET.getSheetByName('محصولات');
  if (!sheet) sheet = SHEET.getActiveSheet();
  
  const rows = sheet.getDataRange().getValues();
  const products = [];
  
  // ردیف اول (سرستون) را رد می‌کنیم
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[1]) { // اگر نام محصول وجود داشت
      products.push({
        name: row[1] || '',
        price: row[2] || 0,
        category: row[3] || 'عمومی',
        sellerShop: row[4] || 'فروشنده'
      });
    }
  }
  return products;
}

// ——— افزودن محصول جدید ———
function addProduct(data) {
  let sheet = SHEET.getSheetByName('محصولات');
  if (!sheet) {
    sheet = SHEET.insertSheet('محصولات');
    sheet.appendRow(['نوع', 'نام', 'قیمت', 'دسته_بندی', 'فروشگاه', 'تاریخ']);
  }
  
  sheet.appendRow([
    'محصول',
    data.name || '',
    data.price || 0,
    data.category || '',
    data.sellerShop || 'نامشخص',
    new Date()
  ]);
  return true;
}

// ——— ثبت سفارش ———
function saveOrder(data) {
  let sheet = SHEET.getSheetByName('سفارشات');
  if (!sheet) {
    sheet = SHEET.insertSheet('سفارشات');
    sheet.appendRow(['نوع', 'نام_مشتری', 'شماره', 'آدرس', 'اقلام', 'مجموع', 'تاریخ']);
  }
  
  sheet.appendRow([
    'سفارش',
    data.customerName || '',
    data.customerPhone || '',
    data.customerAddress || '',
    data.items || '',
    data.total || 0,
    new Date()
  ]);
  return true;
}

// ——— ذخیره پیام چت ———
function saveChatMessage(data) {
  let sheet = SHEET.getSheetByName('گفتگوهای_پشتیبانی');
  if (!sheet) {
    sheet = SHEET.insertSheet('گفتگوهای_پشتیبانی');
    sheet.appendRow(['فرستنده', 'متن', 'تاریخ']);
  }
  
  sheet.appendRow([
    data.sender || 'نامشخص',
    data.message || '',
    new Date(data.time) || new Date()
  ]);
  return true;
}

// ——— ثبت نام فروشنده ———
function registerSeller(data) {
  let sheet = SHEET.getSheetByName('فروشندگان');
  if (!sheet) {
    sheet = SHEET.insertSheet('فروشندگان');
    sheet.appendRow(['نام', 'فروشگاه', 'آدرس', 'شماره', 'رمز', 'تاریخ']);
  }
  
  sheet.appendRow([
    data.name || '',
    data.shop || '',
    data.address || '',
    data.phone || '',
    data.password || '',
    new Date()
  ]);
  return true;
}

// ——— ثبت نام دلیور ———
function registerDelivery(data) {
  let sheet = SHEET.getSheetByName('دلیورها');
  if (!sheet) {
    sheet = SHEET.insertSheet('دلیورها');
    sheet.appendRow(['نام', 'منطقه', 'شماره', 'رمز', 'تاریخ']);
  }
  
  sheet.appendRow([
    data.name || '',
    data.region || '',
    data.phone || '',
    data.password || '',
    new Date()
  ]);
  return true;
}

// ——— دریافت لیست فروشندگان ———
function getSellers() {
  const sheet = SHEET.getSheetByName('فروشندگان');
  if (!sheet) return [];
  
  const rows = sheet.getDataRange().getValues();
  const sellers = [];
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1]) {
      sellers.push({
        name: rows[i][0],
        shop: rows[i][1],
        address: rows[i][2],
        phone: rows[i][3],
        date: rows[i][5]
      });
    }
  }
  return sellers;
}

// ——— ورود کاربر ———
function handleLogin(e) {
  const role = e.parameter.role;
  const id = e.parameter.id;
  const phone = e.parameter.phone;
  const pass = e.parameter.pass;
  
  let sheetName = role === 'seller' ? 'فروشندگان' : 'دلیورها';
  const sheet = SHEET.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'حساب یافت نشد' };
  
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    let match = false;
    
    if (role === 'seller') {
      match = (row[1] === id || row[3] === phone) && row[4] === pass;
    } else {
      match = (row[0] === id || row[2] === phone) && row[3] === pass;
    }
    
    if (match) {
      return {
        success: true,
        user: {
          role: role,
          name: row[0],
          shop: role === 'seller' ? row[1] : null,
          phone: role === 'seller' ? row[3] : row[2],
          region: role === 'delivery' ? row[1] : null
        }
      };
    }
  }
  
  return { success: false, error: 'اطلاعات ورود صحیح نیست' };
}
