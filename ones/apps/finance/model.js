(function(window, angular, ones, io){
    'use strict';
    angular.module('ones.app.finance.model', [
        'ones.gridViewModule'
    ])
        .service('Finance.FinanceAccountAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({

                });
            }
        ])
        .service('Finance.ReceivablesAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {

                var self = this;

                this.resource = dataAPI.getResourceInstance({
                    uri: 'finance/receivables'
                });

                this.receivables_status = {
                    0: _('New Receivables'),
                    1: _('Portion Received'),
                    2: _('All Received')
                };

                this.receivables_status_array = [
                    {value: 0, label: this.receivables_status[0]},
                    {value: 1, label: this.receivables_status[1]},
                    {value: 2, label: this.receivables_status[2]}
                ];

                this.config = {
                    app: 'finance',
                    module: 'receivables',
                    table: 'receivables',
                    workflow: 'finance.receivables',
                    detail_able: true,
                    detail_split: {
                        title: _('common.View %s By', _('crm.Clue')),
                        global_title_field: 'company_name',
                        actions: {
                            basic: {
                                label: _("finance.Receivables"),
                                view: 'views/detail.html',
                                link_actions: [{
                                    label: _('common.Edit') + ' ' + _('finance.Basic Info'),
                                    src : 'crm/crmClue/edit/'+$routeParams.id,
                                    icon: 'edit',
                                    auth_node: 'crm.crmClue.put'
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
                            }
                        }
                    },
                    fields: {
                        common_type_id: {
                            label: _('common.Type'),
                            get_display: function(value, item) {
                                return item.type || '';
                            },
                            widget: "select",
                            data_source: "Home.CommonTypeAPI",
                            data_source_query_param: {
                                _mf: 'module',
                                _mv: 'finance_receivables_type'
                            },
                            required: false
                        },
                        amount: {
                            label: _('Need Receive Amount'),
                            cell_filter: "to_money_display"
                        },
                        received: {
                            label: _('Received Amount'),
                            cell_filter: "to_money_display",
                            editable: false
                        },
                        user_id: {
                            cell_filter: "to_user_fullname"
                        },
                        customer_id: {
                            widget: "select3",
                            group_tpl: FORM_FIELDS_TPL.select3_group_tpl,
                            data_source: "Crm.CustomerAPI",
                            label: _('crm.Customer'),
                            required: false
                        },
                        status: {
                            get_display: function(value, item) {
                                return self.receivables_status[value] || '';
                            },
                            widget: 'select',
                            data_source: self.receivables_status_array
                        },
                        workflow_id: {
                            label: _('bpm.Workflow'),
                            data_source: 'Bpm.WorkflowAPI',
                            widget: "select",
                            data_source_query_param: {
                                _mf: "module",
                                _mv: "finance.receivables"
                            }
                        }
                    },
                    list_display: [
                        'subject',
                        'common_type_id',
                        'amount',
                        'received',
                        'created',
                        'user_id',
                        'status'
                    ],
                    unaddable: [
                        'source_id', 'source_model', 'user_id', 'customer_id', 'created'
                    ],
                    filters: {
                        status: {
                            type: "link"
                        }
                    }
                };

                if(is_app_loaded('crm')) {
                    self.config.unaddable.splice('customer_id'.indexOf(self.config.unaddable)-1, 1);
                }

            }
        ])
    ;

})(window, window.angular, window.ones, window.io);