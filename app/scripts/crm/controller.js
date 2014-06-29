'use strict';
(function(){
    angular.module("ones.crm", ['ones.crm.services', 'ngGrid', 'ones.common.directives'])
        .config(["$routeProvider", function($routeProvider){
            $routeProvider.when("/CRM/addBill/relationshipCompany", {
                templateUrl: "views/crm/edit.html",
                controller: "CRMRelCompanyEditCtl"
            })
            ;
        }])
        .controller("CRMRelCompanyEditCtl", ["$scope", "ComView",
            function($scope, ComView){

            }])
    ;
})();
