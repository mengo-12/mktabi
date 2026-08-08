// import axios from 'axios';

// const apiClient = axios.create({
//     baseURL: process.env.NEXT_PUBLIC_API_URL,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// // Interceptor لحقن التوكن تلقائياً في الهيدر مع كل طلب صادر
// apiClient.interceptors.request.use(
//     (config) => {
//         if (typeof window !== 'undefined') {
//             const token = localStorage.getItem('token');
//             if (token) {
//                 config.headers.Authorization = `Bearer ${token}`;
//             }
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// // Interceptor لمعالجة أخطاء الاستجابة (مثل انتهاء صلاحية التوكن 401)
// apiClient.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response && error.response.status === 401) {
//             if (typeof window !== 'undefined') {
//                 localStorage.removeItem('token');
//                 localStorage.removeItem('user');
//                 window.location.href = '/login';
//             }
//         }
//         return Promise.reject(error);
//     }
// );

// export default apiClient;



import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,

    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor لحقن التوكن تلقائياً في الهيدر مع كل طلب صادر
apiClient.interceptors.request.use(
    (config) => {

        if (typeof window !== 'undefined') {

            const token = localStorage.getItem('token');

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        // مهم جداً:
        // عند إرسال FormData لا نرسل application/json
        // ونترك Axios / المتصفح يحدد multipart/form-data تلقائياً
        if (
            typeof FormData !== 'undefined' &&
            config.data instanceof FormData
        ) {
            delete config.headers['Content-Type'];
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor لمعالجة أخطاء الاستجابة
// مثل انتهاء صلاحية التوكن 401
apiClient.interceptors.response.use(
    (response) => response,

    (error) => {

        if (error.response && error.response.status === 401) {

            if (typeof window !== 'undefined') {

                localStorage.removeItem('token');
                localStorage.removeItem('user');

                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
