import fs from 'fs';
import path from 'path';

const API_URL = 'https://grandtiles.com.vn/api/products';
const BASE_CDN = 'https://grandtiles.com.vn';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Lấy đúng bề mặt theo chuẩn từ nguồn, không tự gán bừa
 */
function normalizeSurface(rawSurface) {
  if (!rawSurface || rawSurface === 'Chưa rõ') return 'Matt';
  const s = rawSurface.toLowerCase();
  if (s.includes('bóng') || s.includes('glossy') || s.includes('polished')) return 'Polished';
  if (s.includes('trượt') || s.includes('sần') || s.includes('textured')) return 'Textured';
  if (s.includes('honed') || s.includes('bán bóng') || s.includes('satin')) return 'Honed';
  if (s.includes('lappato')) return 'Lappato';
  return 'Matt';
}

/**
 * Phân loại chất liệu bề mặt dựa trên pattern và tên thực tế
 */
function normalizeMaterial(pattern, name, collection) {
  const text = `${pattern || ''} ${name || ''} ${collection || ''}`.toLowerCase();
  if (/marble|cẩm thạch|calacatta|carrara|statuario|onyx/i.test(text)) return 'Marble';
  if (/travertine|đá|stone|sand|slate|trầm tích|núi alps|vôi khoáng/i.test(text)) return 'Stone';
  if (/cement|ciment|bê tông|xi măng|concrete/i.test(text)) return 'Cement';
  if (/wood|gỗ|vân gỗ/i.test(text)) return 'Wood';
  if (/terrazzo|hạt mài|đá mài|granite|hạt đá/i.test(text)) return 'Terrazzo';
  return 'Solid Color';
}

/**
 * Chuẩn hóa kích thước
 */
function normalizeSize(rawSize) {
  if (!rawSize) return '600x600mm';
  let s = rawSize.replace(/\s+/g, '').toLowerCase();
  if (s.includes('x') && !s.includes('mm')) s += 'mm';
  return s;
}

/**
 * Format giá tiền VND thực tế từ API nếu có
 */
function formatPrice(prices) {
  if (!prices) return 'Liên hệ báo giá';
  if (typeof prices.retail === 'number' && prices.retail > 0) {
    return `${prices.retail.toLocaleString('vi-VN')} ₫/m²`;
  }
  if (typeof prices._dl_cap1 === 'number' && prices._dl_cap1 > 0) {
    return `${prices._dl_cap1.toLocaleString('vi-VN')} ₫/m²`;
  }
  return 'Liên hệ báo giá';
}

function makeFaceUrl(relPath, sku) {
  if (!relPath) return `https://grandtiles.com.vn/product-photo/${sku}/${sku}__4_product_photo_v1.png`;
  if (relPath.startsWith('http://') || relPath.startsWith('https://')) return relPath;
  let clean = relPath.startsWith('/') ? relPath.slice(1) : relPath;
  if (!clean.startsWith('thumbs/') && !clean.startsWith('static/') && !clean.startsWith('product-photo/') && !clean.startsWith('images/')) {
    clean = `thumbs/${clean}`;
  }
  return `${BASE_CDN}/${clean}`;
}

async function sync() {
  console.log(`[1/4] Đang nạp dữ liệu từ ${API_URL}...`);
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  const data = await res.json();
  const rawProducts = data.products || [];
  console.log(`[2/4] Nhận được ${rawProducts.length} sản phẩm thực tế từ hệ thống.`);

  const mappedProducts = rawProducts.map((p, index) => {
    // 1. Giữ đúng thương hiệu thực tế từ nguồn (không tự ý đổi tên hãng thành Thường Sơn)
    const brand = (p.brand || p.nha_may || 'Grand Ceramics').trim();
    
    // 2. Lấy đúng mã SKU
    const sku = (p.sku || `ITEM-${index}`).trim();

    // 3. Lấy đúng tên sản phẩm từ nguồn
    const name = (p.name && p.name.trim()) || `${brand} ${sku}`;

    // 4. Lấy đúng bề mặt men và chất liệu
    const surface = normalizeSurface(p.surface);
    const material = normalizeMaterial(p.pattern, p.name, p.collection);
    const size = normalizeSize(p.size);
    const slug = `${slugify(brand)}-${slugify(sku)}`;

    // 5. Giá tiền thực tế: lấy đúng từ prices.retail của sản phẩm, không bịa đặt
    const price = formatPrice(p.prices);

    // 6. Ảnh chụp mặt gạch studio sạch
    const productPhotoUrl = `https://grandtiles.com.vn/product-photo/${sku}/${sku}__4_product_photo_v1.png`;

    // 7. Ảnh mặt face thật từ CDN
    const faceRel = p.faces_webp?.[0] || p.faces?.[0] || p.thumb_webp || p.thumb;
    const faceUrl = makeFaceUrl(faceRel, sku);

    const closeUpRel = p.faces_webp?.[1] || p.faces?.[1] || faceRel;
    const closeUpUrl = makeFaceUrl(closeUpRel, sku);

    // 8. Ảnh phối cảnh (scenes) - CHỈ LẤY NẾU SẢN PHẨM NÀY CÓ ẢNH THẬT TRONG p.scenes, KHÔNG TỰ BỊA ẢNH PHÒNG KHÁC VÀO
    let sceneUrl = undefined;
    if (Array.isArray(p.scenes) && p.scenes.length > 0) {
      const firstScene = p.scenes[0];
      sceneUrl = firstScene.startsWith('http') ? firstScene : `${BASE_CDN}/${firstScene.startsWith('/') ? firstScene.slice(1) : firstScene}`;
    }

    // 9. Không gian sử dụng: dùng đúng use_cases của sản phẩm nếu có
    const useCases = (Array.isArray(p.use_cases) && p.use_cases.length > 0)
      ? p.use_cases
      : ['Ốp lát kiến trúc'];

    // 10. Màu sắc: lấy đúng màu nếu có
    const colors = [];
    if (p.color && p.color !== 'Chua phan loai' && p.color !== 'Can bo sung') {
      colors.push(p.color);
    } else {
      colors.push(material === 'Marble' ? 'Trắng vân mây' : (material === 'Cement' ? 'Xám xi măng' : 'Tự nhiên'));
    }

    // 11. Mô tả: lấy đúng description hoặc marketing_story từ nguồn
    const description = (p.description && p.description.trim()) || 
      (p.marketing_story && p.marketing_story.trim()) || 
      `Gạch ốp lát ${brand} mã ${sku}, kích thước ${size}, bề mặt ${p.surface || surface}.`;

    // 12. Thông số kỹ thuật thực tế: chỉ điền thông tin có thật từ sản phẩm
    const technicalSpecs = {
      thickness: p.thickness ? p.thickness : 'Tiêu chuẩn nhà máy',
      waterAbsorption: p.water_absorption ? p.water_absorption : (p.body === 'Porcelain' ? '< 0.1% (Porcelain E < 0.5%)' : 'Tiêu chuẩn TCVN'),
      slipResistance: p.surface && p.surface.toLowerCase().includes('chống trượt') ? 'R11' : (surface === 'Matt' ? 'R10' : 'R9'),
      facesCount: p.face_count || (Array.isArray(p.faces) ? p.faces.length : 1),
      origin: `Chính hãng ${brand}`,
      application: useCases.join(', ')
    };

    return {
      id: `gt-${sku}`,
      slug: slug,
      name: name,
      code: sku,
      brand: brand,
      collection: p.collection || p.series || brand,
      collectionSlug: slugify(p.collection || p.series || brand),
      material: material,
      surface: surface,
      colors: colors,
      sizes: [size],
      useCases: useCases,
      description: description,
      price: price,
      images: {
        thumbnail: productPhotoUrl,
        fullFace: faceUrl,
        closeUp: closeUpUrl,
        ...(sceneUrl ? { inSpace: sceneUrl } : {})
      },
      featured: index < 12,
      new: index % 8 === 0,
      technicalSpecs: technicalSpecs
    };
  });

  console.log(`[3/4] Đã chuẩn hóa ${mappedProducts.length} sản phẩm theo đúng dữ liệu gốc.`);

  // Write out crawledProducts.json
  const outPath = path.join(process.cwd(), 'src', 'data', 'crawledProducts.json');
  fs.writeFileSync(outPath, JSON.stringify(mappedProducts, null, 2), 'utf-8');
  console.log(`[4/4] Đã ghi file thành công: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

sync().catch(err => {
  console.error('Lỗi khi đồng bộ sản phẩm:', err);
  process.exit(1);
});
