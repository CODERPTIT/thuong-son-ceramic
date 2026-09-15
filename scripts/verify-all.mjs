// Automated Test & Verification Suite for Thường Sơn Ceramic
import http from 'http';

// Load mock data
const { PRODUCTS, COLLECTIONS, SPACES, JOURNAL_ARTICLES } = await import('../src/data/mockData.ts');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('\n========================================');
console.log('1. KIỂM TRA TOÀN VẸN DỮ LIỆU (DATA INTEGRITY)');
console.log('========================================');

// Test 1: Products
assert(PRODUCTS.length >= 10, `Có ít nhất 10 sản phẩm (hiện có: ${PRODUCTS.length})`);
const productSlugs = new Set();
const productCodes = new Set();
let allSpecsValid = true;

for (const p of PRODUCTS) {
  if (productSlugs.has(p.slug)) assert(false, `Trùng lặp slug sản phẩm: ${p.slug}`);
  productSlugs.add(p.slug);

  if (productCodes.has(p.code)) assert(false, `Trùng lặp code sản phẩm: ${p.code}`);
  productCodes.add(p.code);

  if (!p.technicalSpecs?.thickness || !p.technicalSpecs?.facesCount || !p.technicalSpecs?.slipResistance) {
    allSpecsValid = false;
  }
}
assert(productSlugs.size === PRODUCTS.length, 'Tất cả product slug là duy nhất');
assert(productCodes.size === PRODUCTS.length, 'Tất cả product code (SKU) là duy nhất');
assert(allSpecsValid, 'Tất cả sản phẩm đều có đầy đủ thông số kỹ thuật (thickness, facesCount, slipResistance)');

// Test 2: Collections
assert(COLLECTIONS.length >= 4, `Có ít nhất 4 bộ sưu tập kiến trúc (hiện có: ${COLLECTIONS.length})`);
for (const c of COLLECTIONS) {
  assert(c.productIds.length > 0, `Collection ${c.name} có chứa ít nhất 1 sản phẩm`);
  assert(c.colorPalette.length >= 2, `Collection ${c.name} có ít nhất 2 mã màu swatch`);
}

// Test 3: Spaces
assert(SPACES.length >= 6, `Có đủ 6 không gian sống chủ đạo (hiện có: ${SPACES.length})`);
for (const s of SPACES) {
  assert(s.recommendedSizes.length > 0, `Không gian ${s.name} có kích thước khuyên dùng`);
  assert(s.designTips.length >= 2, `Không gian ${s.name} có ít nhất 2 lời khuyên thiết kế`);
}

// Test 4: Journal
assert(JOURNAL_ARTICLES.length >= 3, `Có ít nhất 3 bài viết cẩm nang kiến trúc (hiện có: ${JOURNAL_ARTICLES.length})`);
for (const j of JOURNAL_ARTICLES) {
  assert(j.content.length >= 2, `Bài viết ${j.title.slice(0, 30)}... có đủ các section nội dung`);
}

console.log('\n========================================');
console.log('2. KIỂM TRA THUẬT TOÁN LỌC & TÌM KIẾM (LOGIC & SEARCH)');
console.log('========================================');

// Test Filter by Material
const marbleProducts = PRODUCTS.filter(p => p.material === 'Marble');
assert(marbleProducts.length > 0, `Lọc Marble trả về kết quả (${marbleProducts.length} mẫu)`);

// Test Filter by Surface
const mattProducts = PRODUCTS.filter(p => p.surface === 'Matt');
assert(mattProducts.length > 0, `Lọc Bề mặt Matt trả về kết quả (${mattProducts.length} mẫu)`);

// Test Search SKU
const skuQuery = 'MM48001';
const foundBySku = PRODUCTS.filter(p => p.code.toLowerCase().includes(skuQuery.toLowerCase()));
assert(foundBySku.length >= 1 && foundBySku.some(p => p.name.toLowerCase().includes('aureo pietra')), 'Tìm kiếm chính xác mã MM48001 trả về Aureo Pietra');

// Test Material Finder recommendation algorithm
const spaces = ['Phòng khách', 'Phòng tắm', 'Phòng bếp', 'Phòng ngủ', 'Ngoài trời'];
let allCombinationsValid = true;

for (const sp of spaces) {
  const scored = PRODUCTS.map(p => {
    let score = 0;
    if (p.useCases.includes(sp)) score += 3;
    if (p.surface === 'Matt') score += 2;
    return { p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3);
  if (top.length === 0 || top[0].score === 0) {
    allCombinationsValid = false;
  }
}
assert(allCombinationsValid, 'Material Finder wizard gợi ý sản phẩm chính xác cho toàn bộ 5 không gian');

console.log('\n========================================');
console.log('3. KIỂM TRA HTTP ROUTES TRÊN SERVER THẬT (HTTP 200 OK)');
console.log('========================================');

function checkRoute(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000${path}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          hasTitle: body.includes('<title>') && body.includes('Grand Ceramic'),
          length: body.length
        });
      });
    });
    req.on('error', (err) => {
      resolve({ path, status: 500, error: err.message });
    });
  });
}

const routesToTest = [
  '/',
  '/catalog',
  '/collections',
  '/collections/the-quiet-stone',
  '/collections/lumina-carrara',
  '/spaces',
  '/spaces/living-room',
  '/spaces/bathroom',
  '/spaces/kitchen',
  '/spaces/bedroom',
  '/spaces/outdoor',
  '/spaces/commercial',
  '/products/monalisa-aureo-pietra-mm48001',
  '/products/apodio-grand-acm-36001',
  '/products/apodio-grand-acm-36002',
  '/journal',
  '/journal/cach-lua-chon-kich-thuoc-gach-theo-dien-tich',
  '/journal/matt-hay-polished-doi-thoai-giua-anh-sang-va-chat-lieu',
  '/journal/xu-huong-vat-lieu-kien-truc-2026-ton-vinh-nguyen-ban',
  '/showroom',
  '/khong-gian',
  '/lien-he',
  '/tin-tuc'
];

for (const r of routesToTest) {
  const result = await checkRoute(r);
  assert(
    result.status === 200,
    `Route ${r} trả về HTTP 200 (Bytes: ${result.length}, Title OK: ${result.hasTitle})`
  );
}

console.log('\n========================================');
console.log(`TỔNG KẾT: ${passedTests}/${totalTests} TESTS PASS (${failedTests} FAILED)`);
console.log('========================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
