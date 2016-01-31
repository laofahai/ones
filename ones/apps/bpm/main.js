(function(window, angular, ones, io){
    'use strict';
    angular.module('ones.app.bpm.main', [
        'ones.gridViewModule'
    ])
        .config(['$routeProvider', function($route){
            $route.when('/bpm/builder/:id', {
                controller: 'BpmBuilderCtrl',
                templateUrl: appView('builder.html')
            });
        }])
        .controller('BpmBuilderCtrl', [
            '$scope',
            '$timeout',
            '$modal',
            'pluginExecutor',
            'Bpm.WorkflowAPI',
            '$routeParams',
            'RootFrameService',
            function($scope, $timeout, $modal, plugin, workflow_api, $routeParams, RootFrameService) {

                $scope.reloading = false;
                function on_change() {
                    var diagram_div = $("#bpm-show-container");
                    try {
                        var diagram = flowchart.parse($scope.bpm_description_language);
                        $scope.reloading = true;
                        // Clear out old diagram

                        $timeout(function() {
                            diagram_div.html('');
                            $scope.reloading = false;
                            diagram.drawSVG('bpm-show-container', workflow_api.shower_config);
                        }, 1000);
                    } catch(err) {
                        throw err;
                    }
                }


                $scope.$watch('bpm_description_language', function(description_language) {
                    if(!description_language) {
                        return;
                    }
                    on_change();
                });

                $scope.show_editor = true;
                $scope.toggle_editor = function() {
                    $scope.show_editor = !$scope.show_editor;
                };


                workflow_api.get_full_data($routeParams.id).then(function(response_data) {
                    console.log(response_data);
                });

            }
        ])
    ;

})(window, window.angular, window.ones, window.io);