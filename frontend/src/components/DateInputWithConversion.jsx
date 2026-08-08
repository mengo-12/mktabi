'use client';

import React, { useMemo, useState } from 'react';
import { Calendar, Repeat2 } from 'lucide-react';

export default function DateInputWithConversion({
    value,
    onChange,
    onBlur,
    type = 'date',
    disabled = false,
    className = '',
}) {
    const [isHijri, setIsHijri] = useState(false);

    // --------------------------------------------------
    // تحويل القيمة إلى Date للعرض فقط
    // --------------------------------------------------
    const date = useMemo(() => {
        if (!value) return null;

        const parsed = new Date(value);

        return isNaN(parsed.getTime()) ? null : parsed;
    }, [value]);

    const pad = (number) => {
        return String(number).padStart(2, '0');
    };

    const toEnglishDigits = (value) => {
        return String(value || '').replace(
            /[٠-٩]/g,
            (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))
        );
    };

    // --------------------------------------------------
    // التاريخ الميلادي DD/MM/YYYY
    // --------------------------------------------------
    const formatGregorian = () => {
        if (!date) return '';

        const day = pad(date.getDate());
        const month = pad(date.getMonth() + 1);
        const year = date.getFullYear();

        const formatted = `${day}/${month}/${year}`;

        if (type === 'datetime') {
            let hours = date.getHours();
            const minutes = pad(date.getMinutes());

            const period = hours >= 12 ? 'م' : 'ص';

            hours = hours % 12;

            if (hours === 0) {
                hours = 12;
            }

            return `${formatted} ${pad(hours)}:${minutes} ${period}`;
        }

        return formatted;
    };

    // --------------------------------------------------
    // التاريخ الهجري - أم القرى
    // --------------------------------------------------
    const formatHijri = () => {
        if (!date) return '';

        const formatter = new Intl.DateTimeFormat(
            'ar-SA-u-ca-islamic-umalqura',
            {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
            }
        );

        const parts = formatter.formatToParts(date);

        const day = parts.find(
            (part) => part.type === 'day'
        )?.value;

        const month = parts.find(
            (part) => part.type === 'month'
        )?.value;

        const year = parts.find(
            (part) => part.type === 'year'
        )?.value;

        const formatted =
            `${pad(toEnglishDigits(day))}/${pad(toEnglishDigits(month))}/${toEnglishDigits(year)}`;

        if (type === 'datetime') {
            let hours = date.getHours();
            const minutes = pad(date.getMinutes());

            const period = hours >= 12 ? 'م' : 'ص';

            hours = hours % 12;

            if (hours === 0) {
                hours = 12;
            }

            return `${formatted} ${pad(hours)}:${minutes} ${period}`;
        }

        return formatted;
    };

    // --------------------------------------------------
    // تغيير التاريخ الميلادي
    //
    // مهم:
    // عندما يكون العرض هجريًا لا نسمح بتغيير القيمة.
    // القيمة التي تصل إلى onChange تبقى ميلادية.
    // --------------------------------------------------
    const handleChange = (event) => {
        if (isHijri) return;

        onChange?.(event);
    };

    // --------------------------------------------------
    // لا توجد قيمة
    // --------------------------------------------------
    if (!value) {
        return (
            <div className={`relative ${className}`}>
                <input
                    type={
                        type === 'datetime'
                            ? 'datetime-local'
                            : 'date'
                    }
                    value={value || ''}
                    onChange={handleChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    className="
                        w-full
                        bg-white
                        dark:bg-slate-950
                        border
                        border-gray-200
                        dark:border-slate-800
                        rounded-xl
                        px-3
                        py-2
                        text-xs
                        text-slate-700
                        dark:text-slate-200
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500/30
                        focus:border-blue-500
                    "
                />

                <button
                    type="button"
                    disabled
                    className="
                        absolute
                        left-2
                        top-1/2
                        -translate-y-1/2
                        p-1
                        text-slate-400
                    "
                    title="أدخل التاريخ أولاً"
                >
                    <Repeat2 className="w-3.5 h-3.5" />
                </button>
            </div>
        );
    }

    // --------------------------------------------------
    // العرض الهجري
    // --------------------------------------------------
    if (isHijri) {
        return (
            <div className={`relative ${className}`}>
                <div
                    className="
                        w-full
                        bg-emerald-50
                        dark:bg-emerald-950/30
                        border
                        border-emerald-200
                        dark:border-emerald-800
                        rounded-xl
                        px-3
                        py-2
                        pr-3
                        pl-10
                        text-xs
                        text-emerald-700
                        dark:text-emerald-300
                        font-bold
                        min-h-[34px]
                        flex
                        items-center
                    "
                    dir="ltr"
                >
                    {formatHijri()}
                </div>

                <button
                    type="button"
                    onClick={() => setIsHijri(false)}
                    className="
                        absolute
                        left-2
                        top-1/2
                        -translate-y-1/2
                        p-1
                        rounded-md
                        text-emerald-600
                        dark:text-emerald-400
                        hover:bg-emerald-100
                        dark:hover:bg-emerald-900/50
                        transition
                    "
                    title="العودة إلى التاريخ الميلادي"
                >
                    <Calendar className="w-3.5 h-3.5" />
                </button>
            </div>
        );
    }

    // --------------------------------------------------
    // العرض الميلادي الطبيعي
    // --------------------------------------------------
    return (
        <div className={`relative ${className}`}>
            <input
                type={
                    type === 'datetime'
                        ? 'datetime-local'
                        : 'date'
                }
                value={value}
                onChange={handleChange}
                onBlur={onBlur}
                disabled={disabled}
                className="
                    w-full
                    bg-white
                    dark:bg-slate-950
                    border
                    border-gray-200
                    dark:border-slate-800
                    rounded-xl
                    px-3
                    py-2
                    pl-10
                    text-xs
                    text-slate-700
                    dark:text-slate-200
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500/30
                    focus:border-blue-500
                    transition
                "
            />

            <button
                type="button"
                onClick={() => setIsHijri(true)}
                className="
                    absolute
                    left-2
                    top-1/2
                    -translate-y-1/2
                    p-1
                    rounded-md
                    text-blue-500
                    dark:text-blue-400
                    hover:bg-blue-50
                    dark:hover:bg-blue-950/40
                    transition
                "
                title="عرض التاريخ بالهجري"
            >
                <Repeat2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
