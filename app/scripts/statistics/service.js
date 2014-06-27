/**
 * Created by nemo on 6/16/14.
 */
'use strict';
(function(){
    angular.module("ones.statistics.service", [])
        .service("ProductViewModel", ["$rootScope", function($rootScope){
            var timestamp = Date.parse(new Date());
            var startTime = timestamp-3600*24*30*1000;
            return {
                filters: {
                    between: {
                        field: "dateline",
                        defaultData: [startTime, timestamp],
                        inputType: "datepicker"
                    }
                },
                getFieldsStruct: function() {
                    return {
                        factory_code_all: {},
                        goods_name: {},
                        measure: {},
                        standard: {
                            field: "standard_label"
                        },
                        version: {
                            field: "version_label"
                        },
                        sale_num: {},
                        sale_amount: {
                            cellFilter: "currency:'￥'"
                        },
                        purchase_num: {},
                        purchase_amount: {},
                        produce: {
                            field: "produce_num"
                        },
                        store_num: {
                            displayName: $rootScope.i18n.lang.storeNum
                        }
                    };
                }
            };
        }])
    ;
})();