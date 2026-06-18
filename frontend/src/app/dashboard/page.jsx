'use client';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">

            {/* بطاقة الترحيب القانونية */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl md:text-3xl font-extrabold">
                        أهلاً بك يا أستاذ، {user?.full_name || 'المحامي'} 👋
                    </h2>
                    <p className="mt-2 text-indigo-200 max-w-xl text-sm md:text-base font-medium">
                        مكتبك القانوني مؤمن ومحدث حياً بالكامل الآن. يمكنك البدء في إدارة ملفات القضايا والتحكم بالملفات المحلية بصفر تكلفة وبأمان تام.
                    </p>
                </div>
            </div>

            {/* لوحة التحكم الإحصائية الحية القادمة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.01]">
                    <span className="text-2xl">💼</span>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">القضايا النشطة تحت إشرافك</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">1</p> {/* تظهر 1 كعينة تم جلبها سابقاً */}
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.01]">
                    <span className="text-2xl">👥</span>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">إجمالي الموكلين المسجلين</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">--</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.01]">
                    <span className="text-2xl">📂</span>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">المستندات المؤرشفة محلياً</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">--</p>
                </div>
            </div>

        </div>
    );
}