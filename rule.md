Bạn là Senior Frontend Engineer + UI/UX Designer + Web Architect.

Nhiệm vụ của bạn là xây dựng hoàn chỉnh một website cao cấp về gạch, vật liệu kiến trúc và nội thất, lấy website sau làm reference chính:

https://grandtiles.com.vn/

MỤC TIÊU QUAN TRỌNG

Không tạo một template chung chung.

Hãy nghiên cứu kỹ website reference để hiểu:

* Visual language
* Information architecture
* Header/navigation
* Hero section
* Typography
* Color palette
* Spacing
* Layout
* Grid
* Product cards
* Collection cards
* Không gian sử dụng
* Catalog
* Product detail
* Showroom
* Cẩm nang
* Search/filter
* CTA
* Footer
* Responsive behavior
* Interaction
* Animation
* Image treatment
* UX flow

Sau đó xây dựng một phiên bản mới có cùng tinh thần thiết kế nhưng:

* đẹp hơn
* hiện đại hơn
* bố cục rõ hơn
* typography tốt hơn
* khoảng trắng tốt hơn
* responsive tốt hơn
* catalog dễ sử dụng hơn
* tốc độ tải tốt hơn
* code sạch hơn
* component hóa tốt hơn
* dễ đưa lên production

Không được đơn giản hóa website thành landing page.

Website phải có cảm giác như một website thực tế của một thương hiệu vật liệu kiến trúc cao cấp.

==================================================

1. QUY TẮC VỀ REFERENCE
   ==================================================

Reference:

https://grandtiles.com.vn/

Trước khi code:

1. Truy cập website reference.
2. Kiểm tra homepage.
3. Kiểm tra catalog.
4. Kiểm tra product detail.
5. Kiểm tra collections.
6. Kiểm tra các trang "Không gian".
7. Kiểm tra "Giải pháp".
8. Kiểm tra "Cẩm nang".
9. Kiểm tra showroom.
10. Kiểm tra navigation desktop/mobile.
11. Xác định design system hiện tại.
12. Liệt kê những điểm UX/UI có thể cải thiện.

Không được bắt đầu code ngay khi chưa hiểu cấu trúc website.

Nếu một nội dung/hình ảnh trên website reference thuộc bản quyền và project không có asset tương ứng, KHÔNG sao chép nguyên văn hoặc download/reuse trái phép.

Thay vào đó:

* giữ cấu trúc nội dung
* giữ loại content
* giữ concept
* tạo placeholder/content tương đương
* sử dụng ảnh placeholder chất lượng cao hoặc asset mà project cho phép sử dụng

Nếu trong project đã có các asset hợp pháp tương ứng thì ưu tiên sử dụng chúng.

==================================================
2. PHONG CÁCH THIẾT KẾ
======================

Website cần mang phong cách:

Luxury
Architecture
Material
Editorial
Minimal
Premium
Timeless

Không làm theo phong cách:

SaaS
Dashboard
E-commerce phổ thông
Gradient neon
Glassmorphism quá nhiều
Card bo tròn khắp nơi
Animation màu mè

Visual cần gần với:

* architectural magazine
* high-end ceramic brand
* stone/material showroom
* luxury interior studio

==================================================
3. DESIGN TOKENS
================

Tạo global design tokens.

Color palette khởi đầu:

Bone:
#F3F0E9

Paper:
#E9E5DC

Ink:
#171715

Ink Soft:
#292825

Clay:
#B85B35

Stone:
#918B80

Border:
rgba(23,23,21,0.15)

Có thể điều chỉnh nhẹ nếu sau khi phân tích reference thấy cần thiết.

Background chủ đạo:

off-white / bone.

Không sử dụng pure white quá nhiều.

==================================================
4. TYPOGRAPHY
=============

Thiết kế hệ thống typography rõ ràng.

Display / Editorial heading:

ưu tiên:

Newsreader

hoặc một serif editorial tương đương hỗ trợ hiển thị đẹp.

UI / Navigation / Body:

Manrope

hoặc:

Be Vietnam Pro

Đảm bảo tiếng Việt hiển thị tốt.

Desktop typography:

Hero H1:
72-96px

Section H2:
48-64px

Section H3:
32-40px

Card heading:
22-30px

Body:
16-18px

Small UI:
13-14px

Mobile:

Hero:
42-52px

Section H2:
32-40px

Body:
15-17px

Sử dụng clamp() khi phù hợp.

Typography phải responsive.

==================================================
5. GRID & SPACING
=================

Desktop max container:

1440px

Grid:

12 columns

Gutter:

24-32px

Section vertical spacing:

Desktop:
120-160px

Tablet:
80-120px

Mobile:
64-96px

Không nhồi nhiều section sát nhau.

Ảnh cần có "breathing room".

Một số editorial section cho phép breakout khỏi container.

==================================================
6. HEADER
=========

Thiết kế header premium.

Desktop:

Logo bên trái.

Navigation:

CATALOG
KHÔNG GIAN
BỘ SƯU TẬP
GIẢI PHÁP
CẨM NANG
SHOWROOM

Bên phải:

Search
Zalo / Liên hệ
Menu nếu cần.

Header mặc định trên hero:

transparent hoặc semi-transparent.

Khi scroll:

chuyển sang solid background.

Sticky header.

Transition mượt.

Mega menu cho:

Catalog
Không gian
Bộ sưu tập

Mega-menu có thể bao gồm:

* text
* categories
* featured collection
* featured image

Mobile:

hamburger menu fullscreen hoặc large overlay.

Không dùng dropdown mobile nhỏ khó bấm.

==================================================
7. HOMEPAGE
===========

Homepage phải có các section sau.

SECTION 1 — HERO

Full-width / gần full viewport.

Ảnh kiến trúc chất lượng cao.

Text overlay tối giản.

Ví dụ concept headline:

"Bề mặt định hình không gian."

Subtext:

"Khám phá vật liệu được tuyển chọn cho những không gian mang dấu ấn riêng."

CTA:

KHÁM PHÁ CATALOG

KHÔNG GIAN

Có subtle scroll indicator.

Hero không được giống banner quảng cáo thông thường.

---

SECTION 2 — MATERIAL INTRO

Editorial section.

Một heading lớn.

Ví dụ:

"Vật liệu không chỉ hoàn thiện không gian.
Nó định hình cách chúng ta cảm nhận không gian."

Kết hợp:

text
image
large typography

---

SECTION 3 — MATERIAL TYPES

Các nhóm:

Marble
Stone
Cement
Wood
Terrazzo
Solid Color

Layout không nên là 6 card giống nhau.

Có thể dùng asymmetrical editorial grid.

Ảnh lớn.

Hover:

image scale nhẹ
title move nhẹ

---

SECTION 4 — SHOP BY SPACE

Các không gian:

Phòng khách
Phòng tắm
Phòng bếp
Phòng ngủ
Ngoài trời
Thương mại

Ảnh architecture lớn.

Layout có thể:

2-column
hoặc editorial masonry.

---

SECTION 5 — FEATURED COLLECTION

Một collection lớn.

Layout:

ảnh collection chiếm khoảng 60-70%.

Phần còn lại:

collection title
description
product count
CTA

Ví dụ:

THE QUIET STONE COLLECTION

---

SECTION 6 — SELECTED PRODUCTS

Hiển thị khoảng:

4-8 products.

Product card tối giản.

Thông tin:

image
product name
code
size
surface
optional brand

Không tạo card có shadow.

Image là yếu tố chính.

Hover:

secondary image hoặc zoom nhỏ.

---

SECTION 7 — MATERIAL FINDER

Đây là feature quan trọng.

Tạo Material Finder dạng interactive wizard.

Flow:

Bước 1:

Bạn đang hoàn thiện không gian nào?

Phòng khách
Phòng tắm
Phòng bếp
Phòng ngủ
Ngoài trời

Bước 2:

Diện tích?

<20 m²
20-40 m²
40-80 m²

> 80 m²

Bước 3:

Phong cách?

Minimal
Modern
Luxury
Natural
Warm

Bước 4:

Tone màu?

Light
Warm
Neutral
Dark

Bước 5:

Surface?

Matt
Polished
Textured

Sau đó:

hiển thị suggested products.

Hiện tại có thể sử dụng local mock dataset.

Architecture phải cho phép kết nối database/API sau này.

---

SECTION 8 — EDITORIAL / ARCHITECTURE

Một layout giống magazine.

Một câu chuyện về vật liệu và kiến trúc.

Large image.

Small text column.

Có CTA:

XEM CẨM NANG

---

SECTION 9 — BATHROOM SOLUTIONS

Showcase bathroom collections.

Layout premium.

Có hình:

bathroom space
sanitary ware
surface materials

---

SECTION 10 — DIGITAL SHOWROOM / ZALO

Tạo block liên hệ.

Không để block này chiếm diện tích quá lớn.

Có:

QR placeholder
Zalo CTA
Tư vấn vật liệu
Catalog online

---

SECTION 11 — JOURNAL / CẨM NANG

3 article cards.

Ví dụ:

Cách lựa chọn kích thước gạch theo diện tích

Matt hay polished?

Xu hướng vật liệu kiến trúc

Editorial layout.

---

SECTION 12 — SHOWROOM

Large architectural image.

Thông tin:

Showroom
Address
Opening hours
Contact

CTA:

CHỈ ĐƯỜNG

ĐẶT LỊCH TƯ VẤN

---

SECTION 13 — FINAL CTA

Large typography.

Ví dụ:

"Không gian bắt đầu từ bề mặt."

CTA:

KHÁM PHÁ CATALOG

---

SECTION 14 — FOOTER

Footer premium.

Columns:

Catalog

Không gian

Giải pháp

Cẩm nang

Showroom

Company

Contact

Social

Newsletter nếu phù hợp.

Không làm footer quá dày.

==================================================
8. CATALOG PAGE
===============

Route:

/catalog

Catalog phải là page thực tế.

Desktop layout:

LEFT:

filter sidebar.

RIGHT:

product grid.

Filter:

Category

Collection

Material

Size

Color

Surface

Use case

Brand

Filter có:

clear all
active filter chips

Topbar:

Results count
Sort
Grid controls

Sort:

Featured
Newest
A-Z

Product grid:

Desktop:
4 columns

Large desktop:
có thể 5

Tablet:
3

Mobile:
2 hoặc 1 tùy width.

Filter mobile:

bottom sheet hoặc full-screen drawer.

URL filter cần có khả năng mapping sang query parameters.

Ví dụ:

/catalog?space=living-room&surface=matt

==================================================
9. SEARCH
=========

Search icon trên header.

Click:

mở fullscreen search overlay.

Search theo:

product name
code
collection
material

Có:

recent search
popular categories
suggestions

Mock search được phép.

==================================================
10. PRODUCT DETAIL
==================

Route:

/products/[slug]

Trang product detail phải gồm:

Breadcrumb

Large gallery

Product name

Code

Collection

Brand

Sizes

Surface

Color

Use cases

Description

Technical properties

Applications

Download specification CTA

Contact CTA

Similar products

Related collection

Product gallery phải responsive tốt.

Desktop:

gallery lớn bên trái

product information sticky bên phải.

==================================================
11. COLLECTION PAGE
===================

Route:

/collections/[slug]

Hero:

collection image

collection title

collection story

Sau đó:

material overview

color palette

textures

product variants

products

application spaces

related collections

Thiết kế giống editorial catalogue.

==================================================
12. SPACE PAGE
==============

Routes:

/spaces/living-room
/spaces/bathroom
/spaces/kitchen
/spaces/bedroom
/spaces/outdoor

Mỗi page gồm:

hero

intro

recommended materials

featured projects

recommended sizes

recommended surfaces

selected products

design tips

CTA

==================================================
13. JOURNAL
===========

Route:

/journal

và:

/journal/[slug]

Thiết kế editorial.

Không giống blog WordPress mặc định.

Article typography phải đẹp.

Max-width text:

700-800px.

Ảnh có thể breakout.

==================================================
14. SHOWROOM
============

Route:

/showroom

Bao gồm:

showroom hero

address

opening hours

contact

large image gallery

map placeholder

consultation CTA

==================================================
15. COMPONENT ARCHITECTURE
==========================

Code phải chia component rõ ràng.

Gợi ý:

src/
app/
components/
layout/
navigation/
hero/
sections/
catalog/
product/
collection/
space/
editorial/
material-finder/
showroom/
search/
ui/

data/
lib/
types/
hooks/
styles/

Không tạo page.tsx dài hàng nghìn dòng.

Mỗi section lớn thành component riêng.

==================================================
16. STACK
=========

Ưu tiên:

Next.js latest stable

App Router

TypeScript

Tailwind CSS

Framer Motion

Lucide Icons

Next/Image

Nếu project hiện tại đã dùng stack khác thì kiểm tra trước khi thay đổi.

Không thêm dependency không cần thiết.

==================================================
17. DATA MODEL
==============

Tạo mock product dataset đủ thực tế.

Product:

id
slug
name
code
brand
collection
material
surface
colors
sizes
useCases
description
images
featured
new
technicalSpecs

Collection:

id
slug
name
description
heroImage
products
material
story

Journal:

id
slug
title
excerpt
content
image
category
date

Space:

id
slug
name
description
heroImage
recommendedProducts

==================================================
18. IMAGE STRATEGY
==================

Dùng ảnh lớn chất lượng cao.

Ưu tiên:

architecture
interior
stone texture
ceramic texture
bathroom
living room
material close-up

Đảm bảo:

object-fit
proper cropping
responsive sizes
lazy loading

Hero image được priority.

Không dùng cùng một ảnh lặp lại khắp website.

Nếu chưa có asset thật:

tạo hệ thống placeholder asset hợp lý để sau này có thể thay ảnh dễ dàng.

==================================================
19. ANIMATION
=============

Animation subtle.

Dùng:

opacity
translateY
clip-path reveal khi phù hợp
image scale
line reveal

Duration:

250-700ms.

Không animation quá nhiều.

Không parallax mạnh.

Không ảnh hưởng performance.

Respect:

prefers-reduced-motion.

==================================================
20. RESPONSIVE
==============

Kiểm tra tối thiểu:

375px
390px
768px
1024px
1440px
1920px

Không chỉ scale desktop xuống mobile.

Mobile cần layout riêng hợp lý.

Đặc biệt kiểm tra:

header
menu
hero
catalog filters
product grid
product detail
material finder
footer

==================================================
21. ACCESSIBILITY
=================

Đảm bảo:

semantic HTML

alt text

keyboard navigation

focus states

aria-label

sufficient contrast

button/link semantics đúng

==================================================
22. PERFORMANCE
===============

Tối ưu:

Next/Image

image sizes

font loading

dynamic imports nếu cần

bundle size

layout shift

animation performance

Không preload hàng chục ảnh.

Hero ưu tiên tải.

Các ảnh dưới fold lazy load.

==================================================
23. SEO
=======

Tạo:

metadata

title

description

OpenGraph

canonical structure nếu cần.

Dynamic metadata cho:

product
collection
journal

==================================================
24. CODE QUALITY
================

Bắt buộc:

TypeScript strict-friendly.

Không dùng `any` nếu không cần.

Không duplicate component.

Không hardcode cùng dữ liệu nhiều nơi.

Không viết inline style tùy tiện.

Không tạo giant component.

Không bỏ qua console errors.

Không để TypeScript errors.

Không để ESLint errors nghiêm trọng.

==================================================
25. EXECUTION WORKFLOW
======================

Thực hiện theo thứ tự:

PHASE 1

Phân tích repository hiện tại.

Đọc:

package.json
project structure
config
existing components
existing styles

Không phá code hiện tại nếu không cần.

PHASE 2

Phân tích reference website.

Viết file:

docs/reference-analysis.md

Bao gồm:

* sitemap
* navigation
* page types
* layout
* colors
* typography
* spacing
* card patterns
* image patterns
* strengths
* weaknesses
* proposed improvements

PHASE 3

Tạo file:

docs/design-system.md

Bao gồm:

colors
typography
spacing
grid
breakpoints
buttons
links
cards
image rules
animations

PHASE 4

Tạo:

global styles
layout
header
footer
base UI

PHASE 5

Build homepage hoàn chỉnh.

PHASE 6

Build catalog.

PHASE 7

Build product detail.

PHASE 8

Build collection.

PHASE 9

Build space pages.

PHASE 10

Build journal.

PHASE 11

Build showroom.

PHASE 12

Responsive optimization.

PHASE 13

Accessibility.

PHASE 14

Performance optimization.

PHASE 15

Run:

npm install

npm run lint

npm run build

Sửa toàn bộ lỗi.

==================================================
26. VISUAL QA
=============

Sau khi hoàn thiện:

Chạy project.

Kiểm tra thực tế bằng browser.

Không chỉ dựa vào code.

Kiểm tra:

desktop

tablet

mobile

Kiểm tra từng section.

Nếu thấy:

text quá nhỏ
spacing sai
image crop xấu
section quá chật
grid không cân
CTA yếu
navigation khó dùng

thì tự chỉnh sửa.

Không coi task hoàn thành chỉ vì build pass.

==================================================
27. UX IMPROVEMENTS SO VỚI REFERENCE
====================================

Đặc biệt cải thiện:

1. Visual hierarchy.

2. Typography.

3. Spacing.

4. Catalog filtering.

5. Product discovery.

6. Search.

7. Material Finder.

8. Mobile experience.

9. Product detail information architecture.

10. Collection storytelling.

11. Showroom CTA.

12. Performance.

==================================================
28. DESIGN PRINCIPLE
====================

Hãy luôn ưu tiên:

IMAGE > LAYOUT > TYPOGRAPHY > CONTENT > DECORATION

Không thêm decoration chỉ để lấp khoảng trắng.

Whitespace là một thành phần thiết kế.

Không phải mọi section đều cần background khác màu.

Không phải mọi text đều cần box/card.

Không phải mọi button đều cần filled background.

==================================================
29. EXPECTED RESULT
===================

Khi hoàn thành tôi muốn cảm giác:

"Đây là phiên bản redesign cao cấp hơn của một website vật liệu kiến trúc như Grand Tiles."

Không muốn cảm giác:

"AI vừa tạo một landing page bán gạch."

Website phải đủ tốt để tiếp tục phát triển thành website thương mại thật.

==================================================
30. IMPORTANT AGENT BEHAVIOR
============================

Bạn được phép:

* đọc source code
* tạo file
* sửa file
* refactor
* chạy command
* chạy browser
* kiểm tra UI
* sửa bug

Không hỏi tôi xác nhận từng bước nhỏ.

Nếu có lựa chọn kỹ thuật không quan trọng:

tự chọn phương án tốt nhất.

Nếu repository trống:

khởi tạo project phù hợp.

Nếu repository đã có Next.js:

tiếp tục sử dụng architecture hiện tại khi hợp lý.

Không dừng lại sau khi tạo skeleton.

Không chỉ tạo homepage.

Không chỉ viết kế hoạch.

Hãy thực sự triển khai code.

==================================================
31. DEFINITION OF DONE
======================

Task chỉ được coi là hoàn thành khi:

Homepage hoàn chỉnh.

Header hoàn chỉnh.

Mega-menu/mobile-menu hoạt động.

Catalog hoạt động.

Filter hoạt động.

Search UI hoạt động.

Material Finder hoạt động.

Product detail hoạt động.

Collection page hoạt động.

Space pages hoạt động.

Journal hoạt động.

Showroom hoạt động.

Responsive hoạt động.

No broken routes.

No obvious console errors.

Build thành công.

UI đã được kiểm tra bằng browser.

Cuối cùng hãy báo cáo:

1. Những gì đã triển khai.
2. File/folder chính đã tạo.
3. Những cải tiến so với reference.
4. Những phần hiện đang dùng mock data.
5. Những bước cần làm để kết nối backend/CMS thật.
6. Kết quả lint/build.
