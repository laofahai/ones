/**
 * Created by nemo on 14-7-7.
 */
(function(){

    //桌面块
    ones.pluginRegister("hook.dashboard.blocks", function(injector, defer, params) {
        ones.pluginScope.append("dashboardBlocks", {
            name: "produceInProcess",
            template: appView("producePlan/dashboardProducePlanDetail.html", "produce")
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
                .when('/doWorkflow/Produce/doCraft/:id', {
                    templateUrl: appView("doCraft.html", "produce"),
                    controller : "WorkflowDoCraftCtl"
                })
                .when('/doWorkflow/Produce/makeStockin/:nodeId/:id', {
                    templateUrl: appView("producePlan/makeStockin.html", "produce"),
                    controller : "WorkflowProduceMakeStockinCtl"
                })
                .when('/produce/editBill/produceBoms/id/:planId', {
                    templateUrl: appView("producePlan/editProduceBoms.html", "produce"),
                    controller: "ProducePlanEditBomsCtl"
                })
                //工作流
                .when('/doWorkflow/producePlan/makePurchase/:nodeId/:id', {
                    templateUrl: appView('producePlan/makePurchase.html', 'produce'),
                    controller: 'ProducePlanMakePurchaseCtl'
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

        .service("DoCraftModel", ["$rootScope", "$injector", "pluginExecutor", "$route", function($rootScope, $injector, plugin, $route) {
            return {
                config: {
                    editAble: false,
                    deleteAble: false,
                    extraSelectActions: [
                        {
                            label: l('lang.actions.endCurrentCraft'),
                            icon: "retweet",
                            authAction: "produce.doCraft.edit",
                            action: function($event, selectedItems, theItem){
                                var scope = this.scope;
                                var injector = this.injector;
                                var res = injector.get("DoCraftRes");
                                var $location = injector.get("$location");

                                if(selectedItems.length <= 0 && !theItem) {
                                    return;
                                }
                                var ids = [];
                                angular.forEach(selectedItems, function(item){
                                    ids.push(item.id);
                                });

                                res.update({
                                    id: (theItem && theItem.id) || ids.join(),
                                    act: "endCurrentCraft"
                                }, {}, function(data){
                                    if(data.error) {
                                        ComView.alert(l("lang.messages."+data.msg), "danger");
                                    } else {
                                        scope.$broadcast("gridData.changed", true);
                                    }

                                });
                            }
                        },
                        {
                            label: l('lang.actions.doNextCraft'),
                            icon: "level-down",
                            authAction: "produce.doCraft.edit",
                            multi: true,
                            action: function($event, selectedItems, theItem){
                                var scope = this.scope;
                                var injector = this.injector;
                                var res = injector.get("DoCraftRes");
                                var $location = injector.get("$location");

                                if(selectedItems.length <= 0 && !theItem) {
                                    return;
                                }
                                var ids = [];
                                angular.forEach(selectedItems, function(item){
                                    ids.push(item.id);
                                });

                                res.update({
                                    id: (theItem && theItem.id) || ids.join()
                                }, {}, function(data){
                                    if(data.error) {
                                        ComView.alert(l("lang.messages."+data.msg), "danger");
                                    } else {
                                        scope.$broadcast("gridData.changed", true);
                                    }

                                });
                            }
                        },
                        {
                            label: l('lang.actions.viewProduceProcess'),
                            icon: "eye",
                            authAction: "produce.doCraft.read",
                            action: function($event, selectedItems, theItem){
                                var injector = this.injector;
                                var res = injector.get("DoCraftRes");
                                var ComView = injector.get("ComView");

                                if(selectedItems.length !== 1 && !theItem) {
                                    return;
                                }

                                res.get({
                                    id: (theItem && theItem.id) || selectedItems[0].id
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
                        num: {},
                        current_craft: {
                            field: "processes.craft_name",
                            cellFilter: "labelAble:'success arrowed-right'"
                        },
                        start_time: {
                            cellFilter: "dateFormat:0"
                        },
                        end_time: {
                            cellFilter: "dateFormat:0",
                            field: "processes.end_time"
                        },
                        next_craft: {
                            field: "processes.next_craft_name",
                            cellFilter: "labelAble:'primary arrowed-right'"
                        }
                    };

                    plugin.callPlugin("bind_dataModel_to_structure", {
                        structure: structure,
                        alias: "product",
                        require: ["goods_id"],
                        queryExtra: ["goods_id"],
                        after: "product"
                    });

                    return ones.pluginScope.get("defer").promise;
                }
            };
        }])

        .service("ProducePlanModel", ["$rootScope", function($rootScope){
            var obj = {
                config: {
                    isBill: true,
                    workflowAlias: "producePlan",
                    rowsModel: "ProducePlanDetailEditModel",
                    extraSelectActions: [
                        {
                            label: l("lang.viewBomList"),
                            icon: "eye",
                            authAction: "produce.produceboms.read",
                            action: function($event, selectedItems, item){
                                var scope = obj.config.extraSelectActions[0].scope;
                                var injector = obj.config.extraSelectActions[0].injector;
                                item = item || selectedItems[0];
                                var model = injector.get("ProduceBomsModel");

                                if(!item.id) {
                                    return false;
                                }

                                model.showMakedBoms(item.id);

                            }
                        },
                        {
                            label: l("lang.actions.viewDetail"),
                            icon: "eye",
                            authAction: "produce.producePlanDetail.read",
                            action: function($event, selectedItems, item){
                                var injector = obj.config.extraSelectActions[1].injector;
                                item = item || selectedItems[0];
                                var $location = injector.get("$location");

                                if(!item.id) {
                                    return false;
                                }

                                $location.url("/produce/list/producePlanDetail/plan_id/"+item.id);

                            }
                        }
                    ]
                },
                getStructure: function(){
                    return {
                        id: {primary: true, width:50},
                        type_label: {
                            displayName: l('lang.type')
                        },
                        start_time: {
                            cellFilter: "dateFormat:1"
                        },
                        end_time: {
                            cellFilter: "dateFormat:1"
                        },
                        create_time: {
                            cellFilter: "dateFormat:0"
                        },
                        status_text: {
                            displayName: l('lang.status'),
                            field: "processes.status_text"
                        },
                        memo: {}
                    };
                }
            };

            return obj;
        }])
        .service("ProducePlanDetailEditModel", ["$rootScope", "GoodsRes", "pluginExecutor", function($rootScope, GoodsRes, plugin){
            return {
                config: {
                    isBill: true,
                    selectAble: false
                },
                getStructure: function() {
                    var i18n = l('lang');
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
                            listAble: false
                        },
                        craft: {
                            editAbleRequire: "goods_id",
                            queryWithExistsData: ["goods_id"],
                            inputType: "craft",
                            listAble: false
                        },

                        num: {
                            inputType: "number",
                            totalAble: true
                        },
                        memo: {
                            listAble: false
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
        .service("ProduceBomsModel", ["$rootScope", "GoodsRes", "pluginExecutor", "ones.dataApiFactory", "ComView", "$location",
            function($rootScope,GoodsRes,plugin, dataAPI, ComView, $location){
                var self = {
                    config: {
                        isBill: true
                    },
                    api: dataAPI.getResourceInstance({
                        uri: "produce/produceBoms"
                    }),
                    getStructure: function(){
                        var s = {
                            goods_id: {
                                displayName: l('lang.goods'),
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
                    },
                    showMakedBoms: function(plan_id) {
                        self.api.get({
                            id: plan_id,
                            checkIsMaked: true
                        }).$promise.then(function(data){
                            if(!data.maked) {
                                ComView.alert(l("lang.messages.bom_not_maked"));
                            } else {
                                $location.url("/produce/editBill/produceBoms/id/"+plan_id);
                            }
                        });
                    }
                };

                return self;
            }])
        .service("ProducePlanDetailModel", ["$rootScope", "pluginExecutor", "ComView", function($rootScope, plugin, ComView) {
            return {
                config: {
                    editAble: false,
                    deleteAble: false,
                    extraSelectActions: [
                        {
                            label: l('lang.actions.viewProduceProcess'),
                            icon: "level-down",
                            authAction: false,
                            action: function($event, selectedItems, theItem){
                                var injector = this.injector;
                                var $location = injector.get("$location");

                                if(selectedItems.length <= 0 && !theItem) {
                                    return;
                                }

                                $location.url("/doWorkflow/Produce/doCraft/"+theItem.plan_id);
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
                            displayName: l('lang.current_craft'),
                            cellFilter: "labelAble:'success arrowed'"
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
                        after: "product"
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
                                displayName: l('lang.goods'),
                                listAble: false,
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
                        var i18n = l('lang');
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

        .service("ProducePlanMakePurchaseModel", ["pluginExecutor", function(plugin){
            return {
                config: {
                    rowsModel: "ProducePlanMakePurchaseModel"
                },
                getStructure: function(){
                    var fields = {
                        goods_id: {
                            displayName: l("lang.goods"),
                            labelField: true,
                            inputType: "static",
                            width: "20%"
                        },
                        num: {
                            inputType: "number",
                            totalAble: true,
                            "ui-event": "{blur: 'afterNumBlur($event)'}",
                            printAble:true
                        },
                        memo: {}

                    };

                    plugin.callPlugin("bind_dataModel_to_structure", {
                        structure: fields,
                        alias: "product",
                        require: ["goods_id"],
                        queryExtra: ["goods_id"],
                        config: {
                            inputType: "static"
                        }
                    });

                    return ones.pluginScope.get("defer").promise;
                }
            };
        }])

        .controller("ProducePlanEditCtl", ["$scope", "ProducePlanModel", "ProducePlanRes", "ProducePlanDetailRes", "ComView", "$routeParams",
            function($scope, model, res, detailRes, ComView, $routeParams){

                $scope.selectAble = false;

                var e = new Date();
                e.setMonth(e.getMonth()+1);

                $scope.formMetaData = {
                    start_time : getDateForInput(),
                    end_time : getDateForInput(e)
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

                $scope.config = {
                    model: model,
                    resource: res
                };

                ComView.makeGridSelectedActions($scope, model, res, "produce", "producePlan");

            }])

        .controller("ProductTplDetailCtl", ["$scope", "ProductTplDetailRes", "ProductTplDetailModel", "ComView", "$routeParams",
            function($scope, res, model, ComView, $routeParams){
                $scope.formMetaData = {};
                $scope.selectAble = false;
                $routeParams.id = $routeParams.pid;


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

                $scope.config = {
                    model: model,
                    resource: res,
                    opts: {queryExtraParams:{workflowing: true}}
                };

                $scope.doBillSubmit = function() {
                    $scope.formMetaData.rows = $scope.billData;
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

                $routeParams.group = "produce";
                $routeParams.module = "producePlan"

                /**
                 * 扩展选择操作选项
                 * */
                ComView.makeGridSelectedActions($scope, model, res, "produce", "doCraft");

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

                $scope.config = {
                    model: model,
                    resource: res,
                    opts: {
                        plan_id: $routeParams.id,
                        queryExtraParams: {workflowing: true}
                    }
                };

                $scope.doBillSubmit = function(){
                    $scope.formMetaData.rows = $scope.billData;
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
        .controller("ProducePlanEditBomsCtl", ["$scope", "ProduceBomsRes", "ProduceBomsModel", "$routeParams", "ComView",
            function($scope, res, model, $routeParams, ComView){

                $scope.selectAble=false;

                ComView.makeGridSelectedActions($scope, model, res, "Produce", "ProducePlan");

                $scope.billConfig = {
                    model: model,
                    resource: res,
                    returnPage: "/produce/list/producePlan"
                };
                $routeParams.id = $routeParams.planId;

            }])

        .controller("ProducePlanMakePurchaseCtl", ["$scope", "$routeParams", "$injector", "ProduceBomsRes", "ones.dataApiFactory",
            function($scope, $routeParams, $injector, ProduceBomsRes, dataAPI){

                if(!isAppLoaded("purchase")) {
                    return false;
                }

                var outSideRes = $injector.get("PurchaseRes");

                $scope.doBillSubmit = function(){
                    $injector.get("Workflow.WorkflowAPI").doPostWorkflow(
                        ProduceBomsRes, $routeParams.nodeId, $routeParams.id,
                        {
                            total_num: $scope.formMetaData.total_num,
                            source_model: "ProducePlan",
                            memo: $scope.formMetaData.memo,
                            rows: $scope.billData
                        },
                        function(){
                            //
                            $scope.$root.goPage("produce/list/producePlan");
                        }
                    );
                }

                $scope.billConfig = {
                    model: $injector.get("ProducePlanMakePurchaseModel"),
                    resource: ProduceBomsRes
                };
            }])
    ;
})();