// 'use client';
// import { useEffect, useState } from 'react';

// export default function SmartSchedulePage() {
//     const [schedule, setSchedule] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const token = localStorage.getItem('token');
        
//         fetch('http://localhost:8000/api/v1/hearings/daily-schedule', {
//             headers: { 'Authorization': `Bearer ${token}` }
//         })
//         .then(res => res.json())
//         .then(data => {
//             setSchedule(data);
//             setLoading(false);
//         })
//         .catch(err => {
//             console.error(err);
//             setLoading(false);
//         });
//     }, []);

//     if (loading) return <div className="text-center py-10 dark:text-slate-400">جاري ترتيب جدول الجلسات اليومي ذكياً...</div>;

//     return (
//         <div className="space-y-8" dir="rtl">
//             <div>
//                 <h1 className="text-2xl font-bold text-slate-800 dark:text-white">المساعد الذكي لجدولة وترتيب الجلسات</h1>
//                 <p className="text-sm text-slate-500 mt-1">تتبع التداخلات الزمنية وترتيب حضور الجلسات لليوم: <span className="font-bold text-blue-600">{schedule?.date}</span></p>
//             </div>

//             {/* إشعار كاشف التداخلات */}
//             {schedule?.conflicts_detected && (
//                 <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 animate-pulse">
//                     <span className="text-xl">🚨</span>
//                     <div className="text-sm">
//                         <p className="font-bold">تنبيه تعارض في المواعيد!</p>
//                         <p className="text-xs mt-0.5">رصد النظام جلسات متقاربة زمنياً قد تصعب تغطيتها معاً، يرجى التنسيق لإنابة زميل أو طلب تأجيل.</p>
//                     </div>
//                 </div>
//             )}

//             {/* جدول الخط الزمني المرتب */}
//             <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
//                 <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
//                     <span>📅 تسلسل الجلسات اليومي</span>
//                     <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
//                         {schedule?.total_hearings} جلسات
//                     </span>
//                 </h3>

//                 {schedule?.hearings.length === 0 ? (
//                     <div className="text-center py-10 text-sm text-slate-400">لا توجد لديك أي جلسات مجدولة لهذا اليوم. استمتع بيوم هادئ! ✨</div>
//                 ) : (
//                     <div className="relative border-r-2 border-slate-100 dark:border-slate-700 mr-4 space-y-6">
//                         {schedule?.hearings.map((hearing, idx) => (
//                             <div key={hearing.id} className="relative pr-8">
//                                 {/* نقطة الربط على الخط الزمني */}
//                                 <div className={`absolute -right-[7px] top-1.5 h-3 w-3 rounded-full border-2 bg-white dark:bg-slate-800 ${hearing.has_conflict ? 'border-red-500 ring-4 ring-red-500/20' : 'border-blue-500'}`}></div>
                                
//                                 {/* كرت تفاصيل الجلسة */}
//                                 <div className={`p-4 rounded-2xl border transition-all ${hearing.has_conflict 
//                                     ? 'bg-red-50/60 dark:bg-red-950/10 border-red-200 dark:border-red-900/40 shadow-sm' 
//                                     : 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-700'}`}>
                                    
//                                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
//                                         <div>
//                                             <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2.5 py-1 rounded-lg font-bold">
//                                                 ⏱️ {hearing.time}
//                                             </span>
//                                             <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{hearing.case_title}</h4>
//                                             <p className="text-xs text-slate-500 mt-1">🏛️ {hearing.court_name} | قاعة رقم: {hearing.room_number}</p>
//                                         </div>
                                        
//                                         <div className="text-left">
//                                             <span className="text-xs text-slate-400">الترتيب اليومي: #{idx + 1}</span>
//                                         </div>
//                                     </div>

//                                     {/* عرض سبب التعارض إن وجد */}
//                                     {hearing.has_conflict && (
//                                         <div className="mt-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/20 p-2 rounded-lg">
//                                             ⚠️ {hearing.conflict_reason}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }


'use client';
import { useEffect, useState } from 'react';
import { 
  CalendarDays, 
  AlertTriangle, 
  Clock, 
  Gavel, 
  Sparkles, 
  Calendar,
  Layers,
  LayoutGrid,
  Loader2
} from 'lucide-react';

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500 dark:text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                <p className="text-sm font-medium">جاري ترتيب جدول الجلسات اليومي ذكياً...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 md:p-6 max-w-6xl mx-auto" dir="rtl">
            {/* الهيدر الرئيسي الملكي */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
                        المساعد الذكي لجدولة وترتيب الجلسات
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        تتبع التداخلات الزمنية وترتيب حضور الجلسات لليوم: 
                        <span className="font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">{schedule?.date}</span>
                    </p>
                </div>
            </div>

            {/* إشعار كاشف التداخلات (تمت صياغته بأسلوب طوارئ فاخر) */}
            {schedule?.conflicts_detected && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl flex items-start gap-3 shadow-sm shadow-rose-500/5">
                    <span className="p-2 bg-rose-500/20 rounded-xl text-rose-500 shrink-0">
                        <AlertTriangle className="w-5 h-5 animate-bounce" />
                    </span>
                    <div className="text-sm">
                        <p className="font-bold text-base">تنبيه تعارض في المواعيد الإجرائية!</p>
                        <p className="text-xs mt-1 leading-relaxed text-slate-600 dark:text-slate-400">
                            رصد النظام جلسات متقاربة زمنياً في مقار قضائية مختلفة قد تصعب تغطيتها معاً. يرجى التنسيق الفوري لإنابة زميل أو التقدم بطلب تأجيل إلكتروني.
                        </p>
                    </div>
                </div>
            )}

            {/* جدول الخط الزمني المرتب (Midnight Navy Theme) */}
            <div className="bg-white dark:bg-[#141C2F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                        <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                            <Layers className="w-5 h-5" />
                        </span>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">تسلسل الجدول الزمني القضائي</h3>
                    </div>
                    <span className="bg-slate-100 dark:bg-[#0F172A] text-slate-700 dark:text-amber-500 text-xs px-3 py-1.5 rounded-xl font-bold border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                        <LayoutGrid className="w-3.5 h-3.5" />
                        {schedule?.total_hearings} جلسات مجدولة
                    </span>
                </div>

                {schedule?.hearings.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-[#0F172A]/40 flex flex-col items-center gap-2">
                        <Sparkles className="w-6 h-6 text-amber-500/60" />
                        <p className="text-sm font-medium text-slate-400 dark:text-slate-500">لا توجد لديك أي جلسات مجدولة لهذا اليوم. استمتع بيوم هادئ ومثمر! ✨</p>
                    </div>
                ) : (
                    <div className="relative border-r-2 border-slate-200 dark:border-slate-800 mr-3 space-y-6">
                        {schedule?.hearings.map((hearing, idx) => (
                            <div key={hearing.id} className="relative pr-8 group">
                                {/* نقطة الربط على الخط الزمني */}
                                <div className={`absolute -right-[7px] top-2 h-3 w-3 rounded-full border-2 bg-white dark:bg-[#141C2F] transition-all duration-300 ${
                                    hearing.has_conflict 
                                    ? 'border-rose-500 ring-4 ring-rose-500/20' 
                                    : 'border-amber-500 group-hover:bg-amber-500'
                                }`}></div>
                                
                                {/* كرت تفاصيل الجلسة */}
                                <div className={`p-5 rounded-xl border transition-all duration-300 hover:shadow-sm ${
                                    hearing.has_conflict 
                                    ? 'bg-rose-500/5 border-rose-500/20 shadow-sm' 
                                    : 'bg-slate-50/50 dark:bg-[#0F172A]/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-[#0F172A]'
                                }`}>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="space-y-3 flex-1">
                                            {/* توقيت الجلسة */}
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg border ${
                                                hearing.has_conflict
                                                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            }`}>
                                                <Clock className="w-3.5 h-3.5" />
                                                ⏱️ {hearing.time}
                                            </span>

                                            {/* اسم القضية */}
                                            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                <Gavel className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                                                {hearing.case_title}
                                            </h4>

                                            {/* تفاصيل المحكمة */}
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-[#141C2F] px-3 py-1.5 rounded-lg inline-block border border-slate-200/60 dark:border-slate-800">
                                                🏛️ {hearing.court_name} <span className="mx-1.5 text-slate-300 dark:text-slate-700">|</span> قاعة رقم: <span className="text-slate-800 dark:text-slate-200 font-bold">{hearing.room_number}</span>
                                            </p>
                                        </div>
                                        
                                        {/* الترتيب اليومي */}
                                        <div className="sm:text-left shrink-0">
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-[#0F172A] px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800/80">
                                                الترتيب اليومي: #{idx + 1}
                                            </span>
                                        </div>
                                    </div>

                                    {/* عرض سبب التعارض إن وجد بأسلوب تنبيه داخلي احترافي */}
                                    {hearing.has_conflict && (
                                        <div className="mt-4 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/10 flex items-center gap-2 animate-pulse">
                                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                            <span>تعارض إجرائي: {hearing.conflict_reason}</span>
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