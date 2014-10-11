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

        .service("Department.UserAPI", ["$rootScope", "ones.dataApiFactory", "$q", "$injector",
            function($rootScope, res, $q, $injector){
                this.structure = {
                    id: {
                        primary: true
                    },
                    email: {
                        inputType: "email",
                        ensureunique: "Department.UserAPI"
                    },
                    username: {
                        ensureunique: "Department.UserAPI"
                    },
                    password: {
                        inputType: "password",
                        listAble: false,
                        required: false
                    },
                    truename: {},
                    phone: {
                        inputType: "number"
                    },
                    group_name: {
                        displayName: toLang("usergroup", "", $rootScope),
                        field: "usergroup",
                        hideInForm: true
                    },
                    group_ids: {
                        displayName: toLang("usergroup", "", $rootScope),
                        inputType: "select",
                        multiple: "multiple",
                        nameField: "title",
                        valueField: "id",
                        listAble: false,
                        dataSource: "AuthGroupRes",
                        hideInDetail:true
                    },
                    department: {
                        field: "Department.name",
                        hideInForm: true
                    },
                    department_id: {
                        displayName: toLang("department", "", $rootScope),
                        nameField: "prefix_name",
                        listAble: false,
                        inputType: "select",
                        dataSource: "Department.DepartmentAPI",
                        hideInDetail:true
                    },
                    status: {
                        displayName: toLang("isEnable", "", $rootScope),
                        inputType: "select",
                        dataSource: [
                            {id: 1, name: toLang("yes", "", $rootScope)},
                            {id: -1, name: toLang("no", "", $rootScope)}
                        ],
                        cellFilter: "toYesOrNo"
                    }
                };

                this.api = res.getResourceInstance({
                    uri: "department/user",
                    extraMethod: {
                        "update": {method: "PUT"}
                    }
                });

                this.loginAPI = res.getResourceInstance({
                    uri: "passport/login"
                });

                this.getStructure = function() {
                    return this.structure;
                };

                this.login = function(loginInfo) {
                    var defer = $q.defer();

                    this.loginAPI.save(loginInfo).$promise.then(function(data){
                        if(data.error) {
                            defer.reject(toLang(data.msg, "messages", $rootScope));
                        } else if(data.sessionHash){
                            defer.resolve(data.sessionHash);
                        }
                    }, function(data){
                        defer.reject(toLang(data, "messages", $rootScope));
                    });

                    return defer;
                };


                this.logout = function(){
                    var defer = $q.defer();
                    this.loginAPI.query().$promise.then(function(){
                        ones.caches.clear(-1);
                        ones.caches.clear(0);
                        window.location.href = "./";
                    });
                };

            }])

        .factory("AuthRuleModel", ["$rootScope", function($rootScope){
            return {
                getStructure : function() {
                    return {
                        id: {primary: true},
                        name: {},
                        title: {
                            field: "name",
                            cellFilter: "toAuthNodeName",
                            hideInForm: true
                        }
                    };
                }
            };
        }])
        .service("Department.DepartmentAPI", ["$rootScope", "ones.dataApiFactory", "$q", function($rootScope, dataAPI, $q){
            return {
                config: {
                    subAble: true,
                    viewSubAble: false,
                    multiSelect: false
                },
                structure: {
                    id : {
                        primary: true
                    },
                    name: {
                        listAble: false
                    },
                    prefix_name: {
                        hideInForm: true,
                        displayName: toLang("name", "", $rootScope),
                        hideInDetail: true
                    },
                    leader: {
                        inputType: "select",
                        dataSource: "Department.UserAPI",
                        multiple: true,
                        nameField: "truename",
                        required: false
                    }
                },
                api: dataAPI.getResourceInstance({
                    uri: "department/department"
                }),
                getStructure: function(){
                    return this.structure;
                },
                //获取当前部门的所有父部门
                getParentCats: function(did) {
                    return this.api.query({
                        onlyParents: true
                    });
                },
                /**
                 * 查看用户是否有某部门的负责权限
                 * */
                canUserLeader: function(departmentId, uid){
                    uid = uid || ones.userInfo.id;
                    var defer = $q.defer();
                    this.api.get({
                        act: "canLeader",
                        department: departmentId,
                        user: uid
                    }).$promise.then(function(data){
                        if(data.isLeader) {
                            defer.resolve();
                        } else {
                            defer.reject();
                        }
                    });

                    return defer.promise;
                }
            };
        }])
        .factory("AuthGroupModel", ["$rootScope", function($rootScope){
            return {
                config: {
                    subAble: true,
                    addSubAble: false
                },
                getStructure: function(){
                    var i18n = l('i18n.lang');
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

        .controller("LogoutCtl", ["$scope", "$http", "ones.config", "Department.UserAPI", function($scope, $http, conf, User){
             User.logout();
        }])
        .controller("AuthGroupAssignPermissionCtl", ["$scope", "AuthGroupRuleRes", "$routeParams", "$location", "ones.config",
            function($scope, AuthGroupRuleRes, $routeParams, $location, conf){
                $scope.permissionData = {};
                $scope.selectAble = false;
                $scope.dataList = [];
                AuthGroupRuleRes.query({id: $routeParams.pid}).$promise.then(function(data){
                    $scope.permissionData = data.selected || {};
                    $scope.dataList = data.rules || {};
                });

                $scope.toggleThisLine = function(evt) {
                    var tdContainer = $(evt.target).parents("td").next();
                    var node_id = tdContainer.find("input[type='checkbox']").eq(0).data("nodeid");
                    if($scope.permissionData[node_id]) {
                        $(tdContainer).find("input[type='checkbox']").each(function(){
                            $scope.permissionData[$(this).data("nodeid")] = undefined;
                            $(this).prop("checked", false);
                        });
                    } else {
                        $(tdContainer).find("input[type='checkbox']").each(function(){
                            $scope.permissionData[$(this).data("nodeid")] = true;
                            $(this).prop("checked", "checked");
                        });
                    }
                }


                $scope.doSubmit = function(){
                    AuthGroupRuleRes.update({id: $routeParams.pid}, {
                        nodes: $scope.permissionData
                    }).$promise.then(function(data){
                        $location.url("/department/list/authGroup");
                    });
                };
            }])

        .controller("PassportProfileCtl", ["$scope", "$modal", "Department.UserAPI", function($scope, $modal, User){

            var modal = $modal({
                scope: $scope,
                title: l('lang.widgetTitles.editMyProfile'),
                contentTemplate: appView('profileEdit.html', 'department'),
                show: false
            });
            $scope.showProfileEdit = function(){
                $scope.userInfo = $scope.$parent.userInfo;
                modal.show();
            };

            $scope.doSubmitProfile = function() {
                $scope.$parent.userInfo = $scope.userInfo;
                User.api.update({id: $scope.userInfo.id, editMine: true}, {
                    phone: $scope.userInfo.phone,
                    username: $scope.userInfo.username,
                    truename: $scope.userInfo.truename,
                    password: $scope.userInfo.password,
                    email: $scope.userInfo.email
                }).$promise.then(function(data){
                    modal.hide();
                });
            };
        }])
    ;
})();