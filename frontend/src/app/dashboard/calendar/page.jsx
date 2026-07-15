"use client";

import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import { dynamicService } from "@/services/dynamicService";
import { useRouter } from "next/navigation";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

import arLocale from "@fullcalendar/core/locales/ar";

import {
    Calendar,
    Search,
    Filter,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
    CalendarDays
} from "lucide-react";

export default function CalendarPage() {

    const calendarRef = useRef(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [sections, setSections] = useState([]);

    const [tables, setTables] = useState([]);

    const [events, setEvents] = useState([]);

    const [search, setSearch] = useState("");

    const [selectedTables, setSelectedTables] = useState([]);

    const [selectedEvent, setSelectedEvent] = useState(null);

    const [currentView, setCurrentView] = useState("dayGridMonth");

    const router = useRouter();

    const [currentTitle, setCurrentTitle] = useState("");

    //-------------------------------------------------
    // تحميل البيانات
    //-------------------------------------------------

    const loadData = async () => {

        try {

            setLoading(true);

            setError("");

            const sectionsData =
                await dynamicService.getSections();

            setSections(sectionsData);

            //-------------------------------------------------
            // استخراج الجداول المفعلة للتقويم
            //-------------------------------------------------

            const calendarTables = [];

            sectionsData.forEach(section => {

                (section.tables || []).forEach(table => {

                    if (
                        table.calendar_mapping &&
                        table.calendar_mapping.enabled
                    ) {

                        calendarTables.push({

                            id: table.id,

                            name: table.name,

                            section: section.title,

                            color:
                                table.calendar_mapping.color ||
                                "#3b82f6"

                        });

                    }

                });

            });

            setTables(calendarTables);

            //-------------------------------------------------
            // تحميل الأحداث
            //-------------------------------------------------

            const calendarEvents =
                await dynamicService.getCalendarEvents();

            setEvents(calendarEvents);

        }

        catch (err) {

            console.error(err);

            setError("تعذر تحميل بيانات التقويم");

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadData();

    }, []);

    //-------------------------------------------------
    // الفلاتر
    //-------------------------------------------------

    const filteredEvents = useMemo(() => {

        let result = [...events];

        //------------------------------------------

        if (selectedTables.length > 0) {

            result = result.filter(event =>
                selectedTables.includes(event.table_id)
            );

        }

        //------------------------------------------

        if (search.trim()) {

            const q = search.toLowerCase();

            result = result.filter(event => {

                return (

                    (event.title || "")
                        .toLowerCase()
                        .includes(q)

                    ||

                    (event.description || "")
                        .toLowerCase()
                        .includes(q)

                    ||

                    (event.table_name || "")
                        .toLowerCase()
                        .includes(q)

                );

            });

        }

        //------------------------------------------

        return result.map(event => ({

            id: event.id,

            title: event.title,

            start: event.start,

            end: event.end,

            backgroundColor: event.color,

            borderColor: event.color,

            editable: event.editable,

            allDay: event.all_day,

            extendedProps: event

        }));

    }, [
        events,
        selectedTables,
        search
    ]);

    //-------------------------------------------------
    // تبديل الجدول
    //-------------------------------------------------

    const toggleTable = (tableId) => {

        setSelectedTables(prev => {

            if (prev.includes(tableId)) {

                return prev.filter(id => id !== tableId);

            }

            return [...prev, tableId];

        });

    };

    //-------------------------------------------------
    // أدوات التقويم
    //-------------------------------------------------

    const goToday = () => {

        calendarRef.current
            ?.getApi()
            .today();

    };

    const goPrev = () => {

        calendarRef.current
            ?.getApi()
            .prev();

    };

    const goNext = () => {

        calendarRef.current
            ?.getApi()
            .next();

    };

    const changeView = (view) => {

        setCurrentView(view);

        calendarRef.current
            ?.getApi()
            .changeView(view);

    };

    //-------------------------------------------------
    // الضغط على الحدث
    //-------------------------------------------------

    const handleEventClick = (info) => {

        setSelectedEvent(
            info.event.extendedProps
        );

    };

    //-------------------------------------------------
    // Loading
    //-------------------------------------------------

    if (loading) {

        return (

            <div className="flex items-center justify-center h-screen bg-zinc-950">

                <div className="text-center">

                    <div className="animate-spin w-14 h-14 rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />

                    <p className="mt-5 text-zinc-400">

                        جاري تحميل التقويم...

                    </p>

                </div>

            </div>

        );

    }

    //-------------------------------------------------

    if (error) {

        return (

            <div className="flex items-center justify-center h-screen bg-zinc-950">

                <div className="bg-red-900/30 border border-red-700 rounded-xl p-8">

                    <h2 className="text-red-400 font-bold">

                        {error}

                    </h2>

                    <button
                        onClick={loadData}
                        className="mt-5 bg-blue-600 px-5 py-2 rounded-lg"
                    >

                        إعادة المحاولة

                    </button>

                </div>

            </div>

        );

    }

    //-------------------------------------------------
    // يبدأ تصميم الصفحة
    //-------------------------------------------------

    return (
        <div className="mr-64 flex h-[calc(100vh-70px)] bg-zinc-950"> {/* تم فتح الـ div الرئيسي هنا وتم مسح الإغلاق الخاطئ */}

            <aside className="w-80 border-r border-zinc-800 bg-zinc-900 flex flex-col">

                {/* Header */}

                <div className="p-6 border-b border-zinc-800">

                    <div className="flex items-center gap-3">

                        <CalendarDays className="w-7 h-7 text-blue-500" />

                        <div>

                            <h1 className="text-xl font-bold text-white">

                                التقويم

                            </h1>

                            <p className="text-xs text-zinc-400 mt-1">

                                جميع الأحداث الديناميكية

                            </p>

                        </div>

                    </div>

                </div>

                {/* البحث */}

                <div className="p-5">

                    <div className="relative">

                        <Search
                            className="absolute left-3 top-3 text-zinc-500"
                            size={18}
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="بحث..."
                            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-10 pr-3 py-3 text-white outline-none focus:border-blue-500"
                        />

                    </div>

                </div>

                {/* الجداول */}

                <div className="flex-1 overflow-y-auto px-4 pb-6">

                    <div className="flex items-center justify-between mb-4">

                        <h3 className="text-sm font-semibold text-zinc-300">

                            الجداول

                        </h3>

                        <Filter
                            size={18}
                            className="text-zinc-500"
                        />

                    </div>

                    {tables.length === 0 && (

                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">

                            لا توجد جداول مفعلة للتقويم.

                        </div>

                    )}

                    {tables.map(table => {

                        const active =
                            selectedTables.includes(table.id);

                        const count = events.filter(
                            e => e.table_id === table.id
                        ).length;

                        return (

                            <button
                                key={table.id}
                                onClick={() =>
                                    toggleTable(table.id)
                                }
                                className={`w-full rounded-xl border p-3 mb-3 transition text-right ${active
                                    ? "border-blue-500 bg-blue-950/30"
                                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
                                    }`}
                            >

                                <div className="flex items-center gap-3">

                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{
                                            backgroundColor:
                                                table.color
                                        }}
                                    />

                                    <div>

                                        <div className="font-semibold text-white">

                                            {table.name}

                                        </div>

                                        <div className="text-xs text-zinc-500 mt-1">

                                            {table.section}

                                        </div>

                                        <div className="text-xs text-blue-400 mt-1">

                                            {count} حدث

                                        </div>

                                    </div>

                                </div>

                            </button>

                        );

                    })}

                </div>

            </aside>

            {/* ===================================================== */}
            {/* Calendar */}
            {/* ===================================================== */}

            <main className="flex-1 flex flex-col">

                {/* Toolbar */}

                <div className="border-b border-zinc-800 bg-zinc-900 px-6 py-4 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <button
                            onClick={goPrev}
                            className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center"
                        >
                            <ChevronRight size={20} />
                        </button>

                        <button
                            onClick={goNext}
                            className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <button
                            onClick={goToday}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                        >

                            اليوم

                        </button>

                    </div>

                    <div className="flex items-center gap-2">

                        <button
                            onClick={() =>
                                changeView("dayGridMonth")
                            }
                            className={`px-4 py-2 rounded-lg ${currentView === "dayGridMonth"
                                ? "bg-blue-600"
                                : "bg-zinc-800"
                                }`}
                        >
                            شهر
                        </button>

                        <button
                            onClick={() =>
                                changeView("timeGridWeek")
                            }
                            className={`px-4 py-2 rounded-lg ${currentView === "timeGridWeek"
                                ? "bg-blue-600"
                                : "bg-zinc-800"
                                }`}
                        >
                            أسبوع
                        </button>

                        <button
                            onClick={() =>
                                changeView("timeGridDay")
                            }
                            className={`px-4 py-2 rounded-lg ${currentView === "timeGridDay"
                                ? "bg-blue-600"
                                : "bg-zinc-800"
                                }`}
                        >
                            يوم
                        </button>

                        <h2 className="text-xl font-bold text-white">
                            {currentTitle}
                        </h2>

                        <button
                            onClick={loadData}
                            className="ml-3 w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center"
                        >
                            <RefreshCcw
                                size={18}
                                className={loading ? "animate-spin" : ""}
                            />
                        </button>

                    </div>

                </div>

                {/* التقويم */}

                <div className="flex-1 bg-zinc-50 p-4">

                    <FullCalendar

                        nowIndicator={true}

                        navLinks={true}

                        stickyHeaderDates={true}

                        dayMaxEvents={true}

                        eventDisplay="block"


                        ref={calendarRef}

                        datesSet={(info) => {
                            setCurrentTitle(info.view.title);
                        }}

                        plugins={[
                            dayGridPlugin,
                            timeGridPlugin,
                            interactionPlugin,
                            listPlugin
                        ]}

                        locale={arLocale}

                        direction="rtl"

                        initialView="dayGridMonth"

                        height="100%"

                        editable={true}

                        selectable={true}

                        weekends={true}

                        headerToolbar={false}

                        events={filteredEvents}

                        eventClick={handleEventClick}

                        dateClick={(info) => {

                            console.log(info.dateStr);

                        }}

                        eventTimeFormat={{
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false
                        }}

                        moreLinkClick="popover"

                    />

                </div>

            </main>

            {/* ===================================================== */}
            {/* نافذة تفاصيل الحدث */}
            {/* ===================================================== */}

            {selectedEvent && (

                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">

                    <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden">

                        <div
                            className="p-6 text-white"
                            style={{
                                background: selectedEvent.color
                            }}
                        >

                            <div className="flex items-center justify-between">

                                <div>

                                    <h2 className="text-2xl font-bold">

                                        {selectedEvent.title}

                                    </h2>

                                    <p className="text-sm opacity-80 mt-2">

                                        {selectedEvent.table_name}

                                    </p>

                                </div>

                                <Calendar size={34} />

                            </div>

                        </div>

                        <div className="p-6 space-y-5">

                            <div>

                                <div className="text-xs text-zinc-500">

                                    القسم

                                </div>

                                <div className="text-white mt-1">

                                    {selectedEvent.section_name}

                                </div>

                            </div>

                            <div>

                                <div className="text-xs text-zinc-500">

                                    البداية

                                </div>

                                <div className="text-white mt-1">

                                    {new Date(
                                        selectedEvent.start
                                    ).toLocaleString("ar-SA")}

                                </div>

                            </div>

                            {selectedEvent.end && (

                                <div>

                                    <div className="text-xs text-zinc-500">

                                        النهاية

                                    </div>

                                    <div className="text-white mt-1">

                                        {new Date(
                                            selectedEvent.end
                                        ).toLocaleString("ar-SA")}

                                    </div>

                                </div>

                            )}

                            {selectedEvent.description && (

                                <div>

                                    <div className="text-xs text-zinc-500">

                                        الوصف

                                    </div>

                                    <div className="text-white mt-1 whitespace-pre-wrap">

                                        {selectedEvent.description}

                                    </div>

                                </div>

                            )}

                            <div>

                                <div className="text-xs text-zinc-500">

                                    رقم السجل

                                </div>

                                <div className="text-white">

                                    #{selectedEvent.row_id}

                                </div>

                            </div>

                            <div className="flex justify-end gap-3 pt-5">

                                <button
                                    onClick={() =>
                                        setSelectedEvent(null)
                                    }
                                    className="px-5 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white"
                                >

                                    إغلاق

                                </button>

                                <button
                                    onClick={() => {

                                        router.push(
                                            `/dashboard/dynamic/${selectedEvent.table_id}?row=${selectedEvent.row_id}`
                                        );

                                    }}
                                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                                >

                                    فتح السجل

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}