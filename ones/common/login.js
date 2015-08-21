(function (window, angular) {
    angular.module('ones.login', [
        'ones.filtersModule',
        'ones.configModule',
        'ones.i18nModule',
        'ones.servicesModule'
    ])
    
    /**
     * 主控制器
     * */
    .controller('LoginCtrl', [
        '$scope',
        'ones.dataApiFactory',
        '$http',
        function ($scope, dataAPI, $http) {
            
            dataAPI.init('account', 'login');
            
            $scope.loginInfo = {
                company_sign_id: ones.caches.getItem('company_sign_id')
            };
            
            $scope.error = {
                is_error: false,
                msg: null
            };
            
            $scope.doLogin = function() {
                
                if(!$scope.LoginForm.$valid) {
                    return;
                }

                ones.caches.setItem('company_sign_id', $scope.loginInfo.company_sign_id);

                //$http.post(ones.remote_entry + 'account/login', $scope.loginInfo)
                $scope.$on('event:serverError', function(evt, msg) {
                    $scope.error = {
                        is_error: true,
                        msg: msg
                    };
                });

                //return delay.promise;
                //
                dataAPI.resource.save($scope.loginInfo).$promise.then(function(result){
                    if(result.token && result.token !== 'null') {
                        $scope.error.is_error = false;
                        ones.caches.setItem('user.session_token', result.token);
                        window.location.href = ones.APP_ENTRY;
                        // redirect to main app
                    } else {
                        // otherwise
                    }
                });
            };
            
        }
    ])
    ;
})(window, window.angular);