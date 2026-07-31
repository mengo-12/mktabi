// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";

// import { dynamicService } from "@/services/dynamicService";
// import { useRouter } from "next/navigation";

// import FullCalendar from "@fullcalendar/react";

// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import listPlugin from "@fullcalendar/list";
// import { useAuth } from "@/context/AuthContext";
// import arLocale from "@fullcalendar/core/locales/ar";

// import DynamicFormRenderer from "@/components/dynamic/DynamicFormRenderer";

// import {
//     Calendar,
//     Search,
//     Filter,
//     RefreshCcw,
//     ChevronLeft,
//     ChevronRight,
//     CalendarDays,
// } from "lucide-react";

// export default function CalendarPage() {
//     const calendarRef = useRef(null);
//     // مرجع لحفظ توقيت آخر نقرة ومكانها لتحديد النقر المزدوج
//     const lastClickRef = useRef({ time: 0, dateStr: "" });

//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     const { user } = useAuth();

//     const [sections, setSections] = useState([]);
//     const [tables, setTables] = useState([]);
//     const [events, setEvents] = useState([]);

//     const [search, setSearch] = useState("");
//     const [selectedTables, setSelectedTables] = useState([]);

//     const [selectedEvent, setSelectedEvent] = useState(null);

//     const [currentView, setCurrentView] = useState("dayGridMonth");
//     const [currentTitle, setCurrentTitle] = useState("");

//     const [editEventModal, setEditEventModal] = useState({
//         open: false,
//         loading: false,
//         saving: false,
//     });

//     const [editFormColumns, setEditFormColumns] = useState([]);
//     const [editFormData, setEditFormData] = useState({});
//     const [editCalendarMapping, setEditCalendarMapping] = useState({});
//     const [editEventError, setEditEventError] = useState("");
//     const [editingEvent, setEditingEvent] = useState(null);

//     const [eventDetails, setEventDetails] = useState(null);

//     const [eventDetailsLoading, setEventDetailsLoading] = useState(false);

//     const [eventDetailsError, setEventDetailsError] = useState("");

//     const pagePermission = useMemo(() => {
//         if (
//             user?.role?.toLowerCase() === "admin" ||
//             user?.is_superuser
//         ) {
//             return "write";
//         }

//         return user?.system_pages?.calendar || "no_access";
//     }, [user]);

//     const hasPermission = (type) => {
//         if (user?.role === "ADMIN" || user?.is_superuser) {
//             return true;
//         }

//         if (type === "read") {
//             return pagePermission === "read" || pagePermission === "write";
//         }

//         if (type === "write") {
//             return pagePermission === "write";
//         }

//         return false;
//     };

//     console.log("User:", user);
//     console.log("Permissions:", user?.permissions);
//     console.log("Calendar Permission:", pagePermission);


//     const openEditEvent = async () => {
//         if (!hasPermission("write")) return;
//         setEditingEvent(selectedEvent);

//         try {
//             setEditEventError("");

//             setEditEventModal({
//                 open: true,
//                 loading: true,
//                 saving: false,
//             });

//             const token = localStorage.getItem("token");

//             const [formRes, rowRes] = await Promise.all([
//                 fetch(
//                     `${process.env.NEXT_PUBLIC_API_URL}/dynamic/tables/${selectedEvent.table_id}/form`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                         },
//                     }
//                 ),
//                 fetch(
//                     `${process.env.NEXT_PUBLIC_API_URL}/dynamic/rows/${selectedEvent.row_id}`,
//                     {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                         },
//                     }
//                 ),
//             ]);

//             if (!formRes.ok || !rowRes.ok) {
//                 throw new Error("تعذر تحميل بيانات السجل.");
//             }

//             const form = await formRes.json();
//             const row = await rowRes.json();

//             setEditFormColumns(form.columns || []);
//             setEditCalendarMapping(form.calendar_mapping || {});
//             setEditFormData(row.cells_data || {});

//             setEditEventModal({
//                 open: true,
//                 loading: false,
//                 saving: false,
//             });

//         } catch (err) {

//             console.error(err);

//             setEditEventError(err.message);

//             setEditEventModal({
//                 open: false,
//                 loading: false,
//                 saving: false,
//             });

//         }
//     };

//     const saveEditedEvent = async () => {
//         if (!hasPermission("write")) return;
//         try {

//             setEditEventModal((prev) => ({
//                 ...prev,
//                 saving: true,
//             }));

//             setEditEventError("");

//             if (!editingEvent) return;

//             await dynamicService.updateCalendarRow(
//                 editingEvent.row_id,
//                 editFormData
//             );
//             // إعادة تحميل أحداث التقويم
//             await refreshEventsOnly();

//             // إغلاق نافذة التعديل
//             setEditEventModal({
//                 open: false,
//                 loading: false,
//                 saving: false,
//             });

//             setEditingEvent(null);

//             setSelectedEvent(null);

//         } catch (err) {

//             console.error(err);

//             setEditEventError(
//                 err?.response?.data?.detail ||
//                 err.message ||
//                 "حدث خطأ أثناء الحفظ."
//             );

//             setEditEventModal((prev) => ({
//                 ...prev,
//                 saving: false,
//             }));

//         }
//     };

//     const deleteEvent = async () => {
//         if (!hasPermission("write")) return;

//         const event = editingEvent || selectedEvent;

//         if (!event) return;

//         const confirmDelete = window.confirm(
//             "هل تريد حذف هذا الحدث؟"
//         );

//         if (!confirmDelete) return;

//         try {

//             await dynamicService.deleteCalendarRow(
//                 event.row_id
//             );

//             await refreshEventsOnly();

//             setSelectedEvent(null);

//         } catch (err) {

//             console.error(err);

//             alert(
//                 err?.response?.data?.detail ||
//                 "تعذر حذف الحدث."
//             );

//         }

//     };

//     // Modal بسيط ل dateClick عند وجود أكثر من جدول
//     const [dateClickModal, setDateClickModal] = useState({
//         open: false,
//         dateStr: "",
//         candidates: [],
//     });

//     // Modal لإنشاء حدث داخل نفس صفحة التقويم
//     const [createEventModal, setCreateEventModal] = useState({
//         open: false,
//         tableId: null,
//         dateStr: "",
//         title: "",
//         saving: false,
//     });


//     const [createEventError, setCreateEventError] = useState("");

//     const [formColumns, setFormColumns] = useState([]);
//     const [formData, setFormData] = useState({});
//     const [calendarMapping, setCalendarMapping] = useState({});
//     const [loadingForm, setLoadingForm] = useState(false);

//     const router = useRouter();

//     const [calendarSaving, setCalendarSaving] = useState(false);

//     //-------------------------------------------------
//     // تحميل البيانات + الأحداث
//     //-------------------------------------------------
//     const loadData = async () => {
//         try {
//             setLoading(true);
//             setError("");

//             const sectionsData = await dynamicService.getSections();
//             setSections(sectionsData);

//             // استخراج الجداول المفعلة للتقويم
//             const calendarTables = [];

//             sectionsData.forEach((section) => {
//                 (section.tables || []).forEach((table) => {
//                     if (table.calendar_mapping && table.calendar_mapping.enabled) {
//                         calendarTables.push({
//                             id: table.id,
//                             name: table.name,
//                             section: section.title,
//                             color: table.calendar_mapping.color || "#3b82f6",
//                         });
//                     }
//                 });
//             });

//             setTables(calendarTables);

//             const calendarEvents = await dynamicService.getCalendarEvents();
//             setEvents(calendarEvents);
//         } catch (err) {
//             console.error(err);
//             setError("تعذر تحميل بيانات التقويم");
//         } finally {
//             setLoading(false);
//         }
//     };

//     //-------------------------------------------------
//     // تحديث الأحداث فقط
//     //-------------------------------------------------
//     const refreshEventsOnly = async () => {
//         try {
//             const calendarEvents = await dynamicService.getCalendarEvents();
//             setEvents(calendarEvents);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     useEffect(() => {
//         loadData();
//     }, []);

//     // تحديث تلقائي عند إعادة التركيز على الصفحة
//     useEffect(() => {
//         const onFocus = () => {
//             refreshEventsOnly();
//         };
//         window.addEventListener("focus", onFocus);

//         refreshEventsOnly();

//         return () => window.removeEventListener("focus", onFocus);
//     }, []);

//     //-------------------------------------------------
//     // الفلاتر
//     //-------------------------------------------------
//     const filteredEvents = useMemo(() => {
//         let result = [...events];

//         if (selectedTables.length > 0) {
//             result = result.filter((event) => selectedTables.includes(event.table_id));
//         }

//         if (search.trim()) {
//             const q = search.toLowerCase();
//             result = result.filter((event) => {
//                 return (
//                     (event.title || "").toLowerCase().includes(q) ||
//                     (event.description || "").toLowerCase().includes(q) ||
//                     (event.table_name || "").toLowerCase().includes(q)
//                 );
//             });
//         }

//         return result.map((event) => ({
//             id: event.id,
//             title: event.title,
//             start: event.start,
//             end: event.end,
//             backgroundColor: event.color,
//             borderColor: event.color,
//             editable: event.editable,
//             allDay: event.all_day,
//             extendedProps: event,
//         }));
//     }, [events, selectedTables, search]);

//     //-------------------------------------------------
//     // تبديل الجدول
//     //-------------------------------------------------
//     const toggleTable = (tableId) => {
//         setSelectedTables((prev) => {
//             if (prev.includes(tableId)) {
//                 return prev.filter((id) => id !== tableId);
//             }
//             return [...prev, tableId];
//         });
//     };

//     //-------------------------------------------------
//     // أدوات التقويم
//     //-------------------------------------------------
//     const goToday = () => {
//         calendarRef.current?.getApi()?.today();
//     };

//     const goPrev = () => {
//         calendarRef.current?.getApi()?.prev();
//     };

//     const goNext = () => {
//         calendarRef.current?.getApi()?.next();
//     };

//     const changeView = (view) => {
//         setCurrentView(view);
//         calendarRef.current?.getApi()?.changeView(view);
//     };

//     //-------------------------------------------------
//     // الضغط على الحدث
//     //-------------------------------------------------
//     const handleEventClick = async (info) => {

//         try {

//             setEventDetailsLoading(true);

//             setEventDetailsError("");

//             const data =
//                 await dynamicService.getCalendarEvent(
//                     info.event.id
//                 );

//             setSelectedEvent(data.event);

//             setEventDetails(data);

//         } catch (err) {

//             console.error(err);

//             setEventDetailsError(
//                 err?.response?.data?.detail ||
//                 "تعذر تحميل تفاصيل الحدث."
//             );

//         } finally {

//             setEventDetailsLoading(false);

//         }

//     };

//     //-------------------------------------------------
//     // eventDrop / eventResize
//     //-------------------------------------------------
//     const saveCalendarEventUpdate = async ({ eventId, start, end }) => {
//         const payload = {
//             start: start instanceof Date ? start.toISOString() : start,
//             end: end ? (end instanceof Date ? end.toISOString() : end) : null,
//             all_day: true,
//         };

//         const authToken =
//             typeof window !== "undefined" ? localStorage.getItem("token") : null;

//         const res = await fetch(
//             `${process.env.NEXT_PUBLIC_API_URL}/dynamic/calendar/events/${eventId}`,
//             {
//                 method: "PUT",
//                 headers: {
//                     "Content-Type": "application/json",
//                     ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
//                 },
//                 body: JSON.stringify(payload),
//             }
//         );

//         if (!res.ok) {
//             const data = await res.json().catch(() => ({}));
//             throw new Error(data?.detail || "فشل حفظ الحدث");
//         }

//         return res.json().catch(() => ({}));
//     };

//     const createCalendarEvent = async () => {
//         if (!hasPermission("write")) return;
//         try {

//             setCreateEventError("");

//             setCreateEventModal((prev) => ({
//                 ...prev,
//                 saving: true,
//             }));

//             await dynamicService.createCalendarEvent({
//                 table_id: createEventModal.tableId,
//                 cells_data: formData,
//             });

//             await refreshEventsOnly();

//             setCreateEventModal({
//                 open: false,
//                 tableId: null,
//                 dateStr: "",
//                 title: "",
//                 saving: false,
//             });

//             setFormColumns([]);
//             setFormData({});
//             setCalendarMapping({});

//         } catch (err) {

//             console.error(err);

//             setCreateEventError(
//                 err?.response?.data?.detail ||
//                 err?.message ||
//                 "تعذر إنشاء الحدث."
//             );

//             setCreateEventModal((prev) => ({
//                 ...prev,
//                 saving: false,
//             }));

//         }
//     };

//     const updateEventAndPersist = async (info, revert) => {
//         if (!hasPermission("write")) {
//             revert();
//             return;
//         }
//         try {
//             setCalendarSaving(true);

//             const ev = info.event;
//             const extended = ev.extendedProps;

//             const eventId = `${extended.table_id}-${extended.row_id}`;

//             await saveCalendarEventUpdate({
//                 eventId,
//                 start: ev.start,
//                 end: ev.end,
//             });

//             await refreshEventsOnly();

//             setCalendarSaving(false);
//         } catch (e) {
//             console.error(e);
//             revert();
//             setCalendarSaving(false);
//         }
//     };

//     const loadTableForm = async (tableId, dateStr) => {

//         try {
//             setLoadingForm(true);
//             setCreateEventError("");

//             const token = localStorage.getItem("token");

//             const res = await fetch(
//                 `${process.env.NEXT_PUBLIC_API_URL}/dynamic/tables/${tableId}/form`,
//                 {
//                     headers: {
//                         ...(token && {
//                             Authorization: `Bearer ${token}`,
//                         }),
//                     },
//                 }
//             );

//             if (!res.ok) {
//                 throw new Error("تعذر تحميل نموذج الجدول");
//             }

//             const data = await res.json();

//             setFormColumns(data.columns || []);
//             setCalendarMapping(data.calendar_mapping || {});

//             const values = {};

//             (data.columns || []).forEach((column) => {
//                 values[column.id] = "";
//             });

//             const startField = data.calendar_mapping?.start_field;

//             if (startField) {
//                 values[startField] = dateStr;
//             }

//             setFormData(values);



//         } catch (e) {
//             console.error(e);
//             setCreateEventError(e.message);
//         } finally {
//             setLoadingForm(false);
//         }
//     };

//     //-------------------------------------------------
//     // dateClick: إنشاء سجل جديد بالضغط المزدوج فقط
//     //-------------------------------------------------
//     const handleDateClick = async (info) => {
//         if (!hasPermission("write")) return;
//         const now = Date.now();
//         const prevClick = lastClickRef.current;

//         // التحقق من أن النقرة الثانية تمت على نفس التاريخ وخلال أقل من 300 مللي ثانية
//         if (prevClick.dateStr === info.dateStr && now - prevClick.time < 300) {
//             // تصفير النقرة السابقة فوراً لتجنب استدعاءات متكررة سريعة جداً
//             lastClickRef.current = { time: 0, dateStr: "" };

//             const dateStr = info.dateStr; // YYYY-MM-DD

//             const active =
//                 selectedTables.length > 0
//                     ? tables.filter((t) => selectedTables.includes(t.id))
//                     : tables;

//             if (active.length === 1) {

//                 await loadTableForm(
//                     active[0].id,
//                     dateStr
//                 );

//                 setCreateEventModal({
//                     open: true,
//                     tableId: active[0].id,
//                     dateStr,
//                     title: "",
//                     saving: false,
//                 });

//                 return;
//             }
//             // إذا كان هناك أكثر من جدول، نفتح Modal لاختيار الجدول أو إدخال بيانات الحدث
//             if (active.length === 0) return;

//             setDateClickModal({
//                 open: true,
//                 dateStr,
//                 candidates: active,
//             });

//         } else {
//             // تخزين بيانات النقرة الأولى بانتظار الثانية
//             lastClickRef.current = { time: now, dateStr: info.dateStr };
//         }
//     };

//     //-------------------------------------------------
//     // Loading / Error
//     //-------------------------------------------------
//     if (loading) {
//         return (
//             <div className="flex items-center justify-center h-screen bg-zinc-950">
//                 <div className="text-center">
//                     <div className="animate-spin w-14 h-14 rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
//                     <p className="mt-5 text-zinc-400">جاري تحميل التقويم...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="flex items-center justify-center h-screen bg-zinc-950">
//                 <div className="bg-red-900/30 border border-red-700 rounded-xl p-8">
//                     <h2 className="text-red-400 font-bold">{error}</h2>
//                     <button onClick={loadData} className="mt-5 bg-blue-600 px-5 py-2 rounded-lg">
//                         إعادة المحاولة
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     if (!hasPermission("read")) {
//         return (
//             <div className="flex items-center justify-center h-screen">
//                 ليس لديك صلاحية للوصول إلى صفحة التقويم
//             </div>
//         );
//     }

//     return (
//         <div className="mr-64 flex h-[calc(100vh-70px)] bg-zinc-950">
//             <aside className="w-80 border-r border-zinc-800 bg-zinc-900 flex flex-col">
//                 <div className="p-6 border-b border-zinc-800">
//                     <div className="flex items-center gap-3">
//                         <CalendarDays className="w-7 h-7 text-blue-500" />
//                         <div>
//                             <h1 className="text-xl font-bold text-white">التقويم</h1>
//                             <p className="text-xs text-zinc-400 mt-1">جميع الأحداث الديناميكية</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="p-5">
//                     <div className="relative">
//                         <Search className="absolute left-3 top-3 text-zinc-500" size={18} />
//                         <input
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                             placeholder="بحث..."
//                             className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-10 pr-3 py-3 text-white outline-none focus:border-blue-500"
//                         />
//                     </div>
//                 </div>

//                 <div className="flex-1 overflow-y-auto px-4 pb-6">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="text-sm font-semibold text-zinc-300">الجداول</h3>
//                         <Filter size={18} className="text-zinc-500" />
//                     </div>

//                     {tables.length === 0 && (
//                         <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
//                             لا توجد جداول مفعلة للتقويم.
//                         </div>
//                     )}

//                     {tables.map((table) => {
//                         const active = selectedTables.includes(table.id);
//                         const count = events.filter((e) => e.table_id === table.id).length;

//                         return (
//                             <button
//                                 key={table.id}
//                                 onClick={() => toggleTable(table.id)}
//                                 className={`w-full rounded-xl border p-3 mb-3 transition text-right ${active
//                                     ? "border-blue-500 bg-blue-950/30"
//                                     : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
//                                     }`}
//                             >
//                                 <div className="flex items-center gap-3">
//                                     <div
//                                         className="w-4 h-4 rounded-full"
//                                         style={{ backgroundColor: table.color }}
//                                     />
//                                     <div>
//                                         <div className="font-semibold text-white">{table.name}</div>
//                                         <div className="text-xs text-zinc-500 mt-1">{table.section}</div>
//                                         <div className="text-xs text-blue-400 mt-1">{count} حدث</div>
//                                     </div>
//                                 </div>
//                             </button>
//                         );
//                     })}
//                 </div>
//             </aside>

//             <main className="flex-1 flex flex-col">
//                 <div className="border-b border-zinc-800 bg-zinc-900 px-6 py-4 flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                         <button
//                             onClick={goPrev}
//                             className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center"
//                         >
//                             <ChevronRight size={20} />
//                         </button>
//                         <button
//                             onClick={goNext}
//                             className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center"
//                         >
//                             <ChevronLeft size={20} />
//                         </button>
//                         <button
//                             onClick={goToday}
//                             className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
//                         >
//                             اليوم
//                         </button>
//                     </div>

//                     <div className="flex items-center gap-2">
//                         <button
//                             onClick={() => changeView("dayGridMonth")}
//                             className={`px-4 py-2 rounded-lg ${currentView === "dayGridMonth" ? "bg-blue-600" : "bg-zinc-800"
//                                 }`}
//                         >
//                             شهر
//                         </button>
//                         <button
//                             onClick={() => changeView("timeGridWeek")}
//                             className={`px-4 py-2 rounded-lg ${currentView === "timeGridWeek" ? "bg-blue-600" : "bg-zinc-800"
//                                 }`}
//                         >
//                             أسبوع
//                         </button>
//                         <button
//                             onClick={() => changeView("timeGridDay")}
//                             className={`px-4 py-2 rounded-lg ${currentView === "timeGridDay" ? "bg-blue-600" : "bg-zinc-800"
//                                 }`}
//                         >
//                             يوم
//                         </button>
//                         <h2 className="text-xl font-bold text-white">{currentTitle}</h2>

//                         <button
//                             onClick={loadData}
//                             className="ml-3 w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center"
//                         >
//                             <RefreshCcw
//                                 size={18}
//                                 className={loading || calendarSaving ? "animate-spin" : ""}
//                             />
//                         </button>
//                     </div>
//                 </div>

//                 <div className="flex-1 bg-zinc-50 p-4">
//                     <FullCalendar
//                         nowIndicator={true}
//                         navLinks={true}
//                         stickyHeaderDates={true}
//                         dayMaxEvents={true}
//                         eventDisplay="block"

//                         ref={calendarRef}
//                         datesSet={(info) => setCurrentTitle(info.view.title)}

//                         plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
//                         locale={arLocale}
//                         direction="rtl"
//                         initialView="dayGridMonth"
//                         height="100%"

//                         editable={true}
//                         selectable={true}
//                         weekends={true}
//                         headerToolbar={false}

//                         events={filteredEvents}
//                         eventClick={handleEventClick}
//                         dateClick={handleDateClick}

//                         eventDrop={(info) => {
//                             const revert = () => info.revert();
//                             updateEventAndPersist(info, revert);
//                         }}

//                         eventResize={(info) => {
//                             const revert = () => info.revert();
//                             updateEventAndPersist(info, revert);
//                         }}

//                         loading={(isLoadingCb) => {
//                             void isLoadingCb;
//                         }}

//                         eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
//                         moreLinkClick="popover"
//                     />
//                 </div>
//             </main>

//             {/* Modal اختيار جدول عند النقر المزدوج */}
//             {dateClickModal.open && (
//                 <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
//                     <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden">
//                         <div className="p-6 text-white bg-zinc-900">
//                             <h2 className="text-xl font-bold">اختر الجدول لإضافة سجل بتاريخ</h2>
//                             <p className="mt-2 text-zinc-300">{dateClickModal.dateStr}</p>
//                         </div>

//                         <div className="p-6 space-y-3">
//                             {dateClickModal.candidates.map((t) => (
//                                 <button
//                                     key={t.id}
//                                     onClick={async () => {

//                                         setDateClickModal({
//                                             open: false,
//                                             dateStr: "",
//                                             candidates: [],
//                                         });

//                                         await loadTableForm(
//                                             t.id,
//                                             dateClickModal.dateStr
//                                         );

//                                         setCreateEventModal({
//                                             open: true,
//                                             tableId: t.id,
//                                             dateStr: dateClickModal.dateStr,
//                                             title: "",
//                                             saving: false,
//                                         });

//                                     }}
//                                     className="w-full rounded-xl border border-zinc-800 hover:border-blue-500 bg-zinc-950 px-4 py-3 text-right text-white"
//                                 >
//                                     <span className="inline-flex items-center gap-3">
//                                         <span
//                                             className="w-3 h-3 rounded-full"
//                                             style={{ backgroundColor: t.color }}
//                                         />
//                                         {t.name}
//                                     </span>
//                                 </button>
//                             ))}

//                             <button
//                                 onClick={() => {

//                                     setDateClickModal({
//                                         open: false,
//                                         dateStr: "",
//                                         candidates: [],
//                                     });

//                                 }}
//                                 className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-3 text-white"
//                             >
//                                 إلغاء
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {createEventModal.open && (
//                 <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">

//                     <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700">

//                         <div className="p-6 border-b border-zinc-800">

//                             <h2 className="text-xl font-bold text-white">
//                                 إضافة حدث جديد
//                             </h2>

//                             <p className="text-zinc-400 mt-2">
//                                 {createEventModal.dateStr}
//                             </p>

//                         </div>

//                         <div className="p-6">

//                             {loadingForm ? (
//                                 <div className="text-zinc-400">
//                                     جاري تحميل الحقول...
//                                 </div>
//                             ) : (
//                                 <DynamicFormRenderer
//                                     columns={formColumns}
//                                     values={formData}
//                                     onChange={setFormData}
//                                 />
//                             )}

//                             {createEventError && (
//                                 <div className="text-red-400 mt-3">
//                                     {createEventError}
//                                 </div>
//                             )}

//                         </div>

//                         <div className="flex justify-end gap-3 p-6 border-t border-zinc-800">

//                             <button
//                                 onClick={() =>
//                                     setCreateEventModal({
//                                         open: false,
//                                         tableId: null,
//                                         dateStr: "",
//                                         title: "",
//                                         saving: false,
//                                     })
//                                 }
//                                 className="px-5 py-2 rounded-lg bg-zinc-700 text-white"
//                             >
//                                 إلغاء
//                             </button>

//                             <button
//                                 disabled={createEventModal.saving}
//                                 onClick={createCalendarEvent}
//                                 className="px-5 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
//                             >
//                                 {createEventModal.saving
//                                     ? "جارٍ الحفظ..."
//                                     : "حفظ"}
//                             </button>

//                         </div>

//                     </div>

//                 </div>
//             )}

//             {editEventModal.open && (
//                 <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">

//                     <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-700">

//                         <div className="border-b border-zinc-800 p-6">

//                             <h2 className="text-2xl font-bold text-white">
//                                 تعديل الحدث
//                             </h2>

//                             <p className="text-zinc-400 mt-2">
//                                 {selectedEvent?.table_name}
//                             </p>

//                         </div>

//                         <div className="p-6">

//                             {editEventModal.loading ? (

//                                 <div className="text-center text-zinc-400">
//                                     جاري تحميل البيانات...
//                                 </div>

//                             ) : (

//                                 <DynamicFormRenderer
//                                     columns={editFormColumns}
//                                     values={editFormData}
//                                     onChange={setEditFormData}
//                                 />

//                             )}

//                             {editEventError && (

//                                 <div className="text-red-500 mt-4">

//                                     {editEventError}

//                                 </div>

//                             )}

//                         </div>

//                         <div className="border-t border-zinc-800 p-6 flex justify-end gap-3">

//                             <button
//                                 onClick={() =>
//                                     setEditEventModal({
//                                         open: false,
//                                         loading: false,
//                                         saving: false,
//                                     })
//                                 }
//                                 className="px-5 py-2 rounded-lg bg-zinc-700 text-white"
//                             >
//                                 إلغاء
//                             </button>

//                             <button
//                                 onClick={saveEditedEvent}
//                                 disabled={editEventModal.saving}
//                                 className="px-5 py-2 rounded-lg bg-blue-600 text-white"
//                             >
//                                 {editEventModal.saving
//                                     ? "جارٍ الحفظ..."
//                                     : "حفظ التعديلات"}
//                             </button>

//                         </div>

//                     </div>

//                 </div>
//             )}

//             {/* نافذة تفاصيل الحدث */}
//             {selectedEvent && !editEventModal.open && (
//                 <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
//                     <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden">
//                         <div
//                             className="p-6 text-white"
//                             style={{ background: selectedEvent.color }}
//                         >
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
//                                     <p className="text-sm opacity-80 mt-2">{selectedEvent.table_name}</p>
//                                 </div>
//                                 <Calendar size={34} />
//                             </div>
//                         </div>

//                         <div className="p-6 space-y-5">
//                             <div>
//                                 <div className="text-xs text-zinc-500">القسم</div>
//                                 <div className="text-white mt-1">{selectedEvent.section_name}</div>
//                             </div>

//                             <div>
//                                 <div className="text-xs text-zinc-500">البداية</div>
//                                 <div className="text-white mt-1">
//                                     {new Date(selectedEvent.start).toLocaleString("ar-SA")}
//                                 </div>
//                             </div>

//                             {selectedEvent.end && (
//                                 <div>
//                                     <div className="text-xs text-zinc-500">النهاية</div>
//                                     <div className="text-white mt-1">
//                                         {new Date(selectedEvent.end).toLocaleString("ar-SA")}
//                                     </div>
//                                 </div>
//                             )}

//                             {selectedEvent.description && (
//                                 <div>
//                                     <div className="text-xs text-zinc-500">الوصف</div>
//                                     <div className="text-white mt-1 whitespace-pre-wrap">
//                                         {selectedEvent.description}
//                                     </div>
//                                 </div>
//                             )}

//                             <div>
//                                 <div className="text-xs text-zinc-500">رقم السجل</div>
//                                 <div className="text-white">#{selectedEvent.row_id}</div>
//                             </div>

//                             {eventDetails?.columns?.length > 0 && (

//                                 <div className="mt-6 border-t border-zinc-700 pt-5">

//                                     <h3 className="text-sm font-semibold text-zinc-300 mb-4">

//                                         تفاصيل السجل

//                                     </h3>

//                                     <div className="space-y-4">

//                                         {eventDetails.columns.map((column) => (

//                                             <div
//                                                 key={column.id}
//                                                 className="flex flex-col gap-1"
//                                             >

//                                                 <span className="text-xs text-zinc-400">

//                                                     {column.name}

//                                                 </span>

//                                                 <span className="text-white">

//                                                     {eventDetails.cells_data?.[column.id] || "-"}

//                                                 </span>

//                                             </div>

//                                         ))}

//                                     </div>

//                                 </div>

//                             )}

//                             <div className="flex justify-end gap-3 pt-5">

//                                 <button
//                                     onClick={deleteEvent}
//                                     className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
//                                 >
//                                     حذف
//                                 </button>

//                                 <button
//                                     onClick={openEditEvent}
//                                     className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white"
//                                 >
//                                     تعديل
//                                 </button>

//                                 <button
//                                     onClick={() => setSelectedEvent(null)}
//                                     className="px-5 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white"
//                                 >
//                                     إغلاق
//                                 </button>

//                                 <button
//                                     onClick={() => {
//                                         router.push(
//                                             `/dashboard/dynamic/${selectedEvent.table_id}?row=${selectedEvent.row_id}`
//                                         );
//                                     }}
//                                     className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
//                                 >
//                                     فتح السجل
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Loading بسيط أثناء حفظ drag/drop resize */}
//             {calendarSaving && (
//                 <div className="fixed bottom-5 right-5 z-50 bg-zinc-900/90 border border-zinc-700 rounded-xl px-4 py-3 text-white flex items-center gap-3 shadow">
//                     <span className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
//                     جاري حفظ تعديل الحدث...
//                 </div>
//             )}
//         </div>
//     );
// }




"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { dynamicService } from "@/services/dynamicService";
import { useRouter } from "next/navigation";

import FullCalendar from "@fullcalendar/react";

import "./calendar-modern.css";

import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { useAuth } from "@/context/AuthContext";
import arLocale from "@fullcalendar/core/locales/ar";

import DynamicFormRenderer from "@/components/dynamic/DynamicFormRenderer";

import {
    Calendar,
    Search,
    Filter,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
} from "lucide-react";

export default function CalendarPage() {
    const calendarRef = useRef(null);
    // مرجع لحفظ توقيت آخر نقرة ومكانها لتحديد النقر المزدوج
    const lastClickRef = useRef({ time: 0, dateStr: "" });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { user } = useAuth();

    const [sections, setSections] = useState([]);
    const [tables, setTables] = useState([]);
    const [events, setEvents] = useState([]);

    const [search, setSearch] = useState("");
    const [selectedTables, setSelectedTables] = useState([]);

    const [selectedEvent, setSelectedEvent] = useState(null);

    const [currentView, setCurrentView] = useState("dayGridMonth");
    const [currentTitle, setCurrentTitle] = useState("");

    const [editEventModal, setEditEventModal] = useState({
        open: false,
        loading: false,
        saving: false,
    });

    const [editFormColumns, setEditFormColumns] = useState([]);
    const [editFormData, setEditFormData] = useState({});
    const [editCalendarMapping, setEditCalendarMapping] = useState({});
    const [editEventError, setEditEventError] = useState("");
    const [editingEvent, setEditingEvent] = useState(null);

    const [eventDetails, setEventDetails] = useState(null);

    const [eventDetailsLoading, setEventDetailsLoading] = useState(false);

    const [eventDetailsError, setEventDetailsError] = useState("");

    const pagePermission = useMemo(() => {
        if (
            user?.role?.toLowerCase() === "admin" ||
            user?.is_superuser
        ) {
            return "write";
        }

        return user?.system_pages?.calendar || "no_access";
    }, [user]);

    const hasPermission = (type) => {
        if (user?.role === "ADMIN" || user?.is_superuser) {
            return true;
        }

        if (type === "read") {
            return pagePermission === "read" || pagePermission === "write";
        }

        if (type === "write") {
            return pagePermission === "write";
        }

        return false;
    };

    console.log("User:", user);
    console.log("Permissions:", user?.permissions);
    console.log("Calendar Permission:", pagePermission);


    const openEditEvent = async () => {
        if (!hasPermission("write")) return;
        setEditingEvent(selectedEvent);

        try {
            setEditEventError("");

            setEditEventModal({
                open: true,
                loading: true,
                saving: false,
            });

            const token = localStorage.getItem("token");

            const [formRes, rowRes] = await Promise.all([
                fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/dynamic/tables/${selectedEvent.table_id}/form`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                ),
                fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/dynamic/rows/${selectedEvent.row_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                ),
            ]);

            if (!formRes.ok || !rowRes.ok) {
                throw new Error("تعذر تحميل بيانات السجل.");
            }

            const form = await formRes.json();
            const row = await rowRes.json();

            setEditFormColumns(form.columns || []);
            setEditCalendarMapping(form.calendar_mapping || {});
            setEditFormData(row.cells_data || {});

            setEditEventModal({
                open: true,
                loading: false,
                saving: false,
            });

        } catch (err) {

            console.error(err);

            setEditEventError(err.message);

            setEditEventModal({
                open: false,
                loading: false,
                saving: false,
            });

        }
    };

    const saveEditedEvent = async () => {
        if (!hasPermission("write")) return;
        try {

            setEditEventModal((prev) => ({
                ...prev,
                saving: true,
            }));

            setEditEventError("");

            if (!editingEvent) return;

            await dynamicService.updateCalendarRow(
                editingEvent.row_id,
                editFormData
            );
            // إعادة تحميل أحداث التقويم
            await refreshEventsOnly();

            // إغلاق نافذة التعديل
            setEditEventModal({
                open: false,
                loading: false,
                saving: false,
            });

            setEditingEvent(null);

            setSelectedEvent(null);

        } catch (err) {

            console.error(err);

            setEditEventError(
                err?.response?.data?.detail ||
                err.message ||
                "حدث خطأ أثناء الحفظ."
            );

            setEditEventModal((prev) => ({
                ...prev,
                saving: false,
            }));

        }
    };

    const deleteEvent = async () => {
        if (!hasPermission("write")) return;

        const event = editingEvent || selectedEvent;

        if (!event) return;

        const confirmDelete = window.confirm(
            "هل تريد حذف هذا الحدث؟"
        );

        if (!confirmDelete) return;

        try {

            await dynamicService.deleteCalendarRow(
                event.row_id
            );

            await refreshEventsOnly();

            setSelectedEvent(null);

        } catch (err) {

            console.error(err);

            alert(
                err?.response?.data?.detail ||
                "تعذر حذف الحدث."
            );

        }

    };

    // Modal بسيط ل dateClick عند وجود أكثر من جدول
    const [dateClickModal, setDateClickModal] = useState({
        open: false,
        dateStr: "",
        candidates: [],
    });

    // Modal لإنشاء حدث داخل نفس صفحة التقويم
    const [createEventModal, setCreateEventModal] = useState({
        open: false,
        tableId: null,
        dateStr: "",
        title: "",
        saving: false,
    });


    const [createEventError, setCreateEventError] = useState("");

    const [formColumns, setFormColumns] = useState([]);
    const [formData, setFormData] = useState({});
    const [calendarMapping, setCalendarMapping] = useState({});
    const [loadingForm, setLoadingForm] = useState(false);

    const router = useRouter();

    const [calendarSaving, setCalendarSaving] = useState(false);

    //-------------------------------------------------
    // تحميل البيانات + الأحداث
    //-------------------------------------------------
    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const sectionsData = await dynamicService.getSections();
            setSections(sectionsData);

            // استخراج الجداول المفعلة للتقويم
            const calendarTables = [];

            sectionsData.forEach((section) => {
                (section.tables || []).forEach((table) => {
                    if (table.calendar_mapping && table.calendar_mapping.enabled) {
                        calendarTables.push({
                            id: table.id,
                            name: table.name,
                            section: section.title,
                            color: table.calendar_mapping.color || "#3b82f6",
                        });
                    }
                });
            });

            setTables(calendarTables);

            const calendarEvents = await dynamicService.getCalendarEvents();
            setEvents(calendarEvents);
        } catch (err) {
            console.error(err);
            setError("تعذر تحميل بيانات التقويم");
        } finally {
            setLoading(false);
        }
    };

    //-------------------------------------------------
    // تحديث الأحداث فقط
    //-------------------------------------------------
    const refreshEventsOnly = async () => {
        try {
            const calendarEvents = await dynamicService.getCalendarEvents();
            setEvents(calendarEvents);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // تحديث تلقائي عند إعادة التركيز على الصفحة
    useEffect(() => {
        const onFocus = () => {
            refreshEventsOnly();
        };
        window.addEventListener("focus", onFocus);

        refreshEventsOnly();

        return () => window.removeEventListener("focus", onFocus);
    }, []);

    //-------------------------------------------------
    // الفلاتر
    //-------------------------------------------------
    const filteredEvents = useMemo(() => {
        let result = [...events];

        if (selectedTables.length > 0) {
            result = result.filter((event) => selectedTables.includes(event.table_id));
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((event) => {
                return (
                    (event.title || "").toLowerCase().includes(q) ||
                    (event.description || "").toLowerCase().includes(q) ||
                    (event.table_name || "").toLowerCase().includes(q)
                );
            });
        }

        return result.map((event) => ({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            backgroundColor: event.color,
            borderColor: event.color,
            editable: event.editable,
            allDay: event.all_day,
            extendedProps: event,
        }));
    }, [events, selectedTables, search]);

    //-------------------------------------------------
    // تبديل الجدول
    //-------------------------------------------------
    const toggleTable = (tableId) => {
        setSelectedTables((prev) => {
            if (prev.includes(tableId)) {
                return prev.filter((id) => id !== tableId);
            }
            return [...prev, tableId];
        });
    };

    //-------------------------------------------------
    // أدوات التقويم
    //-------------------------------------------------
    const goToday = () => {
        calendarRef.current?.getApi()?.today();
    };

    const goPrev = () => {
        calendarRef.current?.getApi()?.prev();
    };

    const goNext = () => {
        calendarRef.current?.getApi()?.next();
    };

    const changeView = (view) => {
        setCurrentView(view);
        calendarRef.current?.getApi()?.changeView(view);
    };

    //-------------------------------------------------
    // الضغط على الحدث
    //-------------------------------------------------
    const handleEventClick = async (info) => {

        try {

            setEventDetailsLoading(true);

            setEventDetailsError("");

            const data =
                await dynamicService.getCalendarEvent(
                    info.event.id
                );

            setSelectedEvent(data.event);

            setEventDetails(data);

        } catch (err) {

            console.error(err);

            setEventDetailsError(
                err?.response?.data?.detail ||
                "تعذر تحميل تفاصيل الحدث."
            );

        } finally {

            setEventDetailsLoading(false);

        }

    };

    //-------------------------------------------------
    // eventDrop / eventResize
    //-------------------------------------------------
    const saveCalendarEventUpdate = async ({ eventId, start, end }) => {
        const payload = {
            start: start instanceof Date ? start.toISOString() : start,
            end: end ? (end instanceof Date ? end.toISOString() : end) : null,
            all_day: true,
        };

        const authToken =
            typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/dynamic/calendar/events/${eventId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                },
                body: JSON.stringify(payload),
            }
        );

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data?.detail || "فشل حفظ الحدث");
        }

        return res.json().catch(() => ({}));
    };

    const createCalendarEvent = async () => {
        if (!hasPermission("write")) return;
        try {

            setCreateEventError("");

            setCreateEventModal((prev) => ({
                ...prev,
                saving: true,
            }));

            await dynamicService.createCalendarEvent({
                table_id: createEventModal.tableId,
                cells_data: formData,
            });

            await refreshEventsOnly();

            setCreateEventModal({
                open: false,
                tableId: null,
                dateStr: "",
                title: "",
                saving: false,
            });

            setFormColumns([]);
            setFormData({});
            setCalendarMapping({});

        } catch (err) {

            console.error(err);

            setCreateEventError(
                err?.response?.data?.detail ||
                err?.message ||
                "تعذر إنشاء الحدث."
            );

            setCreateEventModal((prev) => ({
                ...prev,
                saving: false,
            }));

        }
    };

    const updateEventAndPersist = async (info, revert) => {
        if (!hasPermission("write")) {
            revert();
            return;
        }
        try {
            setCalendarSaving(true);

            const ev = info.event;
            const extended = ev.extendedProps;

            const eventId = `${extended.table_id}-${extended.row_id}`;

            await saveCalendarEventUpdate({
                eventId,
                start: ev.start,
                end: ev.end,
            });

            await refreshEventsOnly();

            setCalendarSaving(false);
        } catch (e) {
            console.error(e);
            revert();
            setCalendarSaving(false);
        }
    };

    const loadTableForm = async (tableId, dateStr) => {

        try {
            setLoadingForm(true);
            setCreateEventError("");

            const token = localStorage.getItem("token");

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/dynamic/tables/${tableId}/form`,
                {
                    headers: {
                        ...(token && {
                            Authorization: `Bearer ${token}`,
                        }),
                    },
                }
            );

            if (!res.ok) {
                throw new Error("تعذر تحميل نموذج الجدول");
            }

            const data = await res.json();

            setFormColumns(data.columns || []);
            setCalendarMapping(data.calendar_mapping || {});

            const values = {};

            (data.columns || []).forEach((column) => {
                values[column.id] = "";
            });

            const startField = data.calendar_mapping?.start_field;

            if (startField) {
                values[startField] = dateStr;
            }

            setFormData(values);



        } catch (e) {
            console.error(e);
            setCreateEventError(e.message);
        } finally {
            setLoadingForm(false);
        }
    };

    //-------------------------------------------------
    // dateClick: إنشاء سجل جديد بالضغط المزدوج فقط
    //-------------------------------------------------
    const handleDateClick = async (info) => {
        if (!hasPermission("write")) return;
        const now = Date.now();
        const prevClick = lastClickRef.current;

        // التحقق من أن النقرة الثانية تمت على نفس التاريخ وخلال أقل من 300 مللي ثانية
        if (prevClick.dateStr === info.dateStr && now - prevClick.time < 300) {
            // تصفير النقرة السابقة فوراً لتجنب استدعاءات متكررة سريعة جداً
            lastClickRef.current = { time: 0, dateStr: "" };

            const dateStr = info.dateStr; // YYYY-MM-DD

            const active =
                selectedTables.length > 0
                    ? tables.filter((t) => selectedTables.includes(t.id))
                    : tables;

            if (active.length === 1) {

                await loadTableForm(
                    active[0].id,
                    dateStr
                );

                setCreateEventModal({
                    open: true,
                    tableId: active[0].id,
                    dateStr,
                    title: "",
                    saving: false,
                });

                return;
            }
            // إذا كان هناك أكثر من جدول، نفتح Modal لاختيار الجدول أو إدخال بيانات الحدث
            if (active.length === 0) return;

            setDateClickModal({
                open: true,
                dateStr,
                candidates: active,
            });

        } else {
            // تخزين بيانات النقرة الأولى بانتظار الثانية
            lastClickRef.current = { time: now, dateStr: info.dateStr };
        }
    };

    //-------------------------------------------------
    // Loading / Error
    //-------------------------------------------------
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">

                <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl p-10 shadow-2xl">

                    <div className="flex flex-col items-center">

                        <div className="relative">

                            <div className="h-20 w-20 rounded-full border-[6px] border-cyan-500/20" />

                            <div className="absolute inset-0 h-20 w-20 animate-spin rounded-full border-[6px] border-transparent border-t-cyan-400 border-r-blue-500" />

                        </div>

                        <h2 className="mt-8 text-xl font-bold text-white">
                            جاري تحميل التقويم
                        </h2>

                        <p className="mt-2 text-center text-sm text-zinc-400 leading-6">
                            يتم تحميل الأحداث والجداول والبيانات الخاصة بالتقويم...
                        </p>

                    </div>

                </div>

            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">

                <div className="w-full max-w-lg rounded-3xl border border-red-900/60 bg-zinc-900 shadow-2xl overflow-hidden">

                    <div className="border-b border-red-900/50 bg-red-500/10 px-8 py-6">

                        <div className="flex items-center gap-4">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 text-3xl">

                                ⚠️

                            </div>

                            <div>

                                <h2 className="text-xl font-bold text-white">
                                    حدث خطأ
                                </h2>

                                <p className="text-sm text-red-300 mt-1">
                                    تعذر تحميل بيانات التقويم
                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="px-8 py-6">

                        <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-5">

                            <p className="text-red-300 leading-7">

                                {error}

                            </p>

                        </div>

                        <button
                            onClick={loadData}
                            className="mt-7 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 font-semibold text-white transition hover:scale-[1.02]"
                        >
                            إعادة المحاولة
                        </button>

                    </div>

                </div>

            </div>
        );
    }

    if (!hasPermission("read")) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">

                <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-10 shadow-2xl">

                    <div className="flex flex-col items-center text-center">

                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 text-5xl">

                            🔒

                        </div>

                        <h2 className="mt-8 text-2xl font-bold text-white">

                            ليس لديك صلاحية

                        </h2>

                        <p className="mt-4 leading-7 text-zinc-400">

                            لا تملك صلاحية الوصول إلى صفحة التقويم.
                            يرجى التواصل مع مدير النظام للحصول على الصلاحيات المناسبة.

                        </p>

                    </div>

                </div>

            </div>
        );
    }

    return (
        <div className="mr-64 flex h-[calc(100vh-70px)] overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-950 to-black">
            <aside className="w-80 border-r border-zinc-800 bg-zinc-900 flex flex-col">
                <div className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 px-6 py-7">

                    <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">

                            <CalendarDays className="h-7 w-7 text-white" />

                        </div>

                        <div>

                            <h1 className="text-xl font-bold tracking-wide text-white">

                                التقويم

                            </h1>

                            <p className="mt-1 text-sm text-zinc-400">

                                Dynamic Calendar Workspace

                            </p>

                        </div>

                    </div>

                </div>

                <div className="border-b border-zinc-800 px-5 py-5">

                    <div className="relative">

                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                        />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث عن جدول..."
                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                        />

                    </div>

                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-6">
                    <div className="mb-5 flex items-center justify-between">

                        <div>

                            <h3 className="font-semibold text-zinc-200">

                                الجداول

                            </h3>

                            <p className="mt-1 text-xs text-zinc-500">

                                اختر الجداول التي تريد عرضها

                            </p>

                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-2">

                            <Filter
                                size={16}
                                className="text-zinc-400"
                            />

                        </div>

                    </div>

                    {tables.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 px-6 py-8 text-center">

                            <div className="text-4xl">

                                📂

                            </div>

                            <p className="mt-4 text-sm text-zinc-400">

                                لا توجد جداول مفعلة

                            </p>

                        </div>
                    )}

                    {tables.map((table) => {
                        const active = selectedTables.includes(table.id);
                        const count = events.filter((e) => e.table_id === table.id).length;

                        return (
                            <button
                                key={table.id}
                                onClick={() => toggleTable(table.id)}
                                className={`group relative mb-3 w-full overflow-hidden rounded-2xl border p-4 text-right transition-all duration-300 ${active
                                    ? "border-cyan-500 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 shadow-lg shadow-cyan-500/10"
                                    : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-900 hover:shadow-lg"
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="relative mt-1 h-5 w-5 shrink-0 rounded-full ring-2 ring-white/5"
                                        style={{
                                            background: table.color
                                        }}
                                    >

                                        <div
                                            className="absolute inset-0 rounded-full animate-pulse opacity-40"
                                            style={{
                                                background: table.color
                                            }}
                                        />

                                    </div>
                                    <div>

                                        <div className="font-semibold text-white">

                                            {table.name}

                                        </div>

                                        <div className="mt-1 text-xs text-zinc-500">

                                            {table.section}

                                        </div>

                                        <div className="mt-3 flex items-center justify-between">

                                            <span className="text-xs text-zinc-500">

                                                الأحداث

                                            </span>

                                            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">

                                                {count}

                                            </span>

                                        </div>

                                    </div>
                                </div>

                                {active && (

                                    <div className="absolute inset-y-0 right-0 w-1 rounded-full bg-cyan-400" />

                                )}
                            </button>
                        );
                    })}
                </div>
            </aside>

            <main className="flex-1 flex flex-col">
                <div className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 px-7 py-5">

                    <div className="flex items-center justify-between gap-6">

                        {/* Navigation */}

                        <div className="flex items-center gap-3">

                            <div className="flex items-center rounded-2xl border border-zinc-800 bg-zinc-900 p-1">

                                <button
                                    onClick={goPrev}
                                    className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-300 transition-all duration-200 hover:bg-zinc-800 hover:text-white"
                                >
                                    <ChevronRight size={20} />
                                </button>

                                <button
                                    onClick={goNext}
                                    className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-300 transition-all duration-200 hover:bg-zinc-800 hover:text-white"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                            </div>

                            <button
                                onClick={goToday}
                                className="rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]"
                            >
                                اليوم
                            </button>

                        </div>

                        {/* Title */}

                        <div className="flex flex-col items-center">

                            <span className="text-xs uppercase tracking-[0.25em] text-zinc-500">

                                Calendar

                            </span>

                            <h2 className="mt-1 text-2xl font-bold text-white">

                                {currentTitle}

                            </h2>

                        </div>

                        {/* Right Actions */}

                        <div className="flex items-center gap-3">

                            <div className="flex rounded-2xl border border-zinc-800 bg-zinc-900 p-1">

                                <button
                                    onClick={() => changeView("dayGridMonth")}
                                    className={`rounded-xl px-5 py-2 text-sm font-medium transition-all ${currentView === "dayGridMonth"
                                        ? "bg-cyan-600 text-white shadow"
                                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                        }`}
                                >
                                    شهر
                                </button>

                                <button
                                    onClick={() => changeView("timeGridWeek")}
                                    className={`rounded-xl px-5 py-2 text-sm font-medium transition-all ${currentView === "timeGridWeek"
                                        ? "bg-cyan-600 text-white shadow"
                                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                        }`}
                                >
                                    أسبوع
                                </button>

                                <button
                                    onClick={() => changeView("timeGridDay")}
                                    className={`rounded-xl px-5 py-2 text-sm font-medium transition-all ${currentView === "timeGridDay"
                                        ? "bg-cyan-600 text-white shadow"
                                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                        }`}
                                >
                                    يوم
                                </button>

                            </div>

                            <button
                                onClick={loadData}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-300 transition-all hover:border-cyan-500 hover:text-cyan-400"
                            >
                                <RefreshCcw
                                    size={18}
                                    className={loading || calendarSaving ? "animate-spin" : ""}
                                />
                            </button>

                        </div>

                    </div>

                </div>

                <div className="flex-1 overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6">
                    <div className="h-full overflow-hidden rounded-3xl border border-zinc-800 bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-8 py-5">

                            <div>

                                <h3 className="text-lg font-semibold text-zinc-800">

                                    Calendar Workspace

                                </h3>

                                <p className="mt-1 text-sm text-zinc-500">

                                    إدارة جميع الأحداث في مكان واحد

                                </p>

                            </div>

                            <div className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700">

                                {filteredEvents.length} حدث

                            </div>

                        </div>

                        <FullCalendar
                            nowIndicator={true}
                            navLinks={true}
                            stickyHeaderDates={true}
                            dayMaxEvents={true}
                            eventDisplay="block"

                            ref={calendarRef}
                            datesSet={(info) => setCurrentTitle(info.view.title)}

                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                            locale={arLocale}
                            direction="rtl"
                            initialView="dayGridMonth"
                            height="calc(100vh - 220px)"

                            editable={true}
                            selectable={true}
                            weekends={true}
                            headerToolbar={false}

                            events={filteredEvents}
                            eventClick={handleEventClick}
                            dateClick={handleDateClick}

                            eventDrop={(info) => {
                                const revert = () => info.revert();
                                updateEventAndPersist(info, revert);
                            }}

                            eventResize={(info) => {
                                const revert = () => info.revert();
                                updateEventAndPersist(info, revert);
                            }}

                            loading={(isLoadingCb) => {
                                void isLoadingCb;
                            }}

                            eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
                            moreLinkClick="popover"

                            dayHeaderClassNames="fc-modern-header"

                            eventClassNames="fc-modern-event"

                            viewClassNames="fc-modern-view"
                        />
                    </div>
                </div>
            </main>

            {/* Modal اختيار جدول عند النقر المزدوج */}
            {dateClickModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

                    <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,.35)]">

                        {/* Header */}

                        <div className="border-b border-slate-200 px-8 py-7">

                            <div className="flex items-center gap-4">

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">

                                    <CalendarDays className="h-7 w-7 text-white" />

                                </div>

                                <div>

                                    <h2 className="text-2xl font-bold text-slate-900">

                                        اختيار جدول

                                    </h2>

                                    <p className="mt-2 text-sm text-slate-500">

                                        اختر الجدول الذي تريد إنشاء سجل جديد داخله.

                                    </p>

                                </div>

                            </div>

                            <div className="mt-5 inline-flex rounded-xl bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700">

                                {dateClickModal.dateStr}

                            </div>

                        </div>

                        {/* Body */}

                        <div className="max-h-[420px] space-y-3 overflow-y-auto p-6">

                            {dateClickModal.candidates.map((t) => (

                                <button
                                    key={t.id}
                                    onClick={async () => {

                                        setDateClickModal({
                                            open: false,
                                            dateStr: "",
                                            candidates: [],
                                        });

                                        await loadTableForm(
                                            t.id,
                                            dateClickModal.dateStr
                                        );

                                        setCreateEventModal({
                                            open: true,
                                            tableId: t.id,
                                            dateStr: dateClickModal.dateStr,
                                            title: "",
                                            saving: false,
                                        });

                                    }}
                                    className="group w-full rounded-2xl border border-slate-200 bg-white p-5 text-right transition-all duration-300 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-100"
                                >

                                    <div className="flex items-center gap-4">

                                        <div
                                            className="h-5 w-5 rounded-full ring-4 ring-slate-100"
                                            style={{
                                                backgroundColor: t.color
                                            }}
                                        />

                                        <div className="flex-1">

                                            <div className="font-semibold text-slate-900 group-hover:text-cyan-700">

                                                {t.name}

                                            </div>

                                            <div className="mt-1 text-xs text-slate-500">

                                                Dynamic Table

                                            </div>

                                        </div>

                                        <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition group-hover:bg-cyan-50 group-hover:text-cyan-700">

                                            اختيار

                                        </div>

                                    </div>

                                </button>

                            ))}

                        </div>

                        {/* Footer */}

                        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5">

                            <button
                                onClick={() => {

                                    setDateClickModal({
                                        open: false,
                                        dateStr: "",
                                        candidates: [],
                                    });

                                }}
                                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                                إلغاء
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {createEventModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

                    <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,.35)]">

                        {/* Header */}

                        <div className="border-b border-slate-200 px-8 py-7">

                            <div className="flex items-center gap-4">

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">

                                    <CalendarDays className="h-7 w-7 text-white" />

                                </div>

                                <div className="flex-1">

                                    <h2 className="text-2xl font-bold text-slate-900">

                                        إضافة حدث جديد

                                    </h2>

                                    <p className="mt-2 text-sm text-slate-500">

                                        أنشئ حدثًا جديدًا في التاريخ المحدد.

                                    </p>

                                </div>

                                <div className="rounded-xl bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700">

                                    {createEventModal.dateStr}

                                </div>

                            </div>

                        </div>

                        {/* Body */}

                        <div className="max-h-[65vh] overflow-y-auto p-8">

                            {loadingForm ? (

                                <div className="flex flex-col items-center justify-center py-16">

                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />

                                    <p className="mt-5 text-slate-500">

                                        جاري تحميل الحقول...

                                    </p>

                                </div>

                            ) : (

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

                                    <DynamicFormRenderer
                                        theme="light"
                                        columns={formColumns}
                                        values={formData}
                                        onChange={setFormData}
                                    />

                                </div>

                            )}

                            {createEventError && (

                                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

                                    {createEventError}

                                </div>

                            )}

                        </div>

                        {/* Footer */}

                        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-8 py-5">

                            <span className="text-sm text-slate-500">

                                سيتم إنشاء سجل جديد داخل الجدول المحدد.

                            </span>

                            <div className="flex gap-3">

                                <button
                                    onClick={() =>
                                        setCreateEventModal({
                                            open: false,
                                            tableId: null,
                                            dateStr: "",
                                            title: "",
                                            saving: false,
                                        })
                                    }
                                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100"
                                >
                                    إلغاء
                                </button>

                                <button
                                    disabled={createEventModal.saving}
                                    onClick={createCalendarEvent}
                                    className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 font-medium text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {createEventModal.saving
                                        ? "جارٍ الحفظ..."
                                        : "حفظ الحدث"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}

            {editEventModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

                    <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,.35)]">

                        {/* Header */}

                        <div className="border-b border-slate-200 px-8 py-7">

                            <div className="flex items-center gap-4">

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">

                                    <Calendar className="h-7 w-7 text-white" />

                                </div>

                                <div className="flex-1">

                                    <h2 className="text-2xl font-bold text-slate-900">
                                        تعديل الحدث
                                    </h2>

                                    <p className="mt-2 text-sm text-slate-500">
                                        قم بتعديل بيانات الحدث ثم احفظ التغييرات.
                                    </p>

                                </div>

                                <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">

                                    {selectedEvent?.table_name}

                                </div>

                            </div>

                        </div>

                        {/* Body */}

                        <div className="max-h-[65vh] overflow-y-auto p-8">

                            {editEventModal.loading ? (

                                <div className="flex flex-col items-center justify-center py-20">

                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />

                                    <p className="mt-5 text-slate-500">
                                        جاري تحميل بيانات الحدث...
                                    </p>

                                </div>

                            ) : (

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

                                    <DynamicFormRenderer
                                        theme="light"
                                        columns={editFormColumns}
                                        values={editFormData}
                                        onChange={setEditFormData}
                                    />

                                </div>

                            )}

                            {editEventError && (

                                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

                                    {editEventError}

                                </div>

                            )}

                        </div>

                        {/* Footer */}

                        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-8 py-5">

                            <span className="text-sm text-slate-500">
                                سيتم تحديث بيانات الحدث بعد الحفظ.
                            </span>

                            <div className="flex gap-3">

                                <button
                                    onClick={() =>
                                        setEditEventModal({
                                            open: false,
                                            loading: false,
                                            saving: false,
                                        })
                                    }
                                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100"
                                >
                                    إلغاء
                                </button>

                                <button
                                    onClick={saveEditedEvent}
                                    disabled={editEventModal.saving}
                                    className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 font-medium text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {editEventModal.saving
                                        ? "جارٍ الحفظ..."
                                        : "حفظ التعديلات"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}

            {/* نافذة تفاصيل الحدث */}
            {selectedEvent && !editEventModal.open && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

        <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,.35)]">

            {/* Header */}

            <div
                className="relative overflow-hidden px-8 py-8 text-white"
                style={{
                    background: `linear-gradient(135deg, ${selectedEvent.color}, ${selectedEvent.color}CC)`
                }}
            >

                <div className="absolute inset-0 bg-black/10" />

                <div className="relative flex items-center justify-between">

                    <div>

                        <div className="mb-3 inline-flex rounded-full bg-white/20 px-4 py-1 text-xs font-medium backdrop-blur">

                            {selectedEvent.table_name}

                        </div>

                        <h2 className="text-3xl font-bold">

                            {selectedEvent.title}

                        </h2>

                        <p className="mt-3 text-white/90">

                            تفاصيل الحدث والسجل المرتبط به

                        </p>

                    </div>

                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">

                        <Calendar size={38} />

                    </div>

                </div>

            </div>

            {/* Body */}

            <div className="max-h-[65vh] overflow-y-auto p-8">

                <div className="grid gap-5 md:grid-cols-2">

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                        <div className="text-xs uppercase tracking-wider text-slate-500">
                            القسم
                        </div>

                        <div className="mt-2 font-semibold text-slate-900">
                            {selectedEvent.section_name}
                        </div>

                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                        <div className="text-xs uppercase tracking-wider text-slate-500">
                            رقم السجل
                        </div>

                        <div className="mt-2 font-semibold text-slate-900">
                            #{selectedEvent.row_id}
                        </div>

                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                        <div className="text-xs uppercase tracking-wider text-slate-500">
                            البداية
                        </div>

                        <div className="mt-2 font-medium text-slate-900">

                            {new Date(selectedEvent.start).toLocaleString("ar-SA")}

                        </div>

                    </div>

                    {selectedEvent.end && (

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                            <div className="text-xs uppercase tracking-wider text-slate-500">
                                النهاية
                            </div>

                            <div className="mt-2 font-medium text-slate-900">

                                {new Date(selectedEvent.end).toLocaleString("ar-SA")}

                            </div>

                        </div>

                    )}

                </div>

                {selectedEvent.description && (

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">

                        <div className="text-xs uppercase tracking-wider text-slate-500">

                            الوصف

                        </div>

                        <div className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">

                            {selectedEvent.description}

                        </div>

                    </div>

                )}

                {eventDetails?.columns?.length > 0 && (

                    <div className="mt-8">

                        <div className="mb-5 flex items-center justify-between">

                            <h3 className="text-lg font-semibold text-slate-900">

                                تفاصيل السجل

                            </h3>

                            <span className="rounded-full bg-slate-100 px-4 py-1 text-xs font-medium text-slate-600">

                                {eventDetails.columns.length} حقل

                            </span>

                        </div>

                        <div className="overflow-hidden rounded-2xl border border-slate-200">

                            {eventDetails.columns.map((column, index) => (

                                <div
                                    key={column.id}
                                    className={`grid grid-cols-[220px_1fr] gap-6 px-6 py-4 ${
                                        index !== eventDetails.columns.length - 1
                                            ? "border-b border-slate-200"
                                            : ""
                                    }`}
                                >

                                    <div className="font-medium text-slate-500">

                                        {column.name}

                                    </div>

                                    <div className="break-words text-slate-900">

                                        {eventDetails.cells_data?.[column.id] || "-"}

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                )}

            </div>

            {/* Footer */}

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-8 py-5">

                <button
                    onClick={() => {
                        router.push(
                            `/dashboard/dynamic/${selectedEvent.table_id}?row=${selectedEvent.row_id}`
                        );
                    }}
                    className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2.5 font-medium text-white shadow-lg transition hover:scale-[1.02]"
                >
                    فتح السجل
                </button>

                <div className="flex gap-3">

                    <button
                        onClick={deleteEvent}
                        className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700"
                    >
                        حذف
                    </button>

                    <button
                        onClick={openEditEvent}
                        className="rounded-xl bg-amber-500 px-5 py-2.5 font-medium text-white transition hover:bg-amber-600"
                    >
                        تعديل
                    </button>

                    <button
                        onClick={() => setSelectedEvent(null)}
                        className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                        إغلاق
                    </button>

                </div>

            </div>

        </div>

    </div>
)}

            {/* Loading بسيط أثناء حفظ drag/drop resize */}
            {calendarSaving && (
                <div className="fixed bottom-5 right-5 z-50 bg-zinc-900/90 border border-zinc-700 rounded-xl px-4 py-3 text-white flex items-center gap-3 shadow">
                    <span className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    جاري حفظ تعديل الحدث...
                </div>
            )}
        </div>
    );
}