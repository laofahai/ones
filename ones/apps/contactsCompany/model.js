(function(window, ones, angular){
    ones.global_module
        .service('ContactsCompany.ContactsCompanyAPI',[
            'ones.dataApiFactory',
            '$injector',
            '$routeParams',
            function(dataAPI, $injector, $routeParams) {

                var self = this;

                this.resource = dataAPI.getResourceInstance({
                    uri: 'contactsCompany/contactsCompany'
                });

                this.config = {
                    app: 'contactsCompany',
                    module: 'contactsCompany',
                    table: 'contacts_company',
                    fields: {
                        created: {
                            addable: false,
                            editable: false
                        },
                        related_company_id: {
                            addable: false,
                            editable: false,
                            detail_able: false
                        },
                        user_info_id: {
                            addable: false,
                            editable: false,
                            detail_able: false,
                            cell_filter: "to_user_fullname"
                        },
                        contacts_company_role_id: {
                            label: _('contactsCompany.Contacts Company Role'),
                            widget: 'select',
                            ng_model: 'contacts_company_role_id',
                            data_source: 'ContactsCompany.ContactsCompanyRoleAPI',
                            get_display: function(value, item) {
                                return item && item.role_name;
                            }
                        },
                        name: {
                            search_able: true
                        },
                        phone: {
                            search_able: true
                        },
                        mobile: {
                            search_able: true
                        },
                        address: {
                            search_able: true
                        },
                        master: {
                            label: _('contactsCompany.Master'),
                            search_able: true
                        },
                        region_id: {
                            widget: 'region',
                            label: _('region.Region')
                        }
                    },
                    sortable: ['id'],
                    filters: {
                        contacts_company_role_id: {
                            type: 'link'
                        }
                    },
                    list_hide: ['related_company_id'],
                    detail_able: true,
                    detail_split: {
                        title: _('common.View %s By', _('contactsCompany.Contacts Company')),
                        actions: {
                            basic: {
                                label: _("crm.Basic Info"),
                                view: 'views/detail.html',
                                link_actions: [{
                                    src: 'contactsCompany/contactsCompany/edit/'+$routeParams.id,
                                    label: _('common.Edit')+' '+_('contactsCompany.Contacts Company'),
                                    auth_node: 'contactsCompany.contactsCompany.put'
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
                                label: _('contactsCompany.Linkman'),
                                no_padding: true,
                                link_actions: [{
                                    src: 'contactsCompany/contactsCompanyLinkman/add/contacts_company_id/'+$routeParams.id,
                                    label: _('common.Add New')+' '+_('contactsCompany.Contacts Company Linkman'),
                                    auth_node: 'contactsCompany.contactsCompanyLinkman.post'
                                }],
                                init: function(scope, id) {
                                    var model = $injector.get('ContactsCompany.ContactsCompanyLinkmanAPI');
                                    scope.linkman_config = {
                                        model: model,
                                        resource: model.resource,
                                        query_params: {
                                            _mf: 'contacts_company_id',
                                            _mv: id
                                            //contacts_company_id: id
                                        }
                                    };
                                }
                            }
                        }
                    }
                };

            }
        ])
        .service('ContactsCompany.ContactsCompanyRoleAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {

                this.resource = dataAPI.getResourceInstance({
                    uri: 'contactsCompany/contactsCompanyRole',
                    extra_methods: ['update', 'api_query', 'api_get']
                });

                this.config = {
                    app: 'contactsCompany',
                    module: 'contactsCompanyRole',
                    table: 'contacts_company_role',
                    fields: {
                        discount: {
                            help_text: _('contactsCompany.discount_help_text'),
                            required: false
                        }
                    }
                }
            }
        ])
        .service('ContactsCompany.ContactsCompanyLinkmanAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'contactsCompany/contactsCompanyLinkman',
                    extra_methods: ['update', 'api_query', 'api_get']
                });

                this.config = {
                    app: 'contactsCompany',
                    module: 'contactsCompanyLinkman',
                    table: 'contacts_company_linkman',
                    addable: false,
                    fields: {
                        gender: {
                            widget: 'select',
                            data_source: [
                                {value: 1, label: _('common.Male')},
                                {value: 2, label: _('common.Female')}
                            ],
                            value: 1,
                            get_display: function(value) {
                                return get_data_source_display(this.data_source, value);
                            }
                        },
                        created: {
                            addable: false,
                            editable: false
                        },
                        related_company_id: {
                            addable: false,
                            editable: false
                        },
                        user_info_id: {
                            addable: false,
                            editable: false,
                            cell_filter: 'to_user_fullname'
                        },
                        related_user_id: {
                            addable: false,
                            editable: false
                        },
                        contacts_company_id: {
                            addable: false,
                            editable: false
                        },
                        company_name: {
                            search_able: true,
                            addable: false,
                            editable: false
                        },
                        name: {
                            search_able: true
                        },
                        mobile: {
                            search_able: true
                        }
                    },
                    filters: {
                        gender: {
                            type: 'link'
                        }
                    },
                    list_hide: ['related_user_id', 'related_company_id', 'contacts_company_id']
                }
            }
        ])
    ;

    //angular.module('ones.extend_1', ['ones.app.contactsCompany.model']);
})(window, window.ones, window.angular);