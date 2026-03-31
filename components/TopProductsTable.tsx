'use client';
import { motion } from 'framer-motion';

interface Product {
  category: string;
  total_sales: number;
  order_count: number;
}

export default function TopProductsTable({ products }: { products: Product[] }) {
  return (
    <div className="glass-card p-6 overflow-hidden">
      <div className="mb-4">
        <h3 className="text-white font-semibold text-lg uppercase tracking-wide">Top Selling Categories</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-xs font-mono uppercase tracking-widest">
              <th className="pb-3 pl-2">Category</th>
              <th className="pb-3 text-right">Orders</th>
              <th className="pb-3 pr-2 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => (
              <motion.tr 
                key={p.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group border-b border-white/5 hover:bg-white/[0.02] last:border-0"
              >
                <td className="py-4 pl-2">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-secondary" />
                    <span className="text-gray-200 font-medium">{p.category}</span>
                  </div>
                </td>
                <td className="py-4 text-right">
                  <span className="text-gray-400 font-mono">{p.order_count}</span>
                </td>
                <td className="py-4 pr-2 text-right">
                  <span className="text-secondary font-bold font-mono">
                    ${p.total_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
