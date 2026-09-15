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

function normalizeBrand(rawBrand, nhaMay) {
  const b = (rawBrand || nhaMay || '').trim();
  if (/monalisa/i.test(b)) return 'Monalisa';
  if (/apodio/i.test(b)) return 'Apodio Grand';
  if (/changyih/i.test(b)) return 'Changyih Premium';
  if (/việt ý|viet y/i.test(b)) return 'Việt Ý SC';
  if (/grand/i.test(b)) return 'Thường Sơn';
  return b || 'Thường Sơn Ceramic';
}

function normalizeMaterial(rawMaterial, pattern, name) {
  const text = `${rawMaterial || ''} ${pattern || ''} ${name || ''}`.toLowerCase();
  if (/marble|cẩm thạch|vân mây|calacatta|carrara|statuario/i.test(text)) return 'Marble';
  if (/travertine|đá|stone|slate|granite/i.test(text)) return 'Stone';
  if (/cement|ciment|bê tông|xi măng/i.test(text)) return 'Cement';
  if (/wood|gỗ|vân gỗ/i.test(text)) return 'Wood';
  if (/terrazzo|hạt mài|đá mài/i.test(text)) return 'Terrazzo';
  return 'Solid Color';
}

function normalizeSurface(rawSurface, name) {
  const text = `${rawSurface || ''} ${name || ''}`.toLowerCase();
  if (/matt|mờ|nhám mịn|microcid/i.test(text)) return 'Matt';
  if (/bóng|polished|glossy|lappato/i.test(text)) return 'Polished';
  if (/textured|sần|chống trơn|r11/i.test(text)) return 'Textured';
  if (/honed|bán bóng|satin/i.test(text)) return 'Honed';
  return 'Matt';
}

function normalizeSize(rawSize) {
  if (!rawSize) return '600x600mm';
  let s = rawSize.replace(/\s+/g, '').toLowerCase();
  if (s.includes('x') && !s.includes('mm')) s += 'mm';
  return s;
}

function makeUrl(relPath) {
  if (!relPath) return '';
  if (relPath.startsWith('http://') || relPath.startsWith('https://')) return relPath;
  const clean = relPath.startsWith('/') ? relPath : `/${relPath}`;
  return `${BASE_CDN}${clean}`;
}

async function sync() {
  console.log(`[1/4] Đang nạp dữ liệu từ ${API_URL}...`);
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  const data = await res.json();
  const rawProducts = data.products || [];
  console.log(`[2/4] Nhận được ${rawProducts.length} sản phẩm từ hệ thống.`);

  const mappedProducts = rawProducts.map((p, index) => {
    const brand = normalizeBrand(p.brand, p.nha_may);
    const material = normalizeMaterial(p.pattern, p.name, p.collection);
    const surface = normalizeSurface(p.surface, p.name);
    const size = normalizeSize(p.size);
    const slug = `${slugify(brand)}-${slugify(p.sku || `item-${index}`)}`;

    // Build image URLs
    const thumbRel = p.thumb_webp || p.thumb || p.faces_webp?.[0] || p.faces?.[0];
    const thumbUrl = thumbRel ? makeUrl(thumbRel) : `https://grandtiles.com.vn/product-photo/${p.sku}/${p.sku}__4_product_photo_v1.png`;

    const faceUrl = p.faces_webp?.[0] || p.faces?.[0] ? makeUrl(p.faces_webp?.[0] || p.faces?.[0]) : thumbUrl;
    const closeUpUrl = p.faces_webp?.[1] || p.faces?.[1] ? makeUrl(p.faces_webp?.[1] || p.faces?.[1]) : thumbUrl;

    const sceneRel = p.scenes?.[0];
    const inSpaceUrl = sceneRel ? makeUrl(sceneRel) : 'https://grandtiles.com.vn/static/pano720/scenes/SCN-01-living-luxe/SCN-01-living-luxe_web4k.jpg';

    // Use cases
    const useCases = (Array.isArray(p.use_cases) && p.use_cases.length > 0)
      ? p.use_cases
      : (surface === 'Polished' ? ['Phòng khách', 'Sảnh', 'Thương mại'] : ['Phòng khách', 'Phòng tắm', 'Phòng bếp']);

    // Colors
    const color = p.color && p.color !== 'Chua phan loai' ? p.color : (material === 'Marble' ? 'Trắng cẩm thạch' : 'Xám tự nhiên');

    return {
      id: `gt-${p.sku || index}`,
      slug: slug,
      name: p.name || `${brand} ${p.sku}`,
      code: p.sku || `SKU-${index}`,
      brand: brand,
      collection: p.collection || `${brand} Collection`,
      collectionSlug: slugify(p.collection || brand),
      material: material,
      surface: surface,
      colors: [color],
      sizes: [size],
      useCases: useCases,
      description: p.description || `Gạch ốp lát ${p.name || p.sku} kích thước ${size}, bề mặt men ${surface}. Xương porcelain nguyên khối cao cấp, phân phối chính hãng bởi Công ty TNHH Thường Sơn.`,
      price: 'Liên hệ báo giá',
      images: {
        thumbnail: thumbUrl,
        fullFace: faceUrl,
        closeUp: closeUpUrl,
        inSpace: inSpaceUrl
      },
      featured: index < 12,
      new: index % 7 === 0,
      technicalSpecs: {
        thickness: p.thickness || '9.5 mm',
        waterAbsorption: p.water_absorption || '< 0.1% (Porcelain E < 0.5%)',
        slipResistance: surface === 'Matt' ? 'R10' : (surface === 'Textured' ? 'R11' : 'R9'),
        facesCount: p.face_count || 4,
        origin: `Chính hãng ${brand}`,
        application: useCases.join(', ')
      }
    };
  });

  console.log(`[3/4] Đã chuẩn hóa ${mappedProducts.length} sản phẩm.`);

  // Write out crawledProducts.json
  const outPath = path.join(process.cwd(), 'src', 'data', 'crawledProducts.json');
  fs.writeFileSync(outPath, JSON.stringify(mappedProducts, null, 2), 'utf-8');
  console.log(`[4/4] Đã ghi file thành công: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

sync().catch(err => {
  console.error('Lỗi khi đồng bộ sản phẩm:', err);
  process.exit(1);
});
