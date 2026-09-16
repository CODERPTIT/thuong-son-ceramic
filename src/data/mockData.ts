import type { Product, Collection, SpaceCategory, JournalArticle, BathroomSolution } from '../types';
import rawCrawled from './crawledProducts.json' with { type: 'json' };

const CRAWLED_PRODUCTS = rawCrawled as Product[];

export const COMPANY_INFO = {
  name: 'Công ty TNHH Thường Sơn',
  brandName: 'Thường Sơn Ceramic',
  tagline: 'The Art of Surface — Bề mặt định hình không gian',
  address: 'Số 01, thôn Đình Bảng, Xã Hoằng Lộc, tỉnh Thanh Hóa',
  phones: [
    { label: 'Hotline & Zalo 1', number: '0916 640 316', raw: '0916640316', zaloUrl: 'https://zalo.me/0916640316' },
    { label: 'Hotline & Zalo 2', number: '0912 958 578', raw: '0912958578', zaloUrl: 'https://zalo.me/0912958578' }
  ],
  email: 'nguyenhieu32005@gamil.com',
  openingHours: {
    weekdays: '07:30 – 18:00 (Thứ Hai - Thứ Bảy)',
    sunday: '08:00 – 12:00 (Chủ Nhật)'
  },
  mapEmbedSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15014.110678631532!2d105.83495825823277!3d19.817614004728835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313659c48b4c3e87%3A0x8e254cb7629c6c1d!2zQ8O0bmcgdHkgVE5ISCBUaMaw4budbmcgU8ahbg!5e0!3m2!1svi!2s!4v1789483459858!5m2!1svi!2s',
  mapDirectionsUrl: 'https://maps.google.com/?q=Công+ty+TNHH+Thường+Sơn+Hoằng+Lộc+Thanh+Hóa'
};

export const PRODUCTS: Product[] = CRAWLED_PRODUCTS;

export const COLLECTIONS: Collection[] = [
  {
    id: 'col-01',
    slug: 'the-quiet-stone',
    name: 'The Quiet Stone Collection',
    subtitle: 'Vẻ đẹp trầm mặc của đá tự nhiên được gọt giũa qua thời gian',
    description: 'Tuyển chọn những bề mặt đá vôi Travertine, đá núi lửa Bazan và Ceppo di Gré với độ nhám dịu nhẹ. Hướng đến không gian kiến trúc thiền định, nơi vật liệu tĩnh lặng nhường chỗ cho cảm xúc con người.',
    heroImage: 'https://grandtiles.com.vn/static/pano720/scenes/SCN-01-living-luxe/SCN-01-living-luxe_web4k.jpg',
    material: 'Stone',
    story: 'Lấy cảm hứng từ những vách đá trầm tích cổ xưa bên bờ biển Địa Trung Hải, The Quiet Stone không chạy theo những hoa văn phô trương. Thay vào đó, mỗi phiến đá lưu giữ chuyển động khẽ khàng của thời gian, sắc thái màu đất tự nhiên và xúc giác mịn lì hiếm có.',
    productIds: ['gt-AMM-36001', 'gt-AMM-36003', 'gt-AMM-36004'],
    colorPalette: [
      { name: 'Beige Vôi', hex: '#D7CEBE' },
      { name: 'Xám Ceppo', hex: '#8B8882' },
      { name: 'Đen Bazan', hex: '#2B2A28' }
    ],
    textures: ['Honed Silk', 'Micro-Textured R10', 'Bushed Antique'],
    applicationSpaces: ['Phòng khách biệt thự', 'Sân vườn nghỉ dưỡng', 'Phòng tắm Master']
  },
  {
    id: 'col-02',
    slug: 'lumina-carrara',
    name: 'Lumina Carrara Luxe',
    subtitle: 'Vương giả, thanh khiết và chiều sâu quang học vượt thời gian',
    description: 'Sự tái hiện hoàn mỹ của cẩm thạch Calacatta và Statuario vùng Tuscany. Với công nghệ in vân kỹ thuật số 3D nhiều lớp và men phủ kim cương, bộ sưu tập đem lại độ phản quang tinh xảo mà không gây lóa mắt.',
    heroImage: 'https://grandtiles.com.vn/static/pano720/scenes/SCN-15-hotel-lobby/SCN-15-hotel-lobby_web4k.jpg',
    material: 'Marble',
    story: 'Carrara từ thời kỳ Phục hưng đã là linh hồn của những công trình vĩ đại nhất nhân loại. Lumina Carrara mang hơi thở của đá cẩm thạch Ý vào đời sống đương đại với khả năng kháng ố, chống xước tuyệt đối.',
    productIds: ['gt-AMM-33004', 'gt-AMM-44001', 'gt-AMM-44006'],
    colorPalette: [
      { name: 'Trắng Carrara', hex: '#F0EFEB' },
      { name: 'Vàng Hoàng Kim', hex: '#C5A059' },
      { name: 'Tro Núi Đá', hex: '#5A5652' }
    ],
    textures: ['Diamond Polished', 'Velvet Matt'],
    applicationSpaces: ['Sảnh đại sảnh', 'Phòng khách thông tầng', 'Đảo bếp nghệ thuật']
  },
  {
    id: 'col-03',
    slug: 'apodio-ciment',
    name: 'Apodio Ciment Minimalist',
    subtitle: 'Bản tuyên ngôn của chủ nghĩa kiến trúc tối giản và công năng bền bỉ',
    description: 'Tái định nghĩa chất liệu bê tông cốt thép trong kiến trúc đô thị. Tông màu xám trung tính, bề mặt mờ chống trơn và tỷ lệ kích thước đa dạng từ 300x600 đến 600x1200mm.',
    heroImage: 'https://grandtiles.com.vn/static/pano720/scenes/SCN-04-bath-floor/SCN-04-bath-floor_web4k.jpg',
    material: 'Cement',
    story: 'Một bề mặt xi măng tốt không cần phải màu mè. Bản thân sự giản dị của sắc xám bê tông là chất xúc tác hoàn hảo nhất để đồ nội thất gỗ, da và ánh sáng tự nhiên tỏa sáng.',
    productIds: ['gt-ACM-36001', 'gt-ACM-36002', 'gt-ACM-36005'],
    colorPalette: [
      { name: 'Gris Ciment', hex: '#9E9A93' },
      { name: 'Anthracite', hex: '#4A4845' },
      { name: 'Warm Ivory', hex: '#EBE5DC' }
    ],
    textures: ['Matt Smooth R10', 'Light Concrete Texture'],
    applicationSpaces: ['Phòng bếp mở', 'Căn hộ Studio', 'Văn phòng sáng tạo']
  },
  {
    id: 'col-04',
    slug: 'terrazzo-studio',
    name: 'Terrazzo Studio Atelier',
    subtitle: 'Nhịp điệu của các hạt khoáng thạch Venice trong không gian hiện đại',
    description: 'Những mảnh đá cẩm thạch tự nhiên được đúc kết ngẫu nhiên tạo nên họa tiết terrazzo thanh lịch, sống động nhưng không hề rối mắt.',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    material: 'Terrazzo',
    story: 'Terrazzo không chỉ là vật liệu lát sàn; đó là biểu tượng của tinh thần thủ công Ý thế kỷ 20, nơi các vụn đá quý được tái sinh thành tác phẩm nghệ thuật bền vững.',
    productIds: ['gt-AMM-36001', 'gt-ACM-36001'],
    colorPalette: [
      { name: 'Trắng Ngà Thạch Anh', hex: '#F4EFE6' },
      { name: 'Đất Nung Terracotta', hex: '#B85C38' },
      { name: 'Khoáng Xanh Moss', hex: '#4A5B4C' }
    ],
    textures: ['Matt Micro-Grain R10'],
    applicationSpaces: ['Phòng tắm trẻ trung', 'Bếp ăn gia đình', 'Cửa hàng boutique']
  }
];

export const SPACES: SpaceCategory[] = [
  {
    id: 'space-living',
    slug: 'living-room',
    name: 'Phòng khách',
    tagline: 'Điểm nhìn trung tâm định vị toàn bộ khí chất ngôi nhà',
    description: 'Phòng khách là nơi tiếp đón và hội tụ sinh hoạt gia đình, đòi hỏi các khổ gạch lớn (800x800, 600x1200 hoặc gạch slab khổ lớn) để triệt tiêu tối đa đường ron, mở rộng không gian và phô diễn trọn vẹn vẻ đẹp vân đá.',
    heroImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
    productCount: 345,
    hint: 'Khổ lớn · Điểm nhìn chính',
    recommendedSizes: ['800x800mm', '600x1200mm', '800x1600mm', '1200x2400mm'],
    recommendedSurfaces: ['Matt', 'Polished', 'Honed'],
    designTips: [
      {
        title: 'Cân bằng giữa bóng và mờ',
        desc: 'Nếu phòng khách có cửa sổ lớn đón nhiều nắng trực tiếp, gạch bề mặt Matt hoặc Honed sẽ chống lóa tốt hơn gạch bóng gương.'
      },
      {
        title: 'Ưu tiên gạch ít đường ron',
        desc: 'Khổ gạch 600x1200mm hoặc 800x1600mm giúp sàn liền mạch, mang đến cảm giác khoáng đạt như trải thảm đá nguyên khối.'
      }
    ],
    featuredProductSlugs: ['monalisa-aureo-pietra-mm48001', 'grand-ceramics-aamp88005-800x800', 'apodio-calacatta-smp-88010']
  },
  {
    id: 'space-bathroom',
    slug: 'bathroom',
    name: 'Phòng tắm',
    tagline: 'Ốc đảo riêng tư cân bằng giữa an toàn chống trượt và thẩm mỹ thư thái',
    description: 'Môi trường ẩm ướt liên tục đòi hỏi các tiêu chuẩn chống trượt khắt khe (R10 - R11) cho sàn tắm, kết hợp gạch ốp tường dễ lau chùi kháng cặn canxi và chống nấm mốc.',
    heroImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=85',
    productCount: 304,
    hint: 'Sàn và tường ướt · Dễ vệ sinh',
    recommendedSizes: ['300x600mm', '600x600mm'],
    recommendedSurfaces: ['Matt', 'Textured'],
    designTips: [
      {
        title: 'Phân tách khu khô và khu ướt',
        desc: 'Khu vực tắm đứng cần gạch có hệ số chống trượt R10 hoặc R11; khu vực lavabo khô có thể dùng gạch matt mịn hơn để dễ chịu khi đi chân trần.'
      },
      {
        title: 'Đồng bộ màu sắc sàn và tường',
        desc: 'Sử dụng cùng một bộ sưu tập gạch cho cả sàn và tường với hai bề mặt khác nhau tạo nên hiệu ứng mở rộng diện tích tối đa cho phòng tắm.'
      }
    ],
    featuredProductSlugs: ['apodio-grand-acm-36001', 'apodio-grand-acm-36005', 'apodio-grand-acm-36006']
  },
  {
    id: 'space-kitchen',
    slug: 'kitchen',
    name: 'Phòng bếp',
    tagline: 'Nơi ngọn lửa gia đình hội tụ cùng độ bền cơ học và chịu nhiệt tối ưu',
    description: 'Khu vực chịu tác động của dầu mỡ, gia vị và nhiệt lượng. Gạch ốp bếp cần xương porcelain siêu đặc chắc để không ngấm vết bẩn và dễ dàng làm sạch trong chớp mắt.',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    productCount: 297,
    hint: 'Bền thị giác · Dễ lau dầu mỡ',
    recommendedSizes: ['300x600mm', '600x1200mm', '800x800mm'],
    recommendedSurfaces: ['Matt', 'Honed', 'Polished'],
    designTips: [
      {
        title: 'Vách đảo bếp làm điểm nhấn',
        desc: 'Mặt gạch vân cẩm thạch hoặc Terrazzo cho vách bàn đảo tạo nên tâm điểm thu hút ánh nhìn cho toàn bộ căn bếp mở.'
      },
      {
        title: 'Độ hút nước E < 0.1%',
        desc: 'Tuyệt đối chọn gạch xương đá Porcelain để tránh hiện tượng ố vàng chân gạch khi tiếp xúc với hơi ẩm và dầu ăn lâu ngày.'
      }
    ],
    featuredProductSlugs: ['apodio-grand-acm-36002', 'apodio-grand-acm-36005', 'scandinavia-nordic-timber-wd-20120']
  },
  {
    id: 'space-bedroom',
    slug: 'bedroom',
    name: 'Phòng ngủ',
    tagline: 'Nền lặng dịu êm cho giấc ngủ sâu và nguồn năng lượng phục hồi',
    description: 'Phòng ngủ ưu tiên những gam màu ấm áp, bề mặt matt chống phản xạ ánh sáng hoặc gạch vân gỗ tự nhiên mang lại cảm giác mộc mạc thư thái.',
    heroImage: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=85',
    productCount: 262,
    hint: 'Nền lặng · Ánh sáng dịu',
    recommendedSizes: ['200x1200mm', '600x1200mm', '800x800mm'],
    recommendedSurfaces: ['Matt', 'Honed'],
    designTips: [
      {
        title: 'Thanh gỗ xương cá',
        desc: 'Gạch thanh giả gỗ 200x1200mm lát theo kiểu xương cá Chevron hoặc Herringbone đem lại sự ấm cúng như sàn gỗ tự nhiên mà mát mẻ vào mùa hè.'
      },
      {
        title: 'Tránh gam màu quá chói',
        desc: 'Các tone màu Bone, Beige và Xám nhạt là sự lựa chọn hoàn hảo giúp thị giác thả lỏng sau ngày dài làm việc.'
      }
    ],
    featuredProductSlugs: ['scandinavia-nordic-timber-wd-20120', 'changyih-premium-cck-36001', 'apodio-grand-acm-36007']
  },
  {
    id: 'space-outdoor',
    slug: 'outdoor',
    name: 'Ngoài trời',
    tagline: 'Thách thức nắng mưa khắc nghiệt với độ cứng đá hoa cương và chống trơn tuyệt hảo',
    description: 'Khu vực sân vườn, ban công, hồ bơi và hiên đón chịu sự thay đổi nhiệt độ và thời tiết liên tục. Gạch ngoài trời cần xương dày chịu tải trọng xe và bề mặt nhám sần R11.',
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
    productCount: 199,
    hint: 'Sân · Hiên · Chịu thời tiết',
    recommendedSizes: ['300x600mm', '600x600mm'],
    recommendedSurfaces: ['Textured'],
    designTips: [
      {
        title: 'Độ dày từ 10mm - 20mm',
        desc: 'Với gara ô tô hoặc lối đi sân vườn, chọn gạch có độ dày tăng cường để đảm bảo khả năng chịu nén và chống nứt gãy vĩnh cửu.'
      },
      {
        title: 'Tiêu chuẩn chống trượt R11',
        desc: 'Bề mặt sần hạt khoáng hoặc chải rãnh giúp an toàn tuyệt đối ngay cả khi trời mưa bão ướt sũng.'
      }
    ],
    featuredProductSlugs: ['apodio-grand-acm-36005', 'changyih-premium-cck-36001']
  },
  {
    id: 'space-commercial',
    slug: 'commercial',
    name: 'Sảnh & Thương mại',
    tagline: 'Vị thế thương hiệu và sự chào đón bề thế của công trình công cộng',
    description: 'Sảnh đón khách sạn, tòa nhà văn phòng và showroom yêu cầu khả năng chịu mài mòn tần suất cao kết hợp tính thẩm mỹ uy nghi, tráng lệ.',
    heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85',
    productCount: 163,
    hint: 'Lối vào · Khách sạn · Văn phòng',
    recommendedSizes: ['800x800mm', '800x1600mm', '1200x2400mm'],
    recommendedSurfaces: ['Polished', 'Matt', 'Honed'],
    designTips: [
      {
        title: 'Hiệu ứng đối vân Bookmatched',
        desc: 'Các phiến slab cẩm thạch ghép đối xứng tạo nên bức tranh phong thủy tráng lệ ngay tại đại sảnh trung tâm.'
      },
      {
        title: 'Chỉ số chống mài mòn PEI IV - V',
        desc: 'Với mật độ đi lại cao của sảnh khách sạn và tòa nhà văn phòng, cần ưu tiên gạch xương porcelain đồng chất để bề mặt không bị xước mờ theo năm tháng.'
      }
    ],
    featuredProductSlugs: ['apodio-calacatta-smp-88010', 'grand-ceramics-aamp88005-800x800', 'monalisa-aureo-pietra-mm48001']
  }
];

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 'art-01',
    slug: 'cach-lua-chon-kich-thuoc-gach-theo-dien-tich',
    title: 'Cách Lựa Chọn Kích Thước Gạch Theo Tỷ Lệ Không Gian Thực Tế',
    excerpt: 'Kích thước gạch quyết định nhịp nhìn, số lượng đường ron và cảm quan không gian. Hướng dẫn chi tiết từ các chuyên gia vật liệu Thường Sơn.',
    image: 'https://grandtiles.com.vn/static/pano720/scenes/SCN-01-living-luxe/SCN-01-living-luxe_web4k.jpg',
    category: 'Cẩm nang chọn gạch',
    readTime: '6 phút đọc',
    date: '15 Tháng 9, 2026',
    author: 'Bộ Phận Kỹ Thuật — Thường Sơn Ceramic',
    content: [
      {
        heading: 'Định luật về đường ron: Càng ít càng sang',
        paragraph: 'Một trong những sai lầm phổ biến nhất trong thiết kế nội thất là việc dùng gạch kích thước nhỏ (như 400x400 hoặc 500x500mm) cho những phòng khách lớn trên 30m². Mạng lưới đường ron chằng chịt sẽ vô tình chia cắt mặt sàn thành hàng trăm ô vuông vụn vặt, khiến căn phòng trông chật chội và kém sang.'
      },
      {
        heading: 'Quy tắc tỷ lệ vàng giữa diện tích và khổ gạch',
        paragraph: 'Đối với phòng khách từ 20-40m², kích thước 800x800mm hoặc 600x1200mm là tỷ lệ lý tưởng. Với các không gian thông tầng, biệt thự trên 50m², gạch slab khổ lớn 800x1600mm hoặc 1200x2400mm sẽ triệt tiêu hoàn toàn cảm giác ghép nối, tạo nên bề mặt đá nguyên khối liền mạch tự nhiên.'
      },
      {
        quote: 'Vật liệu không chỉ là lớp áo phủ hoàn thiện; kích thước của viên gạch chính là chiếc thước đo định hình tỷ lệ và khí chất của toàn bộ căn nhà.'
      },
      {
        heading: 'Phòng tắm và bài toán độ dốc thoát sàn',
        paragraph: 'Ở khu vực buồng tắm ướt, việc tạo độ dốc về phễu thu sàn là bắt buộc. Khổ gạch 300x600mm hoặc 600x600mm sẽ dễ cắt vát tạo dốc mà không làm gãy vân hay đọng nước so với các khổ gạch quá lớn.'
      }
    ]
  },
  {
    id: 'art-02',
    slug: 'matt-hay-polished-doi-thoai-giua-anh-sang-va-chat-lieu',
    title: 'Matt Hay Polished: Cuộc Đối Thoại Giữa Ánh Sáng Tự Nhiên Và Bề Mặt Gạch',
    excerpt: 'Bề mặt bóng giúp mở rộng không gian, trong khi bề mặt matt giữ lại cảm giác vật liệu chân thực và lắng đọng. Bạn nên chọn loại nào cho tổ ấm?',
    image: 'https://grandtiles.com.vn/static/pano720/scenes/SCN-04-bath-floor/SCN-04-bath-floor_web4k.jpg',
    category: 'Nghệ thuật bề mặt',
    readTime: '8 phút đọc',
    date: '02 Tháng 9, 2026',
    author: 'Ban Cố Vấn Kiến Trúc Thường Sơn',
    content: [
      {
        heading: 'Sự quyến rũ của ánh sáng gương phản chiếu (Polished)',
        paragraph: 'Gạch bóng (Polished) hoạt động như một tấm gương phản quang. Trong những căn hộ có trần thấp hoặc thiếu sáng tự nhiên, sàn gạch bóng sẽ nhân đôi lượng ánh sáng, tạo cảm giác lộng lẫy, sạch sẽ và tráng lệ ngay khi bước vào.'
      },
      {
        heading: 'Độ sâu lắng và tính xúc giác của bề mặt Matt',
        paragraph: 'Ngược lại, xu hướng kiến trúc đương đại đang dịch chuyển mạnh mẽ về bề mặt Matt và Honed. Bề mặt mờ hấp thụ ánh sáng dịu mắt, không phản chiếu đèn trần gây chói, đồng thời bộc lộ rõ rệt từng hạt khoáng thạch và thớ vân tự nhiên dưới từng bước chân.'
      },
      {
        quote: 'Nếu bạn muốn một không gian hào nhoáng để chiêm ngưỡng, hãy chọn bóng gương. Nếu bạn muốn một nơi an trú để sống chậm và cảm nhận, hãy chọn bề mặt matt.'
      }
    ]
  },
  {
    id: 'art-03',
    slug: 'xu-huong-vat-lieu-kien-truc-2026-ton-vinh-nguyen-ban',
    title: 'Xu Hướng Vật Liệu Kiến Trúc 2026: Tôn Vinh Bề Mặt Nguyên Bản',
    excerpt: 'Từ đá vôi travertine cổ điển đến bê tông thô mộc, vật liệu tự nhiên đang khẳng định vị thế dẫn đầu trong kiến trúc bền vững tương lai.',
    image: 'https://grandtiles.com.vn/static/pano720/scenes/SCN-03-kitchen/SCN-03-kitchen_web4k.jpg',
    category: 'Xu hướng kiến trúc',
    readTime: '5 phút đọc',
    date: '20 Tháng 8, 2026',
    author: 'Thường Sơn Editorial Team',
    content: [
      {
        heading: 'Sự suy thoái của chủ nghĩa bóng bẩy giả tạo',
        paragraph: 'Thời kỳ của những mẫu gạch in vân hoa mỹ giả tạo đã khép lại. Năm 2026 đánh dấu sự lên ngôi của các bề mặt có độ trung thực cao: màu đất nung, sắc xám tro bazan và những đường nứt tự nhiên của đá trầm tích.'
      },
      {
        heading: 'Sự hòa hợp giữa công nghệ men sứ và tính sinh thái',
        paragraph: 'Các nhà máy hàng đầu như Monalisa, Apodio và Changyih đang ứng dụng công nghệ nung sinh thái, giảm thiểu phát thải và sử dụng đến 40% nguyên liệu khoáng thạch tái chế, đảm bảo độ bền hàng chục năm mà không bị lỗi mốt.'
      }
    ]
  }
];

export const BATHROOM_SOLUTIONS: BathroomSolution[] = [
  {
    id: 'sol-01',
    title: 'Thiết bị vệ sinh cao cấp',
    category: 'Bồn cầu & Lavabo',
    description: 'Các mẫu bồn cầu nguyên khối men nano kháng khuẩn, lavabo đặt bàn thanh mảnh đồng bộ cho phòng tắm gia đình và công trình cao cấp.',
    brands: ['INAX', 'Caesar', 'Viglacera Platinum', 'TOTO'],
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    features: ['Men sứ chống bám cặn Aqua Ceramic', 'Xả xoáy siêu êm tiết kiệm nước', 'Nắp đóng êm chất liệu UF chống trầy']
  },
  {
    id: 'sol-02',
    title: 'Hệ thống Sen tắm nhiệt độ & Vòi lavabo',
    category: 'Sen vòi',
    description: 'Sen cây ổn định nhiệt độ an toàn chống bỏng cho trẻ nhỏ, củ đồng thau mạ PVD chống hoen gỉ màu xám gunmetal và đồng xước sang trọng.',
    brands: ['INAX', 'Caesar', 'Thường Sơn Studio Selection'],
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80',
    features: ['Khóa nhiệt an toàn 38°C', 'Bát sen massage đa chế độ', 'Lớp mạ chân không PVD bền màu vĩnh cửu']
  },
  {
    id: 'sol-03',
    title: 'Giải pháp Bình nước nóng thông minh',
    category: 'Nước nóng & Năng lượng',
    description: 'Bình nước nóng gián tiếp tráng men Titan, điều khiển Wi-Fi thông minh, tiết kiệm điện năng và bảo vệ an toàn ELCB kép.',
    brands: ['Ariston', 'Ferroli'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    features: ['Thanh đốt đồng 100% làm nóng nhanh', 'Bình chứa kép tráng men Titan siêu bền', 'Vi mạch tự ngắt chống rò điện chủ động']
  },
  {
    id: 'sol-04',
    title: 'Gương LED cảm ứng & Sấy sương điện',
    category: 'Gương kiến trúc',
    description: 'Mẫu gương bo góc vòm hoặc phiến đá oval tích hợp đèn LED 3 dải màu và chức năng sấy phá sương mờ hơi nước chỉ với một chạm.',
    brands: ['Thường Sơn Atelier Custom Mirror'],
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    features: ['Phôi gương Bỉ AGC tráng bạc 8 lớp', 'Tấm sấy nhiệt phá sương công nghệ cao', 'LED đổi màu 3000K - 4000K - 6500K']
  }
];

// Helper query functions
export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter(p => p.featured);
}

export function getProductsByCollection(collectionSlug: string): Product[] {
  return PRODUCTS.filter(p => p.collectionSlug === collectionSlug);
}

export function getProductsBySpace(spaceNameOrSlug: string): Product[] {
  const spaceObj = SPACES.find(s => s.slug === spaceNameOrSlug || s.name.toLowerCase() === spaceNameOrSlug.toLowerCase());
  const searchName = spaceObj ? spaceObj.name : spaceNameOrSlug;
  return PRODUCTS.filter(p => p.useCases.some(u => u.toLowerCase() === searchName.toLowerCase()));
}

export function getAllCollections(): Collection[] {
  return COLLECTIONS;
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find(c => c.slug === slug);
}

export function getAllSpaces(): SpaceCategory[] {
  return SPACES;
}

export function getSpaceBySlug(slug: string): SpaceCategory | undefined {
  return SPACES.find(s => s.slug === slug);
}

export function getAllArticles(): JournalArticle[] {
  return JOURNAL_ARTICLES;
}

export function getArticleBySlug(slug: string): JournalArticle | undefined {
  return JOURNAL_ARTICLES.find(a => a.slug === slug);
}
