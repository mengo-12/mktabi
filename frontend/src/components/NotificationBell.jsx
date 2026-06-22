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
import { Bell } from 'lucide-react'; // استيراد الأيقونة الفاخرة هنا

export default function NotificationBell({ lawyerId }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!lawyerId) return;

        // 1. جلب التنبيهات السابقة غير المقروءة عند تحميل الصفحة
        fetch(`http://localhost:8000/api/v1/notifications/unread/${lawyerId}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setNotifications(data);
                    setUnreadCount(data.length);
                }
            })
            .catch((err) => console.error("Error fetching notifications:", err));

        // 2. الاتصال بالقناة الحية استقبال التنبيهات الفورية عبر الـ WebSocket
        const ws = new WebSocket(`ws://localhost:8000/api/v1/notifications/ws/${lawyerId}`);

        ws.onmessage = (event) => {
            const newNotif = JSON.parse(event.data);
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);

            try {
                const audio = new Audio('/sounds/notification.mp3');
                audio.play();
            } catch (e) { }
        };

        return () => ws.close();
    }, [lawyerId]);

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
                fetch(`http://localhost:8000/api/v1/notifications/${notif.id}/read`, {
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
            {/* 👈 زر أيقونة الجرس الملكي الجديد متضمناً كامل التأثيرات الحركية والتفاعلية البصرية */}
            <button
                onClick={handleToggleDropdown}
                className="relative group p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 hover:border-amber-500/30 transition-all duration-300 shadow-inner flex items-center justify-center text-slate-400 hover:text-amber-400 focus:outline-none"
            >
                {/* تأثير الـ Hover الشعاعي الخلفي النبضي */}
                <span className="absolute inset-0 rounded-xl bg-amber-500/0 group-hover:bg-amber-500/5 blur-sm transition-all duration-300 pointer-events-none" />
                
                {/* الأيقونة الفاخرة مع حركة الاهتزاز الذكية والتكبير الصغير عند الـ Hover */}
                <Bell className="w-4.5 h-4.5 transition-all duration-300 group-hover:rotate-12 group-hover:scale-105 active:scale-95" />
                
                {/* 👈 نقطة التنبيه النابضة الذكية والمخصصة للنظام */}
                {unreadCount > 0 && (
                    <span className="absolute top-1 left-1 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-[#0F172A] animate-pulse" />
                )}
            </button>

            {/* القائمة المنسدلة للتنبيهات مع إضافة تنسيق داكن (Dark Mode) متناسق مع نظامك الفاخر */}
            {isOpen && (
                <div className="absolute left-0 mt-2 w-80 max-h-96 bg-[#0F172A] rounded-2xl shadow-xl border border-slate-800/80 overflow-y-auto z-50 py-2 transition-all">
                    <div className="px-4 py-2 border-b border-slate-800/60 flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-200">التنبيهات الإدارية الحية</span>
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium tracking-wider">REAL-TIME</span>
                    </div>

                    <div className="divide-y divide-slate-800/40">
                        {!Array.isArray(notifications) || notifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-500">
                                لا توجد تنبيهات جديدة حالياً
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div key={notif.id || Math.random()} className="p-4 hover:bg-slate-900/40 transition-colors">
                                    <div className="flex items-start gap-2.5">
                                        <span className="text-base mt-0.5">
                                            {notif.category === 'case' ? '💼' : notif.category === 'visit' ? '📅' : '⚖️'}
                                        </span>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-200">{notif.title}</h4>
                                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}