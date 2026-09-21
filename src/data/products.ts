import type { AdminProduct } from 'types/console';
import { reviewQueueOrder } from 'lib/productApproval';

/* Listings across every store.

   `approval` is the field the backend does not have yet: Prisma's Product has
   no status column at all, so today a seller's listing is live the instant it
   is saved. Adding it is the one migration this screen cannot work without —
   see README.md. Until then these rows carry the shape the console expects.

   The mix is deliberate: rows waiting on review, one approved product the
   seller has switched off, one rejected, one approved but out of stock. Those
   are the four states lib/productApproval distinguishes, and each looks
   different on screen. */

const BUDS_DESC =
  'Samsung introduced the Galaxy Buds Pro alongside the Galaxy S21 series. These are true wireless earbuds, with pro-grade technology for immersive sound like never before. While Intelligent ANC lets you seamlessly switch between noise cancelling and fully adjustable ambient sound.';

const img = (n: number) => `/assets/images/samples/product-${n}.png`;

export const PRODUCTS: AdminProduct[] = [
  {
    id: 'P-10041',
    storeId: 'SH12345',
    name: 'Samsung Galaxy Buds Pro',
    description: BUDS_DESC,
    image: img(1),
    gallery: [img(1), img(2), img(3), img(4)],
    categoryId: 'electronics',
    subcategoryName: 'Headphones & Audio',
    brandName: 'Samsung',
    mode: 'WHOLESALE',
    price: 120,
    discountPercent: 15,
    colour: 'Black',
    stock: 500,
    sales: 750,
    approval: 'APPROVED',
    approvalNote: null,
    listedBySeller: true,
    createdAt: '2025-03-09',
    variations: [
      { name: 'Variation 1', size: 'XL', colour: 'Black', price: 150, stock: 250, createdAt: '2025-03-09', images: [img(1), img(2), img(3), img(4)] },
      { name: 'Variation 2', size: 'XL', colour: 'White', price: 170, stock: 150, createdAt: '2025-03-09', images: [img(5), img(6), img(7), img(8)] }
    ]
  },
  {
    id: 'P-10042',
    storeId: 'FF69870',
    name: 'Wireless Charger 25W',
    description:
      'Fast 25W wireless charging pad with a non-slip surface and over-temperature protection. Works through most cases up to 5mm.',
    image: img(2),
    gallery: [img(2), img(3), img(4)],
    categoryId: 'electronics',
    subcategoryName: 'Mobile Phones',
    brandName: 'Samsung',
    mode: 'WHOLESALE',
    price: 80,
    discountPercent: 0,
    colour: 'White',
    stock: 300,
    sales: 400,
    approval: 'APPROVED',
    approvalNote: null,
    listedBySeller: true,
    createdAt: '2025-02-18',
    variations: []
  },
  {
    id: 'P-10043',
    storeId: 'HH24680',
    name: 'Smart Watch Series 6',
    description:
      'AMOLED always-on display, heart-rate and SpO2 tracking, 7-day battery. Bundled silicone strap.',
    image: img(3),
    gallery: [img(3), img(4), img(5)],
    categoryId: 'electronics',
    subcategoryName: 'Smartwatches',
    brandName: 'Novex Gear',
    mode: 'RETAIL',
    price: 40,
    discountPercent: 10,
    colour: 'Silver',
    stock: 10,
    sales: 60,
    approval: 'PENDING',
    approvalNote: null,
    listedBySeller: true,
    createdAt: '2025-09-14',
    variations: [
      { name: 'Variation 1', size: '42mm', colour: 'Silver', price: 40, stock: 6, createdAt: '2025-09-14', images: [img(3), img(4)] },
      { name: 'Variation 2', size: '46mm', colour: 'Graphite', price: 48, stock: 4, createdAt: '2025-09-14', images: [img(5), img(6)] }
    ]
  },
  {
    id: 'P-10044',
    storeId: 'GG13579',
    name: 'Cotton Crew Neck T-Shirt',
    description: '180gsm combed cotton, pre-shrunk, unisex fit. Sold in packs of ten.',
    image: img(4),
    gallery: [img(4), img(5)],
    categoryId: 'clothing',
    subcategoryName: 'T-Shirts',
    brandName: 'Zyntra Wear',
    mode: 'WHOLESALE',
    price: 200,
    discountPercent: 20,
    colour: 'Navy',
    stock: 90,
    sales: 310,
    approval: 'APPROVED',
    approvalNote: null,
    listedBySeller: true,
    createdAt: '2025-01-22',
    variations: []
  },
  {
    id: 'P-10045',
    storeId: 'SS98765',
    name: 'Niacinamide 10% Serum',
    description:
      'For blemish-prone skin. Fragrance free, 30ml, dermatologically tested. Batch-coded with a 24-month shelf life.',
    image: img(5),
    gallery: [img(5), img(6)],
    categoryId: 'beauty',
    subcategoryName: 'Skincare',
    brandName: 'Aurelia',
    mode: 'RETAIL',
    price: 350,
    discountPercent: 24,
    colour: 'Clear',
    stock: 120,
    sales: 240,
    approval: 'PENDING',
    approvalNote: null,
    listedBySeller: true,
    createdAt: '2025-09-02',
    variations: []
  },
  {
    id: 'P-10046',
    storeId: 'YY87634',
    name: 'Leather Wallet — Handmade',
    description:
      'Full-grain leather, hand-stitched, six card slots. Ages to a deep patina with use.',
    image: img(6),
    gallery: [img(6), img(7)],
    categoryId: 'clothing',
    subcategoryName: 'Jackets & Coats',
    brandName: 'Klyro Fashion',
    mode: 'RETAIL',
    price: 75,
    discountPercent: 0,
    colour: 'Tan',
    stock: 40,
    sales: 55,
    approval: 'REJECTED',
    approvalNote:
      'Product photos are watermarked with another marketplace. Re-shoot or supply unbranded images.',
    listedBySeller: true,
    createdAt: '2025-08-11',
    variations: []
  },
  {
    id: 'P-10047',
    storeId: 'CC09125',
    name: 'Basmati Rice — Aged 2 Years',
    description:
      'Extra long grain, halal certified, ambient storage. 25kg sacks, minimum order twenty.',
    image: img(7),
    gallery: [img(7), img(8)],
    categoryId: 'grocery',
    subcategoryName: 'Rice & Staples',
    brandName: 'Granora',
    mode: 'WHOLESALE',
    price: 1200,
    discountPercent: 12,
    colour: 'n/a',
    stock: 260,
    sales: 980,
    approval: 'APPROVED',
    approvalNote: null,
    listedBySeller: true,
    createdAt: '2024-12-05',
    variations: []
  },
  {
    id: 'P-10048',
    storeId: 'ZR44512',
    name: 'Ceramic Storage Jar Set',
    description:
      'Three-piece set with airtight bamboo lids. Dishwasher safe, microwave safe.',
    image: img(8),
    gallery: [img(8), img(1)],
    categoryId: 'home-kitchen',
    subcategoryName: 'Storage & Organisation',
    brandName: 'Orbina Apparel',
    mode: 'RETAIL',
    price: 145,
    discountPercent: 5,
    colour: 'Cream',
    stock: 0,
    sales: 130,
    approval: 'APPROVED',
    approvalNote: null,
    listedBySeller: true,
    createdAt: '2025-04-19',
    variations: []
  },
  {
    id: 'P-10049',
    storeId: 'SH12345',
    name: 'Puzzle — 1000 Piece Cityscape',
    description:
      'Thick board, matte finish, poster included. Recommended for ages 12 and up.',
    image: img(1),
    gallery: [img(1), img(3)],
    categoryId: 'toys',
    subcategoryName: 'Puzzles',
    brandName: 'Veltic Sports',
    mode: 'RETAIL',
    price: 95,
    discountPercent: 0,
    colour: 'Multi',
    stock: 75,
    sales: 180,
    approval: 'APPROVED',
    approvalNote: null,
    listedBySeller: false,
    createdAt: '2025-05-30',
    variations: []
  },
  {
    id: 'P-10050',
    storeId: 'FF69870',
    name: 'Match Football — Size 5',
    description:
      'Thermally bonded panels, FIFA Basic tested, retains pressure in heat.',
    image: img(2),
    gallery: [img(2), img(4)],
    categoryId: 'sports',
    subcategoryName: 'Footballs',
    brandName: 'Veltic Sports',
    mode: 'WHOLESALE',
    price: 420,
    discountPercent: 8,
    colour: 'White/Red',
    stock: 210,
    sales: 340,
    approval: 'PENDING',
    approvalNote: null,
    listedBySeller: true,
    createdAt: '2025-09-18',
    variations: []
  },
  {
    id: 'P-10051',
    storeId: 'GG13579',
    name: 'Winter Puffer Jacket',
    description:
      'Water-repellent shell, recycled fill, packs into its own pocket. Sizes S to XXL.',
    image: img(3),
    gallery: [img(3), img(6)],
    categoryId: 'clothing',
    subcategoryName: 'Jackets & Coats',
    brandName: 'Lumora Style',
    mode: 'RETAIL',
    price: 480,
    discountPercent: 30,
    colour: 'Black',
    stock: 64,
    sales: 220,
    approval: 'APPROVED',
    approvalNote: null,
    listedBySeller: true,
    createdAt: '2025-02-02',
    variations: [
      { name: 'Variation 1', size: 'M', colour: 'Black', price: 480, stock: 30, createdAt: '2025-02-02', images: [img(3), img(6)] },
      { name: 'Variation 2', size: 'L', colour: 'Olive', price: 495, stock: 34, createdAt: '2025-02-02', images: [img(7), img(8)] }
    ]
  },
  {
    id: 'P-10052',
    storeId: 'HH24680',
    name: 'Brake Pad Set — Front Axle',
    description:
      'Low-dust ceramic compound, fits most 2015+ saloons. Sold per axle with fitting clips.',
    image: img(4),
    gallery: [img(4), img(8)],
    categoryId: 'automotive',
    subcategoryName: 'Car Parts',
    brandName: 'Novex Gear',
    mode: 'WHOLESALE',
    price: 640,
    discountPercent: 0,
    colour: 'n/a',
    stock: 150,
    sales: 90,
    approval: 'REJECTED',
    approvalNote:
      'No safety certification supplied for a braking component. Upload the test report to resubmit.',
    listedBySeller: true,
    createdAt: '2025-07-07',
    variations: []
  },
  {
    id: 'P-10053',
    storeId: 'SS98765',
    name: 'School Textbook Bundle — Year 7',
    description:
      'Curriculum-aligned set of six. Bulk pricing for schools, delivered shrink-wrapped.',
    image: img(5),
    gallery: [img(5), img(2)],
    categoryId: 'books',
    subcategoryName: 'School Textbooks',
    brandName: 'Granora',
    mode: 'WHOLESALE',
    price: 890,
    discountPercent: 18,
    colour: 'n/a',
    stock: 310,
    sales: 410,
    approval: 'APPROVED',
    approvalNote: null,
    listedBySeller: true,
    createdAt: '2025-06-14',
    variations: []
  },
  {
    id: 'P-10054',
    storeId: 'CC09125',
    name: 'Argan Hair Oil 100ml',
    description:
      'Cold-pressed, single ingredient, no added fragrance. Glass bottle with a dropper.',
    image: img(6),
    gallery: [img(6), img(1)],
    categoryId: 'beauty',
    subcategoryName: 'Haircare',
    brandName: 'Aurelia',
    mode: 'RETAIL',
    price: 132,
    discountPercent: 10,
    colour: 'Amber',
    stock: 88,
    sales: 160,
    approval: 'PENDING',
    approvalNote: null,
    listedBySeller: true,
    createdAt: '2025-09-20',
    variations: []
  },
  {
    id: 'P-10055',
    storeId: 'ZR44512',
    name: 'Adjustable Dumbbell 20kg',
    description:
      'Cast-iron plates with a knurled steel handle, quick-lock collars included.',
    image: img(7),
    gallery: [img(7), img(5)],
    categoryId: 'sports',
    subcategoryName: 'Fitness Equipment',
    brandName: 'Veltic Sports',
    mode: 'RETAIL',
    price: 560,
    discountPercent: 0,
    colour: 'Black',
    stock: 22,
    sales: 48,
    approval: 'APPROVED',
    approvalNote: null,
    listedBySeller: true,
    createdAt: '2025-03-28',
    variations: []
  },
  {
    id: 'P-10056',
    storeId: 'YY87634',
    name: 'Non-stick Frying Pan 28cm',
    description:
      'Three-layer coating, induction compatible, riveted handle. Two-year warranty.',
    image: img(8),
    gallery: [img(8), img(3)],
    categoryId: 'home-kitchen',
    subcategoryName: 'Kitchen Tools',
    brandName: 'Trenzik Threads',
    mode: 'WHOLESALE',
    price: 380,
    discountPercent: 6,
    colour: 'Grey',
    stock: 140,
    sales: 70,
    approval: 'PENDING',
    approvalNote: null,
    listedBySeller: true,
    createdAt: '2025-09-19',
    variations: []
  }
];

export const productById = (id: string): AdminProduct | undefined =>
  PRODUCTS.find((product) => product.id === id);

export const productsForStore = (storeId: string): AdminProduct[] =>
  PRODUCTS.filter((product) => product.storeId === storeId);

/** Everything still waiting on a decision, oldest first. */
export const REVIEW_QUEUE = reviewQueueOrder(PRODUCTS).filter(
  (product) => product.approval === 'PENDING'
);
