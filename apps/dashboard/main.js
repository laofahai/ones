(function(){
    //控制面板应用
    angular.module("ones.dashboard", [])
        .config(["$routeProvider", function($route){
            $route
                .when('/', {
                    controller: "HOMEDashboardCtl",
                    templateUrl: appView("dashboard.html", "dashboard")
                })
                .when('/my/preference', {
                    templateUrl: appView("preference.html", "dashboard"),
                    controller: "UserPreferenceCtl"
                })
            ;
        }])
        .factory("UserPreferenceRes", ["$resource", "ones.config", function($resource, cnf){
            return $resource(cnf.BSU+"dashboard/userPreference/:id.json");
        }])
        .factory("UserDesktopRes", ["$resource", "ones.config", function($resource, cnf){
            return $resource(cnf.BSU + "dashboard/userDesktop/:id.json", null, {
                update: {method: "PUT"}
            });
        }])

        .controller("UserPreferenceCtl", ["$scope", "UserPreferenceRes", "$location", "pluginExecutor", "$rootScope",
            function($scope, res, $location, plugin, $rootScope){

                plugin.callPlugin("hook.dashboard.blocks");
                $scope.blocks = ones.pluginScope.get("dashboardBlocks");

                $scope.btns = ones.pluginScope.get("dashboardAppBtns");
                if(!$scope.btns) {
                    ones.pluginScope.set("dashboardSetBtnTip", function(){})
                    plugin.callPlugin("hook.dashboard.appBtn");
                    $scope.btns = ones.pluginScope.get("dashboardAppBtns");
                }

                var activedBlocks = [];
                var activedBlockItem = {};
                var activedBtns = [];
                var activedBtnItem = {};
                res.get().$promise.then(function(data){
                    angular.forEach(data.blocks, function(item) {
                        activedBlocks.push(item.name);
                        activedBlockItem[item.name] = item;
                    });

                    angular.forEach($scope.blocks, function(block, k){
                        if(activedBlocks.indexOf(block.name) >= 0) {
                            $scope.blocks[k]["listorder"] = parseInt(activedBlockItem[block.name].listorder);
                            $scope.blocks[k]["position"] = parseInt(activedBlockItem[block.name].position) || 1;
                            $scope.blocks[k]["selected"] = true;
                        } else {
                            $scope.blocks[k]["listorder"] = 99;
                            $scope.blocks[k]["position"] = 1;
                        }
                    });

                    angular.forEach(data.btns, function(item) {
                        activedBtns.push(item.name);
                        activedBtnItem[item.name] = item;
                    });

                    angular.forEach($scope.btns, function(btn, k){
                        if(activedBtns.indexOf(btn.name) >= 0) {
                            $scope.btns[k]["listorder"] = parseInt(activedBtnItem[btn.name].listorder);
                            $scope.btns[k]["selected"] = true;
                        } else {
                            $scope.btns[k]["listorder"] = 99;
                        }
                    });

                });


                $scope.doSubmit = function() {
                    res.save({
                        blocks: $scope.blocks,
                        btns: $scope.btns
                    });
                    $location.url("/");
                };
            }])

        .controller("HOMEDashboardCtl", ["$scope", "$rootScope", "UserPreferenceRes", "ones.config", "pluginExecutor", "$timeout", "Department.UserAPI", "FirstTimeWizard.WizardAPI",
            function($scope, $rootScope, UserPreferenceRes, conf, plugin, $timeout, user, wizard){

                var chars = 'abcdefghijklmnopqrstuvwxyz';
                var btnClasses = [
                    "default", "success", "inverse", "danger", "warning", "primary",
                    "info", "purple", "pink", "grey", "light", "yellow"
                ];

                ones.pluginScope.set("dashboardAppBtns", []);
                ones.pluginScope.set("dashboardSetBtnTip", function(btnName, tip){
                    $timeout(function(){
                        for(var i=0;i<$scope.appBtns.length;i++) {
                            if($scope.appBtns[i].name == btnName) {
                                $scope.appBtns[i].tip = tip;
                                break;
                            }
                        }
                    }, 1000);
                });

                var appBtns = {};
                plugin.callPlugin("hook.dashboard.appBtn", $scope);
                var dashboardAppBtns = ones.pluginScope.get("dashboardAppBtns");

                var authedNodes = ones.caches.getItem("ones.authed.nodes");

                angular.forEach(dashboardAppBtns, function(app){
                    //权限检测
                    var authNode;
                    if(app.authNode) {
                        authNode = app.authNode;
                    } else {
                        var tmp = app.link.split("/");
                        var action = "read";
                        switch(tmp[2]) {
                            case "add":
                            case "addBill":
                                action = "add";
                                break;
                            case "edit":
                            case "editBill":
                                action = "edit";
                                break;
                        }
                        authNode = [tmp[0],tmp[2],action].join(".").toLowerCase();
                    }

                    try {
                        if(authedNodes.indexOf(authNode) < 0) {
                            return false;
                        }
                    } catch(e) {
                        return false;
                    }


                    //随机底色
                    if(!app.btnClass){
                        var tmp = md5.createHash(app.label).slice(2,3);
                        var tmpIndex = chars.indexOf(tmp);
                        if(tmpIndex >= 0) {
                            if(tmpIndex > 11) {
                                tmpIndex -= 11;
                            }
                            if(tmpIndex > 21) {
                                tmpIndex -= 21;
                            }
                        } else {
                            tmpIndex = tmp;
                        }
                        app.btnClass = btnClasses[tmpIndex];
                    }
                    //图标
                    if(!app.icon){
                        app.icon = "folder-close-alt";
                    }

                    appBtns[app.name] = app;
                });

                wizard.showPopover("#dashboard_appBtn_app_center", "dashboard.after.install.appCenterBtn", "right");

                /**
                 * 桌面块
                 * */
                plugin.callPlugin("hook.dashboard.blocks");

                var tmp = ones.pluginScope.get("dashboardBlocks");
                var dashboardItemsArray = {};
                angular.forEach(tmp, function(blk){
                    dashboardItemsArray[blk.name] = blk;
                });

                $scope.$watch(function(){
                    return $rootScope.dataQuering;
                }, function(dataQuering){
                    if(dataQuering <= 0) {
                        $scope.$broadcast("dashboardItems.loaded");
                    }
                });


                $scope.dashboardItems = {
                    left: [],
                    right: []
                };
                $scope.appBtns = [];
                UserPreferenceRes.get().$promise.then(function(data){
                    angular.forEach(data.blocks, function(item){
                        if(item.position > 1) {
                            $scope.dashboardItems.right.push(dashboardItemsArray[item.name]);
                        } else {
                            $scope.dashboardItems.left.push(dashboardItemsArray[item.name]);
                        }
                    });

                    angular.forEach(data.btns, function(item){
                        $scope.appBtns.push(appBtns[item.name]);
                    });

                    if(!$scope.appBtns.length) {
                        $scope.appBtns.push(appBtns.app_center);
                    }

                    ones.pluginScope.remove("dashboardBlocks");
                });
            }])
    ;
})();