'use client';
import { ShoppingCart } from 'lucide-react';

interface Purchase {
  user_id: number;
  product_name: string;
  category: string;
  price: number;
  timestamp: string;
}

export default function LiveTicker({ purchases }: { purchases: Purchase[] }) {
  if (!purchases || purchases.length === 0) return null;

  return (
    <div className="bg-charcoal/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 overflow-hidden py-3">
      <div className="scrolling-marquee">
        <div className="marquee-content">
          {purchases.map((p, idx) => (
            <div key={`${p.user_id}-${idx}`} className="flex items-center gap-2 whitespace-nowrap px-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                <ShoppingCart className="w-3.4 h-3.4 text-primary" />
              </div>
              <span className="text-gray-300 font-mono text-sm">USER#{p.user_id}</span>
              <span className="text-white font-medium">{p.product_name}</span>
              <span className="text-secondary font-bold font-mono">
                ${p.price.toFixed(2)}
              </span>
              <span className="text-gray-600 text-xs">{p.category}</span>
            </div>
          ))}
          {/* Duplicate for seamless scrolling */}
          {purchases.map((p, idx) => (
            <div key={`dup-${p.user_id}-${idx}`} className="flex items-center gap-2 whitespace-nowrap px-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                <ShoppingCart className="w-3.4 h-3.4 text-primary" />
              </div>
              <span className="text-gray-300 font-mono text-sm">USER#{p.user_id}</span>
              <span className="text-white font-medium">{p.product_name}</span>
              <span className="text-secondary font-bold font-mono">
                ${p.price.toFixed(2)}
              </span>
              <span className="text-gray-600 text-xs">{p.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
