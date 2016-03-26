(function(window, angular, ones) {
    ones.global_module
        .service('Crm.CrmClueAPI', [
            'ones.dataApiFactory',
            '$routeParams',
            '$injector',
            '$location',
            'RootFrameService',
            function(dataAPI, $routeParams,$injector, $location, RootFrameService) {
                var self = this;

                this.resource = dataAPI.getResourceInstance({
                    uri: 'crm/crmClue',
                    extra_methods: ['update', 'api_query', 'api_get']
                });

                this.config = {
                    app: 'crm',
                    module: 'crmClue',
                    table: 'crm_clue',
                    fields: {
                        created: {
                            addable: false,
                            editable: false
                        },
                        company_id: {
                            addable: false,
                            editable: false,
                            detail_able: false
                        },
                        remark: {
                            rows: 20
                        },
                        source_from: {
                            widget: 'select',
                            data_source: 'Home.CommonTypeAPI',
                            data_source_query_param: {
                                _mf: 'module',
                                _mv: 'source_from_type'
                            },
                            get_display: function(value, item) {
                                return item && item.source_from_label;
                            }
                        },
                        next_contact_time: {
                            widget: 'date'
                        },
                        email: {
                            widget: 'email'
                        },
                        label: {
                            get_display: function(value, item) {
                                return to_belongs_to_user_icon(item);
                            },
                            detail_able: false,
                            addable: false,
                            editable: false,
                            width:30,
                            'class': 'text-center',
                            grid_fixed: true
                        },
                        company_name: {
                            search_able: true,
                            ensureUnique: 'Crm.CrmClueAPI',
                            grid_fixed: true
                        },
                        linkman: {
                            search_able: true
                        },
                        phone: {
                            search_able: true
                        },
                        contacts_company_id: {
                            addable: false,
                            editable: false,
                            detail_able: false
                        },
                        customer_id: {
                            addable: false,
                            editable: false,
                            detail_able: false
                        },
                        head_id: {
                            widget: 'item_select',
                            data_source: 'Account.UserInfoAPI',
                            required: false,
                            label: _('crm.Head Man'),
                            cell_filter: 'to_user_fullname',
                            value: ones.user_info.id
                        },
                        user_info_id: {
                            addable: false,
                            editable: false,
                            label: _('crm.Creator'),
                            cell_filter: 'to_user_fullname'
                        },
                        last_contact_time : {
                            widget: 'date',
                            value: new Date(moment().format())
                        }
                    },
                    modal_list_display: [
                        'company_name', 'linkman', 'phone', 'id'
                    ],
                    list_hide: ['contacts_company_id', 'customer_id', 'remark'],

                    filters: {},
                    detail_able: true,
                    // 分栏式详情
                    detail_split: {
                        title: _('common.View %s By', _('crm.Clue')),
                        global_title_field: 'company_name',
                        actions: {
                            basic: {
                                label: _("crm.Basic Info"),
                                view: 'views/detail.html',
                                link_actions: [{
                                    label: _('common.Edit') + ' ' + _('crm.Basic Info'),
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
                                        _mf: 'crm_clue_id',
                                        _mv: id
                                    }).$promise.then(function(data) {
                                            scope.items = data;
                                        });
                                }
                            },
                            head_log: {
                                label: _('crm.Customer Head Log'),
                                init: function(scope, id) {
                                    dataAPI.init('crm', 'customerHeadLog');
                                    dataAPI.resource.query({
                                        _mf: 'crm_clue_id',
                                        _mv: id
                                    }).$promise.then(function(data){
                                            scope.head_log = data;
                                        });
                                }
                            }

                        }
                    }
                };

                // 日程
                if(is_app_loaded('calendar')) {
                    this.config.detail_split.actions.calendar = {
                        label: _('calendar.Calendar'),
                        view: 'apps/crm/views/block/calendar.html',
                        link_actions: [{
                            label: _('common.Add New') + ' ' + _('calendar.Events'),
                            src : 'calendar/events/add/related_model/crm.crmClue/related_id/'+$routeParams.id,
                            icon: 'edit',
                            auth_node: 'calendar.events.post'
                        }],
                        no_padding: true,
                        init: function(scope, id) {
                            var eventAPI = $injector.get('Calendar.EventsAPI');
                            scope.events = [];
                            eventAPI.resource.query({
                                _mf: 'related_model,related_id',
                                _mv: 'crm.crmClue,'+id,
                                _ia: 1
                            }).$promise.then(function(data){ scope.events=data; });
                        }
                    };
                }

                // 扩展选中项操作
                this.config.extra_selected_actions = [];

                // 线索池
                if($routeParams.action === 'pool') {
                    this.config.extra_selected_actions.push(
                        {
                            label: _('crm.Collect Clue'),
                            icon: 'flag',
                            multi: true,
                            auth_node: 'crm.crmClue.collect',
                            action: function(evt, selected, item) {
                                var ids = get_grid_selected_ids(selected, item, true);
                                self.change_headed(ids, true, this.scope);
                            }
                        },
                        {
                            label: _('crm.Dispatch Clue'),
                            icon: 'code-fork',
                            auth_node: 'crm.crmClue.dispatch'
                        }
                    );


                    // 过滤器
                    angular.deep_extend(this.config.filters, {
                        source_from: {
                            type: 'link'
                        },
                        by_user: {
                            type: 'link',
                            data_source: [
                                {value: 'i_created', label: _('crm.I Created')},
                                {value: 'sub_created', label: _('crm.My Subordinates Created')}
                            ],
                            label: _('common.User')
                        }
                    });
                } else {
                    this.config.extra_selected_actions.push(
                        {
                            label: _('crm.Release Clue'),
                            icon: 'flag',
                            multi: true,
                            auth_node: 'crm.crmClue.release',
                            action: function(evt, selected, item) {
                                var ids = get_grid_selected_ids(selected, item, true);
                                self.change_headed(ids, false, this.scope);
                            }
                        },
                        {
                            label: _('crm.Transform To Customer'),
                            icon: 'retweet',
                            multi: false,
                            auth_node: 'crm.crmClue.transform',
                            action: function(evt, selected, item) {
                                if(item.customer_id) {
                                    RootFrameService.alert(_('crm.This Clue is transformed yet'));
                                    return;
                                }
                                $location.url('crm/customer/add/crm_clue_id/'+item.id);
                            }
                        }
                    );

                    // 过滤器
                    var clue_filters = {
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
                                {value: 'sub_headed', label: _('crm.My Subordinates Headed')},
                                {value: 'transformed', label: _('crm.Transformed Clue')}
                            ],
                            label: _('common.User')
                        }
                    };
                    angular.deep_extend(this.config.filters, clue_filters);
                }

                /*
                * 修改线索负责人
                * @param integer clue_id 线索ID
                * @param integer uid 用户ID，释放回线索池设定为false 或 undefined
                * */
                this.change_headed = function(clue_ids, uid, scope) {
                    switch(uid) {
                        case true:
                            var user_info = ones.user_info;
                            uid = user_info.id;
                            break;
                        case undefined:
                        case false:
                            uid = 'null';
                            break;
                        default:
                            if(parseInt(uid) > 0) {
                                uid = uid;
                            } else {
                                uid = 'null';
                            }
                    }
                    this.resource.update({
                        clue_id: clue_ids,
                        uid: uid,
                        action: 'update_head'
                    }).$promise.then(function() {
                            angular.isObject(scope) && scope.$broadcast('gridData.changed', true);
                        });
                };

            }
        ])

        .service('Crm.CustomerCommunicateAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.config = {
                    app: 'crm',
                    module: 'customerCommunicate',
                    table: 'customer_communicate',
                    fields: {
                        company: {
                            addable: false,
                            editable: false
                        },
                        user: {
                            addable: false,
                            editable: false
                        },
                        created: {
                            widget: 'datetime',
                            value: new Date(moment().format())
                        },
                        contacts_company_id: {
                            addable: false,
                            editable: false
                        },
                        crm_clue_id: {
                            addable: false,
                            editable: false
                        },
                        next_contact_time: {
                            widget: 'date',
                            blank: true
                        },
                        next_contact_content: {
                            blank: true
                        },
                        customer_id: {
                            addable: false,
                            editable: false
                        },
                        user_info_id: {
                            addable: false,
                            editable: false
                        }
                    }
                };

                this.resource = dataAPI.getResourceInstance({
                    uri: 'crm/customerCommunicate',
                    extra_methods: ['update', 'api_get', 'api_query']
                });
            }
        ])

        .service('Crm.CustomerAPI', [
            'ones.dataApiFactory',
            '$routeParams',
            'ContactsCompany.ContactsCompanyAPI',
            'Crm.CrmClueAPI',
            '$parse',
            '$injector',
            'RootFrameService',
            function(dataAPI, $routeParams, contactsCompanyApi, clueApi, $parse, $injector, RootFrameService) {

                var self = this;

                this.resource = dataAPI.getResourceInstance({
                    uri: 'crm/customer',
                    extra_methods: ['query', 'api_get', 'api_query']
                });

                this.unicode = function(item) {
                    if(angular.isObject(item)) {
                        return item.name;
                    }
                    return item;
                };

                this.unicode_lazy = function(ids) {
                    return this.resource.api_query({
                        _mf: 'id',
                        _mv: ids
                    }).$promise;
                };

                this.config = {
                    app: 'crm',
                    module: 'customer',
                    table: 'customer',
                    fields: {
                        name: {
                            on_view_item_clicked: function(value, item) {
                                RootFrameService.open_frame({
                                    src: 'crm/customer/view/split/'+item.id+'/basic',
                                    label: _('common.View %s Detail', _('crm.Customer'))
                                });
                            },
                            grid_fixed: true
                        },
                        label: {
                            get_display: function(value, item) {
                                return to_belongs_to_user_icon(item);
                            },
                            detail_able: false,
                            addable: false,
                            editable: false,
                            width:30,
                            'class': 'text-center',
                            grid_fixed: true
                        },
                        source_from: {
                            widget: 'select',
                            data_source: 'Home.CommonTypeAPI',
                            data_source_query_param: {
                                _mf: 'module',
                                _mv: 'source_from_type'
                            },
                            get_display: function(value, item) {
                                return item && item.source_from_label;
                            }
                        },
                        crm_clue_id: {
                            label: _('crm.From Clue'),
                            detail_widget: 'frame_link',
                            on_view_item_clicked: function(value) {
                                RootFrameService.open_frame({
                                    src: 'crm/customer/view/split/'+item.id+'/basic',
                                    label: _('common.View %s Detail', _('crm.Customer'))
                                });
                            },
                            get_display: function(value) {
                                if(!value) { return; }
                                return '#'+ String(value);
                            }
                        },
                        head_id: {
                            map: 'head_id',
                            widget: 'item_select',
                            data_source: 'Account.UserInfoAPI',
                            required: false,
                            label: _('crm.Head Man'),
                            cell_filter: 'to_user_fullname',
                            value: ones.user_info.id
                        },
                        user_info_id: {
                            label: _('crm.Creator'),
                            field: 'user_info_id',
                            cell_filter: 'to_user_fullname'
                        },
                        master: {
                            label: _('crm.Customer Head Man')
                        },
                        last_contact_time: {
                            widget: 'datetime'
                        },
                        next_contact_time: {
                            widget: 'datetime'
                        }
                    },
                    unaddable: ['label', 'head', 'user_info_id', 'contacts_company_id', 'crm_clue_id', 'contacts_company_role'],
                    uneditable: ['label', 'head', 'head_id', 'user_info_id', 'contacts_company_id', 'crm_clue_id', 'contacts_company_role_id'],
                    undetail_able: ['clue', 'contacts_company_role', 'contacts_company_id', 'contacts_company_role_id'],
                    list_hide: ['remark', 'next_contact_content', 'contacts_company_id', 'related_company_id'],
                    modal_list_display: [
                        'name', 'master', 'phone'
                    ],
                    extra_selected_actions: [],
                    detail_able: true,
                    filters: {
                        source_from: {
                            type: 'link'
                        }
                    },
                    detail_split: {
                        title: _('common.View %s By', _('crm.Customer')),
                        global_title_field: 'name',
                        actions: {
                            basic: {
                                label: _("crm.Basic Info"),
                                view: 'views/detail.html',
                                link_actions: [{
                                    label: _('common.Edit') + ' ' + _('crm.Basic Info'),
                                    src : 'crm/customer/edit/'+$routeParams.id,
                                    icon: 'edit',
                                    auth_node: 'crm.customer.put'
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
                            linkman: {
                                label: _('crm.Linkman'),
                                link_actions: [{
                                    src: 'contactsCompany/contactsCompanyLinkman/add/contacts_company_id/'+$routeParams.id,
                                    label: _('common.Add New')+' '+_('contactsCompany.Contacts Company Linkman'),
                                    auth_node: 'contactsCompany.contactsCompanyLinkman.post'
                                }],
                                no_padding: true,
                                init: function(scope, id) {
                                    var model = $injector.get('ContactsCompany.ContactsCompanyLinkmanAPI');
                                    scope.linkman_config = {
                                        model: model,
                                        resource: model.resource,
                                        query_params: {
                                            _mf: 'contacts_company_id',
                                            _mv: id
                                        }
                                    };
                                }
                            },
                            communicate: {
                                label: _("crm.Communicate Log"),
                                view: 'apps/crm/views/block/communicate.html',
                                link_actions: [{
                                    label: _('common.Add New') + ' ' + _('crm.Communicate Log'),
                                    src : 'crm/customerCommunicate/add/customer_id/'+$routeParams.id,
                                    icon: 'edit',
                                    auth_node: 'crm.customerCommunicate.post'
                                }],
                                no_padding: true,
                                init: function(scope, id) {
                                    var model = $injector.get('Crm.CustomerCommunicateAPI');
                                    scope.items = [];
                                    model.resource.query({
                                        _mf: 'ContactsCompany.id',
                                        _mv: id
                                    }).$promise.then(function(data) {
                                            scope.items = data;
                                        });
                                }
                            },
                            care: {
                                label: _('crm.Customer Care'),
                                link_actions: [{
                                    label: _('common.Add New') + ' ' + _('crm.Customer Care'),
                                    src : 'crm/customerCare/add/customer_id/'+$routeParams.id,
                                    icon: 'edit',
                                    auth_node: 'crm.customerCare.post'
                                }],
                                no_padding: true,
                                init: function(scope, id) {
                                    var model = $injector.get('Crm.CustomerCareAPI');
                                    scope.items = [];
                                    model.resource.query({
                                        _mf: 'Customer.id',
                                        _mv: id
                                    }).$promise.then(function(data) {
                                            scope.items = data;
                                        });
                                }
                            }
                        }
                    }
                };

                // 日程
                if(is_app_loaded('calendar')) {
                    this.config.detail_split.actions.calendar = {
                        label: _('calendar.Calendar'),
                        link_actions: [{
                            label: _('common.Add New') + ' ' + _('calendar.Events'),
                            src : 'calendar/events/add/related_model/crm.customer/related_id/'+$routeParams.id,
                            icon: 'edit',
                            auth_node: 'calendar.events.post'
                        }],
                        view: 'apps/crm/views/block/calendar.html',
                        no_padding: true,
                        init: function(scope, id) {
                            var eventAPI = $injector.get('Calendar.EventsAPI');
                            scope.events = [];
                            eventAPI.resource.query({
                                _mf: 'related_model,related_id',
                                _mv: 'crm.customer,'+id,
                                _ia: 1
                            }).$promise.then(function(data){ scope.events=data; });
                        }
                    };
                }

                // merge contacts company fields
                this.config.fields = angular.deep_extend(
                    angular.copy(contactsCompanyApi.config.fields),
                    this.config.fields
                );


                if($routeParams.action === 'pool') {
                    this.config.extra_selected_actions.push({
                        label: _('crm.Dispatch Customer'),
                        icon: 'code-fork',
                        auth_node: 'crm.customer.dispatch'
                    });
                    this.config.extra_selected_actions.push({
                        label: _('crm.Collect Customer'),
                        icon: 'flag',
                        multi: true,
                        auth_node: 'crm.customer.collect',
                        action: function(evt, selected, item) {
                            var ids = get_grid_selected_ids(selected, item, true);
                            self.change_headed(ids, true, this.scope);
                        }
                    });

                    // 过滤器
                    var the_filters = {
                        by_user: {
                            type: 'link',
                            data_source: [
                                {value: 'i_created', label: _('crm.I Created')},
                                {value: 'sub_created', label: _('crm.My Subordinates Created')}
                            ],
                            label: _('common.User')
                        }
                    };
                } else {
                    this.config.extra_selected_actions.push({
                        label: _('crm.Release Customer'),
                        icon: 'flag',
                        multi: true,
                        auth_node: false,
                        action: function(evt, selected, item) {
                            var ids = get_grid_selected_ids(selected, item, true);
                            self.change_headed(ids, false, this.scope);
                        }
                    });

                    // 过滤器
                    var the_filters = {
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

                    //this.config.list_display.push('head_id');
                }

                angular.deep_extend(this.config.filters, the_filters);

                /*
                 * 修改客户负责人
                 * @param integer clue_id 线索ID
                 * @param integer uid 用户ID，释放回线索池设定为false 或 undefined
                 * */
                this.change_headed = function(ids, uid, scope) {
                    switch(uid) {
                        case true:
                            var user_info = ones.user_info;
                            uid = user_info.id;
                            break;
                        case undefined:
                        case false:
                            uid = 'null';
                            break;
                        default:
                            if(parseInt(uid) > 0) {
                                uid = uid;
                            } else {
                                uid = 'null';
                            }
                    }
                    this.resource.update({
                        customer_ids: ids,
                        uid: uid,
                        action: 'update_head'
                    }).$promise.then(function() {
                            angular.isObject(scope) && scope.$broadcast('gridData.changed', true);
                        });
                };

                /*
                * 通用视图中扩展on_add方法
                * */
                this.on_add = function(opts) {
                    if(opts.extra_params.crm_clue_id) {
                        this.config.addable = false;
                        opts.scope.$parent.back_able = true;
                        var available = ['address', 'mobile', 'phone', 'master'];
                        clueApi.resource.get({id: opts.extra_params.crm_clue_id}).$promise.then(function(data) {
                            angular.forEach(data, function(v, k) {
                                switch(k) {
                                    case "company_name":
                                        var getter = $parse(opts.fields_define.name['ng-model']);
                                        getter.assign(opts.scope, v);
                                        return;
                                    case "linkman":
                                        var getter = $parse(opts.fields_define.master['ng-model']);
                                        getter.assign(opts.scope, v);
                                        return;
                                    case "phone":
                                        var getter = $parse(opts.fields_define.mobile['ng-model']);
                                        getter.assign(opts.scope, v);
                                        break;
                                    default:
                                        if(available.indexOf(k) < 0) {
                                            return;
                                        }
                                }
                                var getter = $parse(opts.fields_define[k]['ng-model']);
                                getter.assign(opts.scope, v);
                            });
                        });
                    }
                };
            }
        ])
        .service('Crm.CustomerCareAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'crm/customerCare'
                });

                this.config = {
                    app: 'crm',
                    module: 'customerCare',
                    table: 'customer_care',
                    fields: {
                        created: {
                            widget: 'datetime'
                        },
                        user_info_id: {
                            addable: false,
                            editable: false
                        },
                        executor: {
                            widget: 'item_select',
                            data_source: 'Account.UserInfoAPI',
                            value: ones.user_info.id,
                            map: 'executor_id'
                        },
                        customer_id: {
                            addable: false,
                            editable: false
                        },
                        type: {
                            widget: 'select',
                            data_source: 'Home.CommonTypeAPI',
                            data_source_query_param: {
                                _mf: 'module',
                                _mv: 'customer_care_type'
                            },
                            get_display: function(value, item) {
                                return item.get_type_display;
                            }
                        }
                    }
                };
            }
        ])
    ;
})(window, window.angular, window.ones);