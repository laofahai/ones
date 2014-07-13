(function(){
    angular.module('ones.common', ['ones.common.filters', 'ones.common.directives'])
        .config(["$routeProvider", function($routeProvider) {
            $routeProvider
                .when('/HOME/goTo/url/:url', {
                    controller: "HOMERedirectCtl",
                    templateUrl: "common/base/views/blank.html"
                })
                .when('/HOME/Settings/clearCache', {
                    templateUrl: "common/base/views/home/clearCache.html",
                    controller: "clearCacheCtl"
                })

            ;
        }])
        .controller("HOMERedirectCtl", ["$location", "$routeParams", function($location, $routeParams){
            $location.url($routeParams.url);
        }])

        .controller("clearCacheCtl", ["$scope", "$http", "ones.config", "ComView", function($scope, $http, conf, ComView){
            $scope.cacheTypes = [null, true, true, true];
            $scope.doClearCache = function() {
                $http({method: "POST", url:conf.BSU+'HOME/Settings/clearCache', data:{types: $scope.cacheTypes}}).success(function(data){
                    ComView.alert($scope.i18n.lang.messages.cacheCleared, "info");
                });
            };
        }])
        .controller('CommonSidebarCtl', ['$scope','$location', function($scope, $location) {
            $scope.$on("initDataLoaded", function(event, data){
                $scope.navs = data.navs;
                $scope.activeSubNav = "";
                $scope.checkActiveNav = function($index, id) {
                    $scope.openNav = id;
                    $scope.activeNav = id;
                };
                $scope.checkSubActiveNav = function(id, parent) {
                    $scope.activeSubNav = id;
                    $scope.activeShowNav = parent;
                    $scope.openNav = parent;
                };
                $scope.checkThirdActiveNav = function(id, pid) {
                    $scope.activeThirdNav = id;
                    $scope.activeSubNav = pid;
                };
                $scope.goPage = function(url) {
                    if(!url) {
                        return;
                    }
                    $location.url("/"+url);
                };
            });


        }])
    ;
})();
