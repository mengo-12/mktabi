"use client";

import { Database } from "lucide-react";

export default function EmptyCanvas() {
    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">

                <Database className="w-14 h-14 mx-auto text-slate-600 mb-4" />

                <h2 className="text-xl font-semibold text-white">
                    لم يتم اختيار مصدر بيانات
                </h2>

                <p className="text-slate-500 mt-2">
                    اختر جدولاً من القائمة اليسرى لبدء إنشاء التقرير.
                </p>

            </div>
        </div>
    );
}