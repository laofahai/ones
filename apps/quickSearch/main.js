(function(){

    angular.module("ones.quickSearch", [])
        .factory("QuickSearchRes", ["$resource", "ones.config", function($resource, conf){
            return $resource(conf.BSU + "quickSearch/quickSearch/:id.json");
        }])
        .controller("QuickSearchCtl", ["$scope", function($scope, res){
//            console.log(123);
        }])
    ;
})();