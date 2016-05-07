(function(window, angular, ones){
    ones.global_module
        .service('Home.AppAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {

                var self = this;
                this.config = {
                    app: 'home',
                    module: 'app',
                    table: 'app',
                    fields: {
                        name: {
                            get_display: function(value, item) {
                                var local_name = _(item.alias+'.APP_NAME');
                                return local_name === "APP_NAME" ? item.alias : local_name;
                            },
                            grid_fixed: true
                        },
                        description: {
                            get_display: function(value, item) {
                                return _(item.alias+'.APP_DESCRIPTION')
                            }
                        },
                        price: {
                            get_display: function(value){
                                return value ? to_decimal_display(value) : _('home.Free to use');
                            }
                        },
                        is_active: {
                            get_display: function(value) {
                                return to_boolean_icon(value > 0);
                            },
                            data_source: window.BOOLEAN_DATASOURCE,
                            grid_fixed: true
                        },
                        type: {
                            data_source: [
                                {value: 'contacts', label: _('home.APPS_TYPES.Contacts Company Related')},
                                {value: 'marketing', label: _('home.APPS_TYPES.Marketing Related')},
                                {value: 'storage', label: _('home.APPS_TYPES.Storage Related')},
                                {value: 'product', label: _('home.APPS_TYPES.Product Related')},
                                {value: 'purchase', label: _('home.APPS_TYPES.Purchase Related')},
                                {value: 'finance', label: _('home.APPS_TYPES.Finance Related')},
                                {value: 'office', label: _('home.APPS_TYPES.Office Related')},
                                {value: 'analytics', label: _('home.APPS_TYPES.Analytics Related')},
                                {value: 'null', label: _('home.APPS_TYPES.Other')}
                            ]
                        }
                    },
                    addable: false,
                    editable: false,
                    deleteable: false,
                    filters: {
                        is_active: {
                            type: 'link'
                        },
                        type: {
                            type: 'link'
                        }
                    },
                    extra_selected_actions: [{
                        label: _('home.Enable'),
                        icon : 'check-circle-o text-success',
                        multi: true,
                        auth_node: 'home.app.put',
                        action: function(evt, selected, item) {
                            if(!item && !selected) return;
                            var id = [];
                            if(item) {
                                id.push(item.alias);
                            } else if(selected) {
                                angular.forEach(selected, function(item){
                                    id.push(item.alias);
                                });
                            }

                            if(!id) {
                                return;
                            }

                            var $this = this;
                            self.resource.update({
                                aliases: id,
                                act: 'enable'
                            }).$promise.then(function() {
                                    $this.scope.$broadcast('gridData.changed', true);
                                });
                        }
                    }, {
                        label: _('home.Disable'),
                        icon : 'minus-circle text-danger',
                        multi: true,
                        auth_node: 'home.app.put',
                        action: function(evt, selected, item) {
                            if(!item && !selected) return;
                            var id = [];
                            if(item) {
                                id.push(item.alias);
                            } else if(selected) {
                                angular.forEach(selected, function(item){
                                    id.push(item.alias);
                                });
                            }
                            if(!id) {
                                return;
                            }

                            var $this = this;
                            self.resource.update({
                                aliases: id,
                                act: 'disable'
                            }).$promise.then(function() {
                                    $this.scope.$broadcast('gridData.changed', true);
                                });
                        }
                    }],
                    sortable: [
                        'price'
                    ]
                };

                this.resource = dataAPI.getResourceInstance({
                    uri: "home/app",
                    extra_methods: ['api_get', 'api_query']
                });

                this.unicode = function(item) {
                    return _(item.alias+".APP_NAME");
                }
            }
        ])
        .service('Home.CompanyActiveApps', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'home/companyActiveApps',
                    extra_methods: ['api_query']
                });
                this.config = {
                    app: 'home',
                    module: 'companyActiveApps',
                    table: 'company_active_apps'
                };

                this.unicode = function(item) {
                    var app_name = _(item.alias+'.APP_NAME');
                    return app_name === 'APP_NAME' ? item.alias : app_name;
                }
            }
        ])
    ;
})(window, window.angular, window.ones);