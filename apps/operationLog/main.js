(function(){
    'use strict';

    angular.module("ones.operationLog", [])
        .service("OperationLog.OperationLogAPI", ["ones.dataApiFactory", function(dataAPI){

            this.config = {
                editAble: false,
                viewDetailAble: false,
                deleteAble: false
            };

            this.structure = {
                user: {
                    field: "truename"
                },
                action: {},
                source_model: {},
                source_id: {
                    cellFilter: "toLink:item.link"
                },
                dateline: {
                    cellFilter: "dateFormat:0"
                }
            };

            this.api = dataAPI.getResourceInstance({
                uri: "operationLog/operationLog",
                extraMethod: {}
            });

            this.getStructure = function() {
                return this.structure;
            };
        }]);
    ;

})();