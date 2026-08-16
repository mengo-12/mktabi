// 'use client';
// import { useEffect, useState, useRef } from 'react';

// export default function NotificationBell({ lawyerId }) {
//     const [notifications, setNotifications] = useState([]);
//     const [unreadCount, setUnreadCount] = useState(0);
//     const [isOpen, setIsOpen] = useState(false);
//     const dropdownRef = useRef(null);

//     useEffect(() => {
//         if (!lawyerId) return;

//         // 1. جلب التنبيهات السابقة غير المقروءة عند تحميل الصفحة
//         fetch(`http://localhost:8000/api/v1/notifications/unread/${lawyerId}`)
//             .then((res) => res.json())
//             .then((data) => {
//                 if (Array.isArray(data)) {
//                     setNotifications(data);
//                     setUnreadCount(data.length);
//                 }
//             })
//             .catch((err) => console.error("Error fetching notifications:", err));

//         // 2. الاتصال بالقناة الحية لاستقبال التنبيهات الفورية عبر الـ WebSocket
//         const ws = new WebSocket(`ws://localhost:8000/api/v1/notifications/ws/${lawyerId}`);

//         ws.onmessage = (event) => {
//             const newNotif = JSON.parse(event.data);
//             setNotifications((prev) => [newNotif, ...prev]);
//             setUnreadCount((prev) => prev + 1);

//             try {
//                 const audio = new Audio('/sounds/notification.mp3');
//                 audio.play();
//             } catch (e) { }
//         };

//         return () => ws.close();
//     }, [lawyerId]);

//     // إغلاق القائمة المنسدلة عند الضغط خارج المكون
//     useEffect(() => {
//         function handleClickOutside(event) {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//                 setIsOpen(false);
//             }
//         }
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     // 🔄 دالة فتح القائمة وتحديث حالة التنبيهات في قاعدة البيانات
//     const handleToggleDropdown = async () => {
//         const nextOpenState = !isOpen;
//         setIsOpen(nextOpenState);

//         // إذا فتح المستخدم القائمة وهناك تنبيهات غير مقروءة
//         if (nextOpenState && unreadCount > 0) {
//             // 1. تصفير العداد فورياً في الواجهة لتحسين تجربة المستخدم
//             setUnreadCount(0);

//             // 2. تحديث التنبيهات الحالية في قاعدة البيانات لكي لا تعود عند الـ Refresh
//             const token = localStorage.getItem('token');

//             // نمر حلقة لتحديث كل تنبيه غير مقروء في السيرفر
//             const updatePromises = notifications.map((notif) =>
//                 fetch(`http://localhost:8000/api/v1/notifications/${notif.id}/read`, {
//                     method: 'PATCH',
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 }).catch(err => console.error(`Failed to mark notification ${notif.id} as read:`, err))
//             );

//             // انتهاء تحديث البيانات في الخلفية
//             await Promise.all(updatePromises);
//         }
//     };

//     return (
//         <div className="relative" ref={dropdownRef}>
//             {/* زر أيقونة الجرس */}
//             <button
//                 onClick={handleToggleDropdown}
//                 className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200"
//             >
//                 <span className="text-xl">🔔</span>
//                 {unreadCount > 0 && (
//                     <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white animate-pulse">
//                         {unreadCount}
//                     </span>
//                 )}
//             </button>

//             {/* القائمة المنسدلة للتنبيهات */}
//             {isOpen && (
//                 <div className="absolute left-0 mt-2 w-80 max-h-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-y-auto z-50 py-2 transition-all">
//                     <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
//                         <span className="font-bold text-sm text-slate-800 dark:text-white">التنبيهات الإدارية الحية</span>
//                         <span className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">Real-time</span>
//                     </div>

//                     <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
//                         {!Array.isArray(notifications) || notifications.length === 0 ? (
//                             <div className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
//                                 لا توجد تنبيهات جديدة حالياً
//                             </div>
//                         ) : (
//                             notifications.map((notif) => (
//                                 <div key={notif.id || Math.random()} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
//                                     <div className="flex items-start gap-2">
//                                         <span className="text-base mt-0.5">
//                                             {notif.category === 'case' ? '💼' : notif.category === 'visit' ? '📅' : '⚖️'}
//                                         </span>
//                                         <div>
//                                             <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{notif.title}</h4>
//                                             <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))
//                         )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }




'use client';
import { useEffect, useState, useRef } from 'react';

import {
    Bell,
    Briefcase,
    CalendarDays,
    Scale,
    Clock3
} from 'lucide-react'; // استيراد الأيقونة الفاخرة هنا

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const WS_PROTOCOL =
        typeof window !== "undefined" && window.location.protocol === "https:"
            ? "wss:"
            : "ws:";

    const WS_HOST =
        typeof window !== "undefined"
            ? window.location.host
            : "localhost";

    const WS_URL = `${WS_PROTOCOL}//${WS_HOST}`;

    useEffect(() => {

        const connectWebSocket = () => {

            const token = localStorage.getItem("token");

            if (!token) return;

            fetch(`${API_URL}/notifications/unread`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    setNotifications(data);
                    setUnreadCount(data.length);
                })
                .catch(console.error);

            const ws = new WebSocket(
                `${WS_URL}/api/v1/notifications/ws?token=${token}`
            );

            wsRef.current = ws;

            ws.onopen = () => {

                // console.log("✅ WS Connected");

                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }

            };

            ws.onmessage = (event) => {

                // console.log("NEW MESSAGE", event.data);

                const newNotif = JSON.parse(event.data);

                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);

                try {
                    // const audio = new Audio("/sounds/notification.mp3");
                    // audio.play();
                } catch { }

            };

            ws.onerror = (e) => {

                // console.log("WS ERROR", e);

                ws.close();

            };

            ws.onclose = () => {

                // console.log("WS CLOSED");

                reconnectTimeoutRef.current = setTimeout(() => {

                    // console.log("🔄 Reconnecting...");

                    connectWebSocket();

                }, 3000);

            };

        };

        connectWebSocket();

        return () => {

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            if (wsRef.current) {
                wsRef.current.close();
            }

        };

    }, []);

    // إغلاق القائمة المنسدلة عند الضغط خارج المكون
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 🔄 دالة فتح القائمة وتحديث حالة التنبيهات في قاعدة البيانات
    const handleToggleDropdown = async () => {
        const nextOpenState = !isOpen;
        setIsOpen(nextOpenState);

        if (nextOpenState && unreadCount > 0) {
            setUnreadCount(0);
            const token = localStorage.getItem('token');

            const updatePromises = notifications.map((notif) =>
                fetch(`${API_URL}/notifications/${notif.id}/read`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }).catch(err => console.error(`Failed to mark notification ${notif.id} as read:`, err))
            );

            await Promise.all(updatePromises);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggleDropdown}
                className="
            group
            relative
            flex h-10 w-10 items-center justify-center
            rounded-xl
            border border-slate-200
            bg-white
            text-slate-600
            shadow-sm
            transition-all duration-300
            hover:-translate-y-0.5
            hover:border-blue-500
            hover:bg-blue-50
            hover:text-blue-600
            hover:shadow-md
            active:scale-95

            dark:border-slate-700
            dark:bg-slate-900
            dark:text-slate-300
            dark:hover:border-blue-500
            dark:hover:bg-slate-800
            dark:hover:text-blue-400
        "
            >
                {/* Glow */}
                <span
                    className="
                absolute inset-0 rounded-xl
                bg-blue-500/0
                opacity-0
                blur-md
                transition-all duration-300
                group-hover:bg-blue-500/10
                group-hover:opacity-100
            "
                />

                {/* Icon */}
                <Bell
                    className="
                relative z-10
                h-5 w-5
                transition-all duration-300
                group-hover:rotate-12
                group-hover:scale-110
            "
                />

                {/* Badge */}
                {unreadCount > 0 && (
                    <>
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>

                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 animate-ping opacity-40" />
                    </>
                )}
            </button>

            {/* القائمة المنسدلة للتنبيهات مع إضافة تنسيق داكن (Dark Mode) متناسق مع نظامك الفاخر */}
            {isOpen && (
                <div className="absolute left-0 mt-3 w-[390px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 z-50">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 bg-blue-50 dark:bg-blue-950/30 border-b border-slate-200 dark:border-slate-700">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                                الإشعارات
                            </h3>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                جميع تنبيهات النظام
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <span className="min-w-6 h-6 px-2 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </div>

                    {/* Body */}
                    <div className="max-h-[450px] overflow-y-auto">

                        {!notifications.length ? (

                            <div className="flex flex-col items-center justify-center py-16">

                                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Bell className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>

                                <p className="mt-5 font-medium text-slate-700 dark:text-slate-200">
                                    لا توجد إشعارات
                                </p>

                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    سيتم عرض الإشعارات الجديدة هنا.
                                </p>

                            </div>

                        ) : (

                            notifications.map((notif) => (

                                <div
                                    key={notif.id}
                                    className={`group cursor-pointer border-b border-slate-100 dark:border-slate-800 px-5 py-4 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-slate-800/70 ${!notif.is_read ? "bg-blue-50/40 dark:bg-blue-950/10" : ""
                                        }`}
                                >

                                    <div className="flex gap-4">

                                        {/* Icon */}
                                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">

                                            {notif.category === "case" ? (
                                                <Scale className="w-5 h-5" />
                                            ) : notif.category === "visit" ? (
                                                <CalendarDays className="w-5 h-5" />
                                            ) : notif.category === "calendar" ? (
                                                <Clock3 className="w-5 h-5" />
                                            ) : (
                                                <Bell className="w-5 h-5" />
                                            )}

                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">

                                            <div className="flex items-start justify-between gap-3">

                                                <h4 className="text-sm font-semibold text-slate-800 dark:text-white leading-5">
                                                    {notif.title}
                                                </h4>

                                                {!notif.is_read && (
                                                    <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                                                )}

                                            </div>

                                            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                                {notif.message}
                                            </p>

                                            {notif.created_at && (
                                                <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
                                                    {new Date(notif.created_at).toLocaleString("ar-SA")}
                                                </p>
                                            )}

                                        </div>

                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/40">

                            <button
                                className="w-full rounded-lg py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition"
                            >
                                عرض جميع الإشعارات
                            </button>

                        </div>
                    )}

                </div>
            )}
        </div>
    );
}