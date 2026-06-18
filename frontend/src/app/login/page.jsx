'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'; // 👈 استيراد الموجه هنا

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter(); // 👈 تفعيل الموجه داخل المكون
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);

        if (result.success) {
            // 🚀 إذا نجح الدخول، يتم التوجيه من هنا فوراً وبشكل حاد وسريع
            router.push('/dashboard');
            router.refresh();
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">

                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        منصة مَكْتَبِي الـرَّقْمِيَّة
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        نظام إدارة القضايا والموكلين الذكي للمحاماة
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium text-center">
                        ⚠️ {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                البريد الإلكتروني
                            </label>
                            <input
                                type="email"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                                placeholder="admin@lawfirm.com"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                كلمة المرور
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                                placeholder="••••••••"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-lg shadow-lg transition-all duration-200"
                        >
                            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}