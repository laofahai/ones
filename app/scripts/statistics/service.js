/**
 * Created by nemo on 6/16/14.
 */
'use strict';
(function(){
    angular.module("ones.statistics.service", [])
        .service("ProductViewModel", [function(){
            return {
                filters: {
                    dateline: "between"
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