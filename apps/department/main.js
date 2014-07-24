(function(){
    angular.module("ones.department", [])
        .config(["$routeProvider", function($routeProvider) {
            $routeProvider
                .when("/department/viewChild/authGroup/pid/:pid", {
                    templateUrl: appView('assignPermission.html', 'department'),
                    controller: 'AuthGroupAssignPermissionCtl'
                })
                .when("/department/Department/add/pid/:pid", {
                    templateUrl: 'common/base/views/edit.html',
                    controller: 'DepartmentEditCtl'
                })
                .when("/department/Department/edit/id/:id", {
                    templateUrl: 'common/base/views/edit.html',
                    controller: 'DepartmentEditCtl'
                })
                .when("/department/Logout", {
                    templateUrl: 'common/base/views/blank.html',
                    controller: 'LogoutCtl'
                })
                //个人资料
                .when('/department/Profile', {
                    templateUrl: appView('profile.html', 'department'),
                    controller: 'PassportProfileCtl'
                })
            ;
        }])
        .factory("UserProfileRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "department/profile.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("UserRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "department/user/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("DepartmentRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "department/department/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("AuthRuleRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "department/authRule/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("AuthGroupRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "department/authGroup/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("AuthGroupRuleRes", ["$resource", "ones.config", function($resource, cnf){
            return $resource(cnf.BSU + "department/authGroupRule/:id.json", null, {
                'update': {method: 'PUT'},
                'query' : {isArray: false}
            });
        }])
        .factory("UserModel", ["DepartmentRes", "AuthGroupRes", "$q", "$rootScope",
            function(DepartmentRes, AuthGroupRes, $q, $rootScope){

                var service = {
                    getFieldsStruct: function(structOnly) {

                        var fieldsStruct = {
                            id: {
                                primary: true
                            },
                            email: {
                                inputType: "email",
                                ensureunique: "UserRes"
                            },
                            username: {
                                ensureunique: "UserRes"
                            },
                            password: {
                                inputType: "password",
                                listable: false,
                                required: false
                            },
                            truename: {},
                            phone: {
                                inputType: "number"
                            },
                            group_name: {
                                displayName: $rootScope.i18n.lang.usergroup,
                                field: "usergroup",
                                hideInForm: true
                            },
                            usergroup: {
                                inputType: "select",
                                multiple: "multiple",
                                nameField: "title",
                                valueField: "id",
                                listable: false
                            },
                            department: {
                                field: "Department.name",
                                hideInForm: true
                            },
                            department_id: {
                                displayName: $rootScope.i18n.lang.department,
                                nameField: "prefix_name",
                                listable: false,
                                inputType: "select"
                            },
                            status: {
                                displayName: $rootScope.i18n.lang.isEnable,
                                inputType: "select",
                                dataSource: [
                                    {id: 1, name: $rootScope.i18n.lang.yes},
                                    {id: -1, name: $rootScope.i18n.lang.no}
                                ]
                            }
                        };

                        if(structOnly) {
                            return fieldsStruct;
                        } else {
                            var defered = $q.defer();
                            DepartmentRes.query().$promise.then(function(data){
                                fieldsStruct.department_id.dataSource = data;
                            }, function(){
                                defered.reject();
                            }).then(function(){
                                AuthGroupRes.query().$promise.then(function(data){
                                    fieldsStruct.usergroup.dataSource = data;
                                    defered.resolve(fieldsStruct);
                                });
                            });
                            return defered.promise;
                        }
                    }
                };

                return service;
            }])
        .factory("AuthRuleModel", ["$rootScope", function($rootScope){
            return {
                getFieldsStruct : function() {
                    return {
                        id: {primary: true},
                        name: {},
                        title: {},
                        category: {
                            inputType: "select",
                            dataSource: [
                                {id: "all", name: "公用模块"},
                                {id: "basedata", name: "基础数据"},
                                {id: "crm", name: "客户管理"},
                                {id: "finance", name: "基本财务模块"},
                                {id: "accounting", name: "高级财务模块"},
                                {id: "produce", name: "生产管理"},
                                {id: "sale", name: "销售模块"},
                                {id: "department", name: "组织机构管理"},
                                {id: "set", name: "设置模块"},
                                {id: "statistics", name: "统计模块"},
                                {id: "stock", name: "仓储模块"}
                            ]
                        }
                    };
                }
            };
        }])
        .factory("DepartmentModel", ["$rootScope", function($rootScope){
            return {
                subAble: true,
                viewSubAble: false,
                getFieldsStruct: function(){
                    var i18n = $rootScope.i18n.lang;
                    return {
                        id : {
                            primary: true
                        },
                        name: {
                            displayName: i18n.category,
                            listable: false
                        },
                        prefix_name: {
                            hideInForm: true,
                            displayName: i18n.category
                        }
                    };
                }
            };
        }])
        .factory("AuthGroupModel", ["$rootScope", function($rootScope){
            return {
                subAble: true,
                addSubAble: false,
                getFieldsStruct: function(){
                    var i18n = $rootScope.i18n.lang;
                    return {
                        id : {
                            primary: true
                        },
                        title: {
                            displayName: i18n.name
                        }
                    };
                }
            };
        }])

        .controller("LogoutCtl", ["$scope", "$http", "ones.config", function($scope, $http, conf){
            $http.get(conf.BSU+"department/userLogout").success(function(){
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
                            $location.url("/department/list/authGroup");
                        }
                    });
                };
            }])

        .controller("PassportProfileCtl", ["$scope", "$modal", "UserRes", function($scope, $modal, UserRes){

            var modal = $modal({
                scope: $scope,
                title: $scope.$parent.i18n.lang.widgetTitles.editMyProfile,
                contentTemplate: appView('profileEdit.html', 'department'),
                show: false
            });
            $scope.showProfileEdit = function(){
                $scope.userInfo = $scope.$parent.userInfo;
                modal.show();
            };

            $scope.doSubmitProfile = function() {
                $scope.$parent.userInfo = $scope.userInfo;
                UserRes.update({id: $scope.userInfo.id, editMine: true}, {
                    phone: $scope.userInfo.phone,
                    username: $scope.userInfo.username,
                    password: $scope.userInfo.password,
                    email: $scope.userInfo.email
                }).$promise.then(function(data){
                        modal.hide();
                    });
            };
        }])
    ;
})();