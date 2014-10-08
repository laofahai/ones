(function(){
    angular.module("ones.finance", [])
        .config(["$routeProvider", function($route){
            $route.when('/doWorkflow/FinanceReceivePlan/confirm/:nodeId/:id', {
                templateUrl: appView("confirmReceive.html", "finance"),
                controller: "WorkflowFinanceReceiveConfirmCtl"
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
                            cellFilter: "currency:'￥'"
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
                            cellFilter: "currency:'￥'"
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
                            displayName: $rootScope.i18n.lang.type,
                            inputType: "select",
                            dataSource: "HOME.TypesAPI",
                            queryParams: {
                                type: "pay"
                            }
                        },
                        sponsor: {
                            hideInForm: true
                        },
                        financer: {
                            hideInForm: true
                        },
                        account_id: {
                            field: "account_name",
                            displayName: $rootScope.i18n.lang.account,
                            inputType: "select",
                            dataSource: "FinanceAccountRes",
                            nameField: "name",
                            valueField: "id"
                        },
                        amount: {
                            inputType: "number"
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
                            displayName: $rootScope.i18n.lang.type,
                            inputType: "select",
                            dataSource: "HOME.TypesAPI",
                            queryParams: {
                                type: "receive"
                            }
                        },
                        source_model: {
                            cellFilter: "lang"
                        },
                        customer_name: {
                            displayName: toLang("customer", "", $rootScope)
                        },
                        sponsor: {
                            hideInForm: true
                        },
                        financer: {
                            hideInForm: true
                        },
                        account_id: {
                            field: "account_name",
                            displayName: $rootScope.i18n.lang.account,
                            inputType: "select",
                            dataSource: FinanceAccountRes,
                            nameField: "name",
                            valueField: "id",
                            listAble: false
                        },
                        amount: {
                            inputType: "number"
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

        .service("ConfirmReceiveModel", ["$rootScope", "FinanceAccountRes", function($rootScope,res){
            return {
                getStructure: function(){
                    return {
                        amount: {
                            inputType: "number"
                        },
                        account_id: {
                            displayName: $rootScope.i18n.lang.account,
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


    ;
})();