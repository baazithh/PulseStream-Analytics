'use client';
import { useState, useEffect } from 'react';
import { DollarSign, Users, Activity, ShoppingCart, RefreshCw } from 'lucide-react';
import StatCard from './StatCard';
import LiveTicker from './LiveTicker';
import SalesChart from './SalesChart';
import TopProductsTable from './TopProductsTable';

interface AnalyticsData {
  revenue: { total_revenue: number; order_count: number };
  topProducts: { category: string; total_sales: number; order_count: number }[];
  recentPurchases: { id: string; user_id: number; product_name: string; category: string; price: number; timestamp: string }[];
  activeUsers: number;
  opm: number;
}

export default function Dashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [history, setHistory] = useState<{ time: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPulsing, setIsPulsing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/analytics');
      const result = await res.json();
      
      if (result.success) {
        setData(result.data);
        
        // Update history for chart (keep last 20 points)
        const newPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          value: result.data.revenue.total_revenue
        };
        
        setHistory(prev => {
          const updated = [...prev, newPoint];
          return updated.slice(-20);
        });

        // Trigger pulse effect
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 2000);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-charcoal text-primary">
        <RefreshCw className="w-12 h-12 animate-spin mb-4" />
        <span className="font-mono text-xl tracking-[0.2em] uppercase">Initializing Command Center...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-white font-sans selection:bg-primary/30 selection:text-primary">
      <LiveTicker purchases={data.recentPurchases} />
      
      <main className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
              <span className="text-primary italic">Pulse</span>
              <span className="text-white">Stream</span>
              <span className="ml-2 px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-xs font-mono rounded not-italic tracking-normal">v1.2 LIVE</span>
            </h1>
            <p className="text-gray-500 text-sm font-mono mt-1 uppercase tracking-wider">E-Commerce Real-Time Intelligence Engine</p>
          </div>
          
          <div className="flex items-center gap-6 px-4 py-2 glass-card border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-gray-400 text-xs font-mono uppercase tracking-widest">System Status:</span>
              <span className="text-primary text-xs font-bold font-mono">OPTIMIZED</span>
            </div>
          </div>
        </header>

        {/* Top Row: Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Today's Revenue" 
            value={`$${data.revenue.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
            icon={DollarSign} 
            color="primary"
            pulse={isPulsing}
          />
          <StatCard 
            title="Total Orders" 
            value={data.revenue.order_count} 
            icon={ShoppingCart} 
            color="primary"
          />
          <StatCard 
            title="Active Users" 
            value={data.activeUsers} 
            icon={Users} 
            color="secondary"
            unit="NOW"
          />
          <StatCard 
            title="Throughput" 
            value={data.opm} 
            icon={Activity} 
            color="secondary"
            unit="OPM"
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Chart */}
          <div className="lg:col-span-2 space-y-6">
            <SalesChart data={history} />
            
            {/* Real-time Activity Feed */}
            <div className="glass-card p-6">
              <h3 className="text-white font-semibold text-lg uppercase tracking-wide mb-6">Activity Stream</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {data.recentPurchases.slice(0, 10).map((p, idx) => (
                  <div key={`${p.id}-${idx}`} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors rounded px-2">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 font-mono text-xs">{new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-white text-sm">Product SKU: <span className="text-primary font-mono">{p.product_name}</span></span>
                    </div>
                    <div className="text-right">
                      <span className="text-secondary font-bold font-mono text-sm tracking-tight">+${p.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Top Products */}
          <div className="lg:col-span-1">
            <TopProductsTable products={data.topProducts} />
            
            {/* System Info Tooltip */}
            <div className="mt-8 p-6 glass-card border-secondary/20 bg-secondary/5">
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="w-4 h-4 text-secondary" />
                <span className="text-secondary font-bold text-xs uppercase tracking-[0.2em]">Engine Specs</span>
              </div>
              <ul className="space-y-2 text-xs font-mono text-gray-400 uppercase tracking-tighter">
                <li className="flex justify-between"><span>Core.DB</span> <span className="text-white">DUCKDB_OLAP</span></li>
                <li className="flex justify-between"><span>Latency</span> <span className="text-white">12MS POLLING</span></li>
                <li className="flex justify-between"><span>Threads</span> <span className="text-white">8X_PARALLEL</span></li>
                <li className="flex justify-between"><span>Sync</span> <span className="text-white">WAL_ENABLED</span></li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(0,255,65,0.05)_0%,transparent_50%),radial-gradient(circle_at_100%_100%,rgba(0,229,255,0.05)_0%,transparent_50%)]" />
    </div>
  );
}
