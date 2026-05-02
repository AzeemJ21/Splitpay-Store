/** FYP prototype — static mock product catalog (no database). */

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  stock: number;
  rating: number;
  reviews: number;
};

export const products: Product[] = [
  {
    id: "1",
    name: "Wireless Noise-Cancelling Headphones",
    price: 249.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    description: "Premium sound with 30hr battery. ANC technology.",
    stock: 15,
    rating: 4.8,
    reviews: 124,
  },
  {
    id: "2",
    name: "Mechanical Keyboard",
    price: 129.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600",
    description: "RGB backlit, tactile switches, aluminum frame.",
    stock: 8,
    rating: 4.6,
    reviews: 89,
  },
  {
    id: "3",
    name: "Leather Minimalist Wallet",
    price: 49.99,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600",
    description: "Slim RFID-blocking genuine leather wallet.",
    stock: 32,
    rating: 4.9,
    reviews: 211,
  },
  {
    id: "4",
    name: "Smart Watch Series X",
    price: 399.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    description: "Health tracking, GPS, 7-day battery life.",
    stock: 6,
    rating: 4.7,
    reviews: 67,
  },
  {
    id: "5",
    name: "Canvas Backpack",
    price: 79.99,
    category: "Bags",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    description: "30L waterproof canvas with laptop compartment.",
    stock: 22,
    rating: 4.5,
    reviews: 158,
  },
  {
    id: "6",
    name: "Polarized Sunglasses",
    price: 89.99,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
    description: "UV400 protection, lightweight titanium frame.",
    stock: 18,
    rating: 4.4,
    reviews: 93,
  },
  {
    id: "7",
    name: "Portable Bluetooth Speaker",
    price: 59.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600",
    description: "Waterproof, 12hr playtime, 360° sound.",
    stock: 29,
    rating: 4.6,
    reviews: 187,
  },
  {
    id: "8",
    name: "Desk Organizer Set",
    price: 34.99,
    category: "Home",
    image: "https://images.unsplash.com/photo-1583312834254-f4b5e3f4c75c?w=600",
    description: "Bamboo 5-piece set with wireless charging pad.",
    stock: 41,
    rating: 4.3,
    reviews: 76,
  },
];

export const categories = ["All", "Electronics", "Accessories", "Bags", "Home"] as const;

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}
