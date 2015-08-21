(function(window, ones, angular, io){
    // 注册至工作流服务API
    ones.pluginRegister('bpm_service_api', function(injector, defered) {
        // 确认入库
        ones.pluginScope.append('bpm_service_api', {
            label: _('storage.Confirm Stock In'),
            value: _('storage.stockIn.confirm_stock_in'),
            module: 'storage.stockIn'
        });
        // 检测是否已完全入库
        ones.pluginScope.append('bpm_service_api', {
            label: _('storage.Check if full stock in'),
            value: _('storage.stockIn.check_full_in'),
            module: 'storage.stockIn'
        });

        // 确认出库
        ones.pluginScope.append('bpm_service_api', {
            label: _('storage.Confirm Stock out'),
            value: _('storage.stockOut.confirm_stock_out'),
            module: 'storage.stockOut'
        });
        // 检测是否已完全出库
        ones.pluginScope.append('bpm_service_api', {
            label: _('storage.Check if full stock out'),
            value: _('storage.stockOut.check_full_out'),
            module: 'storage.stockOut'
        });
        // 出库完成回调
        ones.pluginScope.append('bpm_service_api', {
            label: _('storage.Complete Callback Function'),
            value: _('storage.stockOut.complete_callback'),
            module: 'storage.stockOut'
        });
    });

    // 注册至支持工作流中修改的字段
    ones.pluginRegister('bpm_editable_fields_storage.stockIn', function() {
        var fields = [
            {
                field: 'subject',
                widget: 'text'
            },
            {
                field: 'source_model'
            },
            {
                field: 'source_id',
                widget: 'number'
            },
            {
                widget: 'select',
                field: 'status',
                data_source: [
                    {value: -1, label: _('common.No Data')},
                    {value: 0, label: _('storage.STOCK_IN_STATUS_NEW')},
                    {value: 1, label: _('storage.STOCK_IN_STATUS_SAVED')},
                    {value: 2, label: _('storage.STOCK_IN_STATUS_PART')},
                    {value: 3, label: _('storage.STOCK_IN_STATUS_COMPLETE')}
                ]
            },
            {
                field: 'remark'
            }
        ];
        ones.pluginScope.set('bpm_editable_fields', fields);
    });

    ones.pluginRegister('bpm_editable_fields_storage.stockOut', function() {
        var fields = [
            {
                field: 'subject',
                widget: 'text'
            },
            {
                field: 'source_model'
            },
            {
                field: 'source_id',
                widget: 'number'
            },
            {
                widget: 'select',
                field: 'status',
                data_source: [
                    {value: -1, label: _('common.No Data')},
                    {value: 0, label: _('storage.STOCK_OUT_STATUS_NEW')},
                    {value: 1, label: _('storage.STOCK_OUT_STATUS_SAVED')},
                    {value: 2, label: _('storage.STOCK_OUT_STATUS_PART')},
                    {value: 3, label: _('storage.STOCK_OUT_STATUS_COMPLETE')}
                ]
            },
            {
                field: 'remark'
            }
        ];
        ones.pluginScope.set('bpm_editable_fields', fields);
    });
})(window, window.ones, window.angular, window.io);