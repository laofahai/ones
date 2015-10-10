(function(window, angular, ones, io){
    /*
     * @app printer
     * @author laofahai@TEam Swift
     * @link https://ng-erp.com
     * */
    'use strict';
    ones.global_module
        .config(['$routeProvider', function($route) {
            $route.when('/:app/print/:module/:id', {
                controller: "CommonPrintController",
                templateUrl: appView('canvas.html', 'printer')
            });
        }])
        .controller('CommonPrintController', [
            '$scope',
            'ones.dataApiFactory',
            '$routeParams',
            'Printer.PrintTemplateAPI',
            'RootFrameService',
            function($scope, dataAPI, $routeParams, print_template_api, RootFrameService) {
                var data_api = dataAPI.init($routeParams.app, $routeParams.module);

                // 获取HTML
                var fetch_html = function(template_id, id) {
                    var params = {
                        id: id || $routeParams.id,
                        template_id: template_id,
                        _m: 'get_print_html'
                    };
                    data_api.resource.get(params).$promise.then(function(response_data) {
                        $('#print-container').html(response_data.html);
                    });
                };

                $scope.templates = [];

                print_template_api.resource.api_query({
                    _f: 'id,name',
                    _mf: 'module_alias',
                    _mv: sprintf('%s.%s', $routeParams.app, $routeParams.module)
                }).$promise.then(function(response_data) {
                        if(!response_data.length) {
                            RootFrameService.alert({content: _('printer.Please create print template first')});
                            return;
                        }
                        $scope.templates = response_data;
                        $scope.selected_template = response_data[0].id;
                        fetch_html(response_data[0].id);
                    });

                $scope.$watch("selected_template", function(selected_template) {
                    console.log(selected_template);
                    fetch_html(selected_template);
                });
            }
        ])
        .service('ones.printerModule', [
            '$location',
            function($location) {
                // 生成选中项操作
                this.generate_selected_print_action = function(extra_selected_actions, app, module) {
                    extra_selected_actions = extra_selected_actions || [];

                    extra_selected_actions.push({
                        label: _('printer.Print'),
                        icon: 'print',
                        auth_node: sprintf('%s.%s.get', app, module),
                        action: function(evt, selected_items, item) {
                            item = item ? item : selected_items[0];

                            if(!item || !item.id) {
                                return;
                            }

                            $location.url(sprintf('/%s/print/%s/%d', app, module, item.id));
                        }
                    });
                };
            }
        ])
        .service('Printer.PrintTemplateAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.config = {
                    app: 'printer',
                    module: 'printTemplate',
                    table: 'print_template',
                    fields: {
                        name: {
                            search_able: true
                        },
                        module_alias: {
                            search_able: true
                        },
                        content: {
                            widget: 'textarea',
                            style: 'height:500px'
                        }
                    },
                    list_display: [
                        'name', 'module_alias'
                    ]
                };

                this.resource = dataAPI.getResourceInstance({
                    uri: 'printer/printTemplate',
                    extra_methods: ['api_get', 'api_query']
                });
            }
        ])
    ;

    angular.module('ones.app.printer.main', ['ones.gridViewModule']);

})(window, window.angular, window.ones, window.io);