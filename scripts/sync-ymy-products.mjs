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

async function scrapeAll() {
  const products = [];
  console.log(`Starting crawl of ${urls.length} Ý MỸ products...`);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      console.log(`[${i + 1}/${urls.length}] Fetching ${url}...`);
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      if (!res.ok) {
        console.warn(`Failed to fetch ${url} (status ${res.status})`);
        continue;
      }
      const html = await res.text();

      // Extract SKU from URL slug or title
      const slugMatch = url.match(/\/san-pham\/([^\/]+)\//);
      const urlCode = slugMatch ? slugMatch[1].toUpperCase() : 'YMY';

      // Title
      const titleMatch = html.match(/<h1[^>]*class="[^"]*product_title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i) ||
                         html.match(/<title>(.*?)<\/title>/i);
      let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').replace(/- Ý MỸ CERAMIC/gi, '').trim() : urlCode;
      if (!title) title = urlCode;

      // Code
      let code = urlCode;
      const codeMatch = title.match(/([A-Z0-9]{5,15})/i);
      if (codeMatch) code = codeMatch[1].toUpperCase();

      // Specs from table
      const specs = {};
      const trRegex = /<tr[^>]*>\s*<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
      let m;
      while ((m = trRegex.exec(html)) !== null) {
        const k = m[1].replace(/<[^>]+>/g, '').trim();
        const v = m[2].replace(/<[^>]+>/g, '').trim();
        specs[k] = v;
      }

      const rawSurface = specs['Bề mặt'] || 'Mờ';
      const rawSize = specs['Kích thước'] || (code.includes('612') ? '600x1200mm' : '800x800mm');
      const surface = normalizeSurface(rawSurface);
      const size = normalizeSize(rawSize);

      // Category / Material
      const isGranite = html.includes('granite') || html.includes('Granite');
      const material = 'Stone'; // Marble / Stone / Cement
      const boneType = isGranite ? 'Granite' : 'Porcelain';

      // Images
      // Find all image URLs for this product
      const allImgs = [...html.matchAll(new RegExp(`https://ymyceramic\\.com\\.vn/wp-content/uploads/[^\\s"'<>]*(?:${code})[^\\s"'<>]*(?:jpg|png|webp)`, 'gi'))]
        .map(x => x[0])
        .filter(img => !img.includes('-300x') && !img.includes('-150x') && !img.includes('-768x') && !img.includes('-100x'));
      
      const uniqueImgs = [...new Set(allImgs)];

      // Separate 2D/Face images and PC (room scene) images
      const pcImgs = uniqueImgs.filter(img => img.includes('_PC') || img.includes('-PC') || img.toLowerCase().includes('phoi-canh'));
      const faceImgs = uniqueImgs.filter(img => !img.includes('_PC') && !img.includes('-PC') && !img.toLowerCase().includes('phoi-canh'));

      const fullFace = faceImgs[0] || uniqueImgs[0] || 'https://ymyceramic.com.vn/wp-content/uploads/2022/08/LOGO-Y-MY-CHUAN_large.jpg';
      const thumbnail = faceImgs.find(img => img.includes('1024') || img.includes('scaled')) || fullFace;
      const closeUp = faceImgs[1] || faceImgs[0];
      const inSpace = pcImgs[0] || uniqueImgs.find(img => img.includes('_PC')) || undefined;

      const sizeNum = size.includes('1200') ? '600×1200' : '800×800';
      const fullName = `Gạch Ý MỸ ${code} ${boneType} ${sizeNum} ${rawSurface}`;
      const slug = `y-my-${slugify(code)}-${slugify(rawSurface)}`;

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

      const useCases = is600x1200 
        ? ['Phòng khách', 'Sảnh lớn', 'Phòng tắm', 'Thương mại', 'Ốp mặt tiền'] 
        : ['Phòng khách', 'Phòng ngủ', 'Phòng bếp', 'Hành lang', 'Sảnh'];

      const product = {
        id: `ymy-${code.toLowerCase()}`,
        slug: slug,
        name: fullName,
        code: code,
        brand: 'Ý MỸ Ceramic',
        collection: `Ý MỸ ${boneType} Series`,
        collectionSlug: `y-my-${boneType.toLowerCase()}`,
        material: material,
        surface: surface,
        colors: ['Xám', 'Trắng vân đá'],
        sizes: [size],
        useCases: useCases,
        description: `Gạch ốp lát cao cấp Ý MỸ ${code} chất liệu ${boneType} bề mặt ${rawSurface}. Độ bền uốn và chống thấm vượt trội, đường vân sống động tự nhiên phù hợp cho các không gian kiến trúc hiện đại, sang trọng.`,
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
          waterAbsorption: '< 0.5%',
          slipResistance: surface === 'Matt' ? 'R10' : 'R9',
          facesCount: faceImgs.length > 1 ? faceImgs.length : 4,
          origin: 'Việt Nam (Ý MỸ Ceramic)',
          application: is600x1200 ? 'Ốp tường & Lát nền' : 'Lát sàn nội ngoại thất'
        },
        packaging: packaging
      };

      products.push(product);
      console.log(` -> SUCCESS: ${code} (${size}, ${surface}, faces: ${faceImgs.length}, room: ${inSpace ? 'YES' : 'NO'})`);
    } catch (err) {
      console.error(` -> ERROR on ${url}:`, err.message);
    }
  }

  console.log(`\nCrawl complete. Scraped ${products.length}/${urls.length} products.`);
  fs.writeFileSync('./scripts/scraped-ymy.json', JSON.stringify(products, null, 2), 'utf-8');
  console.log('Saved to ./scripts/scraped-ymy.json');
}

scrapeAll();
