import datetime
from collections import deque
from typing import List, Dict

class LogManager:
    def __init__(self, max_len=100):
        self.logs = deque(maxlen=max_len)
    
    def log(self, level: str, message: str):
        """
        Levels: INFO, WARNING, ERROR, SUCCESS
        """
        timestamp = datetime.datetime.now().isoformat()
        entry = {
            "timestamp": timestamp,
            "level": level,
            "message": message
        }
        self.logs.append(entry)
        
        # Also print to stdout for Railway logs
        icon = "ℹ️"
        if level == "WARNING": icon = "⚠️"
        elif level == "ERROR": icon = "❌"
        elif level == "SUCCESS": icon = "✅"
        
        print(f"{icon} [{level}] {message}")

    def get_logs(self) -> List[Dict]:
        return list(self.logs)[::-1] # Newest first

# Global Singleton
sys_logger = LogManager()
