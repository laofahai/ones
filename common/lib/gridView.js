(function(angular, ones){

    angular.module("ones.gridView", [])
        .service("GridView", ["$rootScope", "$routeParams", "$location", "$modal", "ones.dataApiFactory",
            function($rootScope, $routeParams, $location, $modal, dataAPI){
                var self = this;
                this.scope = {};
                this.sortInfo = {
                    field: "id",
                    direction: "ASC"
                };
                this.methodsList = {
//                    doEditItem: function(id, extra){
//                        if(self.config.editAble === false) {
//                            return;
//                        }
//                        extra = extra || "";
//                        $location.url(sprintf("/%(group)s/%(action)s/%(module)s/id/%(id)d", {
//                            group: $routeParams.group,
//                            action: self.scope.config.isBill ? "editBill" : "edit",
//                            module: $routeParams.module,
//                            id: parseInt(id)
//                        })+extra);
//                    },
                    doGridDblClick: function(item, extra){
                        self.scope.$parent.doEditSelected(item);
                    },
                    doGridClick: function(index, evt){
//                        this.recordSelected(index);
//                        if($(evt.target).attr("type") == "checkbox") {
//                            return;
//                        }
//                        var checkbox = $(evt.target).parent().find("input[type='checkbox']");
//                        console.log(checkbox);
//                        if(checkbox.attr("checked") === "checked") {
//                            checkbox.removeAttr("checked");
//                        } else {
//                            checkbox.attr("checked", true);
//                        }

                    },
//                    doDeleteItem: function(id){
//                        self.scope.confirmMsg = sprintf(toLang("confirm_delete", "", $rootScope), 1);
//                        self.scope.doConfirm = function(){
//                            var api = dataAPI.getResourceInstance({
//                                uri: $routeParams.group+"/"+$routeParams.module
//                            });
//                            api.delete({id: id}, function() {
//                                self.scope.$parent.$broadcast("gridData.changed");
//                            });
//                        };
//
//                        var modal = $modal({
//                            scope: self.scope,
//                            title: toLang("confirm", "actions", $rootScope),
//                            template: "common/base/views/confirm.html"
//                        });
//                    },
                    doGridSortBy: function(field){
                        var direction = self.sortInfo.direction == "ASC" ? "DESC" : "ASC"
                        self.scope.$parent.sortInfo = {
                            fields: [field],
                            directions: [direction]
                        }
                        self.sortInfo.direction = direction;
                        self.scope.sorting = field+" "+direction;
                    },
                    doRefresh: function(){
                        self.scope.$parent.getPagedDataAsync(
                            self.scope.$parent.pagingOptions.pageSize,
                            self.scope.$parent.pagingOptions.currentPage,
                            self.scope.$parent.filterOptions.filterText
                        );
                    },
                    setPage: function(p){
                        var goPage = 1;
                        var currentPage = self.scope.$parent.pagingOptions.currentPage;
                        switch(p) {
                            case "-1":
                                goPage = currentPage-1;
                                break;
                            case "+1":
                                goPage = currentPage+1;
                                break;
                            case "max":
                                goPage = self.scope.$parent.totalPages;
                                break;
                            default:
                                goPage = parseInt(p);
                                break;
                        }

                        if(goPage <=0) {
                            goPage = 1;
                        }
                        if(goPage > self.scope.$parent.totalPages) {
                            goPage = self.scope.$parent.totalPages;
                        }

                        self.scope.$parent.pagingOptions.currentPage = goPage;
                    },
                    //记录选中项
                    recordSelected: function(index){
                        var absIndex = Math.abs(index)-1;
                        if(undefined !== self.scope.gridSelected["index_"+absIndex]) {
                            delete(self.scope.gridSelected["index_"+absIndex]);
                        } else {
                            self.scope.gridSelected["index_"+absIndex] = self.scope.itemsList[absIndex];
                        }

                        self.scope.$parent.gridSelected = [];

                        angular.forEach(self.scope.gridSelected, function(item){
                            self.scope.$parent.gridSelected.push(item);
                        });

//                        if(self.scope.$$phase) {
//                            self.scope.$apply();
//                        }

                        //self.scope.selectedItems.push();
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

                            angular.forEach(GridView.methodsList, function(method, k){
                                $scope[k] = method;
                            });

                            $scope.$on("commonGrid.ready", function(){
                                $scope.itemsList = [];
                                $scope.$on("gridData.changed", function(evt, itemsList){
                                    if(itemsList === true) {
                                        $scope.doRefresh();
                                    } else {
                                        $scope.itemsList = itemsList;
                                    }
                                    $scope.gridSelected = {};
                                    $scope.$parent.gridSelected = [];
                                    ones.GridScope = $scope;
                                });

                                $scope.gridSelected = {};
                                $scope.selectedActions = GridView.selectedActions;
                                $scope.$parent.gridSelected = [];
                                $scope.$parent.searchAble = true;

                                GridView.scope = $scope;
                            });





//                            setInterval(function(){
//                                console.log($scope.selectedItems);
//                            }, 2000);
                        }
                    };
                }
            };
        }])
        .filter("tryGridEval", [function(){
            return function(item, index, key){
                if(item) {
                    return item;
                } else {
                    return ones.GridScope.$eval("itemsList["+index+"]."+key);
                }
            }
        }])
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