(function(window, ones, angular){
    angular.module('ones.app.account.main', [
        'ones.app.account.model'
    ])
        .config([
            "$routeProvider",
            function($route){
                $route
                    .when('/account/accountRole/authorize/:id', {
                        controller: 'AccountAuthorizeCtrl',
                        templateUrl: appView('authorize.html', 'account')
                    })
                    .when('/account/userPreference', {
                        controller: 'AccountUserPreferenceCtrl',
                        templateUrl: 'views/edit.html'
                    })
                    .when('/account/profile', {
                        controller: 'AccountUserProfileCtrl',
                        templateUrl: 'views/edit.html'
                    })
                ;
            }
        ])
        // 个人资料
        .controller('AccountUserProfileCtrl', [
            '$scope',
            'Account.UserAPI',
            function($scope, user_api) {
                user_api.config.uneditable = user_api.config.uneditable || [];
                user_api.config.uneditable.push('department_id', 'auth_role_id');
                $scope.formConfig = {
                    resource: user_api.resource,
                    model   : user_api,
                    id      : ones.user_info.id,
                    opts    : {}
                };
            }
        ])
        // 授权
        .controller('AccountAuthorizeCtrl', [
            '$scope',
            'Account.AuthNodeAPI',
            'Account.AuthorizeAPI',
            'ones.dataApiFactory',
            '$location',
            function($scope, node_api, authorize, dataAPI, $location) {
                var nodes_tmp = {};
                var nodes_map = {};

                // 可后退
                $scope.$parent.back_able = true;

                $scope.nodes = [];

                // 一行选择标记
                $scope.link_checked = {};

                $scope.nodes_model = {};

                // 行级权限选择
                $scope.flag_checked = {};

                // 选择一行
                $scope.check_link = function(app){
                    angular.forEach(nodes_tmp[app].items, function(item) {
                        $scope.nodes_model[item.node] = $scope.link_checked[app];
                    });
                };

                // 行级权限是否可用
                $scope.is_flag_disabled = function(node) {
                    return $scope.nodes_model[node] ? false : true;
                };


                // 所有节点
                node_api.resource.query().$promise.then(function(nodes){
                    angular.forEach(nodes, function(node) {
                        nodes_tmp[node.app] = nodes_tmp[node.app] || {items: []};
                        var node_info = node.node.split('.');
                        nodes_tmp[node.app].app = node.app;
                        nodes_tmp[node.app].label = _(node.app+'.APP_NAME');
                        var  action_label = _(node.app+'.METHODS.'+node_info[1]+'.'+node_info[2]);
                        if(action_label == node_info[2]) {
                            action_label = _(node.app+'.METHODS.'+node_info[2]);
                        }
                        nodes_tmp[node.app].items.push({
                            id: node.id,
                            app: node.app,
                            node: node.node,
                            label: action_label+' '+_(node.app+'.'+camelCaseSpace(node_info[1])),
                            flag: node.flagable > 0 ? true : false
                        });

                        nodes_map[node.node] = node.id;

                        if(!(node.node in $scope.nodes_model)) {
                            $scope.nodes_model[node.node] = false;
                            if(node.flagable > 0) {
                                $scope.flag_checked[node.node] = '1';
                            }
                        }
                    });
                    $scope.nodes = reIndex(nodes_tmp);
                });

                // 已授权节点
                authorize.get_authed_nodes().promise.then(function(authed){
                    angular.forEach(authed, function(node) {
                        $scope.nodes_model[node.node] = true;
                        $scope.flag_checked[node.node] = node.flag;
                    });
                });

                // 保存授权
                $scope.save_authorize = function() {
                    var post_data = {
                        nodes: [],
                        flag: {}
                    };

                    angular.forEach($scope.nodes_model, function(enabled, node) {
                        if(!enabled) {
                            return;
                        }

                        post_data.nodes.push(nodes_map[node]);
                        post_data.flag[nodes_map[node]] = $scope.flag_checked[node];
                    });


                    authorize.save_auth(post_data).then(function(){
                        $location.url('/account/authRole');
                    });

                };

                // flags
                $scope.flags = [];

                var node_flag_api = dataAPI.getResourceInstance({
                    uri: 'account/authNode/get_auth_node_flags',
                    extra_methods: ['api_query']
                });
                node_flag_api.api_query().$promise.then(function(data){
                    $scope.flags = data;
                    console.log(data);
                });

            }
        ])
        .controller('AccountUserPreferenceCtrl', [
            '$scope',
            'Account.UserPreferenceAPI',
            function($scope, preference_api) {
                $scope.formConfig = {
                    resource: preference_api.resource,
                    model   : preference_api,
                    id      : 1
                };
            }
        ])
    ;
})(window, window.ones, window.angular);