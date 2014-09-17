(function(angular, ones){
    /**
     * 打印模块
     * */

    angular.module("ones.print", [])
        .service("CommonPrint", ["$routeParams", "$injector", "$rootScope", function($routeParams, $injector, $rootScope){

            var self = this;

            this.scope;
            this.ids;

            this.init = function(scope, ids) {
                this.scope = scope;
                this.ids = ids ? ids : $routeParams.id;
            }
            this.filterStructure = function(structure, configField) {
                var tmp = [];
                angular.forEach(structure, function(v, k){
                    if(v[configField] === true && k.slice(-6, k.length)!=="_label") {
//                        if(structure[k+"_label"]) {
//                            v = structure[k+"_label"];
//                        }

                        if(!v.displayName) {
                            v.displayName = toLang(k, "", $rootScope);
                        }

                        if(!v.field) {
                            v.field = k;
                        }

                        tmp.push(v);
                    }
                });

                return tmp;
            };

//            this.filterStructure = function(data, filterArray){
//                var result = [];
//                var included = [];
//                angular.forEach(filterArray, function(field){
//                    if(!data[field].displayName) {
//                        data[field].displayName = toLang(field, "", $rootScope);
//                    }
//                    result.push(data[field]);
//                    included.push(field);
//                });
//
//                angular.forEach(data, function(v, k){
//                    if(included.indexOf(k) < 0 && v.printAble === true && k.slice(-6, k.length)!=="_label") {
//                        if(data[k+"_label"]) {
//                            v = data[k+"_label"];
//                        }
//
//                        if(!v.displayName) {
//                            v.displayName = toLang(k, "", $rootScope);
//                        }
//
//                        result.push(v);
//                        included.push(k);
//                    }
//                });
//
//                return result;
//            };
            this.displayPrintPage = function(model, res){

                var params = {
                    id: self.ids,
                    includeRows: true //包含子行
                };

                var promise = getDataApiPromise(res, "get", params)

                promise.then(function(data){
                    self.scope.data = data.datas ? data : {datas: [data]};
                });

                if(model.rowsModel) {
                    var rowsModel = $injector.get(model.rowsModel);
                    rowsStructure = rowsModel.getStructure();
                    if(angular.isFunction(rowsStructure.then)) {
                        rowsStructure.then(function(data){
                            self.scope.rowsStructure = self.filterStructure(data, "printAble");
                        });
                    } else {
                        self.scope.rowsStructure = self.filterStructure(rowsStructure, "printAble");
                    }

                }

            }

            this.doPrint = function() {
                window.print();
            };
        }])
        .directive()
    ;

})(window.angular, window.ones);