(function(angular, ones){

    angular.module("ones.gridView", [])
        .service("GridView", ["$rootScope", "$routeParams", "$location", "$modal", "ones.dataApiFactory", "$timeout",
            function($rootScope, $routeParams, $location, $modal, dataAPI, $timeout){
                var self = this;
                this.scope = {};
                this.selected = {};
                this.sortInfo = {
                    field: "id",
                    direction: "ASC"
                };

                this.init = function($scope, options){

                    self.scope = $scope;
                    self.options = options;

                    var optsField = ["pagingOptions", "filterOptions", "sortInfo"];
                    angular.forEach(optsField, function(field){
                        self.scope[field] = options[field];
                    });

                    /**
                     * 监视器
                     * */
                    self.scope.$watch('pagingOptions', function(newVal, oldVal) {
                        if (newVal !== oldVal) {
                            if(newVal.currentPage >= $scope.totalPages) {
                                self.scope.pagingOptions.currentPage = self.scope.totalPages;
                            }
                            ones.caches.setItem("ones.pageSize", self.scope.pagingOptions.pageSize, 1);
                            self.refresh ();
                        }
                    }, true);
                    self.scope.$watch('filterOptions', function(newVal, oldVal) {
                        if (newVal !== oldVal) {
                            self.refresh ();
                        }
                    }, true);
                    self.scope.$watch('sortInfo', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            self.refresh ();
                        }
                    }, true);
                    self.scope.sortData = function(){
                        self.refresh ();
                    };

                    self.refresh();

                }

                this.refresh = function(){
                    self.methodsList.getPagedDataAsync(
                        self.scope.pagingOptions.pageSize,
                        self.scope.pagingOptions.currentPage,
                        self.scope.filterOptions.filterText
                    );
                }

                this.methodsList = {
                    //双击事件
                    doGridDblClick: function(item, extra){
                        try {
                            self.scope.$parent.doViewSelected(item);
                        } catch(e) {
                            self.scope.$parent.doEditSelected(item);
                        }
                    },
                    //排序
                    doGridSortBy: function(field){
                        var direction = self.sortInfo.direction == "ASC" ? "DESC" : "ASC"
                        self.scope.sortInfo = {
                            fields: [field],
                            directions: [direction]
                        }
                        self.sortInfo.direction = direction;
                        self.scope.sorting = field+" "+direction;
                    },
                    //刷新
                    doRefresh: function(){
                        self.refresh();
                    },
                    //设置当前页
                    setPage: function(p){
                        var goPage = 1;
                        var currentPage = self.scope.pagingOptions.currentPage;
                        switch(p) {
                            case "-1":
                                goPage = currentPage-1;
                                break;
                            case "+1":
                                goPage = currentPage+1;
                                break;
                            case "max":
                                goPage = self.scope.totalPages;
                                break;
                            default:
                                goPage = parseInt(p);
                                break;
                        }

                        if(goPage <=0) {
                            goPage = 1;
                        }
                        if(goPage > self.scope.totalPages) {
                            goPage = self.scope.totalPages;
                        }

                        self.scope.pagingOptions.currentPage = goPage;
                    },
                    //记录选中项
                    recordSelected: function(index){
                        var absIndex = Math.abs(index)-1;
                        if(undefined !== self.selected["index_"+absIndex]) {
                            delete(self.selected["index_"+absIndex]);
                        } else {
                            self.selected["index_"+absIndex] = self.scope.itemsList[absIndex];
                        }

                        self.scope.$parent.gridSelected = [];

                        angular.forEach(self.selected, function(item){
                            self.scope.$parent.gridSelected.push(item);
                        });

//                        if(self.scope.$$phase) {
//                            self.scope.$apply();
//                        }

                        //self.scope.selectedItems.push();
                    },
                    //设置数据
                    setPagingData : function(remoteData, page, pageSize) {
                        var data = [];
                        if(remoteData && typeof(remoteData[0]) == "object" && ("count" in remoteData[0])) {
                            data = remoteData[1];
                            self.scope.totalServerItems = remoteData[0].count;
                            self.scope.totalPages = remoteData[0].totalPages;
                        } else {
                            data = remoteData;
                            self.scope.totalServerItems = remoteData.length;
                            self.scope.totalPages = parseInt(remoteData.length/self.scope.pagingOptions.pageSize)+1;
                        }

                        data = reIndex(data);
                        self.scope.$broadcast("gridData.changed", data);

                    },
                    //获取数据
                    getPagedDataAsync : function(pageSize, page, searchText, extraParams) {
                        pageSize = pageSize || self.scope.pagingOptions.pageSize;
                        page = page || self.scope.pagingOptions.currentPage;
                        $timeout(function(){
                            var data;
                            var sb = [];
                            if(self.scope.sortInfo.fields) {
                                for (var i = 0; i < self.scope.sortInfo.fields.length; i++) {
                                    sb.push(sprintf("%s%s",
                                        self.scope.sortInfo.directions[i].toUpperCase() === "DESC" ? "-" : "+",
                                        self.scope.sortInfo.fields[i]
                                    ));
                                }
                            }
                            /**
                             * kw : 搜索关键字
                             * pn : 当前页
                             * ps : 一页N行
                             * si : 排序
                             * ic : 包含count info
                             * */
                            var p = {
                                _kw: self.scope.filterOptions.filterText,
                                _pn: self.scope.pagingOptions.currentPage,
                                _ps: self.scope.pagingOptions.pageSize,
                                _si: sb.join("|"),
                                _ic: 1
                            };
    //                            console.log(p);
                            p = $.extend(self.options.queryExtraParams, p, extraParams||{});
                            var promise;
                            if(angular.isFunction(self.options.resource.query)) {
                                promise = self.options.resource.query(p).$promise;
                            } else {
                                try {
                                    promise = self.options.resource.api.query(p).$promise;
                                } catch(e) {
                                    conle.log("can't load resource instance.");
                                }
                            }

                            promise.then(function(remoteData){
                                self.scope.setPagingData(remoteData, page, pageSize);
                            });
                        });
                    }
                };
            }])
        .directive("tableView", ["$compile", "$timeout", "GridView", "$filter", function($compile, $timeout, GridView, $filter){
            return {
                restrict: "E",
                replace: true,
                transclusion: true,
                templateUrl: "common/base/views/gridTemplate.html",
                scope: {
                    config: "="
                },
                compile: function(element, attrs, transclude){
                    return {
                        pre: function($scope, iElement, iAttrs, controller) {

                            $scope.$on("commonGrid.ready", function(){

                            });

                            var gridOptions = $scope.$parent.$eval(iAttrs.config);
                            GridView.init($scope, gridOptions);

                            angular.forEach(GridView.methodsList, function(method, k){
                                $scope[k] = method;
                            });

                            $scope.itemsList = [];
                            $scope.$on("gridData.changed", function(evt, itemsList){
                                if(itemsList === true) {
                                    $scope.doRefresh();
                                } else {
                                    $scope.itemsList = itemsList;
                                }
                                $scope.gridSelected = [];
                                GridView.selected = {};

                            });

                            ones.GridScope = $scope;

                            $scope.gridSelected = {};
                            $scope.gridSelected = [];

//                            console.log($scope.$parent);

                            $scope.selectedActions = GridView.selectedActions;
                            $scope.$parent.searchAble = true;

                            //每页显示条数
                            var pageSize = ones.caches.getItem("ones.pageSize");
                            if(!pageSize) {
                                pageSize = $scope.pagingOptions.pageSize;
                                ones.caches.setItem("ones.pageSize", pageSize, 1);
                            }
                            $scope.pagingOptions.pageSize = pageSize;
                            $scope.pageSizes = $scope.pagingOptions.pageSizes;

                        }
                    };
                }
            };
        }])
        //尝试使用$eval
        .filter("tryGridEval", [function(){
            return function(item, index, key){
                if(item) {
                    return item;
                } else {
                    return ones.GridScope.$eval("itemsList["+index+"]."+key);
                }
            }
        }])
        //尝试使用过滤器
        .filter("tryGridFilter", ["$filter", function($filter){
            return function(text, filter, $index){
                if(!filter) {
                    return text;
                }

                var item = ones.GridScope.$eval("itemsList["+$index+"]");
//                console.log("itemsList["+$index+"]");return;
                filter = filter.replace(/\+id/ig, item.id);
                filter = filter.replace(/'/g, "");

                args = filter.split(":");
                filter = args[0];
                args = Array.prototype.slice.call(args, 1)
                args.unshift(text);
                args.push($index);
                return $filter(filter).apply(null, args);
            };
        }])
    ;

})(window.angular, window.ones);