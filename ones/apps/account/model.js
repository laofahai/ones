(function(window, ones, angular){

    // 注册线索到可支持自定义字段
    ones.pluginRegister('data_model_supported', function(injector, defered) {
        ones.pluginScope.append('data_model_supported', {
            label: _('account.User') + ' ' + _('common.Module'),
            value: 'account.user'
        });
    });

    ones.global_module
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
                this.get_authed_nodes = function(auth_role_id) {
                    var defered = $q.defer();
                    this.resource.api_query({auth_role_id: auth_role_id}).$promise.then(function(data){
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
                    fields: {
                        name: {
                            ensureUnique: "Account.AuthRoleAPI"
                        }
                    },
                    extra_selected_actions: [{
                        label: _('account.Role Authorize'),
                        icon: 'key',
                        auth_node: 'account.authorize.put',
                        action: function(evt, selected, item) {
                            item = item || selected[0];
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
        .service('Account.UserInfoAPI', [
            'ones.dataApiFactory',
            '$q',
            '$filter',
            function(dataAPI, $q, $filter) {

                this.resource = dataAPI.getResourceInstance({
                    uri: 'account/userInfo',
                    extra_methods: ['api_get', 'api_query']
                });

                this.config = {
                    app: 'account',
                    module: 'userInfo',
                    table: 'user_info',
                    fields: {
                        login: {
                            label: _('account.Login Name'),
                            ensureUnique: 'Account.UserInfoAPI',
                            search_able: true
                        },
                        password: {
                            editable: false
                        },
                        department_id: {
                            data_source: 'Account.DepartmentAPI',
                            widget: 'select',
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
                    },
                    list_hide: ['rand_hash', 'avatar', 'password']
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
                    return $filter('to_user_fullname')(uid);
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
                            width: '20%',
                            get_display: function(value, item) {
                                return item.prefix_name
                            }
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
                            data_source: 'Account.UserInfoAPI',
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
                    label_field: 'prefix_name',
                    list_hide: ['lft', 'rgt'],
                    // 扩展选中项操作
                    extra_selected_actions: [
                        get_selected_action_for_add_child(RootFrameService)
                    ]
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
                    unaddable: ['name', 'data', 'data_type', 'user_info_id', 'app'],
                    uneditable: ['name', 'data', 'data_type', 'user_info_id', 'app']
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

        /*
        * 返回用户真实姓名/全名
        * 根据用户首选项控制是否显示部门名称
        * */
        .filter('to_user_fullname', [function() {
            return function(uid) {
                if(!uid || !ones.all_users[uid]) {
                    return;
                }

                if(!ones.user_preference.show_username_with_department) {
                    return ones.all_users[uid].realname;
                } else {
                    return sprintf('%s %s', ones.all_users[uid].department_id__label__, ones.all_users[uid].realname);
                }

            };
        }])

        /*
        * 返回头像地址
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
	.service('Account.CompanyProfileAPI', [
            'ones.dataApiFactory',
            '$q',
            function(dataAPI, $q) {

                var self = this;

                this.resource = dataAPI.getResourceInstance({
                    uri: 'account/companyProfile',
                    extra_methods: ['api_get', 'api_query']
                });

                this.config = {
                    app: 'account',
                    module: 'companyProfile',
                    table: 'company_profile',
                    fields: {
                        name: {}
                    },
                    fields_groups: window.COMMON_FIELDS_GROUPS
                };

                /**
                 * 返回公司资料中的某项或者多项
                 * @param []|string key 需要获取的项目,可为项目别名或者别名数组
                 * */
                this.get_company_profile = function(key) {
                    var is_single = angular.isArray(key) ? false : true;
                    var params = {
                        _m: 'get_profile',
                        items: angular.isArray(key) ? key : [key]
                    };
                    var profiles = [];
                    var defered = $q.defer();
                    var need_response;
                    self.resource.api_get(params).$promise.then(function(response_data) {
                        response_data = response_data || {};
                        if(is_single) {
                            defered.resolve(response_data[key]);
                        } else {
                            defered.resolve(response_data);
                        }
                    });

                    return defered.promise;
                };
            }
        ])

    ;
})(window, window.ones, window.angular);