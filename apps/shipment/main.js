(function(){
    angular.module("ones.shipment", [])
        .config(["$routeProvider", function($route){
            $route
                .when('/doWorkflow/shipment/makeShipment/:nodeId/:id', {
                    controller: "WorkflowMakeShipmentCtl",
                    templateUrl: "common/base/views/edit.html"
                });
        }])
        .factory("ShipmentRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "shipment/shipment/:id.json", null,
                {
                    'update': {method: 'PUT'}
                }
            );
        }])
        .service("ShipmentModel", ["$rootScope", "TypesRes", function($rootScope, TypesRes) {
            var i18n = $rootScope.i18n.lang;
            return {
                printAble: true,
                getStructure: function() {
                    return {
                        id: {primary: true},
                        shipment_type: {
                            field: "shipment_type_label",
                            inputType: "select",
                            dataSource: TypesRes,
                            queryParams: {
                                type: "shipment"
                            }
                        },
                        to_company: {
                            displayName: i18n.shipment_to_company
                        },
                        to_name: {
                            displayName: i18n.shipment_to_name
                        },
                        to_phone: {
                            displayName: i18n.shipment_to_phone,
                            listable:false
                        },
                        to_address: {
                            displayName: i18n.shipment_to_address
                        },
                        from_company: {
                            displayName: i18n.shipment_from_company,
                            listable:false
                        },
                        from_name: {
                            displayName: i18n.shipment_from_name,
                            listable:false
                        },
                        from_phone: {
                            displayName: i18n.shipment_from_phone,
                            listable:false
                        },
                        from_address: {
                            displayName: i18n.shipment_from_address,
                            listable:false
                        },
                        freight_type: {
                            field: "freight_type_label",
                            inputType: "select",
                            dataSource: TypesRes,
                            queryParams: {
                                type: "freight"
                            },
                            required: false,
                            listable:false
                        },
                        freight: {
                            inputType: "number",
                            required: false,
                            listable:false
                        },
                        weight: {
                            required: false
                        },
                        total_num: {
                            displayName: i18n.totalNum,
                            required: false
                        }
                    };
                }
            };
        }])

        //生成发货单
        .controller("WorkflowMakeShipmentCtl", ["$scope", "StockoutRes", "RelationshipCompanyRes", "ShipmentRes", "ShipmentModel", "ComView", "$routeParams", "ones.config", "$location", "$timeout",
            function($scope, res, cusRes, ShipmentRes, model, ComView, $routeParams, conf, $location, $timeout){
                var cusId;
                $scope.formData = $scope.formData || {};
                res.get({id:$routeParams.id}).$promise.then(function(data){
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
                            id: cusId
                        }).$promise.then(function(data){
                                $scope.formData.to_company = data.name;
                                $scope.formData.to_name = data.Linkman[0].contact;
                                $scope.formData.to_address = data.address;
                                $scope.formData.to_phone = data.Linkman[0].mobile || data.linkman[0].tel;
                            });
                    }
                });



                //@todo. 按状态监测，非延时监测
                $timeout(function(){
                    $scope.formData.from_name = $scope.$parent.userInfo.truename;
                    $scope.formData.from_company = conf.company_name;
                    $scope.formData.from_address = conf.company_address;
                    $scope.formData.from_phone   = conf.company_phone;
                },200);


                $scope.selectAble = false;
                ComView.displayForm($scope, model, res);

                //重写doSubmit()方法
                $scope.doSubmit = function(){
                    if (!$scope.form.$valid) {
                        ComView.alert($scope.i18n.lang.messages.fillTheForm, "danger");
                        return;
                    }
                    ShipmentRes.save($scope.formData, function(data){
                        if(data.error) {
                            ComView.alert(data.msg);
                        } else {
                            $location.url("/shipment/list/shipment");
                        }
                    });
                };
            }])

    ;
})();