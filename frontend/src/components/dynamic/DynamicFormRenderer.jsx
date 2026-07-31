"use client";

export default function DynamicFormRenderer({
    columns = [],
    values = {},
    onChange,
    theme = "dark",
}) {

    const updateValue = (id, value) => {
        onChange((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const inputStyle = {
        width: "100%",
        background: theme === "light" ? "#ffffff" : "#18181b",
        color: theme === "light" ? "#0f172a" : "#ffffff",
        border: theme === "light"
            ? "1px solid #cbd5e1"
            : "1px solid #3f3f46",
        borderRadius: "12px",
        padding: "12px 14px",
        outline: "none",
        transition: "all .2s ease",
    };

    return (
        <div className="space-y-6">

            {columns.map((column) => (

                <div key={column.id} className="space-y-2">

                    <label
                        className={`block text-sm font-medium ${theme === "light"
                                ? "text-slate-700"
                                : "text-zinc-300"
                            }`}
                    >
                        {column.name}
                    </label>

                    {/* Text */}
                    {column.type === "text" && (
                        <input
                            type="text"
                            value={values[column.id] || ""}
                            onChange={(e) =>
                                updateValue(column.id, e.target.value)
                            }
                            placeholder={column.name}
                            style={inputStyle}
                        />
                    )}

                    {/* Textarea */}
                    {column.type === "textarea" && (
                        <textarea
                            rows={4}
                            value={values[column.id] || ""}
                            onChange={(e) =>
                                updateValue(column.id, e.target.value)
                            }
                            placeholder={column.name}
                            style={{
                                ...inputStyle,
                                resize: "vertical",
                                minHeight: "120px",
                            }}
                        />
                    )}

                    {/* Number */}
                    {column.type === "number" && (
                        <input
                            type="number"
                            value={values[column.id] || ""}
                            onChange={(e) =>
                                updateValue(column.id, e.target.value)
                            }
                            placeholder="0"
                            style={inputStyle}
                        />
                    )}

                    {/* Date */}
                    {column.type === "date" && (
                        <input
                            type="date"
                            value={values[column.id] || ""}
                            onChange={(e) =>
                                updateValue(column.id, e.target.value)
                            }
                            style={inputStyle}
                        />
                    )}

                </div>

            ))}

        </div>
    );
}