/**
 * Created by nemo on 6/16/14.
 */
'use strict';
(function(){
    angular.module("ones.statistics.service", [])
        .service("ProductViewModel", [function(){
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
                        goods_name: {},
                        standard: {},
                        version: {},
                        stockin: {},
                        stockout: {},
                        sale: {},
                        purchase: {},
                        produce: {},
                        measure: {}
                    };
                }
            };
        }])
    ;
})();