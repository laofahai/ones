(function(window, angular, ones, io){
    /*
     * @app supplier
     * @author laofahai@TEam Swift
     * @link https://ng-erp.com
     * */
    'use strict';
    angular.module('ones.app.supplier.model', [])
        .service('Supplier.SupplierAPI', [
            'ones.dataApiFactory',
            'RootFrameService',
            '$filter',
            function(dataAPI, RootFrameService, $filter) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'supplier/supplier',
                    extra_methods: ['api_get', 'api_query']
                });

                this.config = {
                    app: 'supplier',
                    module: 'supplier',
                    table: 'supplier',
                    value_field: 'supplier_id',
                    fields: {
                        name: {
                            on_view_item_clicked: function(value, item) {
                                RootFrameService.open_frame({
                                    src: 'supplier/supplier/view/split/'+item.id+'/basic',
                                    label: _('common.View %s Detail', _('supplier.Supplier'))
                                });
                            },
                            search_able: true
                        },
                        level: {
                            widget: 'select',
                            data_source: ones.stars_data_source,
                            get_display: function(value) {
                                return $filter('to_stars')(value);
                            }
                        },
                        head_id: {
                            map: 'head_id',
                            widget: 'item_select',
                            data_source: 'Account.UserInfoAPI',
                            required: false,
                            label: _('supplier.Head Man'),
                            cell_filter: 'to_user_fullname'
                        },
                        user_info_id: {
                            label: _('supplier.Creator'),
                            field: 'user_info_id',
                            cell_filter: 'to_user_fullname'
                        },
                        phone: {
                            search_able: true
                        },
                        master: {
                            label: _('supplier.Supplier Head Man'),
                            search_able: true
                        }
                    },
                    unaddable: ['user_info_id', 'contacts_company_id', 'contacts_company_role_id'],
                    uneditable: ['user_info_id', 'contacts_company_id', 'contacts_company_role_id'],
                    undetail_able: ['contacts_company_id', 'contacts_company_role_id'],
                    list_display: [
                        'name',
                        'level',
                        'phone',
                        'master',
                        'user_info_id',
                        'head_id'
                    ],
                    detail_able: true,
                    filters: {
                        gt_level: {
                            label: _('supplier.Level'),
                            type: 'link',
                            data_source: [
                                {value: 3, label: _('supplier.GT %s Star', 1)},
                                {value: 5, label: _('supplier.GT %s Star', 2)},
                                {value: 7, label: _('supplier.GT %s Star', 3)},
                                {value: 9, label: _('supplier.GT %s Star', 4)}
                            ]
                        }
                    },
                    sortable: ['level']
                };
            }
        ])
    ;

})(window, window.angular, window.ones, window.io);