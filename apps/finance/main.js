(function(){

    ones.pluginRegister("crm.related.items", function(injector, defer, id) {
        ones.pluginScope.append("crm.related.items", {
            title: l("lang.financeReceivePlan"),
            template: appView("plugins/crmRelatedReceive.html", "finance")
        });

        ones.pluginScope.append("crm.related.items", {
            title: l("lang.financePayPlan"),
            template: appView("plugins/crmRelatedPay.html", "finance")
        });
    });

    angular.module("ones.finance", [])
        .config(["$routeProvider", function($route){
            $route.when('/doWorkflow/FinanceReceivePlan/confirm/:nodeId/:id', {
                    templateUrl: appView("confirmReceive.html", "finance"),
                    controller: "WorkflowFinanceReceiveConfirmCtl"
                })
                .when('/doWorkflow/FinancePayPlan/confirm/:nodeId/:id', {
                    templateUrl: appView("confirmPay.html", "finance"),
                    controller: "WorkflowFinancePayConfirmCtl"
                })
            ;
        }])
        //财务模块
        .factory("FinanceAccountRes", ["$resource", "ones.config", function($resource, cnf){
            return $resource(cnf.BSU+"finance/financeAccount/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("FinanceRecordRes", ["$resource", "ones.config", function($resource, cnf){
            return $resource(cnf.BSU+"finance/financeRecord/:id.json", null, {});
        }])
        .factory("FinanceReceivePlanRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "finance/financeReceivePlan/:id.json", null,
                {
                    'doWorkflow': {method: 'GET'},
                    'doPostWorkflow': {method: 'POST'},
                    'update': {method: 'PUT'}
                });
        }])
        .factory("FinancePayPlanRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "finance/financePayPlan/:id.json", null,
                {
                    'doWorkflow': {method: 'GET'},
                    'doPostWorkflow': {method: 'POST'},
                    'update': {method: 'PUT'}
                });
        }])

        .service("FinanceRecordModel", ["$rootScope", function(){
            return {
                config: {
                    editAble: false,
                    addAble: false
                },
                getStructure: function(){
                    return {
                        id: {
                            primary: true,
                            width: "50"
                        },
                        balance_direction: {
                            width: "80"
                        },
                        account: {},
                        record_type: {},
                        amount: {
                            cellFilter: "toCurrency:'￥'"
                        },
                        dateline: {
                            cellFilter: "dateFormat:0"
                        },
                        memo: {},
                        sponsor: {},
                        financer: {}
                    };
                }
            };
        }])
        .service("FinanceAccountModel", ["$rootScope", function(){
            return {
                getStructure: function() {
                    return {
                        id: {primary: true},
                        name: {},
                        balance: {
                            inputType: "number",
                            cellFilter: "toCurrency:'￥'"
                        },
                        listorder: {
                            value: 99
                        }
                    };
                }
            };
        }])
        .service("FinancePayPlanModel", ["$rootScope", function($rootScope){
            return {
                config: {
                    workflowAlias: "financePay"
                },

                getStructure: function(){
                    return {
                        id: {primary: true},
                        subject: {},
                        type_id: {
                            field: "type",
                            displayName: l('lang.type'),
                            inputType: "select",
                            dataSource: "HOME.TypesAPI",
                            queryParams: {
                                type: "pay"
                            }
                        },
                        supplier_name: {
                            field: "supplier_name_label",
                            displayName: l("lang.supplier"),
                            inputType: "select3",
                            dataSource: "RelationshipCompanyRes"
                        },
                        sponsor: {
                            hideInForm: true
                        },
                        amount: {
                            inputType: "number"
                        },
                        payed: {
                            inputType: "number",
                            value: 0
                        },
                        create_dateline: {
                            hideInForm: true,
                            cellFilter: "dateFormat:0"
                        },
                        pay_dateline: {
                            hideInForm: true,
                            cellFilter: "dateFormat:0"
                        },
                        status: {
                            hideInForm: true,
                            field: "processes.status_text"
                        },
                        memo: {
                            required: false,
                            listAble: false
                        }
                    };
                }
            };
        }])
        .service("FinanceReceivePlanModel", ["$rootScope", "FinanceAccountRes", function($rootScope, FinanceAccountRes){
            return {
                config: {
                    workflowAlias: "financeReceive"
                },
                getStructure: function(){
                    return {
                        id: {primary: true},
                        type_id: {
                            field: "type",
                            displayName: l('lang.type'),
                            inputType: "select",
                            dataSource: "HOME.TypesAPI",
                            queryParams: {
                                type: "receive"
                            }
                        },
                        source_model: {
                            cellFilter: "lang",
                            hideInForm: true
                        },
                        customer_name: {
                            field: "customer_name_label",
                            displayName: l("lang.customer"),
                            inputType: "select3",
                            dataSource: "RelationshipCompanyRes"
                        },
                        sponsor: {
                            hideInForm: true
                        },
                        amount: {
                            inputType: "number"
                        },
                        received: {
                            inputType: "number",
                            value: 0
                        },
                        create_dateline: {
                            hideInForm: true,
                            cellFilter: "dateFormat:0"
                        },
                        pay_dateline: {
                            hideInForm: true,
                            cellFilter: "dateFormat:0"
                        },
                        status: {
                            hideInForm: true,
                            field: "processes.status_text"
                        },
                        memo: {
                            required: false,
                            listAble: false,
                            inputType: "textarea"
                        }
                    };
                }
            };
        }])

        .service("ConfirmReceiveModel", ["$rootScope", "FinanceAccountRes", function($rootScope,res){
            return {
                getStructure: function(){
                    return {
                        unreceived: {
                            inputType: "number",
                            displayName: l("lang.amount")
                        },
                        account_id: {
                            displayName: l('lang.account'),
                            inputType: "select",
                            dataSource: res,
                            nameField: "name",
                            valueField: "id"
                        },
                        memo: {
                            required: false
                        }
                    };
                }
            };
        }])

        .service("ConfirmPayModel", ["$rootScope", "FinanceAccountRes", function($rootScope,res){
            return {
                getStructure: function(){
                    return {
                        unpayed: {
                            inputType: "number",
                            displayName: l("lang.amount")
                        },
                        account_id: {
                            displayName: l('lang.account'),
                            inputType: "select",
                            dataSource: "FinanceAccountRes"
                        },
                        memo: {
                            required: false
                        }
                    };
                }
            };
        }])

        /**
         * 确认收款
         * */
        .controller("WorkflowFinanceReceiveConfirmCtl", ["$scope", "ComView", "ConfirmReceiveModel", "FinanceReceivePlanRes", "$routeParams", "$location",
            function($scope, ComView, model, res, $routeParams, $location){
                $scope.selectAble = false;

                $scope.config = {
                    model:model,
                    resource: res
                };

                $scope.doFormSubmit = function(){
                    var params = $.extend({
                        workflow: true,
                        node_id: $routeParams.nodeId,
                        id: $routeParams.id,
                        donext: true
                    }, $scope.formData);
                    res.doPostWorkflow(params).$promise.then(function(data){
                        $location.url('/finance/list/financeReceivePlan');
                    });
                };
            }])
        .controller("WorkflowFinancePayConfirmCtl", ["$scope", "ComView", "ConfirmPayModel", "FinancePayPlanRes", "$routeParams", "$location",
            function($scope, ComView, model, res, $routeParams, $location){
                $scope.selectAble = false;

                $scope.config = {
                    model:model,
                    resource: res
                };

                $scope.doFormSubmit = function(){
                    var params = $.extend({
                        workflow: true,
                        node_id: $routeParams.nodeId,
                        id: $routeParams.id,
                        donext: true
                    }, $scope.formData);
                    res.doPostWorkflow(params).$promise.then(function(data){
                        $location.url('/finance/list/financePayPlan');
                    });
                };
            }])

        .controller("CRMRelatedFinanceReceivePlanCtl", ["$scope", "FinanceReceivePlanModel", "FinanceReceivePlanRes", "$routeParams",
            function($scope, model, res, $routeParams){
                res.query({
                    customer_id: $routeParams.id,
                    _si: "-status",
                    unhandled: true
                }).$promise.then(function(data){
                    $scope.needReceived = data;
                });
            }])
        .controller("CRMRelatedFinancePayPlanCtl", ["$scope", "FinancePayPlanModel", "FinancePayPlanRes", "$routeParams",
            function($scope, model, res, $routeParams){
                res.query({
                    customer_id: $routeParams.id,
                    _si: "-status",
                    unhandled: true
                }).$promise.then(function(data){
                        $scope.needPayed = data;
                    });
            }])

    ;
})();