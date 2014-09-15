(function(angular, ones){
    /**
     * 打印模块
     * */

    angular.module("ones.print", [])
        .service("CommonPrint", [function(){
            this.scope;
            this.displayPrintPage = function(model, res){
                res.get({
                    id: $routeParams.id,
                    includeRows: true //包含子行
                }).$promise.then(function(data){
                    $scope.data = data.datas ? data : {datas: [data]};
                });
            }
        }])
        .directive()
    ;

})(window.angular, window.ones);