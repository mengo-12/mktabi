'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

export default function DateConversionButton({
    value,
    type = 'date',
    className = '',
}) {
    const [isHijri, setIsHijri] = useState(false);

    if (!value) {
        return (
            <span className="text-slate-400 italic">
                فارغ
            </span>
        );
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return (
            <span className={className}>
                {value}
            </span>
        );
    }

    // -----------------------------------------
    // تحويل الأرقام العربية إلى أرقام إنجليزية
    // -----------------------------------------
    const toEnglishDigits = (value) => {
        return String(value)
            .replace(/[٠-٩]/g, (digit) =>
                String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))
            );
    };

    // -----------------------------------------
    // إضافة صفر للأرقام الأقل من 10
    // -----------------------------------------
    const pad = (value) => {
        return String(value).padStart(2, '0');
    };

    // -----------------------------------------
    // أسماء الأشهر الهجرية
    // -----------------------------------------
    const hijriMonths = [
        'محرم',
        'صفر',
        'ربيع الأول',
        'ربيع الآخر',
        'جمادى الأولى',
        'جمادى الآخرة',
        'رجب',
        'شعبان',
        'رمضان',
        'شوال',
        'ذو القعدة',
        'ذو الحجة',
    ];

    // -----------------------------------------
    // استخراج التاريخ الميلادي
    // -----------------------------------------
    const getGregorianParts = () => {
        return {
            day: pad(date.getDate()),
            month: pad(date.getMonth() + 1),
            year: date.getFullYear(),
        };
    };

    // -----------------------------------------
    // استخراج التاريخ الهجري
    // باستخدام تقويم أم القرى
    // -----------------------------------------
    const getHijriParts = () => {
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

        return {
            day: pad(toEnglishDigits(day)),
            month: pad(toEnglishDigits(month)),
            year: toEnglishDigits(year),
        };
    };

    // -----------------------------------------
    // الوقت
    // -----------------------------------------
    const getTime = () => {
        let hours = date.getHours();
        const minutes = pad(date.getMinutes());

        const period = hours >= 12 ? 'م' : 'ص';

        hours = hours % 12;

        if (hours === 0) {
            hours = 12;
        }

        return `${pad(hours)}:${minutes} ${period}`;
    };

    // -----------------------------------------
    // التاريخ الميلادي
    // يوم/شهر/سنة
    // -----------------------------------------
    const formatGregorian = () => {
        const {
            day,
            month,
            year,
        } = getGregorianParts();

        const formattedDate =
            `${day}/${month}/${year}`;

        if (type === 'datetime') {
            return `${formattedDate} ${getTime()}`;
        }

        return formattedDate;
    };

    // -----------------------------------------
    // التاريخ الهجري
    // يوم/شهر/سنة
    // -----------------------------------------
    const formatHijri = () => {
        const {
            day,
            month,
            year,
        } = getHijriParts();

        const formattedDate =
            `${day}/${month}/${year}`;

        if (type === 'datetime') {
            return `${formattedDate} ${getTime()}`;
        }

        return formattedDate;
    };

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                setIsHijri((prev) => !prev);
            }}
            title={
                isHijri
                    ? 'اضغط للعودة إلى التاريخ الميلادي'
                    : 'اضغط لعرض التاريخ الهجري'
            }
            className={`
                inline-flex
                items-center
                gap-1.5
                text-right
                font-medium
                transition-colors
                hover:text-blue-600
                dark:hover:text-blue-400
                ${className}
            `}
        >
            <span dir="ltr">
                {isHijri
                    ? formatHijri()
                    : formatGregorian()}
            </span>

            <Calendar
                className={`
                    w-3 h-3 shrink-0
                    transition-colors
                    ${
                        isHijri
                            ? 'text-emerald-500'
                            : 'text-blue-500'
                    }
                `}
            />
        </button>
    );
}
