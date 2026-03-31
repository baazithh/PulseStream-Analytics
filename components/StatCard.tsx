'use client';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'primary' | 'secondary';
  unit?: string;
  pulse?: boolean;
}

export default function StatCard({ title, value, icon: Icon, color, unit, pulse }: StatCardProps) {
  const glowClass = color === 'primary' ? 'neon-glow-primary border-primary/30' : 'neon-glow-secondary border-secondary/30';
  const textClass = color === 'primary' ? 'text-primary' : 'text-secondary';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-6 flex flex-col justify-between h-40 relative overflow-hidden ${glowClass} ${pulse ? 'pulse-border' : ''}`}
    >
      <div className="flex justify-between items-start">
        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</span>
        <Icon className={`${textClass} w-5 h-5`} />
      </div>
      
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-gray-500 text-lg">{unit}</span>}
      </div>
      
      {/* Background Decor */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-10 ${color === 'primary' ? 'bg-primary' : 'bg-secondary'}`} />
    </motion.div>
  );
}
