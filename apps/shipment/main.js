(function(){
    angular.module("ones.shipment", ["ones.crm"])
        .factory("ShipmentRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "shipment/shipment/:id.json", null,
                {
                    'update': {method: 'PUT'}
                }
            );
        }])
        .service("ShipmentModel", ["$rootScope", "TypesRes", function($rootScope, TypesRes) {
            var i18n = $rootScope.i18n.lang;
            return {
                printAble: true,
                getFieldsStruct: function() {
                    return {
                        id: {primary: true},
                        shipment_type: {
                            field: "shipment_type_label",
                            inputType: "select",
                            dataSource: TypesRes,
                            queryParams: {
                                type: "shipment"
                            }
                        },
                        to_company: {
                            displayName: i18n.shipment_to_company
                        },
                        to_name: {
                            displayName: i18n.shipment_to_name
                        },
                        to_phone: {
                            displayName: i18n.shipment_to_phone,
                            listable:false
                        },
                        to_address: {
                            displayName: i18n.shipment_to_address
                        },
                        from_company: {
                            displayName: i18n.shipment_from_company,
                            listable:false
                        },
                        from_name: {
                            displayName: i18n.shipment_from_name,
                            listable:false
                        },
                        from_phone: {
                            displayName: i18n.shipment_from_phone,
                            listable:false
                        },
                        from_address: {
                            displayName: i18n.shipment_from_address,
                            listable:false
                        },
                        freight_type: {
                            field: "freight_type_label",
                            inputType: "select",
                            dataSource: TypesRes,
                            queryParams: {
                                type: "freight"
                            },
                            required: false,
                            listable:false
                        },
                        freight: {
                            inputType: "number",
                            required: false,
                            listable:false
                        },
                        weight: {
                            required: false
                        },
                        total_num: {
                            displayName: i18n.totalNum,
                            required: false
                        }
                    };
                }
            };
        }])

    ;
})();