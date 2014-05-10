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