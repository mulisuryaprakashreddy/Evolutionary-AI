import type { Category, Listing, Owner } from './types';

export const CATEGORIES: Category[] = [
  { id: 'cameras', name: 'Cameras', icon: 'Camera', blurb: 'DSLRs, lenses, drones & gear' },
  { id: 'vehicles', name: 'Vehicles', icon: 'Car', blurb: 'Cars, bikes & scooters' },
  { id: 'computers', name: 'Computers', icon: 'Laptop', blurb: 'Laptops & workstations' },
  { id: 'gaming', name: 'Gaming', icon: 'Gamepad2', blurb: 'Consoles & controllers' },
  { id: 'tools', name: 'Power Tools', icon: 'Drill', blurb: 'Drills, saws & machinery' },
  { id: 'outdoor', name: 'Outdoor', icon: 'Tent', blurb: 'Camping & adventure gear' },
  { id: 'sports', name: 'Sports', icon: 'Bike', blurb: 'Bikes, boards & equipment' },
  { id: 'music', name: 'Music', icon: 'Music', blurb: 'Instruments & audio gear' },
  { id: 'fashion', name: 'Fashion', icon: 'Watch', blurb: 'Watches & luxury items' },
  { id: 'furniture', name: 'Furniture', icon: 'Sofa', blurb: 'Sofas, tables & decor' },
  { id: 'books', name: 'Books', icon: 'BookOpen', blurb: 'Textbooks & rare editions' },
  { id: 'office', name: 'Office', icon: 'Projector', blurb: 'Projectors & AV equipment' },
  { id: 'electronics', name: 'Electronics', icon: 'Smartphone', blurb: 'Phones, tablets & gadgets' },
  { id: 'other', name: 'Other', icon: 'Package', blurb: 'Everything else rentable' },
];

const owners: Owner[] = [
  { id: 'o1', name: 'Marcus Reed', avatar: 'https://i.pravatar.cc/120?img=12', verified: true, rating: 4.9, reviews: 184, joinedYear: 2021, location: 'Brooklyn, NY', responseTime: 'within an hour' },
  { id: 'o2', name: 'Sofia Alvarez', avatar: 'https://i.pravatar.cc/120?img=47', verified: true, rating: 4.8, reviews: 312, joinedYear: 2020, location: 'Austin, TX', responseTime: 'within 2 hours' },
  { id: 'o3', name: 'Kenji Tanaka', avatar: 'https://i.pravatar.cc/120?img=33', verified: true, rating: 5.0, reviews: 97, joinedYear: 2022, location: 'Seattle, WA', responseTime: 'within an hour' },
  { id: 'o4', name: 'Priya Nair', avatar: 'https://i.pravatar.cc/120?img=45', verified: false, rating: 4.6, reviews: 41, joinedYear: 2023, location: 'Chicago, IL', responseTime: 'within a day' },
  { id: 'o5', name: 'LensCraft Studio', avatar: 'https://i.pravatar.cc/120?img=68', verified: true, rating: 4.9, reviews: 521, joinedYear: 2019, location: 'Los Angeles, CA', responseTime: 'within an hour' },
  { id: 'o6', name: 'Daniel Okafor', avatar: 'https://i.pravatar.cc/120?img=15', verified: true, rating: 4.7, reviews: 156, joinedYear: 2021, location: 'Miami, FL', responseTime: 'within 3 hours' },
  { id: 'o7', name: 'GreenRide Co.', avatar: 'https://i.pravatar.cc/120?img=53', verified: true, rating: 4.8, reviews: 743, joinedYear: 2018, location: 'Portland, OR', responseTime: 'within an hour' },
  { id: 'o8', name: 'Amara Bello', avatar: 'https://i.pravatar.cc/120?img=49', verified: true, rating: 4.9, reviews: 88, joinedYear: 2022, location: 'Atlanta, GA', responseTime: 'within 2 hours' },
];

const sampleReviews = (seed: number) => [
  { id: `r${seed}1`, author: 'Jamie L.', avatar: 'https://i.pravatar.cc/80?img=5', rating: 5, date: '2 weeks ago', text: 'Item was in immaculate condition and the owner was incredibly responsive. Pickup was a breeze — would absolutely borrow again.' },
  { id: `r${seed}2`, author: 'Riley C.', avatar: 'https://i.pravatar.cc/80?img=8', rating: 4, date: '1 month ago', text: 'Great experience overall. Slightly late on delivery but the item performed flawlessly for my whole shoot.' },
  { id: `r${seed}3`, author: 'Sam W.', avatar: 'https://i.pravatar.cc/80?img=11', rating: 5, date: '2 months ago', text: 'Exactly as described, well-packaged, and the owner walked me through setup. Five stars without hesitation.' },
];

export const LISTINGS: Listing[] = [
  {
    id: 'l1', name: 'Canon EOS R5 Mirrorless Camera', category: 'cameras', brand: 'Canon', model: 'EOS R5',
    description: 'A professional full-frame mirrorless camera with 45MP sensor, 8K video, and in-body image stabilization. Includes 24-105mm L lens, two batteries, 128GB CFexpress card, and a rugged Pelican case. Perfect for weddings, wildlife, and commercial work.',
    images: [
      'https://images.pexels.com/photos/18880006/pexels-photo-18880006.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/3989612/pexels-photo-3989612.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/6598819/pexels-photo-6598819.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    condition: 'Like New', year: 2023, priceDaily: 89, priceWeekly: 449, priceMonthly: 1490, deposit: 500,
    delivery: true, pickup: true, shippingCost: 25, quantity: 3, minDays: 1, maxDays: 60,
    rating: 4.9, reviewsCount: 184, reviews: sampleReviews(1),
    location: 'Brooklyn, NY', city: 'New York', insurance: true, instantBook: true, trending: true, recentlyAdded: false, topRated: true, featured: true, owner: owners[0],
  },
  {
    id: 'l2', name: 'Sony A7 IV with 50mm f/1.4 Lens', category: 'cameras', brand: 'Sony', model: 'ILCE-7M4',
    description: '33MP full-frame hybrid camera loved by hybrid shooters. Comes with the legendary 50mm f/1.4 GM lens, three batteries, a gimbal-ready plate, and 64GB SDXC card. Outstanding for portraits and low-light video.',
    images: [
      'https://images.pexels.com/photos/3989612/pexels-photo-3989612.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/6598819/pexels-photo-6598819.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/18880006/pexels-photo-18880006.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    condition: 'Like New', year: 2022, priceDaily: 75, priceWeekly: 379, priceMonthly: 1290, deposit: 450,
    delivery: true, pickup: false, shippingCost: 20, quantity: 2, minDays: 2, maxDays: 45,
    rating: 4.8, reviewsCount: 312, reviews: sampleReviews(2),
    location: 'Los Angeles, CA', city: 'Los Angeles', insurance: true, instantBook: false, trending: true, recentlyAdded: true, topRated: true, featured: true, owner: owners[4],
  },
  {
    id: 'l3', name: 'DJI Mavic 3 Pro Drone', category: 'cameras', brand: 'DJI', model: 'Mavic 3 Pro',
    description: 'Triple-camera drone with Hasselblad sensor and 5.1K video. Includes three batteries, multi-charger, ND filter set, and a fly-more combo backpack. FAA-registered and ready to fly.',
    images: [
      'https://images.pexels.com/photos/5555813/pexels-photo-5555813.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/28861949/pexels-photo-28861949.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    condition: 'Good', year: 2023, priceDaily: 65, priceWeekly: 329, priceMonthly: 1090, deposit: 400,
    delivery: true, pickup: true, shippingCost: 18, quantity: 4, minDays: 1, maxDays: 30,
    rating: 4.9, reviewsCount: 97, reviews: sampleReviews(3),
    location: 'Seattle, WA', city: 'Seattle', insurance: true, instantBook: true, trending: true, recentlyAdded: false, topRated: true, featured: false, owner: owners[2],
  },
  {
    id: 'l4', name: 'MacBook Pro 16" M3 Max', category: 'computers', brand: 'Apple', model: 'MacBook Pro 16',
    description: '16-inch MacBook Pro with M3 Max, 36GB RAM, 1TB SSD. Configured for video editing, 3D rendering, and software development. Includes 96W charger, a calibrated color profile, and a protective sleeve.',
    images: [
      'https://images.pexels.com/photos/34804001/pexels-photo-34804001.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/265144/pexels-photo-265144.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    condition: 'Like New', year: 2024, priceDaily: 59, priceWeekly: 299, priceMonthly: 990, deposit: 600,
    delivery: true, pickup: true, shippingCost: 22, quantity: 5, minDays: 2, maxDays: 90,
    rating: 4.9, reviewsCount: 156, reviews: sampleReviews(4),
    location: 'Austin, TX', city: 'Austin', insurance: true, instantBook: true, trending: true, recentlyAdded: true, topRated: true, featured: true, owner: owners[1],
  },
  {
    id: 'l5', name: 'PlayStation 5 Slim + 2 Controllers', category: 'gaming', brand: 'Sony', model: 'PS5 Slim',
    description: 'PS5 Slim with disc drive, two DualSense controllers, charging dock, and a curated library of 8 popular titles pre-installed. Perfect for game nights, tournaments, and weekend marathons.',
    images: [
      'https://images.pexels.com/photos/7871504/pexels-photo-7871504.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/4523006/pexels-photo-4523006.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    condition: 'Like New', year: 2024, priceDaily: 29, priceWeekly: 149, priceMonthly: 450, deposit: 200,
    delivery: true, pickup: true, shippingCost: 12, quantity: 6, minDays: 1, maxDays: 30,
    rating: 4.7, reviewsCount: 41, reviews: sampleReviews(5),
    location: 'Chicago, IL', city: 'Chicago', insurance: false, instantBook: true, trending: false, recentlyAdded: true, topRated: false, featured: false, owner: owners[3],
  },
  {
    id: 'l6', name: 'Tesla Model 3 (Long Range)', category: 'vehicles', brand: 'Tesla', model: 'Model 3',
    description: '2023 Tesla Model 3 Long Range, AWD, 358mi range. Includes Supercharger access, premium connectivity, full self-driving (supervised), and a clean interior. Ideal for road trips and business travel.',
    images: [
      'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/29380865/pexels-photo-29380865.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    condition: 'Like New', year: 2023, priceDaily: 129, priceWeekly: 799, priceMonthly: 2900, deposit: 1000,
    delivery: true, pickup: true, shippingCost: 0, quantity: 2, minDays: 1, maxDays: 30,
    rating: 4.8, reviewsCount: 743, reviews: sampleReviews(6),
    location: 'Portland, OR', city: 'Portland', insurance: true, instantBook: false, trending: true, recentlyAdded: false, topRated: true, featured: true, owner: owners[6],
  },
  {
    id: 'l7', name: 'Electric Scooter (Dual Motor)', category: 'vehicles', brand: 'Apollo', model: 'Apollo City',
    description: 'Apollo City 2024 dual-motor electric scooter, 40mph top speed, 40mi range. Includes helmet, lock, charger, and phone mount. Great for last-mile commuting and city exploration.',
    images: [
      'https://images.pexels.com/photos/26708106/pexels-photo-26708106.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/9168370/pexels-photo-9168370.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    condition: 'Good', year: 2024, priceDaily: 39, priceWeekly: 199, priceMonthly: 650, deposit: 250,
    delivery: false, pickup: true, shippingCost: 0, quantity: 4, minDays: 1, maxDays: 14,
    rating: 4.6, reviewsCount: 88, reviews: sampleReviews(7),
    location: 'Atlanta, GA', city: 'Atlanta', insurance: false, instantBook: true, trending: false, recentlyAdded: true, topRated: false, featured: false, owner: owners[7],
  },
  {
    id: 'l8', name: 'DeWalt 20V Cordless Drill Kit', category: 'tools', brand: 'DeWalt', model: 'DCD777C2',
    description: 'Complete DeWalt 20V MAX kit: hammer drill, impact driver, circular saw, reciprocating saw, two 5Ah batteries, fast charger, and a tough-structured rolling case. Built for renovation projects.',
    images: [
      'https://images.pexels.com/photos/30413428/pexels-photo-30413428.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/7058409/pexels-photo-7058409.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    condition: 'Good', year: 2022, priceDaily: 24, priceWeekly: 99, priceMonthly: 320, deposit: 150,
    delivery: true, pickup: true, shippingCost: 15, quantity: 8, minDays: 1, maxDays: 30,
    rating: 4.7, reviewsCount: 156, reviews: sampleReviews(8),
    location: 'Miami, FL', city: 'Miami', insurance: false, instantBook: true, trending: false, recentlyAdded: false, topRated: false, featured: false, owner: owners[5],
  },
  {
    id: 'l9', name: '4-Person Camping Tent Bundle', category: 'outdoor', brand: 'REI Co-op', model: 'Half Dome SL 4',
    description: 'Everything for a weekend in the backcountry: 4-person tent, two sleeping bags rated to 30°F, two sleeping pads, headlamps, a camp stove, and a full cookset. Comes in a weatherproof duffel.',
    images: [
      'https://images.pexels.com/photos/10513799/pexels-photo-10513799.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/10762666/pexels-photo-10762666.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    condition: 'Good', year: 2023, priceDaily: 32, priceWeekly: 159, priceMonthly: 480, deposit: 180,
    delivery: true, pickup: true, shippingCost: 14, quantity: 5, minDays: 2, maxDays: 21,
    rating: 4.8, reviewsCount: 64, reviews: sampleReviews(9),
    location: 'Seattle, WA', city: 'Seattle', insurance: false, instantBook: true, trending: true, recentlyAdded: false, topRated: true, featured: false, owner: owners[2],
  },
  {
    id: 'l10', name: 'Trek Marlin 7 Mountain Bike', category: 'sports', brand: 'Trek', model: 'Marlin 7',
    description: '2024 Trek Marlin 7 with hydraulic disc brakes, 1x12 drivetrain, and tubeless-ready wheels. Includes helmet, repair kit, pump, and a U-lock. Sized for riders 5\'7"–6\'0".',
    images: [
      'https://images.pexels.com/photos/36450314/pexels-photo-36450314.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/19131145/pexels-photo-19131145.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    condition: 'Like New', year: 2024, priceDaily: 34, priceWeekly: 169, priceMonthly: 520, deposit: 220,
    delivery: false, pickup: true, shippingCost: 0, quantity: 3, minDays: 1, maxDays: 14,
    rating: 4.9, reviewsCount: 52, reviews: sampleReviews(10),
    location: 'Portland, OR', city: 'Portland', insurance: true, instantBook: true, trending: false, recentlyAdded: true, topRated: true, featured: false, owner: owners[6],
  },
  {
    id: 'l11', name: 'Martin D-28 Acoustic Guitar', category: 'music', brand: 'Martin', model: 'D-28',
    description: 'The legendary Martin D-28 dreadnought — warm, balanced tone with solid spruce top and rosewood back and sides. Includes hardshell case, capo, extra strings, and a strap. Studio-ready condition.',
    images: [
      'https://images.pexels.com/photos/10315093/pexels-photo-10315093.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/34215027/pexels-photo-34215027.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    condition: 'Like New', year: 2022, priceDaily: 45, priceWeekly: 229, priceMonthly: 780, deposit: 350,
    delivery: true, pickup: true, shippingCost: 28, quantity: 1, minDays: 1, maxDays: 30,
    rating: 5.0, reviewsCount: 38, reviews: sampleReviews(11),
    location: 'Austin, TX', city: 'Austin', insurance: true, instantBook: false, trending: false, recentlyAdded: false, topRated: true, featured: true, owner: owners[1],
  },
  {
    id: 'l12', name: 'Rolex Submariner (Vintage)', category: 'fashion', brand: 'Rolex', model: 'Submariner 16610',
    description: 'Classic stainless steel Submariner with black dial, 40mm case, and automatic movement. Recently serviced and pressure-tested. Includes original box, papers, and a recent authentication certificate.',
    images: [
      'https://images.pexels.com/photos/9267840/pexels-photo-9267840.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/28135838/pexels-photo-28135838.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    condition: 'Good', year: 2008, priceDaily: 120, priceWeekly: 699, priceMonthly: 2400, deposit: 2500,
    delivery: true, pickup: false, shippingCost: 45, quantity: 1, minDays: 3, maxDays: 30,
    rating: 4.9, reviewsCount: 27, reviews: sampleReviews(12),
    location: 'Los Angeles, CA', city: 'Los Angeles', insurance: true, instantBook: false, trending: false, recentlyAdded: false, topRated: true, featured: true, owner: owners[4],
  },
  {
    id: 'l13', name: 'Modern 3-Seater Sofa (Gray)', category: 'furniture', brand: 'West Elm', model: 'Modern Sofa',
    description: 'Elegant gray 3-seater sofa with stain-resistant fabric and solid wood legs. Professionally cleaned between rentals. Ideal for staging, events, or temporary furnished housing.',
    images: [
      'https://images.pexels.com/photos/3830747/pexels-photo-3830747.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/11295890/pexels-photo-11295890.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    condition: 'Good', year: 2021, priceDaily: 49, priceWeekly: 249, priceMonthly: 820, deposit: 400,
    delivery: true, pickup: false, shippingCost: 60, quantity: 2, minDays: 3, maxDays: 90,
    rating: 4.6, reviewsCount: 19, reviews: sampleReviews(13),
    location: 'Chicago, IL', city: 'Chicago', insurance: false, instantBook: true, trending: false, recentlyAdded: true, topRated: false, featured: false, owner: owners[3],
  },
  {
    id: 'l14', name: 'Stud Textbooks Bundle (CS)', category: 'books', brand: 'Various', model: 'CS Curriculum',
    description: 'A bundle of 6 core computer science textbooks covering algorithms, operating systems, databases, networking, ML, and distributed systems. Current editions, lightly annotated.',
    images: [
      'https://images.pexels.com/photos/8762862/pexels-photo-8762862.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/18847269/pexels-photo-18847269.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    condition: 'Good', year: 2023, priceDaily: 9, priceWeekly: 39, priceMonthly: 119, deposit: 60,
    delivery: true, pickup: false, shippingCost: 8, quantity: 10, minDays: 7, maxDays: 120,
    rating: 4.7, reviewsCount: 73, reviews: sampleReviews(14),
    location: 'Austin, TX', city: 'Austin', insurance: false, instantBook: true, trending: false, recentlyAdded: false, topRated: false, featured: false, owner: owners[1],
  },
  {
    id: 'l15', name: '4K Projector + 100" Screen', category: 'office', brand: 'Epson', model: 'Home Cinema 4010',
    description: 'Epson 4K PRO-UHD projector with a 100" motorized screen, ceiling mount, and 30ft HDMI cable. Perfect for film nights, conferences, and watch parties. Lamps recently replaced.',
    images: [
      'https://images.pexels.com/photos/8761313/pexels-photo-8761313.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      'https://images.pexels.com/photos/8761299/pexels-photo-8761299.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    ],
    condition: 'Like New', year: 2022, priceDaily: 55, priceWeekly: 279, priceMonthly: 890, deposit: 300,
    delivery: true, pickup: true, shippingCost: 35, quantity: 3, minDays: 1, maxDays: 30,
    rating: 4.8, reviewsCount: 44, reviews: sampleReviews(15),
    location: 'Atlanta, GA', city: 'Atlanta', insurance: true, instantBook: true, trending: false, recentlyAdded: true, topRated: true, featured: false, owner: owners[7],
  },
];

export const POPULAR_CITIES = [
  'New York', 'Los Angeles', 'Austin', 'Seattle', 'Portland', 'Chicago', 'Miami', 'Atlanta',
];

export function getListing(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}

export function formatPrice(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}
