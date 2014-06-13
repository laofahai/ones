'use strict';

angular.module("ones.passport", ['ones.passport.services', 'ngGrid', 'ones.common.directives'])
        .config(["$routeProvider", function($routeProvider) {
            $routeProvider
            .when("/Passport/viewChild/authGroup/pid/:pid", {
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
            .when("/Passport/Logout", {
                templateUrl: 'views/common/blank.html',
                controller: 'LogoutCtl'
            })
            //个人资料
            .when('/Passport/Profile', {
                templateUrl: 'views/passport/profile.html',
                controller: 'PassportProfileCtl'
            })
            ;
        }])
    .controller("LogoutCtl", ["$scope", "$http", "ones.config", function($scope, $http, conf){
        $http.get(conf.BSU+"passport/userLogout").success(function(){
            window.location.href="index.html";
        });
        
    }])
    .controller("AuthGroupAssignPermissionCtl", ["$scope", "AuthGroupRuleRes", "$routeParams", "$location", "ones.config",
        function($scope, AuthGroupRuleRes, $routeParams, $location, conf){
            $scope.permissionData = [];
            $scope.selectAble = false;
            $scope.dataList = [];
            AuthGroupRuleRes.query({id: $routeParams.pid}).$promise.then(function(data){
                $scope.permissionData = data.selected || [];
                $scope.dataList = data.rules || {}; 
            });
            
            $scope.doSubmit = function(){
                AuthGroupRuleRes.update({id: $routeParams.pid}, $scope.permissionData).$promise.then(function(data){
                    if(!conf.DEBUG) {
                        $location.url("/Passport/list/authGroup");
                    }
                });
            };
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
                $scope.selectAble = false;
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
                $scope.selectAble = false;
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
                $scope.selectAble = false;
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
                $scope.selectAble = false;
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
        .controller("PassportProfileCtl", ["$scope", function($scope){
                
        }])
        ;