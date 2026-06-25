'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// استيراد العميل المخصص للمشروع 👈 هو الذي يمتلك الـ Base URL الصحيح بدون تكرار
import apiClient from '@/services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // التحقق الآمن والمحمي من الجلسات المخزنة
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        // فحص إضافي للتأكد أن القيمة ليست نص "undefined" فارغ
        if (storedToken && storedUser && storedUser !== "undefined") {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                // إذا كان الملف تالفاً، قم بتنظيف المتصفح فوراً لحماية النظام
                localStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    // دالة تسجيل الدخول والربط مع الباك-إند
    const login = async (username, password) => {
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            // 🎯 التعديل الذهبي هنا: استخدام apiClient بدلاً من axios الخام لمنع تكرار الروابط
            const response = await apiClient.post('/auth/login', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 1. جلب التوكن الصافي من استجابة السيرفر
            const { access_token } = response.data;

            // 2. 🧠 فك تشفير التوكن برمجياً لقراءة البيانات المخزنة بداخله (JWT Decode)
            const base64Url = access_token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decodedPayload = JSON.parse(window.atob(base64));

            // 3. بناء كائن المستخدم من البيانات المشفرة داخل التوكن نفسه (id و role)
            const user_info = {
                id: decodedPayload.sub,
                role: decodedPayload.role,
                full_name: decodedPayload.role === 'admin' ? 'مدير النظام' : 'المحامي المسؤول'
            };

            // 4. الحفظ الصارم في المتصفح والـ State كـ JSON حقيقي ومكتمل
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user_info));

            setUser(user_info);

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.detail || 'فشل تسجيل الدخول، تأكد من البيانات.';
            return { success: false, error: message };
        }
    };

    // دالة تسجيل الخروج
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);