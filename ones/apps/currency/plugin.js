(function(window, angular, ones, fx){

    /*
    * 依赖 accounting.js money.js
    * 货币模块插件，实现功能：
    *   1、 模块配置
    *       1.1 支持货币列表（名称，缩写，符号）
    *       1.2 本位币
    *       1.3 各货币对本位币比例
    *       1.4 云接口
    *   2、 常用功能
    *       2.1 将数字格式化为货币输出
    * */

    // 注册至配置字段
    ones.pluginRegister('common_config_item', function(injector, defered, fields) {
        // 本位币
        ones.pluginScope.append('common_config_item', {
            alias: 'base_currency',
            label: _('currency.Base Currency'),
            widget: 'select',
            data_source: 'Currency.CurrencyAPI',
            app: 'currency'
        });
        ones.pluginScope.append('common_config_item', {
            alias: 'base_currency_opts',
            widget: 'hidden',
            value: 'currency,string',
            app: 'currency'
        });
    });

    window.__money_js_inited = false;
    window.__money_js_init = function($injector) {
        if(true === window.__money_js_inited) {
            return true;
        }
        window.__money_js_inited = true;

        fx.rates = {
            GBP: 0.6,
            USD: 1
        };
        fx.base = "USD";

    };
    ones.global_module
        .filter('to_money_display', [
            '$injector',
            function($injector) {
                window.__money_js_init($injector);
                return function(money) {
                    ones.base_currency = ones.base_currency || {};
                    if(!is_app_loaded('currency') || !ones.base_currency.symbol) {
                        return to_decimal_display(money);
                    }
                    return accounting.formatMoney(money, {
                        symbol: "$"
                    });
                };
            }
        ])
    ;
})(window, window.angular, window.ones, window.fx);