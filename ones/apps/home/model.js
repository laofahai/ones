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
                                return _(item.alias+'.APP_NAME')+' '+item.alias;
                            }
                        },
                        description: {
                            get_display: function(value, item) {
                                return _(item.alias+'.APP_DESCRIPTION')
                            }
                        },
                        is_active: {
                            get_display: function(value) {
                                return to_boolean_icon(value > 0);
                            },
                            data_source: [
                                {value: 1, label: _('common.Yes')},
                                {value: -1, label: _('common.No')}
                            ]
                        }
                    },
                    list_display: ['name', 'description', 'is_active'],
                    addable: false,
                    editable: false,
                    deleteable: false,
                    filters: {
                        is_active: {
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


                            var $this = this;
                            self.resource.update({
                                aliases: id,
                                act: 'disable'
                            }).$promise.then(function() {
                                    $this.scope.$broadcast('gridData.changed', true);
                                });
                        }
                    }]
                };

                this.resource = dataAPI.getResourceInstance({
                    uri: "home/app",
                    extra_methods: ['api_get', 'api_query']
                });
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
                    table: 'company_active_apps',


                };

                this.unicode = function(item) {
                    var app_name = _(item.alias+'.APP_NAME');
                    return app_name === 'APP_NAME' ? item.alias : app_name;
                }
            }
        ])
    ;
})(window, window.angular, window.ones);