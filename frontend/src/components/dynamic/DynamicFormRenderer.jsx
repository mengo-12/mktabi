"use client";

export default function DynamicFormRenderer({
    columns = [],
    values = {},
    onChange,
}) {

    const updateValue = (id, value) => {
        onChange((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const inputStyle = {
        width: "100%",
        background: "#18181b",
        color: "#fff",
        border: "1px solid #3f3f46",
        borderRadius: "10px",
        padding: "12px 14px",
        outline: "none",
        transition: "0.2s",
    };

    return (
        <div className="space-y-6">

            {columns.map((column) => (

                <div key={column.id} className="space-y-2">

                    <label className="block text-sm font-medium text-zinc-300">
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