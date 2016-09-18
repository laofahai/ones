(function(window, angular, ones){

    /*
    * 控制面板模块，使用 [angular-gridster](https://github.com/ManifestWebDesign/angular-gridster)
    * @plugin dashboard_widgets
    *
    * */
    angular.module('ones.app.dashboard.main', [
        'ones.frameInnerModule',
        'gridster' // 依赖angular-gridster
    ])
        .config(['$routeProvider', function($route){
            $route
                .when('/dashboard', {
                    controller : 'DashboardIndexCtrl',
                    templateUrl: appView('index.html')
                });
        }])
        .controller('DashboardIndexCtrl', [
            '$scope',
            'pluginExecutor',
            '$injector',
            'Account.UserPreferenceAPI',
            '$modal',
            function($scope, plugin, $injector, preference, $modal) {

                // 保存
                var save_dashboard_config = function(blocks) {
                    preference.set_preference('dashboard_widgets', blocks);
                };

                $scope.add_widget = function(widget_alias) {
                    if(!widget_alias) {
                        return false;
                    }

                    for(var i=0;i<$scope.all_widgets.length;i++) {
                        if($scope.all_widgets[i].alias === widget_alias) {
                            $scope.dashboard_widgets_list.push($scope.all_widgets[i]);
                            save_dashboard_config($scope.dashboard_widgets_list);
                            break;
                        }
                    }
                };

                $scope.open_widgets_modal = function() {
                    $modal({
                        scope: $scope,
                        template: appView('add_widget.html', 'dashboard'),
                        show: true
                    });

                    //$modal(
                    //    {
                    //        title: _('calendar.View Event Content'),
                    //        contentTemplate: appView('event_detail.html', 'calendar'),
                    //        show: true,
                    //        scope: $scope
                    //    }
                    //);
                };

                $scope.remove_widget = function($index) {
                    $scope.dashboard_widgets_list.splice($index, 1);
                    save_dashboard_config($scope.dashboard_widgets_list);
                };

                plugin.callPlugin('dashboard_widgets');
                $scope.all_widgets = ones.pluginScope.get('dashboard_widgets') || [];
                $scope.dashboard_widgets_list = preference.get_preference('dashboard_widgets') || [];

                angular.forEach($scope.dashboard_widgets_list, function(item, k) {
                    if(false === item.auth_node) {
                        return true;
                    }
                    if(!is_node_authed(item.auth_node)) {
                        delete($scope.dashboard_widgets_list[k]);
                    }
                });

                try {
                    $scope.dashboard_widgets_list = force_format_data_fields($scope.dashboard_widgets_list, {
                        col: 'Number',
                        row: 'Number',
                        sizeX: 'Number',
                        sizeY: 'Number'
                    });
                } catch (e) {
                    $scope.dashboard_widgets_list = [];
                }


                $scope.gridster_option = {
                    rowHeight: 100,
                    columns: 12,
                    resizable: {
                        stop: function(event, uiWidget, $element) {
                            save_dashboard_config($scope.dashboard_widgets_list);
                        }
                    },
                    draggable: {
                        stop: function(event, uiWidget, $element) {
                            save_dashboard_config($scope.dashboard_widgets_list);
                        }
                    }
                };

                if(is_app_loaded('messageCenter')) {
                    var mc = $injector.get('ones.MessageCenter');
                    mc.on('data_changed', function() {
                        window.location.reload();
                    });
                }

            }
        ])

    ;
})(window, window.angular, window.ones);