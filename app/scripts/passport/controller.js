'use strict';

angular.module("erp.passport", ['erp.passport.services', 'ngGrid', 'erp.common.directives'])
        .config(["$routeProvider", function($routeProvider) {
            $routeProvider.when("/Passport/User", {
                templateUrl: 'views/common/edit.html',
                controller: 'UserListCtl'
            });
        }])
        .controller("UserListCtl", ["$scope", "UserModel", "UserRes", "DepartmentRes", "$location", "$routeParams", "ComView",
            function($scope, UserModel, UserRes, DepartmentRes, $location, $routeParams, ComView){
                var fields = UserModel.getFieldsStruct();
                    fields.then(function(data){
                        ComView.displayForm($scope, data, {name: "testForm"});
                    }, function(msg){
                        $scope.$parent.alert(msg);
                    });
            }])