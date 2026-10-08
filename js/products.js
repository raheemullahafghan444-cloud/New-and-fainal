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
