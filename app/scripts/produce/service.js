'use strict';

angular.module("ones.produce.service", [])
    .service("ProducePlanModel", ["$rootScope", function($rootScope){
            return {
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
;