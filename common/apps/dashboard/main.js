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
                            $scope.blocks[k]["selected"] = true;
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
            		ones.caches.removeItem("ones.dashboard_block.config");
            		ones.caches.removeItem("ones.dashboard_btn.config")
                    res.save({
                        blocks: $scope.blocks,
                        btns: $scope.btns
                    });
                    $location.url("/");
                };
            }])

        .controller("HOMEDashboardCtl", ["$scope", "$rootScope", "UserPreferenceRes", "ones.config", "pluginExecutor", "$timeout", "Department.UserAPI", "$injector",
            function($scope, $rootScope, UserPreferenceRes, conf, plugin, $timeout, user, $injector){

                var chars = 'abcdefghijklmnopqrstuvwxyz';
                var btnClasses = [
                    "default", "success", "inverse", "danger", "warning", "primary",
                    "info", "purple", "pink", "grey", "light", "yellow"
                ];

                ones.pluginScope.set("dashboardAppBtns", []);


                var appBtns = {};
                plugin.callPlugin("hook.dashboard.appBtn", $scope);
                var dashboardAppBtns = ones.pluginScope.get("dashboardAppBtns");

                var authedNodes = ones.caches.getItem("ones.authed.nodes");

                ones.pluginScope.set("dashboardSetBtnTip", function(btnName, tip){
                    $timeout(function(){
                        for(var i=0;i<$scope.appBtns.length;i++) {
                        	$scope.appBtns[i].id = $scope.appBtns[i].name;
                            if($scope.appBtns[i].name == btnName) {
                                $scope.appBtns[i].tip = tip;
                                break;
                            }
                        }
                    }, 1000);
                });

                angular.forEach(dashboardAppBtns, function(app){
                    //权限检测
                    var authNode;
                    if(!app.link && !app.authNode){
                    	return;
                    }
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


                    app.id = 'dashboard_appBtn_'+app.name;
                    app.label_combined = true;
                    app.url = app.link;
                    appBtns[app.name] = app;
                });
                
                $scope.$emit("left_side_changed", appBtns);


                if(isAppLoaded("firstTimeWizard")) {
                    try {
                        $injector.get("FirstTimeWizard.WizardAPI").showPopover("#dashboard_appBtn_app_center", "dashboard.after.install.appCenterBtn", "right");
                    } catch(e) {}

                }


                $scope.appBtns = ones.caches.getItem("ones.dashboard_btn.config") || [];
                $scope.dashboardsBlocks = ones.caches.getItem("ones.dashboard_block.config") || [];
                
                if(!$scope.appBtns.length || !$scope.dashboardsBlocks.length) {
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
                	UserPreferenceRes.get().$promise.then(function(data){
                        angular.forEach(data.blocks, function(item){
                    		block = dashboardItemsArray[item.name];
                        	$scope.dashboardsBlocks.push({
                    			name: block.name,
                    			sizeX: item.width || 12,
                    			sizeY: item.height || 4,
                    			row: item.row || null,
                    			col: item.col || null,
                    			template: block.template
                        	});
                        });
                        
                        angular.forEach(data.btns, function(item){
                            if(!item || !appBtns[item.name]) {
                                return;
                            }
                            if(typeof(item.getTip) === "function") {
                                item.getTip();
                            }
                            $scope.appBtns.push(appBtns[item.name]);
                        });

                        if(!$scope.appBtns.length) {
                            $scope.appBtns.push(appBtns.app_center);
                        }

                        ones.pluginScope.remove("dashboardBlocks");
                    });
                }
                
                
                //更新用户首选项
                var t = 0;
                function updateUserPreference() {
                	data = [];
                	angular.forEach($scope.dashboardsBlocks, function(block){
                		data.push({
                			name: block.name,
                			col: block.col,
                			row: block.row,
                			width: block.sizeX,
                			height: block.sizeY
                		});
                	});
                	if(t) {
                		return;
                	}
                	
                	t = setTimeout(function(){
                		UserPreferenceRes.save({'blocks': data, 'customize': true}, function(){ });
                		ones.caches.setItem("ones.dashboard_block.config", $scope.dashboardsBlocks);
                		ones.caches.setItem("ones.dashboard_btn.config", $scope.appBtns);
                		t = 0;
                	}, 3000); 
                }
                
                
                $scope.gridsterOptions = {
        			margins: [10,10],
        			columns: 24,
        			draggable: {
        				handle: '.dragable',
        				stop: function(){
        					updateUserPreference();
        				}
        			},
        			resizable: {
        				stop: function(){
        					updateUserPreference();
        				}
        			}
        		};
                
                //page info
                $rootScope.currentPage = {};
                $rootScope.currentPage.app = "home";
                $rootScope.currentPage.action = "index";
                $rootScope.currentPage.module = "dashboard";
                $rootScope.currentPage.lang = {
                		app: l("urlmap.dashboard.name")
                };
            		
            }])
    ;
})();