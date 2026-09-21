import type { AdminBrand, AdminCategory } from 'types/console';

/* Categories and brands.

   Two things here do not exist in the backend yet and will need columns:
   • Category/Subcategory carry no `description` in Prisma, but the Categories
     screen shows one per subcategory.
   • There is no Brand model at all — `Product.brand` is a free-text string, so
     the same brand can be spelled three ways across three stores. The Brands
     screen only makes sense once brands are rows.                            */

export const CATEGORIES: AdminCategory[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    subcategories: [
      { id: 'smartwatches', name: 'Smartwatches', description: 'Devices and gadgets', productCount: 120 },
      { id: 'audio', name: 'Headphones & Audio', description: 'Earbuds, over-ear and speakers', productCount: 86 },
      { id: 'phones', name: 'Mobile Phones', description: 'Handsets and accessories', productCount: 143 }
    ]
  },
  {
    id: 'clothing',
    name: 'Clothing',
    subcategories: [
      { id: 'jackets', name: 'Jackets & Coats', description: 'Winter collection', productCount: 200 },
      { id: 'tshirts', name: 'T-Shirts', description: 'Everyday cotton basics', productCount: 310 }
    ]
  },
  {
    id: 'home-kitchen',
    name: 'Home & Kitchen',
    subcategories: [
      { id: 'kitchen-tools', name: 'Kitchen Tools', description: 'Essential for everyday cooking', productCount: 80 },
      { id: 'storage', name: 'Storage & Organisation', description: 'Boxes, racks and shelving', productCount: 54 }
    ]
  },
  {
    id: 'books',
    name: 'Books',
    subcategories: [
      { id: 'textbooks', name: 'School Textbooks', description: 'Educational content for schools', productCount: 90 }
    ]
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    subcategories: [
      { id: 'footballs', name: 'Footballs', description: 'Durable balls for every match', productCount: 130 },
      { id: 'fitness', name: 'Fitness Equipment', description: 'Home gym and training gear', productCount: 76 }
    ]
  },
  {
    id: 'toys',
    name: 'Toys & Games',
    subcategories: [
      { id: 'puzzles', name: 'Puzzles', description: 'Challenging, brain-teasing, fun, interactive', productCount: 250 }
    ]
  },
  {
    id: 'automotive',
    name: 'Automotive',
    subcategories: [
      { id: 'car-parts', name: 'Car Parts', description: 'Essential components for vehicles', productCount: 463 }
    ]
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    subcategories: [
      { id: 'skincare', name: 'Skincare', description: 'Serums, cleansers and moisturisers', productCount: 168 },
      { id: 'haircare', name: 'Haircare', description: 'Shampoo, oils and styling', productCount: 94 }
    ]
  },
  {
    id: 'grocery',
    name: 'Grocery',
    subcategories: [
      { id: 'staples', name: 'Rice & Staples', description: 'Ambient storage, bulk friendly', productCount: 212 }
    ]
  }
];

/** Flattened for the table, which shows one row per subcategory. */
export interface CategoryRow {
  id: string;
  categoryId: string;
  categoryName: string;
  /** Null on the placeholder row for a category with no subcategories yet. */
  subcategoryId: string | null;
  subcategoryName: string;
  description: string;
  productCount: number;
}

/**
 * One row per subcategory — plus one placeholder row for a category that has
 * none. Without that, a category you just created would be invisible on the
 * screen you created it from, which reads as the save having failed.
 */
export const toRows = (categories: AdminCategory[]): CategoryRow[] =>
  // annotated so the two ternary branches widen to CategoryRow rather than
  // inferring `subcategoryId: string` from one and `null` from the other
  categories.flatMap((category): CategoryRow[] =>
    category.subcategories.length === 0
      ? [
          {
            id: `${category.id}/`,
            categoryId: category.id,
            categoryName: category.name,
            subcategoryId: null,
            subcategoryName: '',
            description: '',
            productCount: 0
          }
        ]
      : category.subcategories.map((sub) => ({
          id: `${category.id}/${sub.id}`,
          categoryId: category.id,
          categoryName: category.name,
          subcategoryId: sub.id,
          subcategoryName: sub.name,
          description: sub.description,
          productCount: sub.productCount
        }))
  );

export const CATEGORY_ROWS: CategoryRow[] = toRows(CATEGORIES);

export const categoryName = (id: string): string =>
  CATEGORIES.find((category) => category.id === id)?.name ?? 'Uncategorised';

export const BRANDS: AdminBrand[] = [
  {
    id: 'zyntra-wear',
    name: 'Zyntra Wear',
    logo: '/assets/images/samples/product-2.png',
    description: 'Bold, minimal, urban.',
    productCount: 120,
    status: 'ACTIVE',
    joinedAt: '2024-03-27'
  },
  {
    id: 'novex-gear',
    name: 'Novex Gear',
    logo: '/assets/images/samples/product-4.png',
    description: 'Durable, sporty, performance.',
    productCount: 85,
    status: 'INACTIVE',
    joinedAt: '2025-02-14'
  },
  {
    id: 'lumora-style',
    name: 'Lumora Style',
    logo: '/assets/images/samples/product-6.png',
    description: 'Elegant, timeless, comfortable.',
    productCount: 60,
    status: 'ACTIVE',
    joinedAt: '2023-07-21'
  },
  {
    id: 'veltic-sports',
    name: 'Veltic Sports',
    logo: '/assets/images/samples/product-8.png',
    description: 'Fast, tough, active.',
    productCount: 45,
    status: 'ACTIVE',
    joinedAt: '2024-03-27'
  },
  {
    id: 'klyro-fashion',
    name: 'Klyro Fashion',
    logo: null,
    description: 'Youthful, trendy, vibrant.',
    productCount: 30,
    status: 'INACTIVE',
    joinedAt: '2025-02-14'
  },
  {
    id: 'orbina-apparel',
    name: 'Orbina Apparel',
    logo: '/assets/images/samples/product-7.png',
    description: 'Casual, cozy, modern.',
    productCount: 70,
    status: 'ACTIVE',
    joinedAt: '2023-07-21'
  },
  {
    id: 'trenzik-threads',
    name: 'Trenzik Threads',
    logo: null,
    description: 'Fresh, bold, fashionable.',
    productCount: 35,
    status: 'INACTIVE',
    joinedAt: '2025-02-14'
  },
  {
    id: 'samsung',
    name: 'Samsung',
    logo: '/assets/images/samples/product-1.png',
    description: 'Consumer electronics and mobile.',
    productCount: 214,
    status: 'ACTIVE',
    joinedAt: '2023-01-15'
  },
  {
    id: 'aurelia',
    name: 'Aurelia',
    logo: '/assets/images/samples/product-5.png',
    description: 'Skincare, fragrance free.',
    productCount: 58,
    status: 'ACTIVE',
    joinedAt: '2024-11-02'
  },
  {
    id: 'granora',
    name: 'Granora',
    logo: null,
    description: 'Pantry staples, halal certified.',
    productCount: 41,
    status: 'ACTIVE',
    joinedAt: '2024-06-18'
  }
];
