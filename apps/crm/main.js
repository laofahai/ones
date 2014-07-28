(function(){
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
        .factory("RelationshipCompanyRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "crm/relationshipCompany/:id.json", null, {'update': {method: 'PUT'}});
        }])

        .service("RelationshipCompanyGroupModel", ["$rootScope", function($rootScope){
            return {
                isBill: true,
                getFieldsStruct: function(){
                    return {
                        id: {
                            primary: true
                        },
                        name: {},
                        discount: {
                            inputType: "number",
                            max: 100,
                            min: 1,
                            value: 100
                        }
                    };
                }
            };
        }])
        .service("RelationshipCompanyModel", ["$rootScope", "RelationshipCompanyGroupRes", function($rootScope, RelationshipCompanyGroupRes){
            return {
                columns: 2,
                formActions: false,
                isBill: true,
                getFieldsStruct: function(){
                    return {
                        id: {
                            primary: true
                        },
                        name: {},
                        group_id: {
                            field: "Group.name",
                            dataSource: RelationshipCompanyGroupRes,
                            inputType: "select",
                            displayName: $rootScope.i18n.lang.group
                        },
                        discount: {
                            inputType: "number",
                            max: 100,
                            value: 100
                        },
                        owner: {
                            hideInForm: true,
                            field: "User.truename"
                        },
                        address: {
                            required: false
                        },
                        memo: {
                            required: false,
                            inputType: "textarea"
                        }
                    };
                }
            };
        }])
        .service("RelationshipLinkmanModel", ["$rootScope", function($rootScope){
            return {
                isBill: true,
                getFieldsStruct: function(){
                    return {
                        contact: {},
                        mobile: {},
                        tel: {},
                        email: {
                            inputType: "email"
                        },
                        qq: {},
                        is_primary: {
                            inputType: "select",
                            dataSource: [
                                {id: -1, name: toLang("no", null, $rootScope)},
                                {id: 1, name: toLang("yes", null, $rootScope)}
                            ]
                        }
                    };
                }
            };
        }])

        .controller("CRMRelCompanyEditCtl", ["$scope", "ComView", "RelationshipCompanyModel", "RelationshipCompanyRes", "RelationshipLinkmanModel", "$routeParams",
            function($scope, ComView, RelationshipCompanyModel, res, RelationshipLinkmanModel, $routeParams){
                $scope.selectAble = false;
                ComView.displayForm($scope, RelationshipCompanyModel, res, {
                    dataName: "baseInfo",
                    name: "baseInfoForm",
                    id: $routeParams.id
                });

                ComView.displayBill($scope, RelationshipLinkmanModel, res, {
                    minRows: 4,
                    id: $routeParams.id
                });

                $scope.doComplexSubmit = function() {
                    if(!$scope.doFormValidate("baseInfoForm")) {
                        return false;
                    }
                    $scope.formMetaData = $scope.baseInfo;
                    $scope.doSubmit();
                };
            }])
    ;
})();