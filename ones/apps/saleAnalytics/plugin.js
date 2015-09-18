(function(window, angular, ones){
    'use strict';
    // 桌面块
    ones.pluginRegister('dashboard_widgets', function(injector, defered) {
        ones.pluginScope.append('dashboard_widgets', {
            alias: 'sale_volume_analytics',
            title: _('saleAnalytics.Sale Analytics Monthly'),
            template: appView('dashboard_sale_analytics.html', 'saleAnalytics'),
            sizeX: 6,
            sizeY: 4,
            auth_node: 'saleAnalytics.saleVolume.get'
        });
    });

})(window, window.angular, window.ones);