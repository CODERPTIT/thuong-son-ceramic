async function main() {
  const code = 'ACM-36008';
  const pageRes = await fetch(`https://grandtiles.com.vn/p/${code}`);
  const html = await pageRes.text();
  
  // Look for image urls in html
  const imgMatches = [...html.matchAll(/src=["']([^"']+)["']/gi)].map(m => m[1]);
  console.log(`Images found on /p/${code}:`, imgMatches);

  // Look for ld+json
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
  if (ldMatch) {
    for (const ld of ldMatch) {
      if (ld.includes('image')) {
        console.log('LD-JSON with image:', ld);
      }
    }
  }

  // Also check product-photo candidate
  const photoUrl = `https://grandtiles.com.vn/product-photo/${code}/${code}__4_product_photo_v1.png`;
  const photoCheck = await fetch(photoUrl, { method: 'HEAD' });
  console.log(`product-photo check (${photoUrl}):`, photoCheck.status);

  // Check /thumbs/
  const thumbUrl = `https://grandtiles.com.vn/thumbs/Apodio/APODIO-GRAND/300x600/${code}/face_clean/${code}_clean_1.webp`;
  const thumbCheck = await fetch(thumbUrl, { method: 'HEAD' });
  console.log(`thumbs check (${thumbUrl}):`, thumbCheck.status);
}

main();
