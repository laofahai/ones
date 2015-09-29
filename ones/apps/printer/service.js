(function(window, angular, ones, io){
    /*
     * @app printer
     * @author laofahai@TEam Swift
     * @link https://ng-erp.com
     * */
    'use strict';
    ones.global_module
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
    ;

})(window, window.angular, window.ones, window.io);