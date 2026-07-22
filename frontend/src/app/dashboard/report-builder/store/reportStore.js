import { create } from "zustand";

const initialReport = {
    id: null,
    name: "",
    description: "",

    dataSource: {
        section: null,
        table: null,
        joins: []
    },

    query: {
        columns: [],
        filters: [],
        sorting: [],
        groupBy: "",
        calculatedFields: []
    },

    view: {
        type: "table",
        hiddenColumns: [],
        columnOrder: []
    },

    dashboard: {
        widgets: [],
        layout: [],
        selectedWidget: null,
    }
};

const useReportStore = create((set) => ({

    // -------------------------
    // البيانات القادمة من System Builder
    // -------------------------

    dataSources: [],

    loading: false,

    report: initialReport,

    selectedSection: null,

    selectedTable: null,

    selectedColumn: null,

    selectedRelations: [],

    reportResult: null,

    // -------------------------
    // Data Sources
    // -------------------------

    setLoading: (loading) =>
        set({ loading }),

    setDataSources: (sources) =>
        set({ dataSources: sources }),

    // -------------------------
    // تحديد القسم
    // -------------------------

    selectSection(section) {

        set((state) => ({

            selectedSection: section,

            report: {

                ...state.report,

                dataSource: {

                    ...state.report.dataSource,

                    section

                }

            }

        }));

    },

    // -------------------------
    // تحديد الجدول
    // -------------------------

    selectTable(table) {

        set((state) => ({

            selectedTable: table,

            report: {

                ...state.report,

                dataSource: {

                    ...state.report.dataSource,

                    table

                },

                query: {

                    ...state.report.query,

                    columns: []

                }

            }

        }));

    },

    // -------------------------
    // تحديد عمود
    // -------------------------

    selectColumn(column) {

        set({

            selectedColumn: column

        });

    },

    // -------------------------
    // إضافة / إزالة عمود من التقرير
    // -------------------------

    toggleColumn(column) {

        set((state) => {

            const exists =
                state.report.query.columns.find(
                    c => c.id === column.id
                );

            if (exists) {

                return {

                    report: {

                        ...state.report,

                        query: {

                            ...state.report.query,

                            columns:

                                state.report.query.columns.filter(
                                    c => c.id !== column.id
                                )

                        }

                    }

                };

            }

            return {

                report: {

                    ...state.report,

                    query: {

                        ...state.report.query,

                        columns: [

                            ...state.report.query.columns,

                            column

                        ]

                    }

                }

            };

        });

    },

    toggleRelation(relation) {

        set((state) => {

            const exists =
                state.selectedRelations.find(
                    r => String(r.column.id) === String(relation.column.id)
                );

            if (exists) {

                return {

                    selectedRelations:

                        state.selectedRelations.filter(
                            r => String(r.column.id) !== String(relation.column.id)
                        )

                };

            }

            return {

                selectedRelations: [

                    ...state.selectedRelations,

                    relation

                ]

            };

        });

    },


    // -------------------------
    // تغيير نوع الفلتر
    // -------------------------


    addFilter() {

        set((state) => ({

            report: {

                ...state.report,

                query: {

                    ...state.report.query,

                    filters: [

                        ...(state.report.query.filters || []),

                        {
                            id: crypto.randomUUID(),
                            column: "",
                            operator: "=",
                            value: "",
                        },

                    ],

                },

            },

        }));

    },

    updateFilter(id, values) {

        set((state) => ({

            report: {

                ...state.report,

                query: {

                    ...state.report.query,

                    filters:

                        state.report.query.filters.map(filter =>

                            filter.id === id
                                ? { ...filter, ...values }
                                : filter

                        ),

                },

            },

        }));

    },

    removeFilter(id) {

        set((state) => ({

            report: {

                ...state.report,

                query: {

                    ...state.report.query,

                    filters:

                        state.report.query.filters.filter(

                            filter => filter.id !== id

                        ),

                },

            },

        }));

    },



    // -------------------------
    // Sorting
    // -------------------------

    addSorting: () =>
        set((state) => ({
            report: {
                ...state.report,
                query: {
                    ...state.report.query,
                    sorting: [
                        ...(state.report.query.sorting || []),
                        {
                            id: crypto.randomUUID(),
                            column: "",
                            direction: "asc",
                        },
                    ],
                },
            },
        })),

    updateSorting: (id, values) =>
        set((state) => ({
            report: {
                ...state.report,
                query: {
                    ...state.report.query,
                    sorting: state.report.query.sorting.map((s) =>
                        s.id === id
                            ? { ...s, ...values }
                            : s
                    ),
                },
            },
        })),

    removeSorting: (id) =>
        set((state) => ({
            report: {
                ...state.report,
                query: {
                    ...state.report.query,
                    sorting: state.report.query.sorting.filter(
                        (s) => s.id !== id
                    ),
                },
            },
        })),


    // -------------------------
    // addWidget
    // -------------------------


    addWidget: () =>
        set((state) => ({
            report: {
                ...state.report,
                dashboard: {
                    ...state.report.dashboard,
                    widgets: [
                        ...state.report.dashboard.widgets,
                        {
                            id: crypto.randomUUID(),
                            reportId: null,
                            title: "",
                            type: "table",
                            config: {},
                            layout: {
                                x: 0,
                                y: 0,
                                w: 6,
                                h: 8,
                            },
                        },
                    ],
                },
            },
        })),

    updateWidget: (id, values) =>
        set((state) => ({
            report: {
                ...state.report,
                dashboard: {
                    ...state.report.dashboard,
                    widgets: state.report.dashboard.widgets.map(widget =>
                        widget.id === id
                            ? { ...widget, ...values }
                            : widget
                    ),
                },
            },
        })),


    removeWidget: (id) =>
        set((state) => ({
            report: {
                ...state.report,
                dashboard: {
                    ...state.report.dashboard,
                    widgets: state.report.dashboard.widgets.filter(
                        widget => widget.id !== id
                    ),
                },
            },
        })),

    selectWidget: (id) =>
        set((state) => ({
            report: {
                ...state.report,
                dashboard: {
                    ...state.report.dashboard,
                    selectedWidget: id,
                },
            },
        })),

        
    // -------------------------
    // تغيير نوع العرض
    // -------------------------

    setView(type) {

        set((state) => ({

            report: {

                ...state.report,

                view: {

                    ...state.report.view,

                    type

                }

            }

        }));

    },

    // -------------------------
    // group by
    // -------------------------

    setGroupBy: (columnId) =>
        set(state => ({
            report: {
                ...state.report,
                query: {
                    ...state.report.query,
                    groupBy: columnId,
                },
            },
        })),

    clearGroupBy: () =>
        set(state => ({
            report: {
                ...state.report,
                query: {
                    ...state.report.query,
                    groupBy: "",
                },
            },
        })),


    // -------------------------
    // calculatedFields
    // -------------------------

    addCalculatedField: () =>
        set(state => ({
            report: {
                ...state.report,
                query: {
                    ...state.report.query,
                    calculatedFields: [
                        ...(state.report.query.calculatedFields || []),
                        {
                            id: crypto.randomUUID(),
                            name: "",
                            operation: "sum",
                            column: "",
                        },
                    ],
                },
            },
        })),

    updateCalculatedField: (id, values) =>
        set(state => ({
            report: {
                ...state.report,
                query: {
                    ...state.report.query,
                    calculatedFields:
                        state.report.query.calculatedFields.map(field =>
                            field.id === id
                                ? { ...field, ...values }
                                : field
                        ),
                },
            },
        })),

    removeCalculatedField: (id) =>
        set(state => ({
            report: {
                ...state.report,
                query: {
                    ...state.report.query,
                    calculatedFields:
                        state.report.query.calculatedFields.filter(
                            field => field.id !== id
                        ),
                },
            },
        })),


    // -------------------------
    // إعادة ضبط التقرير
    // -------------------------

    resetReport() {


        set({

            report: structuredClone(initialReport),

            selectedTable: null,

            selectedSection: null,

            selectedColumn: null,

            selectedRelations: [],

        });

    },


    setReportResult: (result) =>
        set({
            reportResult: result
        }),

}));

export default useReportStore;