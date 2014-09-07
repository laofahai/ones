/**
 * 登陆页面逻辑处理
 * */
var LoginModule = angular.module('ones.login', [
    "ngRoute",
    "ngResource",
    "ones.configModule",
    "ones.department"
]);

LoginModule.controller("LoginCtl", ['$scope','$http','$rootScope','ones.config', "$timeout", "$sce", "Department.UserAPI",
    function($scope, $http, $rootScope, conf, $timeout, $sce, User) {
        $scope.error = {
            isError : false,
            msg: null
        };

        $scope.error.message = null;

        //检测是否安装
        $timeout(function(){
            $.ajax({
                url: "server/Data/install.lock",
                statusCode: {
                    404: function(){
                        $scope.error.isError = true;
                        $scope.error.msg = $sce.trustAsHtml(toLang("ones_not_installed", "messages", $rootScope));
                        $scope.notInstalled = true;
                        $scope.$digest();
                    }
                }
            });
        });

        $scope.doLogin = function() {
            if($scope.LoginForm.$invalid) {
                return false;
            }

            User.login($scope.loginInfo).promise.then(function(data){
                window.location.href = 'app.html';
            }, function(data){
                $scope.error.isError = true;
                $scope.error.msg = $sce.trustAsHtml(data);
            });

        };
        
        $scope.doKeyDown = function(event){
            if(event.keyCode === 13) {
                $scope.doLogin();
            }
        };


        $scope.doRetrivePwd = function() {
            //
        };

    }]);

/**
 * 设置http头及序列化
 * */
LoginModule.run(["$http", function($http){
    $http.defaults.useXDomain = true;
    $http.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    $http.defaults.transformRequest = function (data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? jQuery.param(data) : data;
    };
}]);