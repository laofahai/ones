'use strict';

/**
 * 表单生成
 * */
angular.module("erp.common.directives", [])
        .directive("commonform", ["$compile", "$templateCache", function($compile, $templateCache) {
                return {
                    restrict: "E",
                    scope: {
                        config: "=",
                        data: "="
                    },
                    replace: true,
                    transclusion: true,
                    compile: function(element, attrs, transclude) {
                        return {
                            pre: function($scope, iElement, iAttrs, controller) {
                                $scope.$on("commonForm.data.ready", function() {
                                    var html = formMaker($scope);
                                    iElement.append($compile(html)($scope.$parent));
//                                setInterval(function(){
//                                    console.log($scope);
//                                }, 2000);
                                });

                            }
                        };
                    }
                };
            }]);