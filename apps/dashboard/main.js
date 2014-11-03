(function(){
    //控制面板应用
    angular.module("ones.dashboard", [])
        .config(["$routeProvider", function($route){
            $route
                .when('/', {
                    controller: "HOMEDashboardCtl",
                    templateUrl: appView("dashboard.html", "dashboard")
                })
                .when('/dashboard/list/myDesktop', {
                    templateUrl: appView("myDesktop.html", "dashboard"),
                    controller: "HomeMyDesktopCtl"
                })
            ;
        }])
        .factory("MyDesktopRes", ["$resource", "ones.config", function($resource, cnf){
            return $resource(cnf.BSU+"dashboard/myDesktop/:id.json");
        }])
        .factory("UserDesktopRes", ["$resource", "ones.config", function($resource, cnf){
            return $resource(cnf.BSU + "dashboard/userDesktop/:id.json", null, {
                update: {method: "PUT"}
            });
        }])

        .service("UserDesktopModel", function(){
            return {
                getStructure: function(){
                    return {
                        id: {primary: true},
                        name: {},
                        template: {},
                        width: {
                            value: 6,
                            max: 12,
                            inputType: "number"
                        },
                        listorder: {
                            inputType: "number",
                            value: 99
                        }
                    };
                }
            };
        })

        .controller("HomeMyDesktopCtl", ["$scope", "MyDesktopRes", "$location", "pluginExecutor", "$rootScope", function($scope, res, $location, plugin, $rootScope){

            plugin.callPlugin("hook.dashboard.blocks");

            $scope.blocks = ones.pluginScope.get("dashboardBlocks");

            var actived = [];
            var activedItem = {};
            res.query({
                onlyUsed: true
            }).$promise.then(function(data){
                angular.forEach(data, function(item) {
                    actived.push(item.name);
                    activedItem[item.name] = item;
                });

                angular.forEach($scope.blocks, function(block, k){
                    if(actived.indexOf(block.name) >= 0) {
                        $scope.blocks[k]["listorder"] = parseInt(activedItem[block.name].listorder);
                        $scope.blocks[k]["selected"] = true;
                    } else {
                        $scope.blocks[k]["listorder"] = 99;
                    }
                });
            });
            $scope.doSubmit = function() {
                res.save($scope.blocks);
                $location.url("/");
            };
        }])

        .controller("HOMEDashboardCtl", ["$scope", "$rootScope", "MyDesktopRes", "ones.config", "pluginExecutor", "$timeout", "Department.UserAPI", "FirstTimeWizard.WizardAPI",
            function($scope, $rootScope, MyDesktopRes, conf, plugin, $timeout, user, wizard){

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

                $scope.appBtns = [];
                $timeout(function(evt, data){
                    plugin.callPlugin("hook.dashboard.appBtn", $scope);
                    var dashboardAppBtns = ones.pluginScope.get("dashboardAppBtns");
                    dashboardAppBtns.sort(arraySortBy("sort"));
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

                        var authedNodes = ones.caches.getItem("ones.authed.nodes");
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

                        $scope.appBtns.push(app);
                    });

                    wizard.showWizard("#dashboard_appBtn_app_center", "dashboard.after.install.appCenterBtn");
                }, 300);

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


                $scope.dashboardItems = [];
                MyDesktopRes.query({
                    onlyUsed: true
                }, function(data){
                    angular.forEach(data, function(item){
                        $scope.dashboardItems.push(dashboardItemsArray[item.name]);
                    });
                    ones.pluginScope.remove("dashboardBlocks");
                });
            }])
    ;
})();