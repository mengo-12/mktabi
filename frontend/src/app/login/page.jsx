// 'use client';
// import { useState } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/navigation';
// import { Scale, Mail, Lock, ShieldAlert } from 'lucide-react';

// export default function LoginPage() {
//     const { login } = useAuth();
//     const router = useRouter();
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         loading || setLoading(true);

//         const result = await login(username, password);

//         if (result.success) {
//             router.push('/dashboard');
//             router.refresh();
//         } else {
//             setError(result.error);
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] px-4 relative overflow-hidden" dir="rtl">
//             {/* تأثيرات الإضاءة الخلفية الفاخرة (Glow Elements) */}
//             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
//             <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />

//             <div className="max-w-md w-full space-y-8 bg-[#0F172A]/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-slate-800/80 relative z-10">
                
//                 {/* الشعار والهيدر الترحيبي */}
//                 <div className="text-center space-y-3">
//                     <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-inner flex items-center justify-center">
//                         <Scale className="w-6 h-6 text-amber-500" />
//                     </div>
//                     <div className="space-y-1">
//                         <h2 className="text-2xl font-black text-slate-100 tracking-wide">
//                             بوابة مَكْتَبِي الرَّقْمِي
//                         </h2>
//                         <p className="text-xs text-slate-500 font-semibold">
//                             نظام إدارة وُجهاء المحاماة الاستراتيجي والذكي
//                         </p>
//                     </div>
//                 </div>

//                 {/* رسالة الخطأ المصممة بنظام داكن متناسق */}
//                 {error && (
//                     <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 justify-center animate-fade-in">
//                         <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
//                         <span>{error}</span>
//                     </div>
//                 )}

//                 <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
//                     <div className="space-y-4">
//                         {/* حقل البريد الإلكتروني */}
//                         <div>
//                             <label className="block text-xs font-bold text-slate-400 mb-1.5 mr-1">
//                                 البريد الإلكتروني
//                             </label>
//                             <div className="relative group">
//                                 <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-500 transition-colors duration-200">
//                                     <Mail className="w-4 h-4" />
//                                 </span>
//                                 <input
//                                     type="email"
//                                     required
//                                     value={username}
//                                     onChange={(e) => setUsername(e.target.value)}
//                                     className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-800/80 bg-slate-950/40 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all duration-200 text-left"
//                                     placeholder="admin@lawfirm.com"
//                                     dir="ltr"
//                                 />
//                             </div>
//                         </div>

//                         {/* حقل كلمة المرور */}
//                         <div>
//                             <label className="block text-xs font-bold text-slate-400 mb-1.5 mr-1">
//                                 كلمة المرور
//                             </label>
//                             <div className="relative group">
//                                 <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-500 transition-colors duration-200">
//                                     <Lock className="w-4 h-4" />
//                                 </span>
//                                 <input
//                                     type="password"
//                                     required
//                                     value={password}
//                                     onChange={(e) => setPassword(e.target.value)}
//                                     className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-800/80 bg-slate-950/40 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all duration-200 text-left"
//                                     placeholder="••••••••"
//                                     dir="ltr"
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     {/* زر تسجيل الدخول التفاعلي */}
//                     <div className="pt-2">
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-amber-600/50 disabled:to-amber-500/50 text-slate-950 font-black text-sm shadow-lg shadow-amber-950/20 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
//                         >
//                             {loading ? (
//                                 <>
//                                     <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
//                                     <span>جاري تأمين الاتصال...</span>
//                                 </>
//                             ) : (
//                                 <span>دخول آمن للمنصة</span>
//                             )}
//                         </button>
//                     </div>
//                 </form>

//             </div>
//         </div>
//     );
// }




'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Scale,
    Mail,
    Lock,
    ShieldAlert,
    Building2,
    ArrowLeft,
} from 'lucide-react';
import officeProfileService from '@/services/officeProfileService';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // بيانات المكتب
    const [officeName, setOfficeName] = useState('مَكْتَبِي الرَّقْمِي');
    const [officeLogoUrl, setOfficeLogoUrl] = useState('');
    const [officeLoading, setOfficeLoading] = useState(true);

    // جلب هوية المكتب
    useEffect(() => {
        const loadOfficeProfile = async () => {
            try {
                const data = await officeProfileService.getProfile();

                if (data) {
                    setOfficeName(
                        data.office_name || 'مَكْتَبِي الرَّقْمِي'
                    );

                    setOfficeLogoUrl(data.logo_url || '');
                }
            } catch (error) {
                console.error(
                    'خطأ أثناء جلب هوية المكتب:',
                    error
                );
            } finally {
                setOfficeLoading(false);
            }
        };

        loadOfficeProfile();
    }, []);

    const getOfficeLogoSrc = (logoUrl) => {
        if (!logoUrl) return '';

        if (
            logoUrl.startsWith('http://') ||
            logoUrl.startsWith('https://')
        ) {
            return logoUrl;
        }

        return logoUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError('');
        setLoading(true);

        try {
            const result = await login(username, password);

            if (result.success) {
                router.push('/dashboard');
                router.refresh();
            } else {
                setError(
                    result.error ||
                    'البريد الإلكتروني أو كلمة المرور غير صحيحة'
                );
                setLoading(false);
            }
        } catch (error) {
            console.error('خطأ أثناء تسجيل الدخول:', error);

            setError(
                'حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة مرة أخرى.'
            );

            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center px-4 py-8"
            dir="rtl"
        >

            {/* ================= الخلفية ================= */}

            <div className="absolute inset-0 pointer-events-none overflow-hidden">

                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-100/70 blur-3xl" />

                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-100/60 blur-3xl" />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-blue-100/50" />

            </div>


            {/* ================= البطاقة الرئيسية ================= */}

            <div className="relative z-10 w-full max-w-md">

                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-blue-900/10">


                    {/* ================= الجزء العلوي ================= */}

                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 px-8 pb-10 pt-9 text-white">

                        {/* زخرفة */}

                        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10" />

                        <div className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-white/5" />


                        <div className="relative flex flex-col items-center text-center">

                            {/* شعار المكتب */}

                            <div className="mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/30 bg-white shadow-xl">

                                {officeLogoUrl ? (

                                    <img
                                        src={getOfficeLogoSrc(officeLogoUrl)}
                                        alt={officeName}
                                        className="h-full w-full object-contain p-3"
                                    />

                                ) : (

                                    <Scale className="h-11 w-11 text-blue-600" />

                                )}

                            </div>


                            {/* اسم المكتب */}

                            <h1 className="text-xl font-black tracking-wide text-white">

                                {officeLoading
                                    ? 'مَكْتَبِي الرَّقْمِي'
                                    : officeName}

                            </h1>


                            <p className="mt-2 text-xs font-medium text-blue-100">

                                نظام إدارة مكتب المحاماة

                            </p>

                        </div>

                    </div>


                    {/* ================= نموذج الدخول ================= */}

                    <div className="px-7 py-8 sm:px-9">

                        <div className="mb-7">

                            <h2 className="text-xl font-black text-slate-900">

                                تسجيل الدخول

                            </h2>

                            <p className="mt-1.5 text-sm text-slate-500">

                                أدخل بيانات حسابك للوصول إلى النظام

                            </p>

                        </div>


                        {/* رسالة الخطأ */}

                        {error && (

                            <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">

                                <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />

                                <span>{error}</span>

                            </div>

                        )}


                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* البريد الإلكتروني */}

                            <div>

                                <label
                                    htmlFor="username"
                                    className="mb-2 block text-sm font-bold text-slate-700"
                                >
                                    البريد الإلكتروني
                                </label>

                                <div className="group relative">

                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">

                                        <Mail className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-blue-600" />

                                    </div>

                                    <input
                                        id="username"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        placeholder="admin@lawfirm.com"
                                        dir="ltr"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />

                                </div>

                            </div>


                            {/* كلمة المرور */}

                            <div>

                                <div className="mb-2 flex items-center justify-between">

                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-bold text-slate-700"
                                    >
                                        كلمة المرور
                                    </label>

                                </div>

                                <div className="group relative">

                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">

                                        <Lock className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-blue-600" />

                                    </div>

                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="••••••••"
                                        dir="ltr"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />

                                </div>

                            </div>


                            {/* زر الدخول */}

                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >

                                {loading ? (

                                    <>
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                        <span>
                                            جاري تسجيل الدخول...
                                        </span>
                                    </>

                                ) : (

                                    <>
                                        <span>
                                            دخول إلى النظام
                                        </span>

                                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                    </>

                                )}

                            </button>

                        </form>


                        {/* ================= معلومات النظام ================= */}

                        <div className="mt-7 border-t border-slate-100 pt-6">

                            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">

                                <Building2 className="h-4 w-4" />

                                <span>
                                    نظام إدارة مكاتب المحاماة
                                </span>

                            </div>

                            <p className="mt-2 text-center text-[10px] text-slate-400">
                                جميع الحقوق محفوظة © {new Date().getFullYear()}
                            </p>

                        </div>

                    </div>

                </div>


                {/* اسم النظام خارج البطاقة */}

                <p className="mt-5 text-center text-xs font-semibold text-slate-400">
                    مَكْتَبِي الرَّقْمِي
                </p>

            </div>

        </div>
    );
}
