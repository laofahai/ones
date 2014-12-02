(function(){
    angular.module("ones.shipment", [])
        .config(["$routeProvider", function($route){
            $route
                .when('/doWorkflow/shipment/makeExpress/:nodeId/:id', {
                    controller: "WorkflowMakeExpressCtl",
                    templateUrl: "common/base/views/edit.html"
                });
        }])
        .factory("ExpressRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "shipment/express/:id.json", null,
                {
                    'update': {method: 'PUT'}
                }
            );
        }])
        .service("ExpressModel", ["$rootScope", "ones.config", function($rootScope, conf) {
            var i18n = l('lang');
            return {
                config: {
                    printAble: true,
                    printConfig: {}
                },
                getStructure: function() {
                    return {
                        id: {primary: true},
                        express_type: {
                            field: "express_type_label",
                            inputType: "select",
                            dataSource: "HOME.TypesAPI",
                            queryParams: {
                                type: "express"
                            }
                        },
                        freight_type: {
                            field: "freight_type_label",
                            inputType: "select",
                            dataSource: "HOME.TypesAPI",
                            queryParams: {
                                type: "freight"
                            },
                            required: false,
                            listAble:false
                        },
                        freight: {
                            inputType: "number",
                            required: false,
                            listAble:false
                        },
                        weight: {
                            required: false
                        },
                        to_company: {
                            displayName: i18n.shipment_to_company
                        },
                        to_name: {
                            displayName: i18n.shipment_to_name
                        },
                        to_phone: {
                            displayName: i18n.shipment_to_phone,
                            listAble:false
                        },
                        to_address: {
                            displayName: i18n.shipment_to_address
                        },
                        from_company: {
                            displayName: i18n.shipment_from_company,
                            listAble:false,
                            value: conf.company_name
                        },
                        from_name: {
                            displayName: i18n.shipment_from_name,
                            listAble:false,
                            value: ones.userInfo.truename
                        },
                        from_phone: {
                            displayName: i18n.shipment_from_phone,
                            listAble:false,
                            value: ones.userInfo.phone || conf.company_phone
                        },
                        from_address: {
                            displayName: i18n.shipment_from_address,
                            listAble:false,
                            value: conf.company_address
                        },


                        total_num: {
                            displayName: l('lang.totalNum'),
                            required: false
                        }
                    };
                }
            };
        }])

        //生成发货单
        .controller("WorkflowMakeExpressCtl", ["$scope", "StockoutRes", "RelationshipCompanyRes", "ExpressRes", "ExpressModel", "ComView", "$routeParams", "$location", "$timeout",
            function($scope, res, cusRes, ExpressRes, model, ComView, $routeParams,  $location, $timeout){
                var cusId;
                $scope.formData = {};

                $scope.$on("form.dataLoaded", function(){
                    res.get({id:$routeParams.id}).$promise.then(function(data){

                        $scope.formData.from_name = ones.userInfo.truename;
                        $scope.formData.from_company = ones.BaseConf.company_name;
                        $scope.formData.from_address = ones.BaseConf.company_address;
                        $scope.formData.from_phone   = ones.BaseConf.company_phone;

                        if(!data.source) {
                            return;
                        }
                        if(data.source.customer_id) {
                            cusId = data.source.customer_id;
                        } else if(data.source.supplier_id) {
                            cusId = data.source.supplier_id;
                        }

                        if(cusId) {
                            cusRes.get({
                                id: cusId,
                                includeRows: true
                            }).$promise.then(function(data){
                                    $scope.formData.to_company = data.name;
                                    try {
                                        $scope.formData.to_name = data.rows[0].contact;
                                        $scope.formData.to_address = data.address;
                                        $scope.formData.to_phone = data.rows[0].mobile || data.rows[0].tel;
                                    } catch(e) {}

                                });
                        }
                    });
                });


                $scope.selectAble = false;
                $scope.formConfig = {
                    model: model,
                    resource: res
                };

                //重写doSubmit()方法
                $scope.doFormSubmit = function(){
                    if (!$scope.form.$valid) {
                        ComView.alert(l('lang.messages.fillTheForm'), "danger");
                        return;
                    }
                    ExpressRes.save($scope.formData, function(data){
                        if(data.error) {
                            ComView.alert(data.msg);
                        } else {
                            $location.url("/shipment/list/express");
                        }
                    });
                };
            }])

    ;
})();