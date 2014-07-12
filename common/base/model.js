(function(){
    angular.module("ones.common.models", [])
        .service("TypesModel", ["$rootScope",function($rootScope){
            var obj = {};
            obj.getFieldsStruct = function(){
                var i18n = $rootScope.i18n.lang;
                return {
                    id: {
                        primary: true
                    },
                    type: {
                        inputType: "select",
                        dataSource: [
                            {id: "purchase", name:i18n.types.purchase},
                            {id: "sale", name:i18n.types.sale},
                            {id: "returns", name:i18n.types.returns},
                            {id: "shipment", name:i18n.types.shipment},
                            {id: "freight", name:i18n.types.freight},
                            {id: "receive", name:i18n.types.receive},
                            {id: "pay", name:i18n.types.pay},
                            {id: "voucher", name:i18n.types.voucher},
                            {id: "produce", name:i18n.types.produce},
                            {id: "stockin", name:i18n.types.stockin}
                        ]
                    },
                    alias: {},
                    name: {},
                    listorder: {
                        inputType: "number",
                        value: 99
                    },
                    status: {
                        inputType: "checkbox"
                    }
                };
            };
            return obj;
        }])
        .service("ConfigModel", ["$rootScope", function($rootScope){
            return {
                getFieldsStruct : function(){
                    return {
                        id: {primary: true},
                        alias: {},
                        name: {},
                        value: {
                            inputType: "textarea"
                        },
                        description: {
                            inputType: "textarea",
                            required: false
                        }
                    };
                }
            };
        }])

        .service("AppsModel", ["$rootScope", function($rootScope){
            return {
                getFieldsStruct: function() {
                    return {
                        name: {
                            readonly: true,
                            required: false
                        },
                        alias: {
                            readonly: true,
                            required: false
                        },
                        version: {
                            readonly: true,
                            required: false,
                            displayName: $rootScope.i18n.lang.appVersion
                        },
                        author: {
                            readonly: true,
                            required: false
                        },
                        link: {
                            readonly: true,
                            required: false
                        },
                        description: {
                            readonly: true,
                            required: false,
                            inputType: "textarea"
                        },
                        status: {
                            cellFilter: "lang",
                            field: "status_text",
                            inputType: "select",
                            dataSource: [
                                {id: "0", name: "disabled"},
                                {id: "1", name: "enabled"}
                            ]
                        }
                    };
                }
            };
        }])
    ;
})();