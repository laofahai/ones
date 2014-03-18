'use strict'
angular.module("erp.common.directives", [])
        .directive("commonform", function(){
            return {
                restrict: "E",
                scope: {
                    config: "="
                },
                templateUrl: "commonForm/form.html",
                replace: true,
                link: function(scope, element, attrs){
                    
                    var defaultOptions = {
                        class : "form-horizontal"
                    };
                    var opts = scope.opts = $.extend(defaultOptions, scope.$parent[attrs.config]);
                    
                    
                    
                    var fieldsMaker = {
                        makeFields: function(fieldsDefine){
                            var field;
                            for(var key in fieldsDefine) {
                                field = fieldsDefine[key];
                                field.inputType = field.inputType ? field.inputType : "text";
                                
                            }
                        },
                        makeText : function(filedDefine){
                            return '<input type="text" />';
                        }
                    };
                    
                    fieldsMaker.makeFields(opts.fieldsDefine);
                    
                }
            };
        })
        .run(["$templateCache", function($templateCache){
                $templateCache.put("commonForm/form.html",
                    '<form class="{{opts.class}}" role="form" name="{{formName}}">{{opts.fieldsDefine}}</form>'
                );
                $templateCache.put("commonForm/fields/text.html",
                    '<input type="text" />'
                );
        }]);