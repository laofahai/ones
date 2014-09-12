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
                        label: toLang("viewCraft", "actions", $rootScope),
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
                                title: sprintf(toLang("_product_craft", "widgetTitles", $rootScope), item.name),
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
                obj.getStructure = function() {
                    var defer = $q.defer();
                    plugin.callPlugin("loadModelFromJson", "goods.Goods").promise.then(function(structure){
                        plugin.setDefer(defer);
                        plugin.callPlugin("bind_dataModel_to_structure", {
                            structure: structure,
                            alias: "goodsBaseInfo"
                        });
                        plugin.resetDefer();
                    });

                    return defer.promise;
                };

                return obj;
            }])
        .service("GoodsCategoryModel", ["$rootScope","$q","DataModelRes",function($rootScope,$q,DataModelRes) {
            var obj = {
                subAble: true,
                addSubAble: true,
                viewSubAble: false,
                extraSelectActions: [
                    {
                        label: toLang("viewDataModel", "actions", $rootScope),
                        action: function($event, selectedItems){
                            var scope = this.scope;
                            var injector = this.injector;
                            var location = injector.get("$location");
                            var routeParams = injector.get("$routeParams");
                            if(!selectedItems.length) {
                                return;
                            }

                            injector.get("DataModelRes").get({
                                id:0,
                                alias: "product"
                            }).$promise.then(function(data){
                                if(!data.id) {
                                    return;
                                }
                                location.url("/dataModel/list/DataModelData/modelId/"+data.id+"/source_id/"+selectedItems[0].id);
                            });

                        }
                    }
                ]
            };
            obj.getStructure = function(structOnly) {
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
//                    bind_model_name: {
//                        displayName: i18n.bindDataModel,
//                        hideInForm:true
//                    },
                    pinyin: {
                        displayName: i18n.firstChar,
                        required: false
                    },
//                    bind_model: {
//                        displayName: i18n.bindDataModel,
//                        inputType: "select",
//                        listable: false
//                    },
                    listorder: {
                        inputType: "number",
                        value: 99
                    }
                };

                return struct;

//                if(structOnly) {
//                    return struct;
//                } else {
//                    var defer = $q.defer();
//                    DataModelRes.query(function(data){
//                        struct.bind_model.dataSource = data;
//                        defer.resolve(struct);
//                    });
//                    return defer.promise;
//                }
            };
            return obj;
        }])
    ;
})();