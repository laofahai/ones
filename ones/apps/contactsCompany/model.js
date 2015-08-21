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
                            editable: false,
                            label: 'Created Time'
                        },
                        related_company_id: {
                            addable: false,
                            editable: false,
                            detailable: false
                        },
                        user_id: {
                            addable: false,
                            editable: false,
                            detailable: false
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
                        master: {
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
                            label: _('contactsCompany.Master')
                        },
                        region_id: {
                            widget: 'region_select',
                            label: _('region.Region')
                        }
                    },
                    list_display: ['name', 'master', 'phone', 'mobile', 'address'],
                    sortable: ['id'],
                    filters: {
                        contacts_company_role_id: {
                            type: 'link'
                        }
                    },
                    detailable: true,
                    detail_split: {
                        title: _('crm.View Clue By'),
                        actions: {
                            basic: {
                                label: _("crm.Basic Info"),
                                link_actions: [{
                                    src: 'contactsCompany/contactsCompany/edit/'+$routeParams.id,
                                    label: _('common.Edit')+' '+_('contactsCompany.Contacts Company'),
                                    auth_node: 'contactsCompany.contactsCompany.put'
                                }],
                                init: function(scope, id) {
                                    scope.detail_view_config = {
                                        model: dataAPI.model,
                                        resource: dataAPI.resource,
                                        query_method: 'get',
                                        query_params: {
                                            id: id
                                        }
                                    };
                                }
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
                        company: {
                            addable: false,
                            editable: false
                        }
                    },
                    list_display: ['name', 'alias']
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
                            label: 'Created Time',
                            addable: false,
                            editable: false
                        },
                        related_company_id: {
                            addable: false,
                            editable: false
                        },
                        user_id: {
                            addable: false,
                            editable: false
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
                    list_display: ['name', 'gender', 'mobile', 'company_name', 'created']
                }
            }
        ])
    ;

    //angular.module('ones.extend_1', ['ones.app.contactsCompany.model']);
})(window, window.ones, window.angular);