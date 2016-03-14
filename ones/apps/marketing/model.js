(function(window, angular, ones){
    'use strict';

    angular.module('ones.app.marketing.model', [])
        .service('Marketing.SaleOpportunitiesAPI', [
            'ones.dataApiFactory',
            '$filter',
            '$location',
            '$injector',
            '$routeParams',
            'RootFrameService',
            function(dataAPI, $filter, $location, $injector, $routeParams, RootFrameService) {
                var self = this;
                this.resource = dataAPI.getResourceInstance({
                    uri: 'marketing/saleOpportunities',
                    extra_methods: ['api_get', 'api_query']
                });

                var userinfo = ones.user_info;

                this.config = {
                    app: 'marketing',
                    module: 'saleOpportunities',
                    table: 'sale_opportunities',
                    fields: {
                        label: {
                            get_display: function(value, item) {
                                return to_b
                                elongs_to_user_icon(item);
                            },
                            detail_able: false,
                            addable: false,
                            editable: false,
                            width:30,
                            'class': 'text-center'
                        },
                        next_contact_time: {
                            widget: 'date',
                            min: moment().format('YYYY-MM-DD')
                        },
                        name: {
                            label: _('marketing.Opportunities Subject'),
                            search_able: true
                        },
                        status: {
                            widget: 'select',
                            editable: false,
                            data_source: 'Home.CommonTypeAPI',
                            data_source_query_param: {
                                _mf: 'module',
                                _mv: 'sale_opportunities_status'
                            },
                            get_display: function(value, item) {
                                return item && item.status_label
                            },
                            label: _('marketing.The Sale Stage')
                        },
                        user_info_id: {
                            label: _('marketing.Creator'),
                            cell_filter: 'to_user_fullname'
                        },
                        head_id: {
                            widget: 'item_select',
                            multiple: false,
                            data_source: 'Account.UserInfoAPI',
                            label: _('marketing.Head Man'),
                            value: userinfo.id,
                            cell_filter: 'to_user_fullname'
                        },
                        customer_id: {
                            widget: 'item_select',
                            detail_widget: 'frame_link',
                            multiple: false,
                            data_source: 'Crm.CustomerAPI',
                            data_source_list_display: ['label', 'name', 'head_id'],
                            label: _('marketing.Belongs To Customer'),
                            get_display: function(value, item) {
                                return item && to_link_style(item.customer);
                            },
                            on_view_item_clicked: function(value, item) {
                                RootFrameService.open_frame({
                                    src: 'crm/customer/view/split/'+item.contacts_company_id+'/basic',
                                    label: _('common.View %s Detail', _('crm.Customer'))
                                });
                            }
                        },
                        last_contact_time: {
                            widget: 'datetime',
                            label: _('crm.Last Contact Time')
                        }
                    },
                    list_display: ['label', 'name', 'status', 'customer_id', 'next_contact_time', 'head_id'],
                    unaddable: ['user_info_id', 'created'],
                    uneditable: ['user_info_id', 'created', 'last_contact_time'],
                    filters: {
                        status: {
                            type: 'link'
                        }
                    },
                    extra_selected_actions: [{
                        label: _('marketing.Opportunities Push'),
                        icon: 'legal',
                        auth_node: 'marketing.saleOpportunities.push',
                        multiple: false,
                        action: function(event, selected, item) {
                            $location.url('/marketing/saleOpportunities/push/'+item.id);
                        }
                    }],

                    detail_able: true,
                    // 分栏式详情
                    detail_split: {
                        title: _('common.View %s By', _('marketing.Sale Opportunities')),
                        global_title_field: 'company_name',
                        actions: {
                            basic: {
                                label: _("marketing.Basic Info"),
                                view: 'views/detail.html',
                                link_actions: [{
                                    label: _('common.Edit') + ' ' + _('crm.Basic Info'),
                                    src : 'marketing/saleOpportunities/edit/'+$routeParams.id,
                                    icon: 'edit',
                                    auth_node: 'marketing.saleOpportunities.put'
                                }],
                                init: function(scope, id) {
                                    scope.detail_view_config = {
                                        model: self,
                                        resource: self.resource,
                                        query_method: 'get',
                                        query_params: {
                                            id: id
                                        }
                                    };
                                },
                                resource: self.resource
                            },
                            contract: {
                                label: _("marketing.Contract"),
                                no_padding: true,
                                link_actions: [{
                                    label: _('common.Add New') + ' ' + _('marketing.Contract'),
                                    src : 'marketing/contract/add/sale_opportunities_id/'+$routeParams.id,
                                    icon: 'edit',
                                    auth_node: 'marketing.contract.post'
                                }],
                                init: function(scope, id) {
                                    var model = $injector.get('Marketing.ContractAPI');
                                    model.config.addable = false;
                                    scope.contract_config = {
                                        model: model,
                                        resource: model.resource,
                                        query_params: {
                                            _mf: 'sale_opportunities_id',
                                            _mv: id
                                        }
                                    };
                                }
                            },
                            communicate: {
                                label: _('crm.Communicate Log'),
                                view: 'apps/crm/views/block/communicate.html',
                                link_actions: [{
                                    label: _('common.Add New') + ' ' + _('crm.Communicate Log'),
                                    src : 'crm/customerCommunicate/add/crm_clue_id/'+$routeParams.id,
                                    icon: 'edit',
                                    auth_node: 'crm.customerCommunicate.post'
                                }],
                                no_padding: true,
                                init: function(scope, id) {
                                    var model = $injector.get('Crm.CustomerCommunicateAPI');
                                    scope.items = [];
                                    model.resource.query({
                                        _mf: 'sale_opportunities_id',
                                        _mv: id
                                    }).$promise.then(function(data) {
                                            scope.items = data;
                                        });
                                }
                            }
                        }
                    }
                };

                // 商机关联产品
                if(is_app_loaded('product')) {
                    this.config.detail_split.actions['product'] = {
                        label: _("product.Product"),
                        link_actions: [{
                            label: _("common.Add New")+' '+_('marketing.Sale Opportunities Product'),
                            src: 'marketing/saleOpportunitiesProduct/add/sale_opportunities_id/'+$routeParams.id,
                            icon: 'edit',
                            auth_node: 'marketing.saleOpportunities.post'
                        }],
                        no_padding: true,
                        init: function(scope, id) {
                            var model = $injector.get('Marketing.SaleOpportunitiesProductAPI');
                            model.config.addable = false;
                            scope.product_config = {
                                model: model,
                                resource: model.resource,
                                model_prefix: 'form_add_sop'
                            };
                        }
                    };
                }

                this.unicode_lazy = function(ids) {
                    return this.resource.api_query({
                        _mf: 'id',
                        _mv: ids
                    }).$promise;
                };

                this.unicode = function(item) {
                    return item.name;
                };


                // 过滤器
                var filters = {
                    /*
                     * data source:
                     *   w 开头： $n days without contacts
                     *   n 开头： $x need to contact 今天，本周，本月
                     * */
                    date_range: {
                        type: 'link',
                        data_source: [
                            {value: 'nd', label: _('crm.Need To Contact Today')},
                            {value: 'nw', label: _('crm.Need To Contact This Week')},
                            {value: 'nm', label: _('crm.Need To Contact This Month')},
                            {value: 'w7', label: _('crm.%s Days Without Contact', 7)},
                            {value: 'w15', label: _('crm.%s Days Without Contact', 15)},
                            {value: 'w30', label: _('crm.%s Days Without Contact', 30)}
                        ]
                    },
                    by_user: {
                        type: 'link',
                        data_source: [
                            {value: 'i_created', label: _('crm.I Created')},
                            {value: 'i_headed', label: _('crm.I Headed')},
                            {value: 'sub_created', label: _('crm.My Subordinates Created')},
                            {value: 'sub_headed', label: _('crm.My Subordinates Headed')}
                        ],
                        label: _('common.User')
                    }
                };
                angular.deep_extend(this.config.filters, filters);

            }
        ])
        .service('Marketing.SaleOpportunitiesProductAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {

                var self = this;
                this.resource = dataAPI.getResourceInstance({
                    uri: 'marketing/saleOpportunitiesProduct'
                });

                this.config = {
                    app: 'marketing',
                    module: 'saleOpportunitiesProduct',
                    table: 'sale_opportunities_product',
                    fields: {
                        product_id: {
                            label: _('product.Product'),
                            widget: 'item_select',
                            data_source: 'Product.ProductAPI'
                        },
                        num: {
                            get_display: function(value, item) {
                                return to_decimal_display(value);
                            }
                        }
                    },
                    unaddable: ['sale_opportunities_id', 'user_info_id'],
                    uneditable: ['sale_opportunities_id', 'user_info_id']
                };

            }
        ])

        .service('Marketing.ContractAPI', [
            'ones.dataApiFactory',
            '$timeout',
            function(dataAPI, $timeout) {
                var self = this;

                this.resource = dataAPI.getResourceInstance({
                    uri: 'marketing/contract',
                    extra_methods: ['api_get']
                });

                this.config = {
                    app: 'marketing',
                    module: 'contract',
                    table: 'contract',
                    fields: {
                        contract_number: {
                            ensureUnique: 'Marketing.ContractAPI',
                            search_able: true
                        },
                        sale_opportunities_id: {
                            label: _('marketing.Sale Opportunities'),
                            widget: 'item_select',
                            data_source: 'Marketing.SaleOpportunitiesAPI',
                            get_display: function(value, item) {
                                return item.opportunities_name;
                            }
                        },
                        sign_time: {
                            widget: 'date',
                            search_able: true,
                            value: new Date(moment().format())
                        },
                        start_time: {
                            widget: 'date',
                            value: new Date(moment().format())
                        },
                        end_time: {
                            widget: 'date',
                            blank: true
                        },
                        user_info_id: {
                            addable: false,
                            editable: false,
                            cell_filter: 'to_user_fullname'
                        },
                        customer: {
                            addable: false,
                            editable: false,
                            search_able: true,
                            label: _('crm.Customer'),
                            get_display: function(value, item) {
                                return item.customer_name;
                            },
                            field: 'customer',
                            search_able_fields: 'ContactsCompany.name'
                        },
                        head_id: {
                            label: _('common.Head Man'),
                            widget: 'item_select',
                            data_source: 'Account.UserInfoAPI',
                            cell_filter: 'to_user_fullname'
                        }
                    },
                    list_hide: ['remark', 'terms']
                };

                $timeout(function() {
                    self.config.fields.head_id.value = ones.user_info.id;
                });


                this.config.fields.contract_number.value = get_unique_id();

            }
        ])
    ;
})(window, window.angular, window.ones);