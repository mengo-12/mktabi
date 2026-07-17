// frontend/src/constants/fieldTypes.js

export const FIELD_TYPES = [
    {
        value: "text",
        label: "🔤 نص قصير",
        supportsOptions: false,
        supportsRelation: false,
        supportsPermissions: false,
    },

    {
        value: "textarea",
        label: "📝 نص طويل / مذكرات",
        supportsOptions: false,
        supportsRelation: false,
        supportsPermissions: false,
    },

    {
        value: "number",
        label: "🔢 رقم",
        supportsOptions: false,
        supportsRelation: false,
        supportsPermissions: false,
    },

    {
        value: "currency",
        label: "💰 مبلغ مالي",
        supportsOptions: false,
        supportsRelation: false,
        supportsPermissions: false,
    },

    {
        value: "date",
        label: "📅 تاريخ",
        supportsOptions: false,
        supportsRelation: false,
        supportsPermissions: false,
    },

    {
        value: "dropdown",
        label: "📋 قائمة منسدلة",
        supportsOptions: true,
        supportsRelation: false,
        supportsPermissions: false,
    },

    {
        value: "attachment",
        label: "📎 مرفقات وملفات",
        supportsOptions: false,
        supportsRelation: false,
        supportsPermissions: false,
    },

    {
        value: "relation",
        label: "🔗 علاقة بين الجداول",
        supportsOptions: false,
        supportsRelation: true,
        supportsPermissions: false,
    },

    {
        value: "staff_email",
        label: "📧 بريد إلكتروني رسمي",
        supportsOptions: false,
        supportsRelation: false,
        supportsPermissions: false,
    },

    {
        value: "staff_password",
        label: "🔒 كلمة مرور مشفرة",
        supportsOptions: false,
        supportsRelation: false,
        supportsPermissions: false,
    },

    {
        value: "user_account",
        label: "👤 حساب مستخدم وصلاحيات",
        supportsOptions: false,
        supportsRelation: true,
        supportsPermissions: true,
    },
];

export const getFieldType = (value) => {
    return FIELD_TYPES.find((t) => t.value === value);
};

export const fieldSupportsOptions = (value) => {
    return getFieldType(value)?.supportsOptions ?? false;
};

export const fieldSupportsRelation = (value) => {
    return getFieldType(value)?.supportsRelation ?? false;
};

export const fieldSupportsPermissions = (value) => {
    return getFieldType(value)?.supportsPermissions ?? false;
};

