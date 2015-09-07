(function(window, ones, angular){
    angular.module('ones.app.account.model', [])
        // 认证服务
        .service('Account.AuthorizeAPI', [
            'ones.dataApiFactory',
            '$q',
            '$routeParams',
            function(dataAPI, $q, $routeParams) {

                this.resource = dataAPI.getResourceInstance({
                    uri: 'account/authorize',
                    extra_methods: ['update', 'api_query']
                });

                // 获得所有已授权节点
                this.get_authed_nodes = function() {

                    var defered = $q.defer();

                    this.resource.api_query().$promise.then(function(data){
                        data = data || [];
                        defered.resolve(data);
                    });
                    return defered;
                };

                this.save_auth = function(data) {
                    return this.resource.update({id: $routeParams.id}, data).$promise;
                };

                // 节点是否已授权
                this.is_node_authed = function() {};
            }
        ])
        .service('Account.AuthRoleAPI', [
            'ones.dataApiFactory',
            '$location',
            function(dataAPI, $location){
                this.config = {
                    app: 'account',
                    module: 'authRole',
                    table: 'auth_role',
                    fields: {},
                    list_display: ['name'],
                    extra_selected_actions: [{
                        label: _('account.Role Authorize'),
                        icon: 'key',
                        auth_node: 'account.authorize.put',
                        action: function(evt, selected, item) {
                            $location.url('/account/accountRole/authorize/'+item.id);
                        }
                    }]
                };

                this.resource = dataAPI.getResourceInstance({
                    uri: 'account/authRole',
                    extra_methods: ['api_get', 'api_query']
                });
            }
        ])
        .service('Account.AuthNodeAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                this.config = {};

                this.resource = dataAPI.getResourceInstance({
                    uri: 'account/authNode',
                    extra_methods: ['api_get', 'api_query']
                });
            }
        ])
        .service('Account.UserAPI', [
            'ones.dataApiFactory',
            '$q',
            function(dataAPI, $q) {

                this.resource = dataAPI.getResourceInstance({
                    uri: 'account/user',
                    extra_methods: ['api_get', 'api_query']
                });

                this.config = {
                    app: 'account',
                    module: 'user',
                    table: 'user',
                    list_display: ['id', 'login', 'email', 'realname'],
                    fields: {
                        login: {
                            label: _('account.Login Name'),
                            ensureUnique: 'Account.UserAPI',
                            search_able: true
                        },
                        password: {
                            editable: false
                        },
                        department_id: {
                            data_source: 'Account.DepartmentAPI',
                            widget: 'select',
                            map: 'department_id',
                            label: _('account.Department')
                        },
                        realname: {
                            search_able: true
                        },
                        email: {
                            search_able: true,
                            widget: 'email'
                        },
                        auth_role: {
                            map: 'auth_role_id',
                            widget: 'select',
                            data_source: 'Account.AuthRoleAPI',
                            label: _('account.Auth Role'),
                            multiple: true
                        },
                        created: {
                            addable: false,
                            editable: false
                        },
                        avatar: {
                            addable: false,
                            editable: false
                        },
                        rand_hash: {
                            addable: false,
                            editable: false
                        }
                    },
                    label_field: 'realname',
                    filters: {
                        department_id: {
                            type: 'link'
                        }
                    }
                };

                this.unicode = function(item){
                    return this.get_fullname(item);
                };
                this.unicode_lazy = function(ids) {
                    var ret = [];
                    var defered = $q.defer();
                    angular.forEach(ids, function(id) {
                        ret.push(ones.all_users[id]);
                    });
                    defered.resolve(ret);
                    return defered.promise;
                };

                this.get_fullname = function(uid) {
                    if(angular.isObject(uid)) {
                        uid = uid.id;
                    }

                    if(!ones.all_users[uid]) {
                        return;
                    }
                    return sprintf('%s %s', ones.all_users[uid].department, ones.all_users[uid].realname);
                };

                this.get_avatar = function(uid) {
                    var user_info = ones.all_users[uid];
                    if(user_info.avatar) {
                        return user_info.avatar;
                    } else {
                        return sprintf(
                            'https://cn.gravatar.com/avatar/%s?s=%s&d=mm&r=g',
                            hex_md5(avatar),
                            size
                        );
                    }
                };

            }
        ])
        .service('Account.DepartmentAPI', [
            'ones.dataApiFactory',
            '$location',
            'RootFrameService',
            '$filter',

            function(dataAPI, $location, RootFrameService, $filter) {
                this.resource = dataAPI.getResourceInstance({
                    uri: 'account/department',
                    extra_methods: ['api_get', 'api_query']
                });

                this.config = {
                    app: 'account',
                    module: 'department',
                    table: 'department',
                    addable: false,
                    fields: {
                        name: {
                            width: '20%'
                        },
                        lft: {
                            addable: false,
                            editable: false
                        },
                        rgt: {
                            addable: false,
                            editable: false
                        },
                        leader: {
                            widget: 'item_select',
                            multiple: 'multiple',
                            data_source: 'Account.UserAPI',
                            get_display: function(value, item) {
                                if(!value) {
                                    return;
                                }
                                value = value.split(',');

                                var names = [];
                                for(var i=0; i<value.length; i++) {
                                    names.push($filter('to_user_fullname')(value[i]));
                                }

                                return names.join();
                            }
                        }
                    },
                    list_display: ['name', 'leader'],
                    // 扩展选中项操作
                    extra_selected_actions: [{
                        multi: false,
                        label: _('account.Add Child Department'),
                        icon: 'plus',
                        auth_node: 'account.department.post',
                        action: function(evt, selected, item) {
                            RootFrameService.open_frame({
                                label: _('common.Add New')+ ' ' + _('account.Department'),
                                src: 'account/department/add/pid/'+item.id,
                                singleton: true
                            });
                        }
                    }]
                };
            }
        ])
        .service('Account.UserPreferenceAPI', [
            'ones.dataApiFactory',
            'pluginExecutor',
            function(dataAPI, plugin) {

                var self = this;
                this.resource = dataAPI.getResourceInstance({
                    uri: 'account/userPreference',
                    extra_methods: ['api_get', 'api_query']
                });

                this.config = {
                    app: 'account',
                    module: 'userPreference',
                    table: 'user_preference',
                    fields: {},
                    unaddable: ['name', 'data', 'data_type', 'user_id', 'app'],
                    uneditable: ['name', 'data', 'data_type', 'user_id', 'app']
                };

                plugin.callPlugin('user_preference_item');
                angular.forEach(ones.pluginScope.get('user_preference_item'), function(field) {
                    self.config.fields[field.alias] = field;
                });

                /*
                * 设置用户首选项
                * @param string key 首选项key
                * @param mixed data
                * */
                    this.set_preference = function(key, data, append) {
                    this.resource.update({
                        key: key,
                        data: data,
                        append: true === append ? true : false
                    });
                };

                /*
                * 获取用户首选项
                * @param string key
                * @param function callback
                * @param string method [default is api_get]
                * */
                this.get_preference = function(key) {
                    return ones.user_preference[key];
                }

            }
        ])

        .filter('to_user_fullname', [function() {
            return function(uid) {
                if(!uid || !ones.all_users[uid]) {
                    return;
                }
                return sprintf('%s %s', ones.all_users[uid].department, ones.all_users[uid].realname);
            };
        }])

        /*
        * 返回头像地址
        * @todo 非注册用户邮箱显示头像
        * */
        .filter('to_avatar_src', [function() {
            return function(uid, size) {
                if(!uid) return;
                size = size || 45;
                var user_info = ones.all_users[uid];
                if(user_info.avatar) {
                    return user_info.avatar;
                } else {
                    return sprintf(
                        'https://cn.gravatar.com/avatar/%s?s=%s&d=mm&r=g&d=wavatar',
                        hex_md5(user_info.email),
                        size
                    );
                }
            };
        }])

    ;
})(window, window.ones, window.angular);