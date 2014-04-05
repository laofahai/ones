'use strict';

angular.module("erp.passport", ['erp.passport.services', 'ngGrid', 'erp.common.directives'])
        .config(["$routeProvider", function($routeProvider) {
            $routeProvider.when("/Passport/User", {
                templateUrl: 'views/common/grid.html',
                controller: 'UserListCtl'
            })
            .when("/Passport/User/add", {
                templateUrl: 'views/common/edit.html',
                controller: 'UserEditCtl'
            })
            .when("/Passport/User/edit/id/:id", {
                templateUrl: 'views/common/edit.html',
                controller: 'UserEditCtl'
            })
            .when("/Passport/AuthRule", {
                templateUrl: 'views/common/grid.html',
                controller: 'AuthRuleCtl'
            })
            .when("/Passport/AuthRule/add", {
                templateUrl: 'views/common/edit.html',
                controller: 'AuthRuleEditCtl'
            })
            .when("/Passport/AuthRule/edit/id/:id", {
                templateUrl: 'views/common/edit.html',
                controller: 'AuthRuleEditCtl'
            })
            .when("/Passport/AuthGroup", {
                templateUrl: 'views/common/grid.html',
                controller: 'AuthGroupCtl'
            })
            .when("/Passport/AuthGroup/add", {
                templateUrl: 'views/common/edit.html',
                controller: 'AuthGroupEditCtl'
            })
            .when("/Passport/AuthGroup/edit/id/:id", {
                templateUrl: 'views/common/edit.html',
                controller: 'AuthGroupEditCtl'
            })
            .when("/Passport/AuthGroup/viewSub/id/:pid", {
                templateUrl: 'views/passport/assignPermission.html',
                controller: 'AuthGroupAssignPermissionCtl'
            })
            .when("/Passport/AuthGroup", {
                templateUrl: 'views/common/grid.html',
                controller: 'AuthGroupCtl'
            })
            .when("/Passport/Department", {
                templateUrl: 'views/common/grid.html',
                controller: 'DepartmentCtl'
            })
            .when("/Passport/Department/add/pid/:pid", {
                templateUrl: 'views/common/edit.html',
                controller: 'DepartmentEditCtl'
            })
            .when("/Passport/Department/edit/id/:id", {
                templateUrl: 'views/common/edit.html',
                controller: 'DepartmentEditCtl'
            })
        }])
    .controller("AuthGroupAssignPermissionCtl", ["$scope", "AuthGroupRuleRes", "$routeParams",
        function($scope, AuthGroupRuleRes, $routeParams){
            $scope.permissionData = [];
            $scope.selecteAble = false;
            AuthGroupRuleRes.query({id: $routeParams.pid}).$promise.then(function(data){
                $scope.permissionData = data.selected;
                $scope.dataList = data.rules; 
            });
            
            $scope.doSubmit = function(){
                AuthGroupRuleRes.update({id: $routeParams.pid}, $scope.permissionData).$promise.then(function(data){
                    
                });
            }
        }])
    .controller("AuthGroupCtl", ["$scope", "AuthGroupModel", "AuthGroupRes", "ComView",
            function($scope, AuthGroupModel, AuthGroupRes, ComView){
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/Passport/AuthGroup/add"
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/Passport/AuthGroup/"
                    }
                ];
                $scope.viewSubAble = true;
                ComView.displayGrid($scope, AuthGroupModel, AuthGroupRes);
            }])
        .controller("AuthGroupEditCtl", ["$scope", "AuthGroupModel", "AuthGroupRes", "ComView", "$routeParams",
            function($scope, AuthGroupModel, AuthGroupRes, ComView, $routeParams){
                $scope.selecteAble = false;
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/Passport/AuthGroup/add"
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/Passport/AuthGroup/"
                    }
                ];
                ComView.displayForm($scope, AuthGroupModel, AuthGroupRes, {
                    id: $routeParams.id
                });
            }])
    .controller("DepartmentCtl", ["$scope", "DepartmentModel", "DepartmentRes", "ComView",
            function($scope, DepartmentModel, DepartmentRes, ComView){
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/Passport/Department/"
                    }
                ];
                $scope.addChildAble = true;
                ComView.displayGrid($scope, DepartmentModel, DepartmentRes, {multiSelect: false});
            }])
        .controller("DepartmentEditCtl", ["$scope", "DepartmentModel", "DepartmentRes", "ComView", "$routeParams",
            function($scope, DepartmentModel, DepartmentRes, ComView, $routeParams){
                $scope.selecteAble = false;
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/Passport/Department/"
                    }
                ];
                ComView.displayForm($scope, DepartmentModel, DepartmentRes, {
                    id: $routeParams.id
                });
            }])
        .controller("AuthRuleCtl", ["$scope", "AuthRuleModel", "AuthRuleRes", "ComView",
            function($scope, AuthRuleModel, AuthRuleRes, ComView){
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/HOME/AuthRule/add"
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/HOME/AuthRule/"
                    }
                ];
                ComView.displayGrid($scope, AuthRuleModel, AuthRuleRes);
            }])
        .controller("AuthRuleEditCtl", ["$scope", "AuthRuleModel", "AuthRuleRes", "ComView", "$routeParams",
            function($scope, AuthRuleModel, AuthRuleRes, ComView, $routeParams){
                $scope.selecteAble = false;
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/HOME/AuthRule/add"
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/HOME/AuthRule/"
                    }
                ];
                ComView.displayForm($scope, AuthRuleModel, AuthRuleRes, {
                    id: $routeParams.id
                });
            }])
        .controller("UserListCtl", ["$scope", "UserModel", "UserRes", "ComView",
            function($scope, UserModel, UserRes, ComView){
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/Passport/User/add"
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/Passport/User/"
                    }
                ];
                ComView.displayGrid($scope, UserModel, UserRes);
            }])
        .controller("UserEditCtl", ["$scope", "UserModel", "UserRes", "ComView", "$routeParams",
            function($scope, UserModel, UserRes, ComView, $routeParams){
                $scope.selecteAble = false;
                $scope.pageActions = [
                    {
                        label : $scope.i18n.lang.actions.add,
                        class : "success",
                        href  : "/Passport/User/add"
                    },
                    {
                        label : $scope.i18n.lang.actions.list,
                        class : "primary",
                        href  : "/Passport/User/"
                    }
                ];
                ComView.displayForm($scope, UserModel, UserRes, {
                    id: $routeParams.id
                }, true);
            }])