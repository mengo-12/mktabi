'use client';
import { useEffect, useState } from 'react';

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [lawyers, setLawyers] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [priority, setPriority] = useState('medium');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        // جلب مهامي الخاصة
        fetch('http://localhost:8000/api/v1/tasks/my-tasks', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setTasks(data))
        .catch(err => console.error(err));

        // جلب قائمة المحامين والموظفين لخيارات التعيين (عدل الرابط حسب مشروعك)
        fetch('http://localhost:8000/api/v1/lawyers/', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setLawyers(data))
        .catch(err => console.error(err));
    }, []);

    const handleAssignTask = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const res = await fetch(`http://localhost:8000/api/v1/tasks/?title=${encodeURIComponent(title)}&assigned_to=${assignedTo}&description=${encodeURIComponent(description)}&priority=${priority}&due_date=${dueDate}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            alert('تم إسناد المهمة وإطلاق التنبيه الفوري للموظف!');
            setTitle('');
            setDescription('');
            // إعادة تحديث القائمة
            window.location.reload();
        } else {
            alert('حدث خطأ أثناء التكليف.');
        }
    };

    return (
        <div className="space-y-8" dir="rtl">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">منظومة توزيع المهام الإدارية</h1>
                <p className="text-sm text-slate-500 mt-1">تكليف المحامين والسكرتارية ومتابعة مؤشرات الإنجاز</p>
            </div>

            {/* نموذج التكليف بمهمة جديدة */}
            <form onSubmit={handleAssignTask} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white md:col-span-2 border-b pb-2 mb-2">➕ تكليف بمهمة جديدة</h3>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">عنوان المهمة</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm" placeholder="مثال: صياغة مذكرة رد، مراجعة المحكمة..." />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">إسناد وتكليف إلى</label>
                    <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm dark:bg-slate-800">
                        <option value="">اختر المحامي أو السكرتير...</option>
                        {lawyers.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">تفاصيل ومذكرات إضافية</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm" placeholder="اكتب شروط وتفاصيل المهمة هنا..." />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">تاريخ الاستحقاق</label>
                    <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">الأولية</label>
                    <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm dark:bg-slate-800">
                        <option value="low">منخفضة</option>
                        <option value="medium">متوسطة</option>
                        <option value="high">عالية جداً 🚨</option>
                    </select>
                </div>
                <button type="submit" className="md:col-span-2 bg-blue-600 text-white p-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors mt-2">إرسال المهمة وإطلاق التنبيه</button>
            </form>

            {/* قائمة المهام الموكلة إليك */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">📥 قائمة المهام الموكلة إليك حالياً</h3>
                <div className="space-y-3">
                    {tasks.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 py-4">لا توجد مهام معلقة مسندة إليك</p>
                    ) : (
                        tasks.map(t => (
                            <div key={t.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{t.description}</p>
                                    {t.due_date && <span className="text-[11px] text-red-500 font-medium block mt-1">⏰ موعد التسليم: {new Date(t.due_date).toLocaleString('ar-SA')}</span>}
                                </div>
                                <span className={`text-xs px-3 py-1 rounded-full font-bold ${t.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                    {t.priority === 'high' ? 'عالية' : 'عادية'}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}