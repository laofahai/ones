'use strict';

angular.module("ones.produce.service", [])
    .service("ProducePlanModel", ["$rootScope", function($rootScope){
            return {
                isBill: true,
                workflowAlias: "produce",
                getFieldsStruct: function(){
                    return {
                        id: {primary: true, width:50},
                        type_label: {
                            displayName: $rootScope.i18n.lang.type
                        },
                        start_time: {
                            cellFilter: "dateFormat"
                        },
                        end_time: {
                            cellFilter: "dateFormat"
                        },
                        create_time: {
                            cellFilter: "dateFormat"
                        },
                        status: {},
                        memo: {}
                    };
                }
            };
    }])
    .service("ProducePlanDetailModel", ["$rootScope", "GoodsRes", "DataModelDataRes", function($rootScope, GoodsRes, DataModelDataRes){
            return {
                isBill: true,
                selectAble: false,
                getFieldsStruct: function() {
                    var i18n = $rootScope.i18n.lang;
                    return {
                        goods_id: {
                            displayName: i18n.product,
                            labelField: true,
                            inputType: "select3",
                            dataSource: GoodsRes,
                            valueField: "combineId",
                            nameField: "combineLabel",
                            listAble: false,
                            width: 300
                        },
                        standard: {
                            nameField: "data",
                            valueField: "id",
                            labelField: true,
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            autoReset: true,
                            autoHide: true,
                            queryParams: {
                                fieldAlias: "standard"
                            }
                        },
                        version: {
                            nameField: "data",
                            valueField: "id",
                            labelField: true,
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            autoReset: true,
                            autoHide: true,
                            queryParams: {
                                fieldAlias: "version"
                            }
                        },
                        craft: {
                            editAbleRequire: "goods_id",
                            queryWithExistsData: ["goods_id"],
                            inputType: "craft",
                        },
                        num: {
                            inputType: "number",
                            totalAble: true
                        },
                        memo: {}
                    };
                }
            };
    }])
;