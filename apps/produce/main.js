/**
 * Created by nemo on 14-7-7.
 */
(function(){

    //桌面块
    ones.pluginRegister("hook.dashboard.blocks", function(injector, defer, params) {
        ones.pluginScope.append("dashboardBlocks", {
            name: "produceInProcess",
            template: appView("producePlan/dashboardProducePlanDetail.html", "produce"),
            width:4
        });
    });

    angular.module("ones.produce", [
            "ones.pluginsModule"
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
                .when('/produce/viewChild/productTpl/pid/:pid', {
                    templateUrl: appView('productTplEdit.html', 'produce'),
                    controller: 'ProductTplDetailCtl'
                })
                .when('/doWorkflow/Produce/makeBoms/:nodeId/:id', {
                    templateUrl: appView("producePlan/makeBoms.html", "produce"),
                    controller: "WorkflowMakeProduceBomsCtl"
                })
                .when('/doWorkflow/Produce/doCraft/:nodeId/:id', {
                    templateUrl: appView("doCraft.html", "produce"),
                    controller : "WorkflowDoCraftCtl"
                })
                .when('/doWorkflow/Produce/makeStockin/:nodeId/:id', {
                    templateUrl: appView("producePlan/makeStockin.html", "produce"),
                    controller : "WorkflowProduceMakeStockinCtl"
                })
            ;
        }])
        .factory("ProductTplRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "produce/productTpl/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("ProductTplDetailRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "produce/productTplDetail/:id.json", null, {'update': {method: 'PUT'}});
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

        .run(["$rootScope", "$injector", function($rootScope, $injector){
            /**
             * 通用产品工艺设置
             * */
            $rootScope.doSetProductCraft = function(id, name, scope) {
                var res = $injector.get("GoodsCraftRes");
                var modal = $injector.get("$modal");
                res.query({goods_id: id}).$promise.then(function(data){
                    $rootScope.craftsList = data;
                });

                var theModal = modal({
                    scope: scope,
                    title: sprintf(toLang("_product_craft", "widgetTitles", $rootScope), name),
                    contentTemplate: appView('productCraft.html', 'produce'),
                    show: false
                });
                theModal.$promise.then(theModal.show);

                scope.doSaveCraft = function(){
                    res.update({id: id}, scope.craftsList, function(data){
                        theModal.hide();
                    });
                };
            };
        }])

        .service("DoCraftModel", ["$rootScope", "$injector", "pluginExecutor", function($rootScope, $injector, plugin) {
            return {
                config: {
                    editAble: false,
                    deleteAble: false,
                    extraSelectActions: [
                        {
                            label: toLang("doCraft", "actions", $rootScope),
                            icon: "level-down",
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
                    ]
                },
                getStructure: function() {
                    var structure = {
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
                        current_craft: {
                            field: "processes.craft_name",
                            displayName: $rootScope.i18n.lang.current_craft
                        },
                        start_time: {
                            cellFilter: "dateFormat:0"
                        },
                        next_craft: {
                            field: "processes.next_craft_name",
                            displayName: $rootScope.i18n.lang.next_craft
                        },
                        num: {}
                    };

                    plugin.callPlugin("bind_dataModel_to_structure", {
                        structure: structure,
                        alias: "product",
                        require: ["goods_id"],
                        queryExtra: ["goods_id"]
                    });

                    return ones.pluginScope.get("defer").promise;
                }
            };
        }])

        .service("ProducePlanModel", ["$rootScope", function($rootScope){
            return {
                config: {
                    isBill: true,
                    workflowAlias: "produce"
                },
                getStructure: function(){
                    return {
                        id: {primary: true, width:50},
                        type_label: {
                            displayName: $rootScope.i18n.lang.type
                        },
                        start_time: {
                            cellFilter: "dateFormat:0"
                        },
                        end_time: {
                            cellFilter: "dateFormat:0"
                        },
                        create_time: {
                            cellFilter: "dateFormat:0"
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
        .service("ProducePlanDetailEditModel", ["$rootScope", "GoodsRes", "pluginExecutor", function($rootScope, GoodsRes, plugin){
            return {
                config: {
                    isBill: true,
                    selectAble: false
                },
                getStructure: function() {
                    var i18n = $rootScope.i18n.lang;
                    var s = {
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

                    plugin.callPlugin("bind_dataModel_to_structure", {
                        structure: s,
                        alias: "product",
                        require: ["goods_id"],
                        queryExtra: ["goods_id"]
                    });

                    return ones.pluginScope.get("defer").promise;
                }
            };
        }])
        .service("ProduceBomsModel", ["$rootScope", "GoodsRes", "pluginExecutor", function($rootScope,GoodsRes,plugin){
            return {
                config: {
                    isBill: true,
                    workflowAlias: "produce"
                },
                getStructure: function(){
                    var s = {
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
                        num: {
                            inputType: "number"
                        }
                    };

                    plugin.callPlugin("bind_dataModel_to_structure", {
                        structure: s,
                        alias: "product",
                        require: ["goods_id"],
                        queryExtra: ["goods_id"]
                    });

                    return ones.pluginScope.get("defer").promise;
                }
            };
        }])
        .service("ProducePlanDetailModel", ["$rootScope", "pluginExecutor", "ComView", function($rootScope, plugin, ComView) {
            return {
                config: {
                    editAble: false,
                    deleteAble: false,
                    extraSelectActions: [
                        {
                            label: $rootScope.i18n.lang.actions.doCraft,
                            icon: "level-down",
                            action: function($event, selectedItems, theItem){
                                var scope = this.scope;
                                var injector = this.injector;
                                var res = injector.get("DoCraftRes");
                                var conf = injector.get("ones.config");
                                var $location = injector.get("$location");

                                if(selectedItems.length <= 0 && !theItem) {
                                    return;
                                }
                                var ids = [];
                                angular.forEach(selectedItems, function(item){
                                    ids.push(item.id);
                                });

                                res.update({
                                    id: theItem.id || ids.join(),
                                    workflow: true
                                }, {}, function(data){
                                    if(data.error) {
                                        ComView.alert(toLang(data.msg, "messages", $rootScope), "danger");
                                    } else {
                                        scope.$broadcast("gridData.changed", true);
                                    }

                                });
                            }
                        },
                        {
                            label: $rootScope.i18n.lang.actions.viewCraft,
                            icon: "eye",
                            action: function($event, selectedItems, theItem){
                                var scope = this.scope;
                                var injector = this.injector;
                                var res = injector.get("DoCraftRes");
                                var ComView = injector.get("ComView");

                                if(selectedItems.length !== 1 && !theItem) {
                                    return;
                                }

                                res.get({
                                    id: theItem.id || selectedItems[0].id
                                }).$promise.then(function(data){
                                        ComView.aside(data, data.rows, appView("craftProcess.html", "produce"));
                                    });
                            }
                        }
                    ]
                },
                getStructure: function() {
                    var structure = {
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
                        current_craft: {
                            field: "processes.craft_name",
                            displayName: $rootScope.i18n.lang.current_craft
                        },
                        start_time: {
                            cellFilter: "dateFormat:0"
                        },
                        plan_end_time: {
                            cellFilter: "dateFormat:0"
                        },
                        num: {
                        },
                        memo: {}
                    };
                    plugin.callPlugin("bind_dataModel_to_structure", {
                        structure: structure,
                        alias: "product",
                        require: ["goods_id"],
                        queryExtra: ["goods_id"]
                    });

                    return ones.pluginScope.get("defer").promise;
                }
            };
        }])

        .service("ProductTplModel", ["$rootScope", "pluginExecutor",
            function($rootScope, plugin){
                return {
                    config: {
                        subAble: true,
                        addSubAble: false,
                        viewSubAble : true
                    },
                    getStructure: function(structOnly) {
                        var structure = {
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
                                dataSource: "GoodsRes"
                            },
                            measure: {
                                hideInForm: true
                            }
                        };

                        plugin.callPlugin("bind_dataModel_to_structure", {
                            structure: structure,
                            alias: "product",
                            require: ["goods_id"],
                            queryExtra: ["goods_id"]
                        });

                        return ones.pluginScope.get("defer").promise;
                    }
                };
            }])
        .service('ProductTplDetailModel', ["$rootScope", "pluginExecutor",
            function($rootScope, plugin){
                return {
                    config: {
                        rowsModel: "ProductTplDetailModel"
                    },
                    getStructure: function() {
                        var i18n = $rootScope.i18n.lang;
                        var s = {
                            goods_id: {
                                displayName: i18n.goods,
                                labelField: true,
                                inputType: "select3",
                                dataSource: "GoodsRes",
                                valueField: "combineId",
                                nameField: "combineLabel",
                                listAble: false,
                                width: 300
                            },

                            num: {
                                inputType: "number",
                                totalAble: true
                            },
                            memo: {}
                        };

                        plugin.callPlugin("bind_dataModel_to_structure", {
                            structure: s,
                            alias: "product",
                            require: ["goods_id"],
                            queryExtra: ["goods_id"]
                        });

                        return ones.pluginScope.get("defer").promise;
                    }
                };
            }])


        .service("CraftModel", ["$rootScope", function($rootScope){
            return {
                getStructure: function(){
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

        .controller("ProducePlanEditCtl", ["$scope", "ProducePlanDetailEditModel", "ProducePlanRes", "ProducePlanDetailRes", "ComView", "$routeParams",
            function($scope, model, res, detailRes, comView, $routeParams){

                $scope.selectAble = false;

                $scope.formMetaData = {
                    start_time : new Date(),
                    end_time : new Date()
                };

                //生产计划类型字段定义
                $scope.typeSelectOpts = {
                    context: {
                        field: "type"
                    },
                    fieldDefine: {
                        inputType: "select",
                        "ng-model": "formMetaData.type",
                        dataSource: "HOME.TypesAPI",
                        queryParams: {
                            type: "produce"
                        }
                    }
                };

                $scope.billConfig = {
                    model: model,
                    resource: res
                };

            }])

        .controller("ProductTplDetailCtl", ["$scope", "ProductTplDetailRes", "ProductTplDetailModel", "ComView", "$routeParams",
            function($scope, res, model, ComView, $routeParams){
                $scope.formMetaData = {};
                $scope.selectAble = false;
                $routeParams.id = $routeParams.pid;
                console.log(model);
                ComView.displayBill($scope, model, res, {
                    id: $routeParams.pid,
                    module: "/produce/productTplDetail",
                    editExtraParams: "/pid/"+$routeParams.pid
                });

                $scope.config = {
                    model: model,
                    resource: res,
                    opts: {
                        id: $routeParams.pid,
                            module: "/produce/productTplDetail",
                        editExtraParams: "/pid/"+$routeParams.pid
                    }
                };

            }])

        //生成生产计划物料清单
        .controller("WorkflowMakeProduceBomsCtl", ["$scope", "ComView", "ProduceBomsRes", "ProduceBomsModel", "$routeParams", "$location",
            function($scope, ComView, res, model, $routeParams, $location){
                $scope.selectAble=false;

                ComView.makeGridSelectedActions($scope, model, res, "Produce", "ProducePlan");

                ComView.displayBill($scope, model, res, {
                    id: $routeParams.id,
                    queryExtraParams: {workflowing: true}
                });

                $scope.doSubmit = function() {
                    $scope.formMetaData.rows = $scope.formData;
                    res.doPostWorkflow({
                        workflow: true,
                        node_id: $routeParams.nodeId,
                        id: $routeParams.id,
                        donext: true,
                        data: $scope.formMetaData
                    }).$promise.then(function(data){
                            $location.url("/produce/list/producePlan");
                        });
                };
            }])
        /**
         * 执行生产工序
         * 提供当前生产计划成品列表，供操作员选择执行某个成品的某个工序，工序按照预定义顺序执行
         * */
        .controller("WorkflowDoCraftCtl", ["$scope", "ComView", "DoCraftRes", "DoCraftModel", "$routeParams",
            function($scope, ComView, res, model, $routeParams){

                /**
                 * 扩展选择操作选项
                 * */
                ComView.makeGridSelectedActions($scope, model, res, "Produce", "doCraft");

                ComView.displayGrid($scope, model, res, {
                    queryExtraParams: {
                        plan_id: $routeParams.id,
                        workflow: true
                    }
                });
            }])
        /**
         * 生成入库单
         * */
        .controller("WorkflowProduceMakeStockinCtl", ["$scope", "ProducePlanRes", "ProducePlanDetailEditModel", "ComView", "$routeParams", "$location",
            function($scope, res, model, ComView, $routeParams, $location){
                $scope.selectAble = false;
                ComView.displayBill($scope, model, res, {
                    plan_id: $routeParams.id,
                    queryExtraParams: {workflowing: true}
                });

                $scope.doSubmit = function(){
                    $scope.formMetaData.rows = $scope.formData;
                    res.doPostWorkflow({
                        workflow: true,
                        node_id: $routeParams.nodeId,
                        id: $routeParams.id,
                        donext: true,
                        data: $scope.formMetaData
                    }).$promise.then(function(data){
                            $location.url("/produce/list/producePlan");
                        });
                };
            }])

        .controller("DashboardProduceInProcess", ["$scope", "ProducePlanDetailRes", function($scope, res){
            res.query({
                limit: 5
            }).$promise.then(function(data){
                $scope.items = data;
            });
        }])
    ;
})();