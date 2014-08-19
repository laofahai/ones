(function(){
    'use strict';

    angular.module("ones.goods", [])
        .factory("GoodsRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "goods/goods/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("GoodsCategoryRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "goods/goodsCategory/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .service("GoodsModel", ["$rootScope", "GoodsCategoryRes", "$q", "$location", "$modal", "pluginExecutor",
            function($rootScope, GoodsCategoryRes, $q, $location, $modal, plugin) {
                var obj = {};
                obj.columns = 2;
                obj.extraSelectActions = [
                    {
                        label: $rootScope.i18n.lang.actions.viewCraft,
                        action: function($event, selectedItems){
                            var scope = obj.extraSelectActions[0].scope;
                            var injector = obj.extraSelectActions[0].injector;
                            var item = selectedItems[0];
                            var res = injector.get("GoodsCraftRes");

                            res.query({goods_id: item.id}).$promise.then(function(data){
                                scope.craftsList = data;
                            });

                            var theModal = $modal({
                                scope: scope,
                                title: sprintf($rootScope.i18n.lang.widgetTitles._product_craft, item.name),
                                contentTemplate: appView('productCraft.html', 'produce'),
                                show: false
                            });
                            theModal.$promise.then(theModal.show);

                            scope.doSaveCraft = function(){
                                res.update({id: item.id}, scope.craftsList, function(data){
                                    theModal.hide();
                                });
                            };
                        }
                    }
                ];
                obj.getFieldsStruct = function(structOnly) {
                    var i18n = $rootScope.i18n.lang;
                    var struct = {
                        id: {
                            primary: true
                        },
                        factory_code: {
                            ensureunique: "GoodsRes"
                        },
                        name: {},
                        pinyin: {
                            displayName: i18n.firstChar,
                            required: false
                        },
                        measure: {},
                        price: {
                            inputType: "number",
                            cellFilter: "currency:'￥'",
                            value: 0.00
                        },
                        cost: {
                            inputType: "number",
                            cellFilter: "currency:'￥'",
                            value: 0.00
                        },
                        goods_category_id: {
                            displayName: i18n.category,
                            inputType: "select",
                            valueField: "id",
                            nameField : "prefix_name",
                            listable: false,
                            dataSource: "GoodsCategoryRes"
                        },
                        category_name: {
                            displayName: i18n.category,
                            inputType: false,
                            hideInForm: true
                        },
                        store_min: {
                            inputType: "number",
                            value: 0
                        },
                        store_max: {
                            inputType: "number",
                            value: 0
                        }
                    };

                    var rs = plugin.callPlugin("binDataModelToStructure", {
                        structure: struct,
                        alias: "goodsBaseInfo"
                    });
                    return rs.defer.promise;

                };
                return obj;
            }])
        .service("GoodsCategoryModel", ["$rootScope","$q","DataModelRes",function($rootScope,$q,DataModelRes) {
            var obj = {
                subAble: true,
                viewSubAble: false,
                extraSelectActions: [
                    {
                        label: $rootScope.i18n.lang.actions.viewDataModel,
                        action: function($event, selectedItems){
                            var scope = this.scope;
                            var injector = this.injector;
                            var location = injector.get("$location");
                            if(!selectedItems.length) {
                                return;
                            }
                            location.url("/dataModel/DataModelData/catid/"+selectedItems[0].id);
                        }
                    }
                ]
            };
            obj.getFieldsStruct = function(structOnly) {
                var i18n = $rootScope.i18n.lang;
                var struct = {
                    id : {
                        primary: true
                    },
                    name: {
                        displayName: i18n.category,
                        listable: false
                    },
                    prefix_name: {
                        hideInForm: true,
                        displayName: i18n.category
                    },
                    bind_model_name: {
                        displayName: i18n.bindDataModel,
                        hideInForm:true
                    },
                    pinyin: {
                        displayName: i18n.firstChar,
                        required: false
                    },
                    bind_model: {
                        displayName: i18n.bindDataModel,
                        inputType: "select",
                        listable: false
                    },
                    listorder: {
                        inputType: "number",
                        value: 99
                    }
                };

                if(structOnly) {
                    return struct;
                } else {
                    var defer = $q.defer();
                    DataModelRes.query(function(data){
                        struct.bind_model.dataSource = data;
                        defer.resolve(struct);
                    });
                    return defer.promise;
                }
            };
            return obj;
        }])
    ;
})();