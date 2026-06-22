// 'use client';
// import { useAuth } from '@/context/AuthContext';

// export default function DashboardPage() {
//     const { user } = useAuth();

//     return (
//         <div className="space-y-6">

//             {/* بطاقة الترحيب القانونية */}
//             <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
//                 <div className="relative z-10">
//                     <h2 className="text-2xl md:text-3xl font-extrabold">
//                         أهلاً بك يا أستاذ، {user?.full_name || 'المحامي'} 👋
//                     </h2>
//                     <p className="mt-2 text-indigo-200 max-w-xl text-sm md:text-base font-medium">
//                         مكتبك القانوني مؤمن ومحدث حياً بالكامل الآن. يمكنك البدء في إدارة ملفات القضايا والتحكم بالملفات المحلية بصفر تكلفة وبأمان تام.
//                     </p>
//                 </div>
//             </div>

//             {/* لوحة التحكم الإحصائية الحية القادمة */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.01]">
//                     <span className="text-2xl">💼</span>
//                     <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">القضايا النشطة تحت إشرافك</p>
//                     <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">1</p> {/* تظهر 1 كعينة تم جلبها سابقاً */}
//                 </div>

//                 <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.01]">
//                     <span className="text-2xl">👥</span>
//                     <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">إجمالي الموكلين المسجلين</p>
//                     <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">--</p>
//                 </div>

//                 <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.01]">
//                     <span className="text-2xl">📂</span>
//                     <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">المستندات المؤرشفة محلياً</p>
//                     <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">--</p>
//                 </div>
//             </div>

//         </div>
//     );
// }

'use client';
import { useAuth } from '@/context/AuthContext';
import { 
    Briefcase, 
    Users, 
    FolderOpen, 
    Sparkles, 
    ShieldCheck 
} from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto" dir="rtl">

            {/* بطاقة الترحيب القانونية بتصميم ملكي فاخر */}
            <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#141C2F] rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
                {/* تأثير خلفية خفيف باللون الـ Amber */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[11px] font-bold border border-amber-500/20 mb-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            النظام محدث ومؤمن بالكامل
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-50">
                            أهلاً بك يا أستاذ، {user?.full_name || 'المحامي'} 👋
                        </h2>
                        <p className="text-slate-400 max-w-xl text-xs md:text-sm font-medium leading-relaxed">
                            مكتبك القانوني الرقمي يعمل الآن حياً. يمكنك البدء في إدارة ملفات القضايا، مراجعة المستحقات المالية، والتحكم بالمستندات المحلية بصفر تكلفة وبأعلى معايير الأمان.
                        </p>
                    </div>
                    
                    <div className="hidden lg:flex items-center gap-2 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 text-slate-400 text-xs">
                        <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                        <div>
                            <p className="font-bold text-slate-200">تشفير محلي تام</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">الملفات والبيانات تخضع لخصوصية صارمة</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* لوحة التحكم الإحصائية الحية */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* كارت القضايا النشطة */}
                <div className="bg-white dark:bg-[#141C2F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/20 dark:hover:border-amber-500/20 transition-all duration-200 group">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">القضايا النشطة تحت إشرافك</p>
                            <p className="text-4xl font-black text-slate-900 dark:text-slate-50 font-mono mt-2 tracking-tight">1</p>
                        </div>
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-105 transition-transform duration-200">
                            <Briefcase className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">تحتاج إلى متابعة مستمرة</span>
                        <span className="text-amber-500 font-bold bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10">محدث الآن</span>
                    </div>
                </div>

                {/* كارت الموكلين */}
                <div className="bg-white dark:bg-[#141C2F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/20 dark:hover:border-blue-500/20 transition-all duration-200 group">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي الموكلين المسجلين</p>
                            <p className="text-4xl font-black text-slate-900 dark:text-slate-50 font-mono mt-2 tracking-tight">--</p>
                        </div>
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-105 transition-transform duration-200">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">ملفات الشركات والأفراد</span>
                        <span className="text-slate-400 italic">في انتظار البيانات</span>
                    </div>
                </div>

                {/* كارت المستندات المؤرشفة */}
                <div className="bg-white dark:bg-[#141C2F] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/20 dark:hover:border-emerald-500/20 transition-all duration-200 group">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">المستندات والمذكرات المؤرشفة</p>
                            <p className="text-4xl font-black text-slate-900 dark:text-slate-50 font-mono mt-2 tracking-tight">--</p>
                        </div>
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-105 transition-transform duration-200">
                            <FolderOpen className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">صيغ مدعومة: PDF, Word, Images</span>
                        <span className="text-slate-400 italic">ملحقات آمنة</span>
                    </div>
                </div>

            </div>

        </div>
    );
}