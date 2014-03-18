angular.module("erp.jxc.services", [])
        .service("JXCGoodsModel", function() {
            this.getFields = function(i18n){
                return {
                    id: {
                        primary: true,
                        displayName: "ID"
                    },
                    factory_code: {
                        displayName: i18n.lang.factory_code
                    },
                    name: {
                        displayName: i18n.lang.name
                    },
                    measure: {
                        displayName: i18n.lang.measure
                    },
                    price: {
                        displayName: i18n.lang.price,
                        inputType: "float",
                        value: 0
                    },
                    category_id: {
                        displayName: i18n.lang.category_name,
                        inputType: "select"
                    }
                };
            };
        });