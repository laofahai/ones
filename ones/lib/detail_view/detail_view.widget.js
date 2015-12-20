(function(window, angular, ones){

    /*
    * @todo
    *
    * cell_filter, __label__字段, get_display() 方法 三种显示优先级
    * */
    var DETAIL_VIEW_WIDGETS_TPL = {
        CONTAINER: '<div class="col-md-%(column_width)s detail-view-group">' +
            '<label class="col-sm-3 text-right detail-view-label">%(label)s</label>' +
            '<div class="col-sm-9 detail-view-content">%(html)s</div>' +
        '</div>',
        static: '<div class="%(class)s" ng-bind-html="(column_defs.%(field)s.get_display && column_defs.%(field)s.get_display(%(bind)s, %(item_data)s)) || %(bind)s__label__ || %(bind)s"></div>',
        frame_link: '<a href="javascript:void(0)" ' +
                    'ng-click="%(click_func)s(%(bind)s, %(item_data)s)" ' +
                    'ng-bind-html="(column_defs.%(field)s.get_display && column_defs.%(field)s.get_display(%(bind)s, %(item_data)s)) || %(bind)s__label__ || %(bind)s"></a>'
    };

    angular.module('ones.detailViewWidgetModule', [])

    .service('ones.detail_view_widgets', [
        'pluginExecutor',
        '$parse',
        function(plugin, $parse) {
            var self = this;

            /**
             * */
            this.widgets = {
                static: function(config, scope) {
                    return sprintf(DETAIL_VIEW_WIDGETS_TPL.static, {
                        bind: config.bind_model,
                        field: config.field,
                        item_data: scope.model_prefix,
                        'class': config.highlight ? 'text-'+config.highlight : 'text-default'
                    });
                },
                frame_link: function(config, scope) {
                    var click_func = 'dcfl_'+config.bind_model.split('.').pop();
                    scope[click_func] = config.on_view_item_clicked
                        ? config.on_view_item_clicked
                        : function(value) {};
                    return sprintf(DETAIL_VIEW_WIDGETS_TPL.frame_link, {
                        bind: config.bind_model,
                        field: config.field,
                        item_data: scope.model_prefix,
                        click_func: click_func
                    });
                }
            };


            angular.extend(this.widgets, ones.pluginScope.get('detail_view.widgets') || {});

            this.make_widget = function(scope, config) {
                this.scope = scope;
                return sprintf(DETAIL_VIEW_WIDGETS_TPL.CONTAINER, {
                    column_width: config.column_width || 6,
                    label: config.label,
                    html: this.widgets[config.widget](config, scope)
                });
            };
        }
    ])
})(window, window.angular, window.ones);