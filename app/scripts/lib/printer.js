'use strict';
angular.module("ones.printer", [])
        .service("Printer", ["$rootScope", function($rootScope){
                var printer = {
                    printBill: function(){},
                    doPrint: function(){}
                };
        }]);