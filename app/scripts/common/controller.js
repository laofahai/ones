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
            $timeout(function() {
		$scope.data = {
			series: ['销售', '来往', 'Expense', 'Laptops', 'Keyboards'],
			data : [{
				x : "销售",
				y: [100,500, 0],
				tooltip:"this is tooltip"
			},
			{
				x : "Not Sales",
				y: [300, 100, 100]
			},
			{
				x : "Tax",
				y: [351]
			},
			{
				x : "Not Tax",
				y: [54, 0, 879]
			}]     
		};
	}, 100);


	$scope.data1 = {
		series: ['Sales', 'Income', 'Expense', 'Laptops', 'Keyboards'],
		data : [{
			x : "Sales",
			y: [100,500, 0],
			tooltip:"this is tooltip"
		},
		{
			x : "Not Sales",
			y: [300, 100, 100]
		},
		{
			x : "Tax",
			y: [351]
		},
		{
			x : "Not Tax",
			y: [54, 0, 879]
		}]     
	}

	$scope.chartType = 'bar';

	$scope.config = {
		labels: false,
		title : "Not Products",
		legend : {
			display:true,
			position:'left'
		},
		innerRadius: 0
	};

	$scope.config1 = {
		labels: false,
		title : "Products",
		legend : {
			display:true,
			position:'right'
		},
		lineLegend: 'traditional'
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
        .controller('navHeaderCtl', ["$scope", function($scope){
            
        }]);
