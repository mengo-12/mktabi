import React, { useState, useEffect } from 'react';

export default function ClientDocumentsPage() {
    // 1. حالات الموكلين والمستندات (تم تحويلها لحالات فارغة في البداية ليتم جلبها من السيرفر)
    const [clients, setClients] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState(null);
    
    // حالات التحكم في التحميل والأخطاء والبحث
    const [loadingClients, setLoadingClients] = useState(true);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    // 2. جلب قائمة الموكلين عند تحميل الصفحة لأول مرة
    useEffect(() => {
        const fetchClients = async () => {
            try {
                setLoadingClients(true);
                // استبدل الرابط برابط الـ API الخاص بنظامك (مثال: FastAPI backend)
                const response = await fetch('http://localhost:8000/api/clients');
                const data = await response.json();
                
                setClients(data);
                if (data.length > 0) {
                    setSelectedClientId(data[0].id); // اختيار أول موكل تلقائياً
                }
            } catch (err) {
                console.error("خطأ في جلب الموكلين:", err);
                setError("فشل في تحميل قائمة الموكلين");
            } finally {
                setLoadingClients(false);
            }
        };

        fetchClients();
    }, []);

    // 3. جلب المستندات المرتبطة بالموكل المختار عند تغير الـ (selectedClientId)
    useEffect(() => {
        if (!selectedClientId) return;

        const fetchClientDocuments = async () => {
            try {
                setLoadingDocs(true);
                // جلب المستندات المرتبطة بهذا الموكل تحديداً من السيرفر
                const response = await fetch(`http://localhost:8000/api/documents?client_id=${selectedClientId}`);
                const data = await response.json();
                
                setDocuments(data);
            } catch (err) {
                console.error("خطأ في جلب مستندات الموكل:", err);
                setDocuments([]); // تصفير القائمة في حال حدوث خطأ
            } finally {
                setLoadingDocs(false);
            }
        };

        fetchClientDocuments();
    }, [selectedClientId]); // تشغيل الدالة فوراً عند تغير الموكل المحدد

    // تصفية المستندات المجلوبة محلياً بناءً على نص البحث
    const selectedClient = clients.find(c => c.id === selectedClientId);
    const filteredDocuments = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100 font-sans" dir="rtl">
            
            {/* الهيدر العلوي */}
            <div className="mb-8 border-b border-zinc-900 pb-5">
                <h1 className="text-xl font-black text-zinc-100 flex items-center gap-2">
                    📁 أرشيف مستندات وملفات الموكلين
                </h1>
                <p className="text-xs text-zinc-400 mt-1">تصفح واستعرض كافة العقود والوثائق الرسمية المجلوبة تلقائياً لكل موكل.</p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-950/40 border border-red-900 text-red-400 text-xs rounded-xl">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* العمود الأيمن: قائمة الموكلين */}
                <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 shadow-xl">
                    <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">👥 اختر الموكل</h2>
                    
                    {loadingClients ? (
                        <div className="text-center p-4 text-xs text-zinc-500 animate-pulse">جاري تحميل الموكلين...</div>
                    ) : (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {clients.map((client) => {
                                const isSelected = client.id === selectedClientId;
                                return (
                                    <button
                                        key={client.id}
                                        onClick={() => setSelectedClientId(client.id)}
                                        className={`w-full text-right p-3 rounded-xl border transition flex flex-col gap-1 ${
                                            isSelected 
                                            ? 'bg-amber-950/40 border-amber-500 text-amber-400 shadow-lg' 
                                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                                        }`}
                                    >
                                        <span className="text-xs font-bold">{client.name}</span>
                                        <div className="flex justify-between items-center w-full text-[10px] text-zinc-500">
                                            <span>الهوية: {client.idNumber}</span>
                                            <span className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                                                {client.caseCount || 0} قضايا
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* العمود الأيسر: عرض المستندات المتربطة ديناميكياً */}
                <div className="lg:col-span-3 space-y-6">
                    
                    {/* لوحة معلومات الموكل الحالي */}
                    {selectedClient && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                    <h2 className="text-base font-bold text-zinc-200">{selectedClient.name}</h2>
                                </div>
                                <p className="text-[11px] text-zinc-500 mt-1">
                                    رقم الهوية: <span className="font-mono text-zinc-400">{selectedClient.idNumber}</span> | الهاتف: <span className="font-mono text-zinc-400">{selectedClient.phone}</span>
                                </p>
                            </div>

                            {/* شريط البحث */}
                            <div className="relative w-full md:w-64">
                                <input
                                    type="text"
                                    placeholder="ابحث في مستندات هذا الموكل..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition text-right"
                                />
                                <span className="absolute left-3 top-2.5 text-xs opacity-40">🔍</span>
                            </div>
                        </div>
                    )}

                    {/* جدول المستندات المرتبطة */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-zinc-400">📄 المستندات والوثائق الملحقة ({filteredDocuments.length})</h3>
                            <button className="text-[11px] bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold px-3 py-1.5 rounded-lg transition shadow">
                                ➕ رفع مستند جديد للموكل
                            </button>
                        </div>

                        {loadingDocs ? (
                            <div className="text-center p-12 text-zinc-500 text-xs animate-pulse">
                                🔄 جاري سحب وتصفية مستندات الموكل من الأرشيف...
                            </div>
                        ) : filteredDocuments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-right border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 text-[11px] font-bold">
                                            <th className="p-4">اسم المستند</th>
                                            <th className="p-4">النوع</th>
                                            <th className="p-4">تاريخ الرفع</th>
                                            <th className="p-4">الحجم</th>
                                            <th className="p-4">الحالة</th>
                                            <th className="p-4 text-center">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800 text-xs">
                                        {filteredDocuments.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-zinc-800/30 transition text-zinc-300">
                                                <td className="p-4 font-semibold text-zinc-200 flex items-center gap-2">
                                                    <span>📎</span> {doc.title}
                                                </td>
                                                <td className="p-4">
                                                    <span className="bg-zinc-950 px-2 py-1 rounded text-[10px] border border-zinc-800 text-zinc-400">
                                                        {doc.type}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono text-zinc-400 text-[11px]">{doc.date}</td>
                                                <td className="p-4 font-mono text-zinc-500 text-[11px]">{doc.size}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        doc.status === 'ساري' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900' :
                                                        doc.status === 'مراجعة' ? 'bg-amber-950/60 text-amber-400 border border-amber-900' :
                                                        'bg-zinc-950 text-zinc-500 border border-zinc-800'
                                                    }`}>
                                                        {doc.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button className="px-2 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-[10px] transition text-zinc-400 hover:text-zinc-200">
                                                            👁️ استعراض
                                                        </button>
                                                        <button className="px-2 py-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded text-[10px] transition text-zinc-400 hover:text-zinc-200">
                                                            ⬇️ تحميل
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center p-12 text-zinc-500 space-y-2">
                                <p className="text-2xl">📁</p>
                                <p className="text-xs">لا توجد مستندات مرفوعة لهذا الموكل حالياً.</p>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}