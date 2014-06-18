'use strict';

angular.module('ones.common', ['ones.common.filters', 'ones.common.directives'])
        .config(["$routeProvider", function($routeProvider) {
            $routeProvider
                    .when('/HOME/test', {
                        controller: 'CommonTestCtl',
                        templateUrl: "views/common/test.html"
                    })
                    .when('/', {
                        redirectTo: '/HOME/Index/dashboard'
                    })
                    .otherwise({
                        redirectTo: '/HOME/Index/dashboard'
                    })
                    ;
        }])
        .controller("CommonTestCtl", ["$scope", "$timeout", function($scope, $timeout){

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
        .controller('navHeaderCtl', ["$scope", function($scope){
            
        }]);
