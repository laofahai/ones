(function(ones, angular, window){

    angular.module('ones.commonViewModule', [
        'ngResource',
        'ngRoute',
        'ngSanitize',

        'ones.formModule'
    ])

        .config(['$routeProvider', function($route){
            $route
                // 列表 grid
                .when('/:app', {
                    controller : 'ComViewIndexCtrl',
                    templateUrl: get_view_path('views/list.html')
                })
                .when('/:app/:module', {
                    controller : 'ComViewIndexCtrl',
                    templateUrl: get_view_path('views/list.html')
                })
                // 带action过滤
                .when('/:app/:module/filter/:action', {
                    controller : 'ComViewIndexCtrl',
                    templateUrl: get_view_path('views/list.html')
                })
                // 修改
                .when('/:app/:module/edit/:id', {
                    controller : 'ComViewEditCtrl',
                    templateUrl: get_view_path('views/edit.html')
                })

                // 新增
                .when('/:app/:module/add/:extra*', {
                    controller : 'ComViewEditCtrl',
                    templateUrl: get_view_path('views/edit.html')
                })
                .when('/:app/:module/add', {
                    controller : 'ComViewEditCtrl',
                    templateUrl: get_view_path('views/edit.html')
                })

                // 详情
                .when('/:app/:module/view/:id', {
                    controller: 'ComViewDetailCtrl',
                    templateUrl: get_view_path('views/detail.html')
                })
                // 分栏详情
                .when('/:app/:module/view/split/:id', {
                    controller: 'ComViewDetailSplitCtrl',
                    templateUrl: get_view_path('views/detailSplit.html')
                })
                .when('/:app/:module/view/split/:id/:action', {
                    controller: 'ComViewDetailSplitCtrl',
                    templateUrl: get_view_path('views/detailSplit.html')
                })
            ;
        }])

        /**
         * 通用Grid
         * */
        .controller('ComViewIndexCtrl', [
            "$scope",
            "$location",
            "ones.dataApiFactory",
            "$routeParams",
            "$rootScope",
            "PageSelectedActions",
            function($scope, $location, dataAPI, $routeParams, $rootScope, PageSelectedActions) {
                ones.DEBUG && console.debug('Common view detected: '+ $location.url());

                var query_params = {};
                // 可返回
                $scope.$parent.back_able = false;

                $scope.goTrash = function() {
                    return $location.url($location.url()+'/filter/trash');
                };

                switch($routeParams.action) {
                    case 'trash':
                        query_params._ot=1;
                        $scope.$parent.back_able = true;
                        break;
                    default:
                        query_params.action = $routeParams.action;
                        break;
                }

                dataAPI.init($routeParams.app, $routeParams.module);
                $scope.gridConfig = {
                    resource: dataAPI.resource,
                    model   : dataAPI.model,
                    query_params: query_params
                };
            }
        ])

        /**
         * 通用新增/编辑
         * */
        .controller('ComViewEditCtrl', [
            "$scope",
            "$location",
            "ones.dataApiFactory",
            "$routeParams",
            "RootFrameService",
            function($scope, $location, dataAPI, $routeParams, RootFrameService) {
                ones.DEBUG && console.debug('Common view detected: '+ $location.url());

                if($routeParams.id) {
                    $scope.is_edit = true;
                }

                var extra_params = parse_arguments($routeParams.extra);
                angular.forEach(extra_params, function(v, k) {
                    $routeParams[k] = v;
                });
                dataAPI.init($routeParams.app, $routeParams.module);
                $scope.formConfig = {
                    resource: dataAPI.resource,
                    model   : dataAPI.model,
                    id      : $routeParams.id,
                    opts    : {
                        extra_params: extra_params || {}
                    }
                };

            }

        ])

        /**
         * 通用单据新增/编辑
         * */
        .controller('ComViewEditBillCtrl', [
            "$scope",
            "$location",
            "ones.dataApiFactory",
            "$routeParams",
            "RootFrameService",
            function($scope, $location, dataAPI, $routeParams, RootFrameService) {
                ones.DEBUG && console.debug('Common view detected: '+ $location.url());

                var extra_params = parse_arguments($routeParams.extra) || {};
                angular.forEach(extra_params, function(v, k) {
                    $routeParams[k] = v;
                });
                dataAPI.init($routeParams.app, $routeParams.module);
                $scope.billConfig = {
                    resource: dataAPI.resource,
                    model   : dataAPI.model,
                    id      : $routeParams.id,
                    opts    : {
                        extra_params: extra_params || {}
                    }
                };

            }

        ])

        /*
        * 详情
        * */
        .controller('ComViewDetailCtrl', [
            '$scope',
            function($scope) {}
        ])

        /*
        * 分栏详情
        * */
        .controller('ComViewDetailSplitCtrl', [
            '$scope',
            'ones.dataApiFactory',
            '$routeParams',
            function($scope, dataAPI, $routeParams) {
                dataAPI.init($routeParams.app, $routeParams.module);

                $scope.detail_view_split_config = {
                    resource: dataAPI.resource,
                    model   : dataAPI.model,
                    opts    : dataAPI.model.config.detail_split
                };
            }
        ])

    ;
    
})(window.ones, window.angular, window);