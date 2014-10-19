(function(angular, ones){

    /**
     * 综合搜索
     * */

    ones.pluginRegister("hook.hotKey", function(injector, defer, $event){
        if($event.ctrlKey && $event.keyCode == 70) {
            $("#multiSearchInput").focus();
            window.event.returnValue = false;
        }
    });
    angular.module("ones.multiSearch", [])
        .controller("multiSearchCtl", ["$scope", "pluginExecutor", "$injector", "$location", "$timeout",
            function($scope, plugin, $injector, $location, $timeout){
                plugin.callPlugin("hook.multiSearch.items")

                var searchItems = ones.pluginScope.get("ones.multiSearch.items");

                $scope.results = [];

                //不分组
                $scope.resultsAll = [];

                var rowIndex = 0;

                var assignData = function(item, data){
                    var result = {};
                    result.subject = {
                        title: item.name,
                        link: item.link
                    };
                    angular.forEach(data, function(row){
                        result.datas = result.datas || [];
                        var itemRow = {
                            link: typeof(item.linkTpl) === "function" ? item.linkTpl(row) : item.linkTpl.replace("+id", row.id),
                            label: typeof(item.labelField) === "function" ? item.labelField(row) : row[item.labelField||"bill_id"],
                            index: rowIndex
                        };
                        result.datas.push(itemRow);
                        $scope.resultsAll.push(itemRow);
                        rowIndex++;
                    });


                    return result;
                };

                var resetResults = function() {
                    $scope.results = [];
                    $scope.resultsAll = [];
                    $scope.selectedIndex = 0;
                    rowIndex = 0;
                };

                $scope.$watch("keyword", function(keyword){
                    if($.trim(keyword)) {
                        resetResults();
                        angular.forEach(searchItems, function(item){
                            var dataSource = typeof(item.dataSource) === "string" ? $injector.get(item.dataSource) : item.dataSource;

                            getDataApiPromise(dataSource, "query", {
                                _kw: keyword,
                                limit: item.pageSize || 3,
                                _si: item.sortBy || "+id",
                                _fd: item.fields || ""
                            }).then(function(data){
                                if(data.length && !data.error) {
                                    $scope.results.push(assignData(item, data));
                                }
                            });
                        });
                    }
                });

                $scope.doSearchBlur = function($event){
                    $timeout(function(){
                        resetResults();
                    }, 200);
                };

                $scope.doSearchFocus = function() {
                    $scope.keyword = "";
                    resetResults();
                }

                $scope.doSearchKeydown = function($event){
                    switch($event.keyCode) {
                        case ones.keyCodes.Down:
                            $scope.selectedIndex++;
                            if($scope.selectedIndex > $scope.resultsAll.length) {
                                $scope.selectedIndex = 0;
                            }
                            window.event.returnValue = false;
                            break;
                        case ones.keyCodes.Up:
                            $scope.selectedIndex--;
                            if($scope.selectedIndex < 0) {
                                $scope.selectedIndex = $scope.resultsAll.length;
                            }
                            window.event.returnValue = false;
                            break;
                        case ones.keyCodes.Enter:
                            window.event.returnValue = false;
                            $location.url($scope.resultsAll[$scope.selectedIndex].link);
                            $timeout(function(){
                                resetResults();
                            },200);
                            break;
                        case ones.keyCodes.Escape:
                            resetResults();
                            break;
                    }
                }

            }])
    ;

})(window.angular, window.ones);