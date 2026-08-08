/**
 * أدوات تحويل التاريخ بين الميلادي والهجري
 * يستخدم تقويم أم القرى الخاص بالسعودية.
 */

/**
 * تحويل تاريخ ميلادي إلى هجري
 *
 * @param {Date|string} date
 * @returns {string}
 */
export function gregorianToHijri(date) {
    if (!date) {
        return "";
    }

    try {
        const parsedDate = date instanceof Date
            ? date
            : new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        const formatter = new Intl.DateTimeFormat(
            "ar-SA-u-ca-islamic-umalqura",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
            }
        );

        return formatter.format(parsedDate);

    } catch (error) {

        console.error(
            "خطأ أثناء تحويل التاريخ إلى هجري:",
            error
        );

        return "";
    }
}


/**
 * تحويل تاريخ ميلادي إلى هجري بصيغة مختصرة
 *
 * مثال:
 * 24/02/1448 هـ
 */
export function gregorianToHijriShort(date) {

    if (!date) {
        return "";
    }

    try {

        const parsedDate = date instanceof Date
            ? date
            : new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        const formatter = new Intl.DateTimeFormat(
            "ar-SA-u-ca-islamic-umalqura",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }
        );

        return formatter.format(parsedDate);

    } catch (error) {

        console.error(
            "خطأ أثناء تحويل التاريخ الهجري:",
            error
        );

        return "";
    }
}


/**
 * إرجاع التاريخ الميلادي بتنسيق عربي
 */
export function formatGregorianDate(date) {

    if (!date) {
        return "";
    }

    try {

        const parsedDate = date instanceof Date
            ? date
            : new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        return new Intl.DateTimeFormat(
            "ar-SA",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }
        ).format(parsedDate);

    } catch (error) {

        console.error(
            "خطأ أثناء تنسيق التاريخ الميلادي:",
            error
        );

        return "";
    }
}
