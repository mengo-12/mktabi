# app/services/websocket_manager.py
from fastapi import WebSocket
from typing import Dict, List

class NotificationManager:
    def __init__(self):
        # قاموس يربط معرف المحامي (lawyer_id) بقائمة قنوات الاتصال النشطة له
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, lawyer_id: int, websocket: WebSocket):
        await websocket.accept()
        if lawyer_id not in self.active_connections:
            self.active_connections[lawyer_id] = []
        self.active_connections[lawyer_id].append(websocket)

    def disconnect(self, lawyer_id: int, websocket: WebSocket):
        if lawyer_id in self.active_connections:
            self.active_connections[lawyer_id].remove(websocket)
            if not self.active_connections[lawyer_id]:
                del self.active_connections[lawyer_id]

    async def send_personal_notification(self, lawyer_id: int, notification_data: dict):
        """إرسال تنبيه فوري لمحامي معين إذا كان متصلاً بالنظام حالياً"""
        if lawyer_id in self.active_connections:
            for connection in self.active_connections[lawyer_id]:
                try:
                    await connection.send_json(notification_data)
                except Exception:
                    # في حال انقطع الاتصال فجأة
                    pass

# إنشاء نسخة مركزية من المدير لاستخدامها في النظام
notifier_manager = NotificationManager()