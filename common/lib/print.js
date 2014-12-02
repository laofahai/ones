(function(angular, ones){
    /**
     * 打印模块
     * */

    angular.module("ones.print", [])
        .service("CommonPrint", ["$routeParams", "$injector", "ones.config",
            function($routeParams, $injector, conf){

                var self = this;

                this.scope;
                this.ids;

                this.init = function(scope, ids) {
                    this.scope = scope;
                    this.ids = ids ? ids : $routeParams.id;

                    this.scope.doPrint = function(){
                        window.print();
                    };
                }

                this.filterStructure = function(structure, configField) {
                    var tmp = [];
                    angular.forEach(structure, function(v, k){
                        if(v[configField] === true && k.slice(-6, k.length)!=="_label") {

                            if(!v.displayName) {
                                v.displayName = l("lang."+k);
                            }

                            if(!v.field) {
                                v.field = k;
                            }

                            tmp.push(v);
                        }
                    });

                    return tmp;
                };

                this.assignStructure = function(model) {
                    if(model.config.rowsModel) {
                        var rowsModel = $injector.get(model.config.rowsModel);
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

                this.assignMeta = function(promise, model, callback){
                    promise.then(function(data){
                        self.scope.data = data;
                        self.scope.sourceData = data.source;
                        self.scope.sourceDetail = data.source_detail;
                        self.scope.companyInfo = {
                            address: conf.company_address,
                            phone: conf.company_phone
                        };
                        self.scope.billId = data.bill_id || "#"+data.id;
                        if(model.config.printConfig.dateline) {
                            self.scope.dateline = self.scope.$eval("data."+model.config.printConfig.dateline);
                        } else {
                            self.scope.dateline = parseInt(new Date().getTime()/1000)
                        }

                        self.scope.printTitle = model.config.printConfig.title;

                        if(typeof(callback) === 'function') {
                            callback();
                        }

                    });
                };

                this.doPrint = function() {
                    window.print();
                };
            }])
        ;

})(window.angular, window.ones);