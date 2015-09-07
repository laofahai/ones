(function(window, angular, ones) {

    // 注册到可支持自定义字段
    ones.pluginRegister('data_model_supported', function(injector, defered) {
        ones.pluginScope.append('data_model_supported', {
            label: _('product.Product') + ' ' + _('common.Module'),
            value: 'product.product'
        });
    });

    /*
     * 返回产品计量单位
     * */
    window.to_product_measure_unit = function(product_api, $q, item) {
        if(!item || (!item.product_id && !item.measure_unit)) {
            return;
        }
        if(item.measure_unit) {
            return item.measure_unit;
        } else {
            var defer = $q.defer();
            product_api.resource.api_get({id: item.product_id, _fd: 'measure_unit'}).$promise.then(function(product_item){
                item.measure_unit = product_item.measure_unit;
                defer.resolve(product_item.measure_unit);
            });
            return defer.promise;
        }
    }

})(window,window.angular,window.ones);