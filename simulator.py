import duckdb
import pandas as pd
import time
import random
from datetime import datetime
import json
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

def init_db():
    print(f"Initializing DuckDB at {DB_PATH}...")
    conn = duckdb.connect(DB_PATH)
    
    # DuckDB manages WAL automatically. 
    # Checkpointing is handled via the CHECKPOINT command.
    
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
    
    conn.close()

def generate_purchase():
    category = random.choice(CATEGORIES)
    product = random.choice(PRODUCTS[category])
    user_id = random.randint(1000, 9999)
    price = round(random.uniform(10.0, 500.0), 2)
    
    return {
        "user_id": user_id,
        "product_name": product,
        "category": category,
        "price": price,
        "timestamp": datetime.now().isoformat()
    }

def aggregate_data(conn):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Aggregating data...")
    
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
    
    # Force a checkpoint to make sure data is flushed for readers
    conn.execute("CHECKPOINT;")

def run_simulator():
    init_db()
    conn = duckdb.connect(DB_PATH)
    
    last_agg_time = time.time()
    
    print("Simulation started. Press Ctrl+C to stop.")
    try:
        while True:
            # Generate 1-3 purchases every second to simulate "traffic"
            num_purchases = random.randint(1, 3)
            for _ in range(num_purchases):
                event = generate_purchase()
                conn.execute("""
                    INSERT INTO raw_purchases (user_id, product_name, category, price, timestamp)
                    VALUES (?, ?, ?, ?, ?)
                """, (event['user_id'], event['product_name'], event['category'], event['price'], event['timestamp']))
            
            # Aggregate every 5 seconds
            current_time = time.time()
            if current_time - last_agg_time >= 5:
                aggregate_data(conn)
                last_agg_time = current_time
            
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nStopping simulation...")
    finally:
        conn.close()

if __name__ == "__main__":
    run_simulator()
