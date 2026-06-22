// 'use client';
// import { useEffect, useState } from 'react';

// export default function TasksPage() {
//     const [tasks, setTasks] = useState([]);
//     const [lawyers, setLawyers] = useState([]);
//     const [title, setTitle] = useState('');
//     const [description, setDescription] = useState('');
//     const [assignedTo, setAssignedTo] = useState('');
//     const [priority, setPriority] = useState('medium');
//     const [dueDate, setDueDate] = useState('');

//     useEffect(() => {
//         const token = localStorage.getItem('token');
        
//         // جلب مهامي الخاصة
//         fetch('http://localhost:8000/api/v1/tasks/my-tasks', {
//             headers: { 'Authorization': `Bearer ${token}` }
//         })
//         .then(res => res.json())
//         .then(data => setTasks(data))
//         .catch(err => console.error(err));

//         // جلب قائمة المحامين والموظفين لخيارات التعيين (عدل الرابط حسب مشروعك)
//         fetch('http://localhost:8000/api/v1/lawyers/', {
//             headers: { 'Authorization': `Bearer ${token}` }
//         })
//         .then(res => res.json())
//         .then(data => setLawyers(data))
//         .catch(err => console.error(err));
//     }, []);

//     const handleAssignTask = async (e) => {
//         e.preventDefault();
//         const token = localStorage.getItem('token');

//         const res = await fetch(`http://localhost:8000/api/v1/tasks/?title=${encodeURIComponent(title)}&assigned_to=${assignedTo}&description=${encodeURIComponent(description)}&priority=${priority}&due_date=${dueDate}`, {
//             method: 'POST',
//             headers: { 'Authorization': `Bearer ${token}` }
//         });

//         if (res.ok) {
//             alert('تم إسناد المهمة وإطلاق التنبيه الفوري للموظف!');
//             setTitle('');
//             setDescription('');
//             // إعادة تحديث القائمة
//             window.location.reload();
//         } else {
//             alert('حدث خطأ أثناء التكليف.');
//         }
//     };

//     return (
//         <div className="space-y-8" dir="rtl">
//             <div>
//                 <h1 className="text-2xl font-bold text-slate-800 dark:text-white">منظومة توزيع المهام الإدارية</h1>
//                 <p className="text-sm text-slate-500 mt-1">تكليف المحامين والسكرتارية ومتابعة مؤشرات الإنجاز</p>
//             </div>

//             {/* نموذج التكليف بمهمة جديدة */}
//             <form onSubmit={handleAssignTask} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <h3 className="text-sm font-bold text-slate-800 dark:text-white md:col-span-2 border-b pb-2 mb-2">➕ تكليف بمهمة جديدة</h3>
//                 <div>
//                     <label className="block text-xs font-semibold text-slate-500 mb-1">عنوان المهمة</label>
//                     <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm" placeholder="مثال: صياغة مذكرة رد، مراجعة المحكمة..." />
//                 </div>
//                 <div>
//                     <label className="block text-xs font-semibold text-slate-500 mb-1">إسناد وتكليف إلى</label>
//                     <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm dark:bg-slate-800">
//                         <option value="">اختر المحامي أو السكرتير...</option>
//                         {lawyers.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
//                     </select>
//                 </div>
//                 <div className="md:col-span-2">
//                     <label className="block text-xs font-semibold text-slate-500 mb-1">تفاصيل ومذكرات إضافية</label>
//                     <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm" placeholder="اكتب شروط وتفاصيل المهمة هنا..." />
//                 </div>
//                 <div>
//                     <label className="block text-xs font-semibold text-slate-500 mb-1">تاريخ الاستحقاق</label>
//                     <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm" />
//                 </div>
//                 <div>
//                     <label className="block text-xs font-semibold text-slate-500 mb-1">الأولية</label>
//                     <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent text-sm dark:bg-slate-800">
//                         <option value="low">منخفضة</option>
//                         <option value="medium">متوسطة</option>
//                         <option value="high">عالية جداً 🚨</option>
//                     </select>
//                 </div>
//                 <button type="submit" className="md:col-span-2 bg-blue-600 text-white p-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors mt-2">إرسال المهمة وإطلاق التنبيه</button>
//             </form>

//             {/* قائمة المهام الموكلة إليك */}
//             <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
//                 <h3 className="font-bold text-slate-800 dark:text-white mb-4">📥 قائمة المهام الموكلة إليك حالياً</h3>
//                 <div className="space-y-3">
//                     {tasks.length === 0 ? (
//                         <p className="text-center text-sm text-slate-400 py-4">لا توجد مهام معلقة مسندة إليك</p>
//                     ) : (
//                         tasks.map(t => (
//                             <div key={t.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
//                                 <div>
//                                     <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.title}</h4>
//                                     <p className="text-xs text-slate-500 mt-1">{t.description}</p>
//                                     {t.due_date && <span className="text-[11px] text-red-500 font-medium block mt-1">⏰ موعد التسليم: {new Date(t.due_date).toLocaleString('ar-SA')}</span>}
//                                 </div>
//                                 <span className={`text-xs px-3 py-1 rounded-full font-bold ${t.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
//                                     {t.priority === 'high' ? 'عالية' : 'عادية'}
//                                 </span>
//                             </div>
//                         ))
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }


'use client';
import { useEffect, useState } from 'react';
import { 
  PlusCircle, 
  Inbox, 
  Calendar, 
  AlertCircle, 
  FileText, 
  UserPlus, 
  Clock, 
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

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

        // جلب قائمة المحامين والموظفين لخيارات التعيين
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
            window.location.reload();
        } else {
            alert('حدث خطأ أثناء التكليف.');
        }
    };

    // دالة ديناميكية لتلوين مستويات الأهمية بلمسات فاخرة ومتناسقة مع الـ Amber والـ Midnight Navy
    const getPriorityStyle = (prio) => {
        switch (prio) {
            case 'high':
                return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
            case 'medium':
                return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
            default:
                return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
        }
    };

    const getPriorityLabel = (prio) => {
        if (prio === 'high') return 'عالية جداً وجسيمة';
        if (prio === 'medium') return 'متوسطة الأهمية';
        return 'منخفضة الأهمية';
    };

    return (
        <div className="space-y-8 p-4 md:p-6 max-w-6xl mx-auto" dir="rtl">
            {/* الهيدر الرئيسي الملكي */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                    منظومة توزيع المهام الإدارية
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    تكليف المحامين والسكرتارية ومتابعة مؤشرات الإنجاز بدقة وسرعة فورية.
                </p>
            </div>

            {/* نموذج التكليف بمهمة جديدة (Midnight Navy Theme) */}
            <form onSubmit={handleAssignTask} className="bg-white dark:bg-[#141C2F] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5 transition-all duration-300 hover:shadow-md">
                <div className="md:col-span-2 flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
                    <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                        <PlusCircle className="w-5 h-5" />
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">تكليف بمهمة جديدة</h3>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 tracking-wide flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" /> عنوان المهمة
                    </label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        required 
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:text-white transition-all placeholder:text-slate-400" 
                        placeholder="مثال: صياغة مذكرة رد، مراجعة المحكمة الإدارية..." 
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 tracking-wide flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5 text-slate-400" /> إسناد وتكليف إلى
                    </label>
                    <select 
                        value={assignedTo} 
                        onChange={e => setAssignedTo(e.target.value)} 
                        required 
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:text-white transition-all cursor-pointer"
                    >
                        <option value="" className="dark:bg-[#0F172A]">اختر المحامي أو السكرتير...</option>
                        {lawyers.map(l => <option key={l.id} value={l.id} className="dark:bg-[#0F172A]">{l.full_name}</option>)}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 tracking-wide flex items-center gap-1.5">
                        <FolderOpen className="w-3.5 h-3.5 text-slate-400" /> تفاصيل ومذكرات إضافية
                    </label>
                    <textarea 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        rows={3}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:text-white transition-all placeholder:text-slate-400 resize-none" 
                        placeholder="اكتب شروط وتفاصيل المهمة هنا بالتفصيل..." 
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 tracking-wide flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> تاريخ ووقت الاستحقاق
                    </label>
                    <input 
                        type="datetime-local" 
                        value={dueDate} 
                        onChange={e => setDueDate(e.target.value)} 
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:text-white transition-all" 
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 tracking-wide flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400" /> مستوى الأولية
                    </label>
                    <select 
                        value={priority} 
                        onChange={e => setPriority(e.target.value)} 
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:text-white transition-all cursor-pointer"
                    >
                        <option value="low" className="dark:bg-[#0F172A]">منخفضة</option>
                        <option value="medium" className="dark:bg-[#0F172A]">متوسطة</option>
                        <option value="high" className="dark:bg-[#0F172A]">عالية جداً وطارئة</option>
                    </select>
                </div>

                <button 
                    type="submit" 
                    className="md:col-span-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-3.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.99] transition-all shadow-lg shadow-amber-500/10 mt-2 flex items-center justify-center gap-2"
                >
                    <CheckCircle2 className="w-4 h-4" />
                    إرسال المهمة وإطلاق التنبيه الفوري للموظف
                </button>
            </form>

            {/* قائمة المهام الموكلة إليك حالياً */}
            <div className="bg-white dark:bg-[#141C2F] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                        <Inbox className="w-5 h-5" />
                    </span>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">قائمة المهام الموكلة إليك حالياً</h3>
                </div>

                <div className="space-y-4">
                    {tasks.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-[#0F172A]/40">
                            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">لا توجد مهام معلقة مسندة إليك في الوقت الحالي.</p>
                        </div>
                    ) : (
                        tasks.map(t => (
                            <div 
                                key={t.id} 
                                className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172A]/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-200 hover:bg-slate-100/50 dark:hover:bg-[#0F172A]"
                            >
                                <div className="space-y-2 flex-1">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0"></span>
                                        {t.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-4">
                                        {t.description || 'لا توجد مذكرات إضافية لهذه المهمة.'}
                                    </p>
                                    {t.due_date && (
                                        <div className="flex items-center gap-1.5 text-[11px] text-rose-500 font-semibold pt-1 pr-4">
                                            <Clock className="w-3 h-3" />
                                            <span>موعد التسليم النهائي:</span>
                                            <span dir="ltr">{new Date(t.due_date).toLocaleString('ar-SA', { hour12: true })}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <span className={`text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0 whitespace-nowrap tracking-wide flex items-center gap-1.5 ${getPriorityStyle(t.priority)}`}>
                                    <AlertCircle className="w-3 h-3" />
                                    {getPriorityLabel(t.priority)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}