/**
 * Created by nemo on 14-7-7.
 */
(function(){
    angular.module("ones.produce", [
            "ones.goods",
            "ones.dataModel",
            "ones.department",
            "ones.workflow"
        ])
        .config(["$routeProvider", function($route){
            $route
                .when('/produce/addBill/producePlan', {
                    templateUrl: appView("producePlan/edit.html", "produce"),
                    controller : "ProducePlanEditCtl"
                })
                .when('/produce/editBill/producePlan/id/:id', {
                    templateUrl: appView('producePlan/edit.html', 'produce'),
                    controller: 'ProducePlanEditCtl'
                })
                .when('/doWorkflow/Produce/makeBoms/:nodeId/:id', {
                    templateUrl: "common/viewsproduce/producePlan/makeBoms.html",
                    controller: "WorkflowMakeProduceBomsCtl"
                })
                .when('/doWorkflow/Produce/doCraft/:nodeId/:id', {
                    templateUrl: "common/viewsproduce/producePlan/doCraft.html",
                    controller : "WorkflowDoCraftCtl"
                })
                .when('/doWorkflow/Produce/makeStockin/:nodeId/:id', {
                    templateUrl: "common/viewsproduce/producePlan/makeStockin.html",
                    controller : "WorkflowProduceMakeStockinCtl"
                })
            ;
        }])
        //生产模块
        .factory("CraftRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "produce/craft/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("ProduceBomsRes", ["$resource", "ones.config", function($resource, cnf){
            return $resource(cnf.BSU+"produce/produceBoms/:id.json", null, {
                update: {method: 'PUT'},
                doWorkflow: {method: 'GET'},
                doPostWorkflow: {method: 'POST'}
            });
        }])
        .factory("ProducePlanRes", ["$resource","ones.config", function($resource, cnf){
            return $resource(cnf.BSU+"produce/producePlan/:id.json", null,
                {
                    'doWorkflow': {method: 'GET'},
                    'doPostWorkflow': {method: 'POST'},
                    'update': {method: 'PUT'}
                });
        }])
        .factory("ProducePlanDetailRes", ["$resource","ones.config", function($resource, cnf){
            return $resource(cnf.BSU+"produce/producePlanDetail/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("GoodsCraftRes", ["$resource","ones.config", function($resource, cnf){
            return $resource(cnf.BSU+"produce/goodsCraft/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("DoCraftRes", ["$resource","ones.config", function($resource, cnf){
            return $resource(cnf.BSU+"produce/doCraft/:id.json", null, {'update': {method: 'PUT'}});
        }])

        .service("DoCraftModel", ["$rootScope", "$injector", function($rootScope, $injector) {
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
                                //刷新当前页面
                                var $location = $injector.get("$location");
//                                console.log($location.url());
                                $injector.get("ComView").redirectTo($location.url());
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
                            cellFilter: "dateFormat"
                        },
                        next_craft: {
                            field: "processes.next_craft_name",
                            displayName: $rootScope.i18n.lang.next_craft
                        },
                        num: {}
                    };
                }
            };
        }])

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
                                    ComView.aside(data, data.rows, appView("craftProcess.html", "produce"));
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

        .service("ProductTplModel", ["$rootScope", "GoodsRes", "DataModelDataRes", function($rootScope, GoodsRes,DataModelDataRes){
            return {
                subAble: true,
                addSubAble: false,
                viewSubAble : true,
                getFieldsStruct: function(structOnly) {
                    var struct = {
                        id: {primary:true},
                        factory_code_all: {
                            hideInForm:true
                        },
                        goods_name: {
                            hideInForm: true
                        },
                        goods_id: {
                            displayName: $rootScope.i18n.lang.goods,
                            listable: false,
                            inputType: "select3",
                            dataSource: GoodsRes
                        },
                        measure: {
                            hideInForm: true,
                        },
                        standard: {
                            field: "standard_label",
                            nameField: "data",
                            valueField: "id",
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            queryParams: {
                                fieldAlias: "standard"
                            }
                        },
                        version: {
                            field: "version_label",
                            nameField: "data",
                            valueField: "id",
                            inputType: "select3",
                            editAbleRequire: "goods_id",
                            dataSource: DataModelDataRes,
                            queryWithExistsData: ["goods_id"],
                            autoQuery: true,
                            queryParams: {
                                fieldAlias: "version"
                            }
                        }
                    };

                    return struct;
                }
            };
        }])
        .service('ProductTplEditModel', ["$rootScope", "StockRes", "GoodsRes",
            function($rootScope, StockRes, GoodsRes){
                return {
                    getFieldsStruct: function(){
                        return {
                            factory_code_all: {
                                hideInForm:true
                            },
                            goods_name: {
                                hideInForm:true
                            },
                            goods_id: {
                                displayName: $rootScope.i18n.lang.goods,
                                listable: false,
                                dataSource: GoodsRes
                            },
                            num: {},
                            stock_id: {
                                displayName: $rootScope.i18n.lang.stock,
                                inputType: "select",
                                dataSource: StockRes
                            }
                        };
                    }
                };
            }])
        .service('ProductTplDetailModel', ["$rootScope", "StockRes", "GoodsRes","DataModelDataRes",
            function($rootScope,StockRes,GoodsRes,DataModelDataRes){
                return {
                    getFieldsStruct: function() {
                        var i18n = $rootScope.i18n.lang;
                        return {
                            goods_id: {
                                displayName: i18n.goods,
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
                                inputType: "number",
                                totalAble: true
                            },
                            memo: {}
                        };
                    }
                };
            }])


        .service("CraftModel", ["$rootScope", function($rootScope){
            return {
                getFieldsStruct: function(){
                    return {
                        id: {primary: true},
                        name: {},
                        listorder: {
                            inputType: "number",
                            placeholder: 0,
                            required: false
                        },
                        memo: {
                            inputType: "textarea",
                            required: false
                        }
                    };
                }
            };
        }])

        .controller("ProducePlanEditCtl", ["$scope", "ProducePlanDetailEditModel", "ProducePlanRes", "ProducePlanDetailRes", "ComView", "$routeParams","TypesRes",
            function($scope, model, res, detailRes, comView, $routeParams, TypesRes){

                $scope.selectAble = false;

                $scope.formMetaData = {
                    startTime : new Date(),
                    endTime : new Date()
                };

                //生产计划类型字段定义
                $scope.typeSelectOpts = {
                    context: {
                        field: "type"
                    },
                    fieldDefine: {
                        inputType: "select",
                        "ng-model": "formMetaData.type",
                        dataSource: TypesRes,
                        queryParams: {
                            type: "produce"
                        }
                    }
                };

                comView.displayBill($scope, model, res, {
                    id: $routeParams.id
                });
            }])
    ;
})();