(function(){

    'use strict';
    angular.module('ones', [
            'ngResource',
            'ngSanitize',
            'ngRoute',
            'ngAnimate',
            'ngTouch',
            'mgcrea.ngStrap',
            'localytics.directives', //FOR CHOSEN
            'ui.utils',
            'gridster',
            
            'ones.gridView',
            "ones.formMaker",
            'ones.detailView',

            "ones.pluginsModule",
            "ones.print",

            '[ones.requirements.placeholder]',

            'ones.common',
            'ones.common.services',
            'ones.configModule',
            'ones.commonView' //需要先加载模块，让模块路由优先匹配
        ])
        /**
         * $http interceptor.
         * On 401 response – it stores the request and broadcasts 'event:loginRequired'.
         */
        .config(["$httpProvider", "$locationProvider", function($httpProvider, $locationProvider) {

            var reqInterceptor = ['$q', '$cacheFactory', '$timeout', '$rootScope', function ($q, $cacheFactory, $timeout, $rootScope) {

                $rootScope.dataQuering = 0;
                var loadingStatePercent = 0;
                var timer;

                return {
                    'request': function(config) {
                        $rootScope.dataQuering++;
                        return config;
                    },

                    'response': function(response) {
                        $rootScope.dataQuering--;
                        if (parseInt(response.data.error) > 0) {
                            $rootScope.$broadcast('event:serverError', response.data.msg);
                            return $q.reject(response);
                        } else {
                            return response;
                        }

                        return response;
                    },

                    'responseError': function(response) {
                        var status = response.status;
                        switch(status) {
                            case 401:
                                $rootScope.$broadcast('event:loginRequired', response.data);
                                break;
                            case 403:
                                $rootScope.$broadcast('event:permissionDenied', response.data);
                                break;
                            case 500:
                                $rootScope.$broadcast('event:serverError', response.data);
                                break;
                            default:
                                break;
                        };
                        $rootScope.dataQuering = 0;
                        return $q.reject(response);
                    }
                };
            }];

            if(ones.useHTML5) {
                $locationProvider.html5Mode(true);
            }

            $httpProvider.interceptors.push(reqInterceptor);
        }])
        /**
         * Root Ctrl
         * */
        .controller('MainCtl', ["$scope", "$rootScope", "$location", "$http", "ones.config", "ComView", "$timeout", "pluginExecutor", "$injector", "$route",
            function($scope, $rootScope, $location, $http, conf, ComView, $timeout, plugin, $injector, $route) {

                if(!ones.caches.getItem("ones.authed.nodes")) {
                    if(ones.caches.getItem("ones.reloading")) {
                        ones.caches.removeItem("ones.reloading");
                        alert("Something is wrong, please clear the cache and re-login.");
                    }

                    $http.get(conf.BSU + "home/index/0.json").success(function(data) {
                        ones.caches.setItem("ones.authed.nodes", data.authed, 1);
                        ones.caches.setItem("ones.main.navs", data.navs, 1);
                        ones.caches.setItem("ones.reloading", 1);

                        window.location.reload();
                    });

                }

                var loadingStatePercent
                $scope.$watch(function(){
                    return $rootScope.dataQuering;
                }, function(dataQuering, old){

                    if(!dataQuering) {
                        setTimeout(function(){
                            $("#loadingStateBarProgress").width("0");
                        }, 1500);
                        return;
                    }
                    if(old === dataQuering) {
                        loadingStatePercent = 0;
                    } else {

                        loadingStatePercent = Number(100-parseInt((dataQuering-1)*100/dataQuering));

                        if(isNaN(loadingStatePercent)) {
                            loadingStatePercent = 100;
                        }
                    }

                    $("#loadingStateBarProgress").width(String(loadingStatePercent)+"%");

                });

                $rootScope.goPage = function(url, evt) {
                    if(undefined === url || !$.trim(url)) {
                        return;
                    };
                    if(url === "DASHBOARD") {
                        url = "";
                    };
                    if(evt) {
                    	$(evt.target).siblings().removeClass('active').addClass('active');
                    }
                    $location.url(url[0] == "/" ? url : "/"+url);
                };

                //左侧是否展开
                var expand = ones.caches.getItem("ones.sidebar.expand");

                $scope.sidebar_expand = expand;
                $scope.sidebarToggleExpand = function() {
                    $scope.sidebar_expand = !$scope.sidebar_expand;
                    ones.caches.setItem("ones.sidebar.expand", $scope.sidebar_expand, 1);
                };

                //有需要的APP未能加载
                if(ones.unfoundApp) {
                    ComView.alert(
                        sprintf(l('lang.messages.unfoundApp'), ones.unfoundApp.join()),
                        "danger",
                        "!",
                        false);
                    $scope.unfoundApp = ones.unfoundApp;
                }
                
                //打开wiki帮助页面
                $scope.goToWiki = function(app){
                	var uri = 'http://project.ng-erp.com/projects/ones/';
                	if(isPrimaryApp()) {}
                	if(app != "home" && app != "dashboard") {
                		uri = sprintf('%ssearch?q=%s&wiki_pages=1', uri, app);
                	} else {
                		uri += "wiki"
                	}
                	
                	window.open(uri);
                };

                $scope.onesConf = conf;
                $scope.BSU = conf.BSU;
                $scope.BSURoot = conf.BSURoot;
                if(!$scope.BSURoot) {
                    var tmp = conf.BSU.split("/").slice(0, -2);
                    $scope.BSURoot = tmp.join("/");
                }

                $scope.$watch(function() {
                    return $location.path();
                }, function() {
                    $scope.currentURI = encodeURI(encodeURIComponent($location.$$url));
                });

                //监听全局事件
                $scope.$on("event:loginRequired", function() {
                    window.location.href = "./";
                });

                $scope.$on("event:permissionDenied", function(evt, msg) {
                    msg = ComView.toLang("permissionDenied", "messages") + ComView.toLang(msg, "messages");
                    ComView.alert(msg, "danger");
                });

                $scope.$on("event:serverError", function(evt, msg) {
                    //msg = ComView.toLang(msg || "serverError", "messages");

                    if(msg.indexOf("_unicode_|") >= 0) {
                        msg = msg.replace('_unicode_|', '');
                    } else {
                        msg = l("lang.messages."+msg);
                    }
                    ComView.alert(msg, "danger");
                });

                $scope.hideContextMenu = function() {
                    $timeout(function(){
                        $scope.contextMenu = {};
                    }, 50);
                };
                $scope.$on("contextMenu", function(evt, param) {

                    param.top += document.body.scrollTop;

                    $scope.contextMenu = param;

                    $(document).click(function(){
                        $scope.$apply(function(){
                            $scope.contextMenu = {};
                        });
                    });
                });
                
                //左侧导航
                $scope.$on("left_side_changed", function(evt, childs){
                	$scope.left_navs = childs;
                });
                $scope.toggle_sidebar_active_nav = function(id, url){
                	$scope.sidebar_active_nav = id;
                	if(url) {
                		$rootScope.goPage(url);
                	}
                };
                

                //窗口活动状态
                $(window).blur(function(){
                    ones.caches.setItem("ones.is.window.active", false, -1);
                });
                $(window).focus(function(){
                    ones.caches.setItem("ones.is.window.active", true, -1);
                });


                //刷新NG-VIEW
                $scope.doPageRefresh = function(){
                    $scope.$broadcast("$locationChangeStart");
                    $route.reload();
                };

                //全局键盘事件
                $scope.doMainKeyDown = function($event){
                    //back space
                    if($event.keyCode === 8) {
                        var skips = [
                            "input",
                            "textarea"
                        ];
                        if(skips.indexOf($($event.target).context.localName) >= 0) {
                            return true;
                        }
                        window.event.returnValue = false;
                        return false;
                    }

                    plugin.callPlugin("hook.hotKey", $event);
                };

                $scope.isAppLoaded = function(app) {
                    return isAppLoaded(app);
                };

                $scope.isPrimaryApp = function(app) {
                    return isPrimaryApp(app);
                };

                /**
                 * 监控路由变化
                 * */
                 var lastPage = [];
                 $rootScope.$on("$locationChangeSuccess", function() {
                    doWhenLocationChanged();

                    $('body,html').animate({scrollTop:0},300);

                    lastPage[0] = lastPage[1];
                    lastPage[1] = $location.path();
                    ones.caches.setItem("lastPage", lastPage, -1);
                });

                function doWhenLocationChanged() {
                    /**
                     * 设置当前页面信息
                     * 两种URL模式： 普通模式 app/module/action
                     *             URL友好模式 app/action(list|add|edit)/module
                     * */
                    var actionList = ones.BaseConf.actionsList;
                    var fullPath, app, module, action;
                    fullPath = $location.path().split("/").slice(1, 4);
                    if (!fullPath[1]) {
                        return;
                    }
                    app = fullPath[0];
                    fullPath[1] = fullPath[1].replace(/Bill/ig, ''); //将addBill, editBill转换为普通add,edit
                    //友好模式
                    if (actionList.indexOf(fullPath[1].toLowerCase()) >= 0) {
                        module = fullPath[2].ucfirst();
                        action = fullPath[1];
                    } else {
                        module = fullPath[1];
                        action = fullPath[2];
                    }

                    app = app ? app : "HOME";
                    module = module ? module : "Index";
                    action = action && isNaN(parseInt(action)) ? action : "list";
//                        console.log(module);
                    $rootScope.currentPage = {
                        lang: {}
                    };

                    var urlmap, appMapSection, moduleMapSection, actionMapSection;

                    appMapSection = l("urlMap."+app);
                    if (appMapSection) {
                        $rootScope.currentPage.lang.app = appMapSection.name;
                        moduleMapSection = l(sprintf("urlMap.%s.modules.%s", app, module));
                        if (moduleMapSection) {
                            $rootScope.currentPage.lang.module = moduleMapSection.name;
                            actionMapSection = l(sprintf("urlMap.%s.modules.%s.actions.%s", app, module, action));
                            if (actionMapSection) {
                                $rootScope.currentPage.lang.action = actionMapSection instanceof Array
                                    ? actionMapSection[0]
                                    : actionMapSection;
                                $rootScope.currentPage.lang.actionDesc = actionMapSection instanceof Array
                                    ? actionMapSection[1] : "";
                            }
                        }
                    }

                    /**
                     * 设定当前APP信息
                     * current location info
                     * */
                    $rootScope.currentPage.app = app;
                    $rootScope.currentPage.action = action;
                    $rootScope.currentPage.module = module;
                    $scope.currentPage = $rootScope.currentPage;


                    /**
                     * 清除即时缓存
                     * */
                     ones.caches.clear(-1);
                 }

                doWhenLocationChanged();

                $scope.userInfo = ones.userInfo;


                if(isAppLoaded("firstTimeWizard")) {
                    $injector.get("FirstTimeWizard.WizardAPI").showPopover("#topest_setting_btn", "dashboard.after.install.topestSettingBtn", 'left');
                }


            }])
    ;
})();
