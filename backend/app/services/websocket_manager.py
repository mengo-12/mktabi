# app/services/websocket_manager.py

from fastapi import WebSocket
from typing import Dict, List
import json


class NotificationManager:

    def __init__(self):

        # مستخدمو الإدارة (users)
        self.user_connections: Dict[int, List[WebSocket]] = {}

        # الموظفون الديناميكيون
        self.staff_connections: Dict[str, List[WebSocket]] = {}

    # ===========================
    # Users
    # ===========================

    async def connect_user(
        self,
        user_id: int,
        websocket: WebSocket
    ):
        await websocket.accept()

        if user_id not in self.user_connections:
            self.user_connections[user_id] = []

        self.user_connections[user_id].append(websocket)

    def disconnect_user(
        self,
        user_id: int,
        websocket: WebSocket
    ):
        if user_id not in self.user_connections:
            return

        if websocket in self.user_connections[user_id]:
            self.user_connections[user_id].remove(websocket)

        if not self.user_connections[user_id]:
            del self.user_connections[user_id]

    # ===========================
    # Dynamic Staff
    # ===========================

    async def connect_staff(
        self,
        table_id: int,
        row_id: int,
        websocket: WebSocket
    ):

        print(f"✅ Dynamic staff connected: {table_id}:{row_id}")

        await websocket.accept()

        key = f"{table_id}:{row_id}"

        if key not in self.staff_connections:
            self.staff_connections[key] = []

        self.staff_connections[key].append(websocket)

    def disconnect_staff(
        self,
        table_id: int,
        row_id: int,
        websocket: WebSocket
    ):

        key = f"{table_id}:{row_id}"

        if key not in self.staff_connections:
            return

        if websocket in self.staff_connections[key]:
            self.staff_connections[key].remove(websocket)

        if not self.staff_connections[key]:
            del self.staff_connections[key]

    # ===========================
    # إرسال لمستخدم إدارة
    # ===========================

    async def send_to_user(
        self,
        user_id: int,
        notification: dict
    ):

        if user_id not in self.user_connections:
            return

        disconnected = []

        for ws in self.user_connections[user_id]:
            try:
                await ws.send_text(json.dumps(notification))
            except Exception:
                disconnected.append(ws)

        for ws in disconnected:
            self.disconnect_user(user_id, ws)

    # ===========================
    # إرسال لموظف ديناميكي
    # ===========================

    async def send_to_staff(
        self,
        table_id: int,
        row_id: int,
        notification: dict
    ):


        key = f"{table_id}:{row_id}"
        
        print(f"📤 Sending to staff: {key}")
        print("Connected keys:", list(self.staff_connections.keys()))

        if key not in self.staff_connections:
            return

        disconnected = []

        for ws in self.staff_connections[key]:
            try:
                await ws.send_text(json.dumps(notification))
            except Exception:
                disconnected.append(ws)

        for ws in disconnected:
            self.disconnect_staff(table_id, row_id, ws)

    # ===========================
    # الدالة العامة
    # ===========================

    async def send_notification(
        self,
        notification: dict,
        lawyer_id: int | None = None,
        dynamic_table_id: int | None = None,
        dynamic_row_id: int | None = None,
    ):

        if lawyer_id is not None:

            await self.send_to_user(
                lawyer_id,
                notification
            )

            return

        if (
            dynamic_table_id is not None
            and dynamic_row_id is not None
        ):

            await self.send_to_staff(
                dynamic_table_id,
                dynamic_row_id,
                notification
            )


notifier_manager = NotificationManager()