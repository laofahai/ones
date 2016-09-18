(function(window, angular, ones, io){
    /*
     * @app printer
     * @author laofahai@TEam Swift
     * @link http://ng-erp.com
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
            '$compile',
            '$injector',
            function($scope, dataAPI, $routeParams, print_template_api, RootFrameService, $compile, $injector) {

                var self = this;

                $scope.back_able = true;

                // 编译HTML
                var render = function(template) {
                    var service = {};
                    var template_html = template.content;
                    try {
                        var fetch_data_callback = function(data) {
                            $scope.print_data = data;
                            $('#print-container').html($compile(template_html)($scope));
                        };

                        service = $injector.get(get_current_data_api($routeParams));

                        $scope.print_config = template.config;

                        // 单据
                        if(service.config.is_bill) {
                            self.get_data_by_bill(service, template, fetch_data_callback);
                        }

                    } catch(e) {
                        console.log(e);
                    }
                };

                // 获取HTML
                var render_html = function(template) {
                    if(!template || !template.content) {
                        return;
                    }

                    // html模板路径形式
                    if(template['content'].start_with('apps/') && template['content'].end_with('.html')) {
                        $.get(template['content'] + '?' + Math.random(), function(html) {
                            template.content = html;
                            render(template);
                        });
                    } else {
                    // 字符串形式
                        render(template);
                    }
                };

                $scope.templates = [];
                var templates_id_map = {};
                print_template_api.resource.api_query({
                    _f: 'id,name',
                    _mf: 'module_alias',
                    _mv: sprintf('%s.%s', $routeParams.app, $routeParams.module),
                    _parse_config: true
                }).$promise.then(function(response_data) {
                    if(!response_data.length) {
                        RootFrameService.alert({content: _('printer.Please create print template first'), type: 'danger'});
                        return;
                    }

                    for(var i=0;i<response_data.length;i++) {
                        templates_id_map['id_'+response_data[i].id] = i;
                    }

                    $scope.templates = response_data;
                    $scope.selected_template = response_data[0].id;
                });

                $scope.$watch("selected_template", function(selected_template) {
                    if(!selected_template) {
                        return;
                    }
                    render_html($scope.templates[templates_id_map['id_'+selected_template]]);
                });


                // 获取单据数据
                this.get_data_by_bill = function(service, template, callback) {

                    if($scope.print_data) {
                        callback($scope.print_data);
                        return;
                    }

                    var p = {
                        id: $routeParams.id,
                        _ir: true
                    };

                    var row_model = $injector.get(service.config.bill_row_model);

                    angular.forEach(row_model.config.fields, function(config, k) {
                        if(!config.label && k.slice(-3) === "_id") {
                            config.label =
                                _(
                                    sprintf('%s.%s', ones.app_info.app, camelCaseSpace(k.slice(0, -3)))
                                );
                        }
                    });

                    $scope.fields_define = row_model.config.fields;
                    $scope.total_items = {};

                    service.resource.get(p).$promise.then(function(response_data) {

                        var rows = response_data.rows;
                        var cleared_rows = [];

                        angular.forEach(rows, function (row, k) {
                            var cleared_row = {};
                            angular.forEach(template.config.bill_row_fields, function(field) {
                                if(!row[field + '__label__']) {
                                    if (row_model.config.fields[field] && typeof row_model.config.fields[field].get_display === 'function') {
                                        cleared_row[field] = row_model.config.fields[field].get_display(row[field], row);
                                    } else {
                                        cleared_row[field] = row[field];
                                    }
                                } else {
                                    cleared_row[field] = row[field + '__label__'];
                                }

                                if(row_model.config.fields[field] && row_model.config.fields[field].total_able) {
                                    if(!$scope.total_items[field]) {
                                        $scope.total_items[field] = 0;
                                    }
                                    $scope.total_items[field] += Number(cleared_row[field]);
                                }
                            });
                            cleared_rows.push(cleared_row);
                        });

                        callback({
                            meta: response_data.meta,
                            rows: cleared_rows
                        });
                    });
                };

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
                    list_hide: ['content', 'config']
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