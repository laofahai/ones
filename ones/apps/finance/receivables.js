(function(window, ones, angular) {
    angular.module('ones.app.finance.receivables', [])

        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/finance/receivables/confirm/:id/node/:node_id', {
                templateUrl: appView('confirm.html'),
                controller: "Finance.ConfirmReceivableCtrl"
            });
        }])
        .service('Finance.ReceivablesAPI', [
            'ones.dataApiFactory',
            '$routeParams',
            'Bpm.WorkflowAPI',
            'Finance.FinanceStreamlineAPI',
            '$timeout',
            '$filter',
            function(dataAPI, $routeParams, workflow_api, streamline_api, $timeout, $filter) {

                var self = this;

                this.resource = dataAPI.getResourceInstance({
                    uri: 'finance/receivables'
                });

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

                                    scope.$root.workflow_node_in_bill = [];
                                    if(!scope.basic_data.workflow_id) {
                                        scope.$parent.workflow_not_started = true;
                                        workflow_api.get_all_workflow('finance.receivables').then(function(all_workflow) {
                                            scope.$parent.all_workflows = all_workflow;
                                        });
                                    } else {
                                        workflow_api.get_next_nodes(scope.basic_data.workflow_id, id, ['id', 'label'])
                                            .then(function(next_nodes){
                                                scope.$root.workflow_node_in_bill = next_nodes;
                                            });
                                    }
                                },
                                resource: self.resource
                            },
                            operation_log: {
                                label: _('finance.Operation Record'),
                                view: appView('operation_log.html', 'finance'),
                                init: function(scope, id) {
                                    $timeout(function() {
                                        var query_param = {
                                            _mf: 'source_id,direction',
                                            _mv: [id, 1].join()
                                        };
                                        streamline_api.resource.api_query(query_param).$promise
                                            .then(function(logs){
                                                scope.logs = logs;
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
                        subject: {
                            grid_fixed: true
                        },
                        amount: {
                            label: _('Need Receive Amount'),
                            cell_filter: "to_money_display",
                            highlight: "primary",
                            widget: 'number',
                            grid_fixed: true
                        },
                        received: {
                            label: _('Received Amount'),
                            cell_filter: "to_money_display",
                            editable: false,
                            highlight: "success",
                            widget: 'number',
                            value: 0
                        },
                        unreceived: {
                            label: _('Unreceived Amount'),
                            get_display: function(value, item) {
                                return $filter('to_money_display')(item.amount - item.received);
                            },
                            highlight: 'danger',
                            grid_fixed: true
                        },
                        user_info_id: {
                            cell_filter: "to_user_fullname"
                        },
                        customer_id: {
                            widget: "select3",
                            group_tpl: FORM_FIELDS_TPL.select3_group_tpl,
                            data_source: "Crm.CustomerAPI",
                            label: _('crm.Customer'),
                            required: false,
                            data_source_value_field: 'customer_id'
                        },
                        status: {
                            get_display: function(value, item) {
                                return item.workflow_node_status_label || (item.last_workflow_progress && (item.last_workflow_progress.node_status_label || item.last_workflow_progress.node_label));
                            }
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
                            },
                            editable: false
                        }
                    },
                    unaddable: [
                        'source_id', 'source_model', 'user_info_id', 'created', 'status', 'unreceived', '', ''
                    ],
                    uneditable: [
                        'source_id', 'source_model', 'user_info_id', 'created', 'status', 'received', 'unreceived'
                    ],
                    undetail_able: [
                        'source_id'
                    ],
                    list_hide: ['source_id', 'remark'],
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
        .service('Finance.ConfirmReceivablesAPI', [
            'ones.dataApiFactory',
            'Finance.ReceivablesAPI',
            function(dataAPI, receivables_api) {

                this.resource = receivables_api.resource;

                this.config = {
                    app: "finance",
                    module: "receivables",
                    table: "receivable",
                    fields: {

                    }
                };
            }
        ])
        .controller('Finance.ConfirmReceivableCtrl', [
            '$scope',
            'Finance.ConfirmReceivablesAPI',
            'Finance.ReceivablesAPI',
            'Bpm.WorkflowAPI',
            '$routeParams',
            'RootFrameService',
            '$q',
            '$location',
            function($scope, confirm_receivables_api, receivables_api, workflow_api, $routeParams, RootFrameService, $q, $location) {
                $scope.back_able = true;

                $scope.panel_title = _('finance.Confirm Receivable');

                $scope.account_config = {
                    label: _('finance.Account'),
                    required: true,
                    widget: 'select',
                    data_source: 'Finance.FinanceAccountAPI',
                    'ng-model': 'bill_info.account_id',
                    field: 'account_id'
                };

                $scope.formConfig = {
                    resource: confirm_receivables_api.resource,
                    model   : confirm_receivables_api,
                    id      : $routeParams.id,
                    model_prefix: 'bill_info',

                    schema  : {
                        receivable: {
                            structure: [
                                {
                                    field: 'subject',
                                    readonly: true,
                                    required: false
                                },
                                {
                                    field: 'customer_id__label__',
                                    readonly: true,
                                    label: _('crm.Customer'),
                                    required: false
                                },
                                {
                                    field: 'amount',
                                    required: false,
                                    readonly: true
                                },
                                {
                                    field: 'received_amount',
                                    required: false,
                                    readonly: true,
                                    value: 0
                                },
                                {
                                    field: 'account_id',
                                    widget: 'select',
                                    data_source: 'Finance.FinanceAccountAPI',
                                    label: _('finance.Finance Account')
                                },
                                {
                                    field: 'payment_method',
                                    widget: 'select',
                                    data_source: 'Home.CommonTypeAPI',
                                    data_source_query_param: {
                                        _mf: 'module',
                                        _mv: 'finance_payment_method'
                                    }
                                },
                                {
                                    field: 'this_time_received',
                                    widget: 'number',
                                    value: 0
                                },
                                {
                                    field: 'remark',
                                    required: false
                                }
                            ]
                        }
                    }
                };

                $scope.form_submit_action = function(get_params, data) {

                    var defer = $q.defer();

                    if(Number(data.this_time_received || 0) <= 0) {
                        RootFrameService.alert({
                            content: _('finance.Please input the amount'),
                            type: 'danger'
                        });
                        return defer.promise;
                    }

                    workflow_api.post($routeParams.node_id, $routeParams.id, {
                        amount: data.this_time_received,
                        remark: data.remark,
                        account_id: data.account_id,
                        payment_method: data.payment_method
                    }, function(response) {
                        $location.url('/finance/receivables/view/split/'+$routeParams.id);
                    });

                    return defer.promise;
                };
            }
        ])
    ;
})(window, ones, angular);