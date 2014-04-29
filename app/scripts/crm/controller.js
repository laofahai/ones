'use strict';

angular.module("erp.crm", ['erp.crm.services', 'ngGrid', 'erp.common.directives'])
//        .config(["$routeProvider", function($routeProvider){
//            $routeProvider.when("/CRM/RelCompanyGroup", {
//                controller: "RelCompanyGroupCtl",
//                templateUrl: "views/common/grid.html"
//            })
//            .when("/CRM/RelCompanyGroup/add", {
//                controller: "RelCompanyGroupEditCtl",
//                templateUrl: "views/common/edit.html"
//            })
//            .when("/CRM/RelCompanyGroup/edit/id/:id", {
//                controller: "RelCompanyGroupEditCtl",
//                templateUrl: "views/common/edit.html"
//            })
//            .when("/CRM/RelCompany", {
//                controller: "RelCompanyCtl",
//                templateUrl: "views/common/grid.html"
//            })
//            .when("/CRM/RelCompany/add", {
//                controller: "RelCompanyEditCtl",
//                templateUrl: "views/common/edit.html"
//            })
//            .when("/CRM/RelCompany/edit/id/:id", {
//                controller: "RelCompanyEditCtl",
//                templateUrl: "views/common/edit.html"
//            })
//        }])
//        .controller("RelCompanyGroupCtl", ["$scope", "RelCompanyGroupRes", "RelCompanyGroupModel","ComView",
//            function($scope, RelCompanyGroupRes, RelCompanyGroupModel, ComView){
//                ComView.makeDefaultPageAction($scope, "CRM/RelCompanyGroup");
//                ComView.displayGrid($scope, RelCompanyGroupModel, RelCompanyGroupRes);
//            }])
//        .controller("RelCompanyGroupEditCtl", ["$scope", "RelCompanyGroupRes", "RelCompanyGroupModel", "$routeParams","ComView", 
//            function($scope, RelCompanyGroupRes, RelCompanyGroupModel, $routeParams, ComView){
//                ComView.makeDefaultPageAction($scope, "CRM/RelCompanyGroup");
//                ComView.displayForm($scope, RelCompanyGroupModel, RelCompanyGroupRes, {
//                    id: $routeParams.id
//                });
//            }])
//        .controller("RelCompanyCtl", ["$scope", "RelCompanyRes", "RelCompanyModel","ComView",
//            function($scope, RelCompanyRes, RelCompanyModel, ComView){
//                ComView.makeDefaultPageAction($scope, "CRM/RelCompany");
//                ComView.displayGrid($scope, RelCompanyModel, RelCompanyRes);
//            }])
//        .controller("RelCompanyEditCtl", ["$scope", "RelCompanyRes", "RelCompanyModel", "$routeParams","ComView", 
//            function($scope, RelCompanyRes, RelCompanyModel, $routeParams, ComView){
//                ComView.makeDefaultPageAction($scope, "CRM/RelCompany");
//                ComView.displayForm($scope, RelCompanyModel, RelCompanyRes, {
//                    id: $routeParams.id
//                });
//            }])