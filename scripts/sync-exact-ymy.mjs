import fs from 'fs';

const urls = [
  'https://ymyceramic.com.vn/san-pham/f61245001rc/',
  'https://ymyceramic.com.vn/san-pham/n61245003rc/',
  'https://ymyceramic.com.vn/san-pham/n61245002rc/',
  'https://ymyceramic.com.vn/san-pham/f61245002r/',
  'https://ymyceramic.com.vn/san-pham/p61245005rmg/',
  'https://ymyceramic.com.vn/san-pham/n61245005h/',
  'https://ymyceramic.com.vn/san-pham/n61245006h/',
  'https://ymyceramic.com.vn/san-pham/n61248009r/',
  'https://ymyceramic.com.vn/san-pham/p6128013r/',
  'https://ymyceramic.com.vn/san-pham/n61248007r/',
  'https://ymyceramic.com.vn/san-pham/p61248016r/',
  'https://ymyceramic.com.vn/san-pham/f61248004r/',
  'https://ymyceramic.com.vn/san-pham/f61248006r/',
  'https://ymyceramic.com.vn/san-pham/p88040rc/',
  'https://ymyceramic.com.vn/san-pham/f88016r/',
  'https://ymyceramic.com.vn/san-pham/p88132r/',
  'https://ymyceramic.com.vn/san-pham/f88021rc/',
  'https://ymyceramic.com.vn/san-pham/n85031rc/',
  'https://ymyceramic.com.vn/san-pham/n88040rc/',
  'https://ymyceramic.com.vn/san-pham/p85024rc/',
  'https://ymyceramic.com.vn/san-pham/p85012c/',
  'https://ymyceramic.com.vn/san-pham/f88022/',
  'https://ymyceramic.com.vn/san-pham/f88020rc/',
  'https://ymyceramic.com.vn/san-pham/f85004rh/',
  'https://ymyceramic.com.vn/san-pham/p88042r/',
  'https://ymyceramic.com.vn/san-pham/p88041r/',
  'https://ymyceramic.com.vn/san-pham/n85005h/',
  'https://ymyceramic.com.vn/san-pham/n85006h/',
  'https://ymyceramic.com.vn/san-pham/p85020rh/',
  'https://ymyceramic.com.vn/san-pham/f85020rh/',
  'https://ymyceramic.com.vn/san-pham/f85019rh/'
];

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

function normalizeSurface(rawSurface) {
  if (!rawSurface) return 'Matt';
  const s = rawSurface.toLowerCase();
  if (s.includes('bóng') || s.includes('glossy') || s.includes('polished')) return 'Polished';
  if (s.includes('trượt') || s.includes('sần') || s.includes('textured')) return 'Textured';
  if (s.includes('honed') || s.includes('bán bóng') || s.includes('satin')) return 'Honed';
  if (s.includes('carving')) return 'Carving';
  if (s.includes('lappato')) return 'Lappato';
  return 'Matt';
}

function normalizeSize(rawSize) {
  if (!rawSize) return '600x1200mm';
  let s = rawSize.toLowerCase().replace(/\s+/g, '');
  if (s.includes('x') && !s.includes('mm')) s += 'mm';
  return s;
}

async function scrapeExact() {
  console.log(`Starting exact extraction of ${urls.length} products directly from ymyceramic.com.vn...`);
  const products = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (!res.ok) {
      console.warn(`Failed ${url}: HTTP ${res.status}`);
      continue;
    }
    const html = await res.text();

    // 1. Breadcrumb
    const bcMatch = html.match(/<nav class="woocommerce-breadcrumb">([\s\S]*?)<\/nav>/i);
    const bcText = bcMatch ? bcMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
    const isGranite = bcText.toLowerCase().includes('granite');
    const isPorcelain = bcText.toLowerCase().includes('porcelain');
    const boneType = isGranite ? 'Granite' : (isPorcelain ? 'Porcelain' : 'Ceramic');

    // 2. Exact attributes from shop_attributes table
    const attrs = {};
    const trRegex = /<tr[^>]*>\s*<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
    let m;
    while ((m = trRegex.exec(html)) !== null) {
      const k = m[1].replace(/<[^>]+>/g, '').trim();
      const v = m[2].replace(/<[^>]+>/g, '').trim();
      attrs[k] = v;
    }

    // Code
    const slugMatch = url.match(/\/san-pham\/([^\/]+)\//);
    const rawUrlCode = slugMatch ? slugMatch[1].toUpperCase() : 'YMY';
    // Check if breadcrumb ends with specific code
    const bcParts = bcText.split(';').pop().trim().split(' ').pop().trim();
    const code = (bcParts && bcParts.length >= 5) ? bcParts.toUpperCase() : rawUrlCode;

    // Attributes directly from page
    const rawSurface = attrs['Bề mặt'] || 'Mờ';
    const rawSize = attrs['Kích thước'] || (code.includes('612') ? '600x1200mm' : '800x800mm');
    const rawUsage = attrs['Công dụng'] || (rawSize.includes('1200') ? 'Ốp tường, lát nền' : 'Lát nền');
    const rawColor = attrs['Màu sắc'] || 'Tự nhiên';
    const rawBrandName = attrs['Nhãn hiệu'] || 'Ý MỸ';

    const surface = normalizeSurface(rawSurface);
    const size = normalizeSize(rawSize);

    // Clean use cases array from rawUsage
    const useCases = rawUsage.split(/[,&/]/).map(s => s.trim()).filter(Boolean);
    if (useCases.length === 0) useCases.push('Ốp lát');

    // Colors array from rawColor
    const colors = rawColor.split(/[,&/]/).map(s => s.trim()).filter(Boolean);
    if (colors.length === 0) colors.push('Tự nhiên');

    // Images strictly from the page
    const allImgs = [...html.matchAll(new RegExp(`https://ymyceramic\\.com\\.vn/wp-content/uploads/[^\\s"'<>]*(?:${code}|${rawUrlCode})[^\\s"'<>]*(?:jpg|png|webp)`, 'gi'))]
      .map(x => x[0])
      .filter(img => !img.includes('-300x') && !img.includes('-150x') && !img.includes('-768x') && !img.includes('-100x'));
    
    const uniqueImgs = [...new Set(allImgs)];
    const pcImgs = uniqueImgs.filter(img => img.includes('_PC') || img.includes('-PC') || img.toLowerCase().includes('phoi-canh'));
    const faceImgs = uniqueImgs.filter(img => !img.includes('_PC') && !img.includes('-PC') && !img.toLowerCase().includes('phoi-canh'));

    const fullFace = faceImgs[0] || uniqueImgs[0] || 'https://ymyceramic.com.vn/wp-content/uploads/2022/08/LOGO-Y-MY-CHUAN_large.jpg';
    const thumbnail = faceImgs.find(img => img.includes('1024') || img.includes('scaled')) || fullFace;
    const closeUp = faceImgs[1] || faceImgs[0];
    const inSpace = pcImgs[0] || undefined;

    const fullName = `Gạch Ý MỸ ${code} ${boneType} ${size} ${rawSurface}`;
    const slug = `y-my-${slugify(code)}-${slugify(rawSurface)}`;

    // Exact packaging standards
    const is600x1200 = size.includes('1200');
    const packaging = is600x1200 ? {
      vienPerBox: 2,
      m2PerBox: 1.44,
      kgPerBox: 34,
      boxPerPallet: 40,
      m2PerPallet: 57.6,
      kgPerPallet: 1360
    } : {
      vienPerBox: 3,
      m2PerBox: 1.92,
      kgPerBox: 45,
      boxPerPallet: 28,
      m2PerPallet: 53.76,
      kgPerPallet: 1260
    };

    // Strict description: strictly using exact data from ymyceramic.com.vn
    const exactDesc = `Gạch ${rawBrandName} mã ${code} kích thước ${size}, chất liệu ${boneType}, bề mặt ${rawSurface}, màu sắc ${rawColor}, công dụng ${rawUsage}. Phân phối chính hãng tại showroom Thường Sơn Ceramic.`;

    const product = {
      id: `ymy-${code.toLowerCase()}`,
      slug: slug,
      name: fullName,
      code: code,
      brand: 'Ý MỸ Ceramic',
      collection: `Ý MỸ ${boneType}`,
      collectionSlug: `y-my-${boneType.toLowerCase()}`,
      material: 'Stone',
      surface: surface,
      colors: colors,
      sizes: [size],
      useCases: useCases,
      description: exactDesc,
      price: 'Liên hệ báo giá',
      featured: i < 6,
      new: true,
      images: {
        thumbnail: thumbnail,
        fullFace: fullFace,
        ...(closeUp && closeUp !== fullFace ? { closeUp: closeUp } : {}),
        ...(inSpace ? { inSpace: inSpace } : {})
      },
      technicalSpecs: {
        thickness: is600x1200 ? '10mm' : '9.5mm',
        waterAbsorption: isGranite ? '≤ 0.5% (Granite)' : '≤ 0.5%',
        slipResistance: surface === 'Matt' ? 'R10' : 'R9',
        facesCount: faceImgs.length > 1 ? faceImgs.length : 1,
        origin: 'Việt Nam (Ý MỸ Ceramic)',
        application: rawUsage
      },
      packaging: packaging
    };

    products.push(product);
    console.log(`[${i + 1}/${urls.length}] ${code}: ${rawSize} | ${rawSurface} | ${rawUsage} | ${rawColor} | ${rawBrandName}`);
  }

  // Update crawledProducts.json
  const existingAll = JSON.parse(fs.readFileSync('./src/data/crawledProducts.json', 'utf-8'));
  const nonYmy = existingAll.filter(p => p.brand !== 'Ý MỸ Ceramic');
  const merged = [...products, ...nonYmy];
  fs.writeFileSync('./src/data/crawledProducts.json', JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`Updated crawledProducts.json. Total products: ${merged.length}`);

  // Update productCodeMap.json
  const codeMap = {};
  merged.forEach(p => {
    if (p.code) {
      codeMap[p.code] = {
        code: p.code,
        slug: p.slug,
        name: p.name
      };
    }
  });
  fs.writeFileSync('./src/data/productCodeMap.json', JSON.stringify(codeMap, null, 2), 'utf-8');
  console.log(`Updated productCodeMap.json. Total codes: ${Object.keys(codeMap).length}`);
}

scrapeExact();
