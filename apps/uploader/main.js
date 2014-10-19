(function(window, angular, ones){
    'use strict';

     /**
      * 异步加载js文件
      * */
     ones.pluginRegister("when_make_form_init", function(injector, defer){
         var fileStyleScript = "apps/uploader/statics/filestyle.js";
         if(ones.asyncScript.indexOf(fileStyleScript) < 0) {
             var $http = injector.get("$http");
             $http.get(fileStyleScript).success(function(data) {
                 ones.asyncScript.push(fileStyleScript);
                 eval(data);
             });
         }
     });
    /**
     * 实现文件上传
     * 选择文件-》自动上传-》返回URL-》绑定到ng-model
     * */
     ones.pluginRegister("when_fields_factory_init", function(injector, defer, factory){
        factory.prototype._file = function(name, fieldDefine, $scope){
            var tpl = '<input type="file" change="onChange()" ng-model="%(model)s" accept="%(accept)s" %(multi)s filestyle />';
            var accept = fieldDefine["accept"] || "image/gif,image/png,image/jpg,image/jpeg";
            return sprintf(tpl, {
                model: fieldDefine["ng-model"],
                multi: fieldDefine.multiple ? "multiple" : "",
                accept: accept
            });
        };
        factory.prototype._image = function(name, fieldDefine, $scope) {

        };
    });

    angular.module('ones.uploader', [])
        .service("Uploader.UploaderAPI", ["$resource", "ones.dataApiFactory", function($resource, dataAPI) {
            this.api = dataAPI.getResourceInstance({
                uri: "uploader/uploader"
            });
        }])
        .directive('filestyle', ["$injector", "ComView", "$parse", "$modal", function($injector, ComView, $parse, $modal) {
            return {
                restrict: 'A',
                require: "?ngModel",
                link: function urFilePostLink(scope, element, attrs, ngModel) {

                    var $elem = $(element);
                    $elem.filestyle({
                        classInput: $elem.data('classinput'),
                        buttonName: "btn-sm",
                        buttonText: l("lang.choose file"),
                        disabled: false
                    });

                    var uploader = $injector.get("Uploader.UploaderAPI");
                    var reader = new FileReader();

                    var existsValue;
                    scope.$on("form.dataLoaded", function(){
                        existsValue = scope.$eval(attrs.ngModel);
                        if(!existsValue) {
                            return;
                        }
                        var tmp = [];
                        angular.forEach(existsValue.split(","), function(f){
                            tmp.push(f.split("/").pop());
                        });

                        $elem.next()
                            .find("input[type='text']")
                            .val(tmp.join())
                            .bind("click", function(){
                                //@todo 点击readonly文件名框显示已上传文件
                            });
                    });

                    element.bind('change', function(e) {
                        if (!e.target.files || !e.target.files.length || !e.target.files[0]) {
                            return true;
                        }

                        var uploadFiles = [];
                        var readed = 0;
                        angular.forEach(e.target.files, function(file){
                            reader.readAsBinaryString(file);
                            reader.onload = function(){
                                uploadFiles.push({
                                    fileData: base64encode(reader.result),
                                    type: file.type,
                                    name: file.name,
                                    size: file.size
                                });

                                readed++;
                            }
                        });

                        /*
                        * 循环监测文件是否读取完成
                        * 最多6秒
                        * **/
                        var times = 0;
                        var t = window.setInterval(function(){
                            if(times >= 20) {
                                ComView.alert("timeout");
                                window.clearInterval(t);
                            }
                            if(readed === e.target.files.length) {
                                window.clearInterval(t);
                                uploader.api.save({
                                    files: uploadFiles
                                }).$promise.then(function(data){
                                    if(data.error) {
                                        ComView.alert(data.msg);
                                    } else {
                                        $parse(attrs.ngModel).assign(scope, data.uploaded);
                                    }
                                });
                            }
                            times++;
                        }, 300);
                    });
                }
            }
        }])
    ;

})(window, window.angular, window.ones);