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
                editAble: false,
                addAble: false,
                getFieldsStruct: function(){
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
                        amount: {},
                        dateline: {
                            cellFilter: "dateFormat"
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
                getFieldsStruct: function() {
                    return {
                        id: {primary: true},
                        name: {},
                        balance: {
                            inputType: "number"
                        },
                        listorder: {
                            value: 99
                        }
                    };
                }
            };
        }])
        .service("FinancePayPlanModel", ["$rootScope","TypesRes", "FinanceAccountRes", function($rootScope, TypesRes, FinanceAccountRes){
            return {
                workflowAlias: "financePay",
                getFieldsStruct: function(){
                    return {
                        id: {primary: true},
                        subject: {},
                        type_id: {
                            field: "type",
                            displayName: $rootScope.i18n.lang.type,
                            inputType: "select",
                            dataSource: TypesRes,
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
                            dataSource: FinanceAccountRes,
                            nameField: "name",
                            valueField: "id"
                        },
                        amount: {
                            inputType: "number"
                        },
                        create_dateline: {
                            hideInForm: true,
                            cellFilter: "dateFormat"
                        },
                        pay_dateline: {
                            hideInForm: true,
                            cellFilter: "dateFormat"
                        },
                        status: {
                            hideInForm: true,
                            field: "processes.status_text"
                        },
                        memo: {
                            required: false,
                            listable: false
                        }
                    };
                }
            };
        }])
        .service("FinanceReceivePlanModel", ["$rootScope", "TypesRes", "FinanceAccountRes", function($rootScope, TypesRes, FinanceAccountRes){
            return {
                workflowAlias: "financeReceive",
                getFieldsStruct: function(){
                    return {
                        id: {primary: true},
                        subject: {},
                        type_id: {
                            field: "type",
                            displayName: $rootScope.i18n.lang.type,
                            inputType: "select",
                            dataSource: TypesRes,
                            queryParams: {
                                type: "receive"
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
                            dataSource: FinanceAccountRes,
                            nameField: "name",
                            valueField: "id"
                        },
                        amount: {
                            inputType: "number"
                        },
                        create_dateline: {
                            hideInForm: true,
                            cellFilter: "dateFormat"
                        },
                        pay_dateline: {
                            hideInForm: true,
                            cellFilter: "dateFormat"
                        },
                        status: {
                            hideInForm: true,
                            field: "processes.status_text"
                        },
                        memo: {
                            required: false,
                            listable: false
                        }
                    };
                }
            };
        }])

        .service("ConfirmReceiveModel", ["$rootScope", "FinanceAccountRes", function($rootScope,res){
            return {
                getFieldsStruct: function(){
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
                ComView.displayForm($scope, model, res, {
                    id: $routeParams.id
                });

                $scope.doSubmit = function(){
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