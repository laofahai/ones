'use strict';
angular.module("ones.finance.service", [])
        .service("FinanceRecordModel", ["$rootScope", function(){
                return {
                    getFieldsStruct: function(){
                        return {
                            id: {
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
                            id: {},
                            name: {},
                            balance: {},
                            listorder: {}
                        };
                    }
                };
        }])
        .service("FinancePayPlanModel", ["$rootScope", function(){
                return {
                    getFieldsStruct: function(){
                        return {
                            id: {},
                            subject: {},
                            type: {},
                            sponsor: {},
                            financer: {},
                            account: {},
                            amount: {},
                            create_dateline: {
                                cellFilter: "dateFormat"
                            },
                            pay_dateline: {
                                cellFilter: "dateFormat"
                            }
                        };
                    }
                };
        }])
        .service("FinanceReceivePlanModel", ["$rootScope", function(){
                return {
                    getFieldsStruct: function(){
                        return {
                            id: {},
                            subject: {},
                            type: {},
                            sponsor: {},
                            financer: {},
                            account: {},
                            amount: {},
                            create_dateline: {
                                cellFilter: "dateFormat"
                            },
                            receive_dateline: {
                                cellFilter: "dateFormat"
                            }
                        };
                    }
                };
        }])
