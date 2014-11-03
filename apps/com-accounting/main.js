(function(window, angular, ones){
    'use strict';

    /**
     * 财务应用
     * */
    angular.module("ones.com-accounting", [])
        .service("Com.accounting.SubjectAPI", ["ones.dataAPIFactory", function(dataAPI){
            this.config = {};

            this.api = dataAPI.getResourceInstance({
                uri: "accounting/subject"
            });

            this.structure = {};

            this.getStructure = function(){
                return this.structure;
            };

        }])
    ;

})(window, window.angular, window.ones);