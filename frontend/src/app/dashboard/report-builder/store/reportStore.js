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

    // visualization: {
    //     type: "table",

    //     xAxis: "",

    //     yAxis: "",

    //     aggregation: "count",

    //     groupBy: "",

    //     sortBy: "",

    //     sortDirection: "asc",
    // },

    view: {
        type: "table",
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

    // // -------------------------
    // // Visualization
    // // -------------------------

    // setVisualization(values) {

    //     set((state) => ({

    //         report: {

    //             ...state.report,

    //             visualization: {

    //                 ...state.report.visualization,

    //                 ...values,

    //             },

    //         },

    //     }));

    // },



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