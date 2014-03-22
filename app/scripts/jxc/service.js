angular.module("erp.jxc.services", [])
        .service("JXCGoodsModel", function() {
            
            var obj = {};
            obj.getFieldsStruct = function(i18n) {
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
                    pinyin: {
                        displayName: i18n.lang.firstChar,
                        required: false
                    },
                    measure: {
                        displayName: i18n.lang.measure
                    },
                    price: {
                        displayName: i18n.lang.price,
                        inputType: "number",
                        value: 0
                    },
                    goods_category_id: {
                        displayName: i18n.lang.category,
                        inputType: "select",
                        valueField: "id",
                        nameField : "prefix_name",
                        listable: false
                    },
                    category_name: {
                        displayName: i18n.lang.category,
                        inputType: false,
                        hideInForm: true
                    },
                    store_min: {
                        displayName: i18n.lang.store_min,
                        inputType: "number",
                        value: 0
                    },
                    store_max: {
                        displayName: i18n.lang.store_max,
                        inputType: "number",
                        value: 0
                    }
                };
            };
            obj.getFields = function($scope, GoodsCategoryRes){
                GoodsCategoryRes.query(function(data){
                    var fields = obj.getFieldsStruct($scope.i18n);
                    fields.goods_category_id.dataSource = data;
                    $scope.$broadcast("goods_category_loaded", fields);
                });
                
            };
            
            return obj;
        });