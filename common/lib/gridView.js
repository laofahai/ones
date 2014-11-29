(function(angular, ones){

    angular.module("ones.gridView", [])
        .service("GridView", ["$rootScope", "$routeParams", "$location", "$modal", "ones.dataApiFactory", "$timeout", "$injector",
            function($rootScope, $routeParams, $location, $modal, dataAPI, $timeout, $injector){
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
                    self.parentScope = self.scope.$parent;

                    self.methodsList.doResetGridOptions();

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
                    self.scope.$watch('$parent.filterOptions', function(newVal, oldVal) {
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

                    self.methodsList.makeFilters(self.scope.$parent);

                    /**
                     * 搜索框自动获得焦点
                     * */
                    $timeout(function(){
                        $("#gridSearchInput").focus();
                    }, 500);

                };

                this.refresh = function(){
                    self.methodsList.getPagedDataAsync(
                        self.scope.pagingOptions.pageSize,
                        self.scope.pagingOptions.currentPage,
                        self.parentScope.filterOptions.filterText,
                        self.filtersData
                    );
                };

                this.methodsList = {
                    //
                    hiddenWhen480px: [
                        'memo',
                        'value',
                        'dateline',
                        'pinyin',
                        'type',
                        'alias',
                        'source_model',
                        'description',
                        'subject',
                        'id'
                    ],
                    doAlert: function() {
                        console.log(arguments);
                        alert(1);
                    },
                    doContextMenu: function(evt, item, config){
                        self.scope.$emit("contextMenu", {
                            items: self.selectedActions,
                            left: evt.clientX,
                            top: evt.clientY,
                            selectedItems: self.selected,
                            currentItem: item
                        });
                    },
                    //双击事件
                    doGridDblClick: function(item, extra, evt){
                        var acts = {};
                        angular.forEach(self.selectedActions, function(act) {
                            acts[act.name] = act.action;
                        });

                        if("viewChild" in acts) {
                            acts.viewChild(evt, self.selected, item);
                        } else if("viewDetail" in acts) {
                            acts.viewDetail(evt, self.selected, item);
                        } else if("edit" in acts) {
                            acts.edit(evt, self.selected, item);
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
                    doResetGridOptions: function(){
                        self.scope.pagingOptions = {
                            pageSizes: [10, 15, 20, 30, 50],
                            pageSize: 15,
                            currentPage: 1
                        };
                        self.parentScope.filterOptions = {
                            filterText: "",
                            useExternalFilter: false
                        };
                        self.scope.sortInfo = {
                            fields: ["id"],
                            directions: ["ASC"]
                        };
                        self.scope.filterFormData = {};
                        self.filtersData = {};
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

                        if(self.options.multiSelect === false) {
                            self.selected = {};
                            self.selected["index_"+absIndex] = self.scope.itemsList[absIndex];
                            self.scope.$parent.gridSelected = [self.scope.itemsList[absIndex]];
                            return;
                        }

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
                                _kw: self.parentScope.filterOptions.filterText,
                                _pn: self.scope.pagingOptions.currentPage,
                                _ps: self.scope.pagingOptions.pageSize,
                                _si: sb.join("|"),
                                _ic: 1
                            };

                            p = $.extend(p, self.options.queryExtraParams, extraParams||{});
                            var promise;

                            try {
                                if(angular.isFunction(self.options.resource.query)) {
                                    promise = self.options.resource.query(p).$promise;
                                } else {
                                    try {
                                        promise = self.options.resource.api.query(p).$promise;
                                    } catch(e) {
                                        console.log("can't load resource instance.");
                                    }
                                }

                                promise.then(function(remoteData){
                                    self.scope.setPagingData(remoteData, page, pageSize);
                                });
                            } catch(e) {}
                        });
                    },
                    //过滤器
                    makeFilters: function($scope, filters){

                        filters = filters || self.options.filters;

                        if(!filters) {
                             return;
                        };

                        $scope.showFilters = true;

                        var FieldsDefine = {};
                        angular.forEach(filters, function(item, type){
                            switch(type) {
                                case "between":
                                    FieldsDefine["_filter_start_"+item.field] = {
                                        displayName: l("lang."+item.field) + l("lang.start"),
                                        inputType: item.inputType || "number",
                                        value: item.defaultData[0] || 0,
                                        required: false
                                    };
                                    FieldsDefine["_filter_end_"+item.field] = {
                                        displayName: l("lang."+item.field) + l("lang.end"),
                                        inputType: item.inputType || "number",
                                        value: item.defaultData[1] || 0,
                                        required: false
                                    };
                                    break;
                                case "select":
                                    item.required = false;
                                    FieldsDefine["_filter_"+item.field] = item;
                                    break;
                                case "workflow":
                                    FieldsDefine["_filter_workflow_node"] = {
                                        displayName: l("lang.workflow"),
                                        inputType: "select",
                                        multiple: true,
                                        dataSource: "Workflow.WorkflowNodeAPI",
                                        nameField: "status_text",
                                        queryParams: {
                                            workflow_alias: item
                                        },
                                        required: false
                                    };
                                    break;

                            }
                        });

                        var modal = null;
                        var modalHtml = null;
                        var $compile = $injector.get("$compile");

                        if(typeof($scope.doFilter) !== "function") {
                            $scope.doFilter = function(){
                                self.filtersData = $scope.filterFormData;
                                self.scope.doRefresh();
                                modal.hide();
                            };
                        }

                        $scope.showFiltersModal = function(){
                            if(modal && modalHtml) {
                                modal.show();
                                $timeout(function(){
                                    $("#filterContainer").append($compile(modalHtml)($scope));
                                });
                                return;
                            }
                            $scope.modal = modal = $modal({
                                scope: $scope,
                                title: toLang("filters", "actions", $rootScope),
                                contentTemplate: "common/base/views/filters.html"
                            });
                            modal.$promise.then(function(){
                                $timeout(function(){
                                    var FormMaker = $injector.get("FormMaker");
                                    var fm = new FormMaker.makeForm($scope, {
                                        fieldsDefine: FieldsDefine,
                                        includeFoot: false,
                                        dataName: "filterFormData"
                                    });
                                    modalHtml = fm.makeHTML();
                                    $("#filterContainer").append($compile(modalHtml)($scope));
                                });
                            });
                        };
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

                            var fetchData = function(){
                                var gridOptions = $scope.$parent.$eval(iAttrs.config);

                                GridView.init($scope, gridOptions);

                                angular.forEach(GridView.methodsList, function(method, k){
                                    $scope[k] = method;
                                });

                                $scope.doResetGridOptions();

                                //每页显示条数
                                var pageSize = ones.caches.getItem("ones.pageSize");

                                if(!pageSize || "undefined" === pageSize) {
                                    pageSize = $scope.pagingOptions.pageSize;
                                    ones.caches.setItem("ones.pageSize", pageSize, 1);
                                }
                                $scope.pagingOptions.pageSize = pageSize;
                                $scope.pageSizes = $scope.pagingOptions.pageSizes;
                            };

                            var fetched = false;

                            $scope.$on("commonGrid.ready", function(){
                                if(!fetched) {
                                    fetchData();
                                    fetched = true;
                                }
                            });

                            $timeout(function(){
                                if(!fetched) {
                                    fetchData();
                                    fetched = true;
                                }
                            }, 300);

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

                            $scope.$on("gridData.refreshed", function(evt){
                                $scope.gridSelected = [];
                                GridView.selected = {};
                                $scope.doResetGridOptions();
                                $scope.doRefresh();
                            });

                            ones.GridScope = $scope;

                            $scope.gridSelected = {};
                            $scope.gridSelected = [];

//                            console.log($scope.$parent);

                            $scope.selectedActions = GridView.selectedActions;
                            $scope.$parent.searchAble = true;
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

                filter = filter.replace(/'/g, "");


                args = filter.split(":");
                filter = args[0];

                if(args[1] && args[1].indexOf("item.") >=0) {
                    var itemField = args[1].split(".");
                    args[1] = ones.GridScope.$eval("itemsList["+$index+"]."+itemField[1]);
                }

                if(args[1]) {
                    var filterParams = args[1].match(/\+[a-zA-Z0-9\_\-]+/);
                    if(filterParams) {
                        angular.forEach(filterParams, function(p){
                            args[1] = args[1].replace(p, item[p.replace("+", "")]);
                        });
                    }
                }

                args = Array.prototype.slice.call(args, 1);

                args.unshift(text);
                args.push($index);

                return $filter(filter).apply(null, args);
            };
        }])
    ;

})(window.angular, window.ones);