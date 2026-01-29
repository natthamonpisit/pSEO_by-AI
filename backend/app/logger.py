import datetime
from collections import deque
from typing import List, Dict
from app.database import get_db

class LogManager:
    def __init__(self, max_len=100):
        # Keep a small local buffer for immediate read before DB write confirms
        self.logs = deque(maxlen=max_len)
    
    def log(self, level: str, message: str, details: Dict = None):
        """
        Levels: INFO, WARNING, ERROR, SUCCESS
        """
        timestamp = datetime.datetime.now().isoformat()
        entry = {
            "timestamp": timestamp,
            "level": level,
            "message": message,
            "details": details
        }
        self.logs.append(entry)
        
        # 1. Print to stdout (Cloud Logs)
        icon = "ℹ️"
        if level == "WARNING": icon = "⚠️"
        elif level == "ERROR": icon = "❌"
        elif level == "SUCCESS": icon = "✅"
        print(f"{icon} [{level}] {message}")

        # 2. Persist to Supabase (Best Idea for production)
        try:
            # Note: In a high-throughput system, we might want to batch this or use a background task.
            # But for this agentic workflow, direct write is fine for reliability.
            get_db().table("system_logs").insert({
                "level": level,
                "message": message,
                "details": details or {}
            }).execute()
        except Exception as e:
            print(f"❌ Failed to write log to DB: {e}")

    def get_logs(self, limit=50) -> List[Dict]:
        """
        Fetch recent logs from Supabase to ensure consistency across workers.
        Fallback to memory if DB fails.
        """
        try:
            res = get_db().table("system_logs")\
                .select("*")\
                .order("timestamp", desc=True)\
                .limit(limit)\
                .execute()
            return res.data
        except Exception as e:
            print(f"⚠️ Failed to fetch logs from DB: {e}, falling back to memory")
            return list(self.logs)[::-1]

# Global Singleton
sys_logger = LogManager()
