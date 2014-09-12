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
                    doEditItem: function(id, extra){
                        extra = extra || "";
                        $location.url(sprintf("/%(group)s/%(action)s/%(module)s/id/%(id)d", {
                            group: $routeParams.group,
                            action: self.scope.config.isBill ? "editBill" : "edit",
                            module: $routeParams.module,
                            id: parseInt(id)
                        })+extra);
                    },
                    doGridDblClick: function(id, extra){
                        this.doEditItem(id, extra);
                    },
                    doDeleteItem: function(id){
                        self.scope.confirmMsg = sprintf(toLang("confirm_delete", "", $rootScope), 1);
                        self.scope.doConfirm = function(){
                            var api = dataAPI.getResourceInstance({
                                uri: $routeParams.group+"/"+$routeParams.module
                            });
                            api.delete({id: id}, function() {
                                self.scope.$parent.$broadcast("gridData.changed");
                            });
                        };

                        var modal = $modal({
                            scope: self.scope,
                            title: toLang("confirm", "actions", $rootScope),
                            template: "common/base/views/confirm.html"
                        });
                    },
                    doGridSortBy: function(field){
                        var direction = self.sortInfo.direction == "ASC" ? "DESC" : "ASC"
                        self.scope.$parent.sortInfo = {
                            fields: [field],
                            directions: [direction]
                        }
                        self.sortInfo.direction = direction;
                        self.scope.sorting = field+" "+direction;
                    },
                    doSearchByKeyword: function(){},
                    doFilter: function(){},
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
                        if(index < 0) {
                            delete(self.scope.gridSelected["index_"+absIndex]);
                        } else {
                            self.scope.gridSelected["index_"+absIndex] = self.scope.itemsList[absIndex];
                        }

                        self.scope.$parent.gridSelected = [];

                        angular.forEach(self.scope.gridSelected, function(item){
                            self.scope.$parent.gridSelected.push(item);
                        });

                        //self.scope.selectedItems.push();
                    }
                };
            }])
        .directive("tableView", ["$compile", "$timeout", "GridView", function($compile, $timeout, GridView){
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
                            $scope.$on("gridData.changed", function(evt, itemsList){
                                $scope.itemsList = itemsList;
                                ones.GridScope = $scope;
                            });

                            $scope.gridSelected = {};
                            $scope.$parent.searchAble = true;

                            GridView.scope = $scope;

                            angular.forEach(GridView.methodsList, function(method, k){
                                $scope[k] = method;
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
    ;

})(window.angular, window.ones);