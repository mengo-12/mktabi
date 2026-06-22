// 'use client';
// import { useState } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/navigation'; // 👈 استيراد الموجه هنا

// export default function LoginPage() {
//     const { login } = useAuth();
//     const router = useRouter(); // 👈 تفعيل الموجه داخل المكون
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setLoading(true);

//         const result = await login(username, password);

//         if (result.success) {
//             // 🚀 إذا نجح الدخول، يتم التوجيه من هنا فوراً وبشكل حاد وسريع
//             router.push('/dashboard');
//             router.refresh();
//         } else {
//             setError(result.error);
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
//             <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">

//                 <div className="text-center">
//                     <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
//                         منصة مَكْتَبِي الـرَّقْمِيَّة
//                     </h2>
//                     <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
//                         نظام إدارة القضايا والموكلين الذكي للمحاماة
//                     </p>
//                 </div>

//                 {error && (
//                     <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium text-center">
//                         ⚠️ {error}
//                     </div>
//                 )}

//                 <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//                     <div className="space-y-4">
//                         <div>
//                             <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
//                                 البريد الإلكتروني
//                             </label>
//                             <input
//                                 type="email"
//                                 required
//                                 value={username}
//                                 onChange={(e) => setUsername(e.target.value)}
//                                 className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
//                                 placeholder="admin@lawfirm.com"
//                                 dir="ltr"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
//                                 كلمة المرور
//                             </label>
//                             <input
//                                 type="password"
//                                 required
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
//                                 placeholder="••••••••"
//                                 dir="ltr"
//                             />
//                         </div>
//                     </div>

//                     <div>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-lg shadow-lg transition-all duration-200"
//                         >
//                             {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
//                         </button>
//                     </div>
//                 </form>

//             </div>
//         </div>
//     );
// }



'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Scale, Mail, Lock, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        loading || setLoading(true);

        const result = await login(username, password);

        if (result.success) {
            router.push('/dashboard');
            router.refresh();
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] px-4 relative overflow-hidden" dir="rtl">
            {/* تأثيرات الإضاءة الخلفية الفاخرة (Glow Elements) */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-md w-full space-y-8 bg-[#0F172A]/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-slate-800/80 relative z-10">
                
                {/* الشعار والهيدر الترحيبي */}
                <div className="text-center space-y-3">
                    <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-inner flex items-center justify-center">
                        <Scale className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-100 tracking-wide">
                            بوابة مَكْتَبِي الرَّقْمِي
                        </h2>
                        <p className="text-xs text-slate-500 font-semibold">
                            نظام إدارة وُجهاء المحاماة الاستراتيجي والذكي
                        </p>
                    </div>
                </div>

                {/* رسالة الخطأ المصممة بنظام داكن متناسق */}
                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 justify-center animate-fade-in">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>{error}</span>
                    </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* حقل البريد الإلكتروني */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 mr-1">
                                البريد الإلكتروني
                            </label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-500 transition-colors duration-200">
                                    <Mail className="w-4 h-4" />
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-800/80 bg-slate-950/40 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all duration-200 text-left"
                                    placeholder="admin@lawfirm.com"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* حقل كلمة المرور */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 mr-1">
                                كلمة المرور
                            </label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-500 transition-colors duration-200">
                                    <Lock className="w-4 h-4" />
                                </span>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-800/80 bg-slate-950/40 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all duration-200 text-left"
                                    placeholder="••••••••"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                    </div>

                    {/* زر تسجيل الدخول التفاعلي */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-amber-600/50 disabled:to-amber-500/50 text-slate-950 font-black text-sm shadow-lg shadow-amber-950/20 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                                    <span>جاري تأمين الاتصال...</span>
                                </>
                            ) : (
                                <span>دخول آمن للمنصة</span>
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}