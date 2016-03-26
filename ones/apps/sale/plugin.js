(function(window, angular, ones){
    'use strict';

    /**
     * 额外加载文件
     * */
    ones.pluginRegister('after_js_loaded', function() {
        if(ones.app_info.app == 'crm' && ones.app_info.module == 'customer' && ones.app_info.action == 'view') {
            ones.pluginScope.append('need_include_js', 'apps/sale/orders');
        }
    });

    /* 客户明细中加入订单列表 */
    ones.pluginRegister('extend_crm_customer_detail_split_actions', function($injector) {
        ones.pluginVariables.extend_crm_customer_detail_split_actions = ones.pluginVariables.extend_crm_customer_detail_split_actions || {};

        ones.pluginVariables.extend_crm_customer_detail_split_actions.orders = {
            label: _('sale.Latest Orders'),
            no_padding: true,
            view: get_view_path('views/blankTableView.html'),
            init: function(scope, id, item) {
                var model = $injector.get('Sale.OrdersAPI');
                scope.gridConfig = {
                    model: model,
                    resource: model.resource,
                    query_params: {
                        _mf: 'customer_id',
                        _mv: item.customer_id
                    }
                };
            }
        };
    });

})(window, window.angular, window.ones);