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
        .controller("multiSearchCtl", ["$scope", "pluginExecutor", "$injector", "$location", "$timeout", "$modal",
            function($scope, plugin, $injector, $location, $timeout, $modal){
                plugin.callPlugin("hook.multiSearch.items");

                var searchItems = ones.pluginScope.get("ones.multiSearch.items");

                $scope.results = [];

                //不分组
                $scope.resultsAll = [];

                var rowIndex = 0;

                //总共查询次数
                var queried = 0;

                var isModalShown = false;

                var searchResultModal

                var assignData = function(item, data){
                    var result = {};
                    result.subject = {
                        title: item.name,
                        link: item.link
                    };
                    if(data.length < 1) {
                        return;
                    }

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
                    queried = 0;
                    $scope.results = [];
                    $scope.resultsAll = [];
                    $scope.selectedIndex = 0;
                    rowIndex = 0;
                };

                searchResultModal = $modal({
                    scope: $scope,
                    title: l("lang.multiSearchResult"),
                    template: appView("searchResult.html", "multiSearch"),
                    show: false
                });

                $scope.$watch("keyword", function(keyword){
                    if($.trim(keyword)) {
                        resetResults();
                        angular.forEach(searchItems, function(item){

                            var node = link2action(item.link);
                            if(!isNodeAuthed(node)){
                                console.log("unauthed.node:" + node);
                                return;
                            }

                            var dataSource = typeof(item.dataSource) === "string" ? $injector.get(item.dataSource) : item.dataSource;

                            getDataApiPromise(dataSource, "query", {
                                _kw: keyword,
                                limit: item.pageSize || 5,
                                _si: item.sortBy || "+id",
                                _fd: item.fields || ""
                            }).then(function(data){
                                if(data.length && !data.error) {
                                    $scope.results.push(assignData(item, data));
                                }
                            });

                            queried++;

                            //查询完成
                            if(queried >= searchItems.length && !isModalShown) {
                                isModalShown = true;
                                searchResultModal.show();
                                $timeout(function(){
                                    $("#multiSearchModalKeyword").focus();
                                },300);
                            }
                        });
                    }
                });

                $scope.hideModal = function() {
                    searchResultModal.hide();
                    isModalShown = false;
                };

            }])
    ;

})(window.angular, window.ones);