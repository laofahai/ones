(function(angular, ones){

    /**
     * 综合搜索
     * */

    angular.module("ones.multiSearch", [])
        .controller("multiSearchCtl", ["$scope", "pluginExecutor", "$injector", function($scope, plugin, $injector){
            plugin.callPlugin("hook.multiSearch.items")

            var searchItems = ones.pluginScope.get("ones.multiSearch.items");

            $scope.results = [];

            $scope.$watch("keyword", function(keyword){
                if($.trim(keyword)) {
                    $scope.results = [];
                    var resultIndex = 0;
                    angular.forEach(searchItems, function(item){
                        var dataSource = typeof(item.dataSource) === "string" ? $injector.get(item.dataSource) : item.dataSource;

                        getDataApiPromise(dataSource, "query", {
                            _kw: keyword,
                            limit: item.pageSize || 3,
                            _si: item.sortBy || "+id",
                            _fd: item.fields || ""
                        }).then(function(data){
                            if(data && !data.error) {
                                $scope.results[resultIndex] = {};
                                $scope.results[resultIndex].subject = {
                                    title: item.name,
                                    link: item.link
                                };
                                angular.forEach(data, function(row){
                                    $scope.results[resultIndex].datas = $scope.results[resultIndex].datas || [];
                                    $scope.results[resultIndex].datas.push({
                                        link: typeof(item.linkTpl) === "function" ? item.linkTpl(row) : item.linkTpl.replace("+id", row.id),
                                        label: typeof(item.labelField) === "function" ? item.labelField(row) : row[item.labelField||"bill_id"]
                                    });
                                });
                                console.log($scope.results);
                            }
                        });

                        resultIndex++;

                    });
                }
            });
        }])
    ;

})(window.angular, window.ones);