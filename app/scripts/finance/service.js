'use strict';
angular.module("ones.finance.service", [])
        .service("FinanceRecordModel", ["$rootScope", function(){
                return {
                    editAble: false,
                    addAble: false,
                    getFieldsStruct: function(){
                        return {
                            id: {
                                primary: true,
                                width: "50"
                            },
                            balance_direction: {
                                width: "80"
                            },
                            account: {},
                            record_type: {},
                            amount: {},
                            dateline: {
                                cellFilter: "dateFormat"
                            },
                            memo: {},
                            sponsor: {},
                            financer: {}
                        };
                    }
                };
        }])
        .service("FinanceAccountModel", ["$rootScope", function(){
                return {
                    getFieldsStruct: function() {
                        return {
                            id: {primary: true},
                            name: {},
                            balance: {
                                inputType: "number"
                            },
                            listorder: {
                                value: 99
                            }
                        };
                    }
                };
        }])
        .service("FinancePayPlanModel", ["$rootScope","TypesRes", "FinanceAccountRes", function($rootScope, TypesRes, FinanceAccountRes){
                return {
                    workflowAlias: "financePay",
                    getFieldsStruct: function(){
                        return {
                            id: {primary: true},
                            subject: {},
                            type_id: {
                                field: "type",
                                displayName: $rootScope.i18n.lang.type,
                                inputType: "select",
                                dataSource: TypesRes,
                                queryParams: {
                                    type: "pay"
                                }
                            },
                            sponsor: {
                                hideInForm: true
                            },
                            financer: {
                                hideInForm: true
                            },
                            account_id: {
                                field: "account_name",
                                displayName: $rootScope.i18n.lang.account,
                                inputType: "select",
                                dataSource: FinanceAccountRes,
                                nameField: "name",
                                valueField: "id"
                            },
                            amount: {
                                inputType: "number"
                            },
                            create_dateline: {
                                hideInForm: true,
                                cellFilter: "dateFormat"
                            },
                            pay_dateline: {
                                hideInForm: true,
                                cellFilter: "dateFormat"
                            },
                            status: {
                                hideInForm: true,
                                field: "processes.status_text"
                            },
                            memo: {
                                required: false,
                                listable: false
                            }
                        };
                    }
                };
        }])
        .service("FinanceReceivePlanModel", ["$rootScope", "TypesRes", "FinanceAccountRes", function($rootScope, TypesRes, FinanceAccountRes){
                return {
                    workflowAlias: "financeReceive",
                    getFieldsStruct: function(){
                        return {
                            id: {primary: true},
                            subject: {},
                            type_id: {
                                field: "type",
                                displayName: $rootScope.i18n.lang.type,
                                inputType: "select",
                                dataSource: TypesRes,
                                queryParams: {
                                    type: "receive"
                                }
                            },
                            sponsor: {
                                hideInForm: true
                            },
                            financer: {
                                hideInForm: true
                            },
                            account_id: {
                                field: "account_name",
                                displayName: $rootScope.i18n.lang.account,
                                inputType: "select",
                                dataSource: FinanceAccountRes,
                                nameField: "name",
                                valueField: "id"
                            },
                            amount: {
                                inputType: "number"
                            },
                            create_dateline: {
                                hideInForm: true,
                                cellFilter: "dateFormat"
                            },
                            receive_dateline: {
                                hideInForm: true,
                                cellFilter: "dateFormat"
                            },
                            status: {
                                hideInForm: true,
                                field: "processes.status_text"
                            },
                            memo: {
                                required: false,
                                listable: false
                            }
                        };
                    }
                };
        }])
;
