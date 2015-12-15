(function(window, ones, angular) {
    angular.module('ones.app.finance.receivables', [])
        .service('Finance.ReceivablesAPI', [
            'ones.dataApiFactory',
            '$routeParams',
            'Bpm.WorkflowAPI',
            '$timeout',
            function(dataAPI, $routeParams, workflow_api, $timeout) {

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
                        title: _('common.View %s By', _('finance.Receivables')),
                        global_title_field: 'company_name',
                        actions: {
                            basic: {
                                label: _("finance.Receivables"),
                                view: 'views/detail.html',
                                link_actions: [
                                    {
                                        label: _('common.Edit') + ' ' + _('finance.Basic Info'),
                                        src : 'finance/receivables/edit/'+$routeParams.id,
                                        icon: 'edit',
                                        auth_node: 'finance.receivables.put'
                                    }
                                ],
                                init: function(scope, id) {
                                    scope.detail_view_config = {
                                        model: self,
                                        resource: self.resource,
                                        query_method: 'get',
                                        query_params: {
                                            id: id
                                        }
                                    };
                                    scope.$root.current_item = scope.basic_data;
                                    workflow_api.get_next_nodes(scope.basic_data.workflow_id, id, ['id', 'label'])
                                        .then(function(next_nodes){
                                            scope.$root.workflow_in_bill = next_nodes;
                                        });
                                },
                                resource: self.resource
                            },
                            operation_log: {
                                label: _('finance.Operation Record'),
                                view: appView('operation_log.html', 'finance'),
                                init: function(scope, id) {
                                    $timeout(function() {
                                        workflow_api.get_progress(scope.basic_data.workflow_id, id)
                                            .then(function(progress){
                                                scope.operation_log = progress;
                                            });
                                    });
                                },
                                link_actions: []
                            }
                        }
                    },
                    fields: {
                        common_type_id: {
                            get_display: function(value, item) {
                                return item.common_type_id_label || '';
                            },
                            label: _('common.Type'),
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
                            cell_filter: "to_money_display",
                            highlight: "primary"
                        },
                        received: {
                            label: _('Received Amount'),
                            cell_filter: "to_money_display",
                            editable: false,
                            highlight: "success"
                        },
                        unreceived: {
                            label: _('Unreceived Amount'),
                            get_display: function(value, item) {
                                return to_decimal_display(item.amount - item.received);
                            },
                            highlight: 'danger'
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
                                return item.workflow_node_status_label || (item.last_workflow_progress && item.last_workflow_progress.node_status_label);
                            },
                            widget: 'select',
                            data_source: self.receivables_status_array
                        },
                        workflow_id: {
                            label: _('bpm.Workflow'),
                            data_source: 'Bpm.WorkflowAPI',
                            get_display: function(value, item) {
                                return item.workflow_id_label;
                            },
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
                        'customer_id',
                        'amount',
                        'received',
                        'created',
                        'user_id',
                        'status'
                    ],
                    unaddable: [
                        'source_id', 'source_model', 'user_id', 'created', 'status', '', '', ''
                    ],
                    uneditable: [
                        'source_id', 'source_model', 'user_id', 'created', 'status', 'received', 'unreceived'
                    ],
                    undetail_able: [
                        'source_id'
                    ],
                    filters: {
                        status: {
                            type: "link"
                        },
                        common_type_id: {
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
})(window, ones, angular);