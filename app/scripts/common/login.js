/**
 * 登陆页面逻辑处理
 * */
var LoginModule = angular.module('login', ["erp.config"]);

LoginModule.controller("LoginCtl", ['$scope','$http','$rootScope','erp.config',
    function($scope, $http, $rootScope, conf) {
        $scope.error = {
            isError : false,
            msg: null
        };
        $scope.error.message = null;
        $scope.loginInfo = {
            username: null,
            password: null,
            remember: false
        };
        $scope.doLogin = function() {
            if($scope.LoginForm.$invalid) {
                return false;
            }
            $rootScope.sessionHash = $rootScope.sessionHash || null;

            $http.post(conf.BSU+'passport/userLogin', $scope.loginInfo).
                success(function(data, status, headers, config) {
                    if(data.error) {
                        $scope.error.isError = true;
                        $scope.error.msg = data.msg;
                    } else if(data.sessionHash){
                        window.location.href = 'app.html?hash='+data.sessionHash;
                    }
                }).
                error(function(data, status, headers, config) {
                    $scope.error.isError = true;
                    $scope.error.msg = 'Server Error.';
                });
        };


        $scope.doRetrivePwd = function() {
            //
        };

    }]);

/**
 * 设置http头及序列化
 * 
 * */
LoginModule.run(function($http){
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    $http.defaults.transformRequest = function (data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? jQuery.param(data) : data;
    }
});