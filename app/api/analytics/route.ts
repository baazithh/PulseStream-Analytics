import { NextResponse } from 'next/server';
import duckdb from 'duckdb';
import path from 'path';

// Use a persistent connection if possible, but for simplicity in Next.js Serverless/Edge
// (actually this is Node.js runtime) we can open/close or use a global.
// DuckDB in Node.js needs the native library.

const dbPath = path.resolve(process.cwd(), 'analytics.db');

export const dynamic = 'force-dynamic'; // Prevent static pre-rendering during build
export const revalidate = 0;

export async function GET() {
  try {
    const db = new duckdb.Database(dbPath, { access_mode: 'READ_ONLY' });
    
    const getData = (query: string): Promise<Record<string, unknown>[]> => {
      return new Promise((resolve, reject) => {
        db.all(query, (err, res) => {
          if (err) reject(err);
          else resolve(res as Record<string, unknown>[]);
        });
      });
    };

    // Parallel fetch
    const [revenue, topProducts, recentPurchases] = await Promise.all([
      getData("SELECT * FROM daily_revenue WHERE date = CURRENT_DATE"),
      getData("SELECT * FROM top_products ORDER BY total_sales DESC LIMIT 5"),
      getData("SELECT * FROM raw_purchases ORDER BY timestamp DESC LIMIT 20")
    ]);

    // Active users simulation (based on unique user_ids in last 5 mins)
    const activeUsersResult = await getData("SELECT COUNT(DISTINCT user_id) as count FROM raw_purchases WHERE timestamp >= (CURRENT_TIMESTAMP - INTERVAL 5 MINUTE)");
    const activeUsers = (activeUsersResult[0]?.count as number) || 0;

    // Orders per minute (OPM)
    const opmResult = await getData("SELECT COUNT(*) / 5.0 as opm FROM raw_purchases WHERE timestamp >= (CURRENT_TIMESTAMP - INTERVAL 5 MINUTE)");
    const opm = Math.round((opmResult[0]?.opm as number) || 0);

    return NextResponse.json({
      success: true,
      data: {
        revenue: revenue[0] || { total_revenue: 0, order_count: 0 },
        topProducts,
        recentPurchases,
        activeUsers,
        opm
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('Database Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
