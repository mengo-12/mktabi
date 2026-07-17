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
        groupBy: [],
        calculatedFields: []
    },

    view: {
        type: "table", // table | cards | chart | calendar | kpi
        hiddenColumns: [],
        columnOrder: []
    },

    dashboard: {
        widgets: [],
        layout: []
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
    // إعادة ضبط التقرير
    // -------------------------

    resetReport() {

        set({

            report: structuredClone(initialReport),

            selectedTable: null,

            selectedSection: null,

            selectedColumn: null

        });

    },


    setReportResult: (result) =>
        set({
            reportResult: result
        }),

}));

export default useReportStore;