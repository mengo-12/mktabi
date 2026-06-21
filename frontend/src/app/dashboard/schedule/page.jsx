'use client';
import { useEffect, useState } from 'react';

export default function SmartSchedulePage() {
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        fetch('http://localhost:8000/api/v1/hearings/daily-schedule', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            setSchedule(data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-center py-10 dark:text-slate-400">جاري ترتيب جدول الجلسات اليومي ذكياً...</div>;

    return (
        <div className="space-y-8" dir="rtl">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">المساعد الذكي لجدولة وترتيب الجلسات</h1>
                <p className="text-sm text-slate-500 mt-1">تتبع التداخلات الزمنية وترتيب حضور الجلسات لليوم: <span className="font-bold text-blue-600">{schedule?.date}</span></p>
            </div>

            {/* إشعار كاشف التداخلات */}
            {schedule?.conflicts_detected && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                    <span className="text-xl">🚨</span>
                    <div className="text-sm">
                        <p className="font-bold">تنبيه تعارض في المواعيد!</p>
                        <p className="text-xs mt-0.5">رصد النظام جلسات متقاربة زمنياً قد تصعب تغطيتها معاً، يرجى التنسيق لإنابة زميل أو طلب تأجيل.</p>
                    </div>
                </div>
            )}

            {/* جدول الخط الزمني المرتب */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <span>📅 تسلسل الجلسات اليومي</span>
                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        {schedule?.total_hearings} جلسات
                    </span>
                </h3>

                {schedule?.hearings.length === 0 ? (
                    <div className="text-center py-10 text-sm text-slate-400">لا توجد لديك أي جلسات مجدولة لهذا اليوم. استمتع بيوم هادئ! ✨</div>
                ) : (
                    <div className="relative border-r-2 border-slate-100 dark:border-slate-700 mr-4 space-y-6">
                        {schedule?.hearings.map((hearing, idx) => (
                            <div key={hearing.id} className="relative pr-8">
                                {/* نقطة الربط على الخط الزمني */}
                                <div className={`absolute -right-[7px] top-1.5 h-3 w-3 rounded-full border-2 bg-white dark:bg-slate-800 ${hearing.has_conflict ? 'border-red-500 ring-4 ring-red-500/20' : 'border-blue-500'}`}></div>
                                
                                {/* كرت تفاصيل الجلسة */}
                                <div className={`p-4 rounded-2xl border transition-all ${hearing.has_conflict 
                                    ? 'bg-red-50/60 dark:bg-red-950/10 border-red-200 dark:border-red-900/40 shadow-sm' 
                                    : 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-700'}`}>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2.5 py-1 rounded-lg font-bold">
                                                ⏱️ {hearing.time}
                                            </span>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{hearing.case_title}</h4>
                                            <p className="text-xs text-slate-500 mt-1">🏛️ {hearing.court_name} | قاعة رقم: {hearing.room_number}</p>
                                        </div>
                                        
                                        <div className="text-left">
                                            <span className="text-xs text-slate-400">الترتيب اليومي: #{idx + 1}</span>
                                        </div>
                                    </div>

                                    {/* عرض سبب التعارض إن وجد */}
                                    {hearing.has_conflict && (
                                        <div className="mt-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/20 p-2 rounded-lg">
                                            ⚠️ {hearing.conflict_reason}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}