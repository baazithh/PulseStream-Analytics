import duckdb
import pandas as pd
import time
import random
from datetime import datetime
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

# Configuration
DB_PATH = "analytics.db"
CATEGORIES = ["Electronics", "Fashion", "Home & Garden", "Books", "Sports", "Beauty"]
PRODUCTS = {
    "Electronics": ["Smartphone", "Laptop", "Headphones", "Smartwatch"],
    "Fashion": ["T-Shirt", "Jeans", "Sneakers", "Jacket"],
    "Home & Garden": ["Coffee Maker", "Desk Lamp", "Plant Pot", "Cushion"],
    "Books": ["Novel", "Biography", "Cookbook", "Sci-Fi"],
    "Sports": ["Yoga Mat", "Dumbbells", "Football", "Running Shoes"],
    "Beauty": ["Lipstick", "Moisturizer", "Perfume", "Shampoo"]
}

# Global database connection
db_conn = None

def init_db():
    print(f"Initializing DuckDB at {DB_PATH}...")
    conn = duckdb.connect(DB_PATH)
    
    # Create tables
    conn.execute("""
        CREATE TABLE IF NOT EXISTS raw_purchases (
            id UUID DEFAULT gen_random_uuid(),
            user_id INTEGER,
            product_name VARCHAR,
            category VARCHAR,
            price DOUBLE,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    conn.execute("""
        CREATE TABLE IF NOT EXISTS daily_revenue (
            date DATE PRIMARY KEY,
            total_revenue DOUBLE,
            order_count INTEGER,
            last_updated TIMESTAMP
        );
    """)
    
    conn.execute("""
        CREATE TABLE IF NOT EXISTS top_products (
            category VARCHAR PRIMARY KEY,
            total_sales DOUBLE,
            order_count INTEGER,
            last_updated TIMESTAMP
        );
    """)
    return conn

def aggregate_data(conn):
    # Aggregate Daily Revenue
    conn.execute("""
        INSERT OR REPLACE INTO daily_revenue
        SELECT 
            timestamp::DATE as date,
            SUM(price) as total_revenue,
            COUNT(*) as order_count,
            CURRENT_TIMESTAMP as last_updated
        FROM raw_purchases
        WHERE timestamp::DATE = CURRENT_DATE
        GROUP BY 1;
    """)
    
    # Aggregate Top Products by Category
    conn.execute("""
        INSERT OR REPLACE INTO top_products
        SELECT 
            category,
            SUM(price) as total_sales,
            COUNT(*) as order_count,
            CURRENT_TIMESTAMP as last_updated
        FROM raw_purchases
        GROUP BY 1;
    """)
    conn.execute("CHECKPOINT;")

def simulation_loop():
    global db_conn
    print("Simulation thread started.")
    last_agg_time = time.time()
    
    while True:
        try:
            # Generate 1-5 purchases every 2 seconds for a steady stream
            num_purchases = random.randint(1, 5)
            for _ in range(num_purchases):
                category = random.choice(CATEGORIES)
                product = random.choice(PRODUCTS[category])
                user_id = random.randint(1000, 9999)
                price = round(random.uniform(10.0, 500.0), 2)
                
                db_conn.execute("""
                    INSERT INTO raw_purchases (user_id, product_name, category, price, timestamp)
                    VALUES (?, ?, ?, ?, ?)
                """, (user_id, product, category, price, datetime.now().isoformat()))
            
            # Aggregate every 5 seconds
            if time.time() - last_agg_time >= 5:
                aggregate_data(db_conn)
                last_agg_time = time.time()
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Data aggregated.")
                
            time.sleep(2)
        except Exception as e:
            print(f"Error in simulation loop: {e}")
            time.sleep(1)

# FastAPI App Setup
app = FastAPI(title="PulseStream Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/analytics")
async def get_analytics():
    global db_conn
    try:
        # Fetch current dashboard state
        revenue = db_conn.execute("SELECT * FROM daily_revenue WHERE date = CURRENT_DATE").fetchone()
        top_products = db_conn.execute("SELECT * FROM top_products ORDER BY total_sales DESC LIMIT 6").fetchall()
        recent_purchases = db_conn.execute("SELECT * FROM raw_purchases ORDER BY timestamp DESC LIMIT 15").fetchall()
        
        # Active users (last 5 min)
        active_users = db_conn.execute("SELECT COUNT(DISTINCT user_id) FROM raw_purchases WHERE timestamp >= (CURRENT_TIMESTAMP - INTERVAL 5 MINUTE)").fetchone()[0]
        
        # Throughput (OPM)
        opm = db_conn.execute("SELECT COUNT(*) / 5.0 FROM raw_purchases WHERE timestamp >= (CURRENT_TIMESTAMP - INTERVAL 5 MINUTE)").fetchone()[0]

        return {
            "success": True,
            "data": {
                "revenue": {
                    "total_revenue": revenue[1] if revenue else 0,
                    "order_count": revenue[2] if revenue else 0
                },
                "topProducts": [
                    {"category": p[0], "total_sales": p[1], "order_count": p[2]} 
                    for p in top_products
                ],
                "recentPurchases": [
                    {"id": str(p[0]), "user_id": p[1], "product_name": p[2], "category": p[3], "price": p[4], "timestamp": p[5].isoformat()} 
                    for p in recent_purchases
                ],
                "activeUsers": active_users,
                "opm": round(opm)
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Initialize DB
    db_conn = init_db()
    
    # Start simulation in a background thread
    sim_thread = threading.Thread(target=simulation_loop, daemon=True)
    sim_thread.start()
    
    # Start FastAPI server
    print("Starting API server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
