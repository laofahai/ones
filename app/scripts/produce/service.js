'use strict';

angular.module("ones.produce.service", [])
    .service("ProducePlanModel", ["$rootScope", function($rootScope){
            return {
                isBill: true,
                workflowAlias: "produce",
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
                        status_text: {
                            displayName: $rootScope.i18n.lang.status,
                            field: "processes.status_text"
                        },
                        memo: {}
                    };
                }
            };
    }])
    .service("ProducePlanDetailEditModel", ["$rootScope", "GoodsRes", "DataModelDataRes", function($rootScope, GoodsRes, DataModelDataRes){
            return {
                isBill: true,
                selectAble: false,
                getFieldsStruct: function() {
                    var i18n = $rootScope.i18n.lang;
                    return {
                        goods_id: {
                            displayName: i18n.product,
                            labelField: true,
                            inputType: "select3",
                            dataSource: GoodsRes,
                            valueField: "combineId",
                            nameField: "combineLabel",
                            width: 300,
                            callback: function(tr) {
                                tr.find("[data-bind-model='craft'] label").trigger("click");
                            },
                            listable: false
                        },
                        standard: {
                            nameField: "data",
                            valueField: "id",
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            autoReset: true,
                            autoHide: true,
                            queryParams: {
                                fieldAlias: "standard"
                            },
                            listable: false
                        },
                        version: {
                            nameField: "data",
                            valueField: "id",
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            autoReset: true,
                            autoHide: true,
                            listable: false,
                            queryParams: {
                                fieldAlias: "version"
                            }
                        },
                        craft: {
                            editAbleRequire: "goods_id",
                            queryWithExistsData: ["goods_id"],
                            inputType: "craft",
                            listable: false
                        },
                        
                        num: {
                            inputType: "number",
                            totalAble: true
                        },
                        memo: {
                            listable: false
                        }
                    };
                }
            };
    }])
    .service("ProduceBomsModel", ["$rootScope", "GoodsRes", "DataModelDataRes", function($rootScope,GoodsRes,DataModelDataRes){
            return {
                isBill: true,
                workflowAlias: "produce",
                getFieldsStruct: function(){
                    return {
                        plan_id: {
                            editAble: false
                        },
                        goods_id: {
                            displayName: $rootScope.i18n.lang.goods,
                            labelField: true,
                            inputType: "select3",
                            dataSource: GoodsRes,
                            valueField: "combineId",
                            nameField: "combineLabel",
                            listAble: false,
                            width: 300
                        },
                        standard: {
                            nameField: "data",
                            valueField: "id",
                            labelField: true,
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            autoReset: true,
                            autoHide: true,
                            queryParams: {
                                fieldAlias: "standard"
                            }
                        },
                        version: {
                            nameField: "data",
                            valueField: "id",
                            labelField: true,
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            autoReset: true,
                            autoHide: true,
                            queryParams: {
                                fieldAlias: "version"
                            }
                        },
                        num: {
                            inputType: "number"
                        }
                    };
                }
            };
    }])
    .service("ProducePlanDetailModel", ["$rootScope", function($rootScope) {
        return {
            editAble: false,
            deleteAble: false,
            extraSelectActions: [
                {
                    label: $rootScope.i18n.lang.actions.doCraft,
                    action: function($event, selectedItems){
                        var scope = this.scope;
                        var injector = this.injector;
                        var res = injector.get("DoCraftRes");
                        var conf = injector.get("ones.config");
                        var $location = injector.get("$location");

                        if(selectedItems.length <= 0) {
                            return;
                        }
                        var ids = [];
                        angular.forEach(selectedItems, function(item){
                            ids.push(item.id);
                        });

                        res.update({
                            id: ids.join(),
                            workflow: true
                        }, {}, function(){
                            if(!conf.DEBUG) {
                                var url = "/HOME/goTo/url/"+encodeURI(encodeURIComponent($location.$$url));
                                $location.url(url);
                            }
                        });
                    }
                },
                {
                    label: $rootScope.i18n.lang.actions.viewCraft,
                    action: function($event, selectedItems){
                        var scope = this.scope;
                        var injector = this.injector;
                        var res = injector.get("DoCraftRes");
                        var ComView = injector.get("ComView");

                        if(selectedItems.length !== 1) {
                            return;
                        }
                        
                        res.get({
                            id: selectedItems[0].id
                        }).$promise.then(function(data){
                            ComView.aside(data, data.rows, "views/common/asides/craftProcess.html");
                        });
                    }
                }
            ],
            getFieldsStruct: function() {
                return {
                    id: {
                        primary: true,
                        cellFilter: "idFormat",
                        width: 80
                    },
                    plan_id: {
                        cellFilter: "idFormat",
                        width: 80
                    },
                    product: {
                        field: "goods_name"
                    },
                    standard_label: {
                        displayName: $rootScope.i18n.lang.standard
                    },
                    version_label: {
                        displayName: $rootScope.i18n.lang.version
                    },
                    current_craft: {
                        field: "processes.craft_name",
                        displayName: $rootScope.i18n.lang.current_craft
                    },
                    start_time: {
                        cellFilter: "dateFormat:1"
                    },
                    plan_end_time: {
                        cellFilter: "dateFormat:1"
                    },
                    num: {
                    },
                    memo: {}
                };
            }
        };   
   }])
;