'use strict'
angular.module("erp.common.directives", [])
        .directive("commonForm", function(){
            console.log(123);
            return {
                restrict: "E",
                scope: {
                    info: "="
                },
                templateUrl: "commonForm/form.html"
            };
        })
        .run(["$templateCache", function($templateCache){
                $templateCache.put("commonForm/form.html",
                    '<form class="" role="form" name="">{{info}}123</form>'
                );
                $templateCache.put("commonForm/fields/text.html",
                    '<input type="text" />'
                );
        }]);