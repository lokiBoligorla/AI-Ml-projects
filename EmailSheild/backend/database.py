import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email_text TEXT NOT NULL,
            prediction TEXT NOT NULL,
            confidence REAL NOT NULL,
            keywords_detected TEXT NOT NULL,
            urls_detected TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    print("SQLite Database initialized successfully.")

def insert_scan(email_text, prediction, confidence, keywords_detected, urls_detected):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Serialize lists to JSON strings for database storage
    keywords_json = json.dumps(keywords_detected)
    urls_json = json.dumps(urls_detected)
    
    cursor.execute("""
        INSERT INTO scans (email_text, prediction, confidence, keywords_detected, urls_detected)
        VALUES (?, ?, ?, ?, ?)
    """, (email_text, prediction, confidence, keywords_json, urls_json))
    
    inserted_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return inserted_id

def get_history(limit=50):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, email_text, prediction, confidence, keywords_detected, urls_detected, created_at
        FROM scans
        ORDER BY created_at DESC
        LIMIT ?
    """, (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    
    history = []
    for row in rows:
        history.append({
            "id": row["id"],
            "email_text": row["email_text"],
            "prediction": row["prediction"],
            "confidence": round(row["confidence"], 2),
            "keywords_detected": json.loads(row["keywords_detected"]),
            "urls_detected": json.loads(row["urls_detected"]),
            "created_at": row["created_at"]
        })
    return history

def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Aggregates
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN prediction = 'safe' THEN 1 ELSE 0 END) as safe_count,
            SUM(CASE WHEN prediction = 'spam' THEN 1 ELSE 0 END) as spam_count,
            SUM(CASE WHEN prediction = 'phishing' THEN 1 ELSE 0 END) as phishing_count
        FROM scans
    """)
    agg = cursor.fetchone()
    
    total = agg["total"] or 0
    safe = agg["safe_count"] or 0
    spam = agg["spam_count"] or 0
    phishing = agg["phishing_count"] or 0
    
    # 2. Chronological daily trends for visual chart
    # (Group by date, fill in values)
    cursor.execute("""
        SELECT 
            strftime('%Y-%m-%d', created_at) as scan_date,
            COUNT(*) as total_day,
            SUM(CASE WHEN prediction = 'safe' THEN 1 ELSE 0 END) as safe_day,
            SUM(CASE WHEN prediction = 'spam' THEN 1 ELSE 0 END) as spam_day,
            SUM(CASE WHEN prediction = 'phishing' THEN 1 ELSE 0 END) as phishing_day
        FROM scans
        GROUP BY scan_date
        ORDER BY scan_date ASC
        LIMIT 30
    """)
    rows = cursor.fetchall()
    conn.close()
    
    trends = []
    for row in rows:
        trends.append({
            "date": row["scan_date"],
            "total": row["total_day"],
            "safe": row["safe_day"],
            "spam": row["spam_day"],
            "phishing": row["phishing_day"]
        })
        
    return {
        "total": total,
        "safe": safe,
        "spam": spam,
        "phishing": phishing,
        "trends": trends
    }

def clear_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM scans")
    conn.commit()
    conn.close()
    return True
