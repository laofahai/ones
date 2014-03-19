'use strict';

/**
 * 表单生成
 * */
angular.module("erp.common.directives", [])
        .directive("commonform", ["$compile", "$templateCache", function($compile, $templateCache) {
            return {
                restrict: "E",
                scope: {
                    config: "="
                },
                replace: true,
                transclusion: true,
                compile: function(element, attrs, transclude) {
                    return {
                        pre: function($scope, iElement, iAttrs, controller) {
                            var defaultOptions = {
                                class: "form-horizontal",
                                formtpl: $templateCache.get("commonForm/form.html"),
                                name: ""
                            };
                            var opts = $.extend(defaultOptions, $scope.$parent.config);
                            /**
                             * 生成初始HTML
                             * */
                            var fieldsMaker = {
                                makeActions: function() {
                                    return $templateCache.get("commonForm/footer.html");
                                },
                                makeAttrs: function(name, fieldDefine) {
                                    var k, v, html = [];
                                    var defaultAttr = {
                                        class: "width-100",
                                        required: "true",
                                        id: "id_" + name,
                                        name: name,
                                        "ng-model": opts.name + "Data." + name
                                    };
                                    var attrOpts = $.extend(defaultAttr, fieldDefine);
                                    for (k in attrOpts) {
                                        v = attrOpts[k];
                                        html.push(sprintf('%s="%s"', k, v));
                                    }
                                    return html.join(" ");
                                },
                                makeFields: function(fieldsDefine) {
                                    var field, fieldHTML, boxHTML, finalHTML = [];
                                    boxHTML = opts.boxTpl ? opts.boxTpl : $templateCache.get("commonForm/box.html");
                                    for (var key in fieldsDefine) {
                                        field = fieldsDefine[key];
                                        if(field.primary) {
                                            continue;
                                        }
                                        /**
                                         * 默认
                                         * */
                                        field.required = false === field.required ? false : true;

                                        field.inputType = field.inputType ? field.inputType : "text";
                                        fieldHTML = $templateCache.get("commonForm/fields/" + field.inputType + ".html");
                                        fieldHTML = sprintf(fieldHTML, fieldsMaker.makeAttrs(key, field));
                                        
                                        finalHTML.push(sprintf(boxHTML, {
                                            formname: opts.name,
                                            fieldname: field.name ? field.name : key,
                                            label: field.displayName,
                                            inputHTML: fieldHTML
                                        }));
                                    }
                                    finalHTML.push(fieldsMaker.makeActions());
                                    
                                    return finalHTML.join("");
                                }
                            };
                            
                            $scope.formName = opts.name;
                            
                            console.log($scope.JXCGoodsAddForm);
                            
                            var formhtml = sprintf(
                                opts.formtpl,
                                {formname: opts.name}
                            );
                            formhtml = $(formhtml);
                            formhtml.append(fieldsMaker.makeFields(opts.fieldsDefine));
                            
                            iElement.append($compile(formhtml)($scope.$parent));
                            
                        }
                    };
                }
            };
        }])
        .run(["$templateCache", function($templateCache) {
                $templateCache.put("commonForm/form.html",
                        '<form class="form-horizontal" name="%(formname)s"></form>'
                        );
                $templateCache.put("commonForm/footer.html",
                        '<div class="clearfix form-actions">' +
                            '<div class="col-md-offset-3 col-md-9">' +
                                '<button id="submitbtn" class="btn btn-info" ng-click="doSubmit();" type="button">' +
                                    '<i class="icon-ok bigger-110"></i>' +
                                    'Submit' +
                                '</button>' +
                                '&nbsp; &nbsp; &nbsp;' +
                                '<button class="btn" type="reset">' +
                                    '<i class="icon-undo bigger-110"></i>' +
                                    'Reset' +
                                '</button>' +
                            '</div>' +
                        '</div>{{JXCGoodsAddData}}'
                        );
                $templateCache.put("commonForm/fields/text.html",
                        '<input type="text" %s />'
                        );
                $templateCache.put("commonForm/fields/float.html",
                        '<input type="number" %s />'
                        );
                $templateCache.put("commonForm/box.html",
                        '<div class="form-group" ng-class="{\'has-error\': %(formname)s.%(fieldname)s.$dirty&&%(formname)s.%(fieldname)s.$invalid}">' +
                            '<label class="col-sm-3 control-label no-padding-right">%(label)s</label>' +
                            '<div class="col-xs-12 col-sm-4">%(inputHTML)s</div>' +
                            '<div class="help-block col-xs-12 col-sm-reset" ng-show="%(formname)s.%(fieldname)s.$dirty&&%(formname)s.%(fieldname)s.$invalid">{{%(formname)s.%(fieldname)s.$error}}</div>' +
                        '</div>'
                        );
            }]);