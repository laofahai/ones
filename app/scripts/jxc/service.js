angular.module("erp.jxc.services", [])
        .service("JXCGoodsModel", ["$rootScope", "GoodsCategoryRes", function($rootScope, GoodsCategoryRes) {
            var i18n = $rootScope.i18n;
            GoodsCategoryRes.query(function(data){
                $rootScope.$broadcast("goods_category_loaded", data);
            });
            this.getFields = function(categories){
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
                        inputType: "number",
                        value: 0
                    },
                    category_id: {
                        displayName: i18n.lang.category_name,
                        inputType: "select",
                        dataSource: categories,
                        valueField: "id",
                        nameField : "prefix_name"
                    }
                };
            };
        }]);