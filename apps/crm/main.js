(function(){

    //桌面按钮
    ones.pluginRegister("hook.dashboard.appBtn", function(injector, defer) {
        var ComView = injector.get("ComView");
        ones.pluginScope.append("dashboardAppBtns", {
            label: ComView.toLang("appName", "AppCrm"),
            name: "crmList",
            icon: "group",
            link: "crm/list/relationshipCompany"
        });

        ones.pluginScope.set("defer", defer);
    });

    //综合搜索
    ones.pluginRegister("hook.multiSearch.items", function(inject, defer, params){
        ones.pluginScope.append("ones.multiSearch.items", {
            name: "relationshipCompany",
            dataSource: "RelationshipCompanyRes",
            labelField: "name",
            linkTpl: "crm/editBill/relationshipCompany/id/+id",
            link: "crm/list/relationshipCompany"
        });
        ones.pluginScope.append("ones.multiSearch.items", {
            name: "relationshipCompanyLinkman",
            dataSource: "RelationshipCompanyLinkmanRes",
            labelField: "contact",
            linkTpl: "crm/edit/relationshipCompanyLinkman/id/+id",
            link: "crm/list/relationshipCompanyLinkman"
        });
    });

    angular.module("ones.crm", ["ones.department"])
        .config(["$routeProvider", function($routeProvider){
            $routeProvider.when("/crm/addBill/relationshipCompany", {
                templateUrl: appView("edit.html", "crm"),
                controller: "CRMRelCompanyEditCtl"
            })
            .when("/crm/editBill/relationshipCompany/id/:id", {
                templateUrl: appView("edit.html", "crm"),
                controller: "CRMRelCompanyEditCtl"
            })
            ;
        }])
        .factory("RelationshipCompanyGroupRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "crm/relationshipCompanyGroup/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("RelationshipCompanyLinkmanRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "crm/relationshipCompanyLinkman/:id.json", null, {update: {method: "PUT"}});
        }])
        .factory("RelationshipCompanyRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "crm/relationshipCompany/:id.json", null, {'update': {method: 'PUT'}});
        }])

        .service("RelationshipCompanyGroupModel", ["$rootScope", function($rootScope){
            return {
                getStructure: function(){
                    return {
                        id: {
                            primary: true
                        },
                        name: {},
                        discount: {
                            inputType: "number",
                            min: 1,
                            value: 100
                        }
                    };
                }
            };
        }])
        .service("RelationshipCompanyModel", ["$rootScope", "pluginExecutor", function($rootScope, plugin){
            return {
                config: {
                    columns: 2,
                    formActions: false,
                    isBill: true,
                    rowsModel: "RelationshipCompanyLinkmanModel"
                },
                getStructure: function(){
                    var structure = {
                        id: {
                            primary: true
                        },
                        name: {},
                        group_id: {
                            field: "group_name",
                            dataSource: "RelationshipCompanyGroupRes",
                            inputType: "select",
                            displayName: l('lang.group')
                        },
                        discount: {
                            inputType: "number",
                            max: 100,
                            value: 100
                        },
                        owner: {
                            hideInForm: true
                        },
                        address: {
                            required: false
                        },
                        memo: {
                            required: false,
                            inputType: "textarea"
                        }
                    };

                    plugin.callPlugin("bind_dataModel_to_structure", {
                        structure: structure,
                        after: "address",
                        alias: "crmBaseInfo"
                    });

                    return ones.pluginScope.get("defer").promise;
                }
            };
        }])
        .service("RelationshipCompanyLinkmanModel", ["$rootScope", "pluginExecutor", function($rootScope, plugin){
            return {
                getStructure: function(){
                    var structure = {
                        contact: {},
                        company_name: {
                            billAble: false,
                            hideInForm: true
                        },
                        mobile: {
                            required: false
                        },
                        tel: {
                            required: false
                        },
                        email: {
                            inputType: "email",
                            required: false
                        },
                        qq: {
                            required: false
                        },
                        is_primary: {
                            inputType: "select",
                            cellFilter:"toYesOrNo",
                            dataSource: [
                                {id: -1, name: toLang("no", null, $rootScope)},
                                {id: 1, name: toLang("yes", null, $rootScope)}
                            ],
                            listAble: false
                        }
                    };

                    plugin.callPlugin("bind_dataModel_to_structure", {
                        structure: structure,
                        after: "qq",
                        alias: "crmContact"
                    });

                    return ones.pluginScope.get("defer").promise;
                }
            };
        }])

        .controller("CRMRelCompanyEditCtl", ["$scope", "ComView", "RelationshipCompanyModel", "RelationshipCompanyRes", "RelationshipCompanyLinkmanModel", "$routeParams",
            function($scope, ComView, RelationshipCompanyModel, res, RelationshipCompanyLinkmanModel, $routeParams){
                $scope.selectAble = false;

                $scope.billConfig = {
                    model: RelationshipCompanyModel,
                    resource: res,
                    opts: {
                        minRows: 4
                    }
                };

                $scope.formConfig = {
                    model: RelationshipCompanyModel,
                    resource: res
                };

                $scope.doComplexSubmit = function() {
                    $scope.formMetaData = $scope.formData;
//
//                    console.log($scope);
//                    return;
                    $scope.doBillSubmit();
                };
            }])
    ;
})();