(function(window, angular, ones, io){
    'use strict';

    /*
    * 文件上传字段
    * */
    ones.pluginRegister('extend_fields_maker', function(injector, defered, FORM_FIELDS_TPL, factory) {

        var tpl = '<div class="input-uploader-container"><input type="file" %(attr)s base-sixty-four-input />' +
                    '<table ng-show="%(bind_model)s" class="table table-bordered">' +
                    '<thead><tr><th ng-bind="\'uploader.Name\'|lang"></th><th ng-bind="\'uploader.Size\'|lang"></th><th ng-bind="\'uploader.Thumb\'|lang"></th></tr></thead>' +
                    '<tr ng-repeat="uf in %(bind_model)s track by $index"><td><a class="uploader_close_btn text-danger" ng-click="cancel_upload_file(uf, $index)"><i class="fa fa-close"></i></a> ' +
                    '<label ng-bind="uf.filename"></label></td>' +
                    '<td ng-bind="uf.filesize|to_upload_file_size"></td>' +
                    '<td class="uploader-thumb" ng-bind-html="uf|to_upload_file_thumb"></td>' +
                    '</tr></table></div>';

        factory.available_attrs.push(
            'accept'
        );

        var $parse = injector.get('$parse');
        var $filter = injector.get('$filter');
        var $attachment = injector.get('Uploader.AttachmentAPI');

        var max_size = 5242880;
        factory.fields_maker.uploader = function(config) {

            var getter = $parse(config['ng-model']);

            config['class'] = 'uploader-input';
            config['accept'] = config['accept'] || 'image/*,text/plain,application/pdf,application/msword,application/rtf,application/vnd.ms-excel,application/vnd.ms-powerpoint,application/x-gzip,application/zip,application/x-zip-compressed,application/octet-stream';

            // 移除文件
            factory.scope.cancel_upload_file = function(file, index) {
                var value = factory.scope.$eval(config['ng-model']) || [];
                value.splice(index, 1);
                if(file.id) {
                    $attachment.resource.delete({id: file.id}).$promise.then(function() {
                        getter.assign(factory.scope, value || undefined);
                    });
                } else {
                    getter.assign(factory.scope, value || undefined);
                }
            };

            // 编辑时已存在
            var exists_on_edit = [];
            var data_loaded = 0;

            // 编辑时默认值
            factory.scope.$on('form.dataLoaded', function(evt, data) {
                var ids = data[config.field];
                if(!ids) {
                    getter.assign(factory.scope, undefined);
                    return;
                }

                var _files = [];
                $attachment.resource.api_query({ids: ids}).$promise.then(function(data) {

                    if(!data) {
                        getter.assign(factory.scope, undefined);
                        return;
                    }

                    angular.forEach(data, function(file) {
                        _files.push({
                            filename: file.source_name,
                            filesize: file.file_size,
                            filetype: file.file_mime,
                            id: file.id
                        });
                    });

                    if(!_files) {
                        getter.assign(factory.scope, undefined);
                        return;
                    }

                    exists_on_edit = _files;

                    injector.get("$timeout")(function() {
                        getter.assign(factory.scope, _files);
                    });

                });

            });

            factory.scope.$watch(config['ng-model'], function(files) {
                if(!files) {
                    return;
                }

                files = angular.isArray(files) ? files : [files];
                angular.forEach(files, function(file) {
                    // 检测文件大小
                    if(file.filesize > max_size) {
                        injector.get('RootFrameService').alert({
                            type: 'danger',
                            content: _('uploader.File [%s] is too large(%s), max size is %s',
                                [
                                    file.filename,
                                    $filter('to_upload_file_size')(file.filesize),
                                    $filter('to_upload_file_size')(max_size)
                                ]
                            )
                        });

                        files.splice(files.indexOf(file), 1);
                    }
                });

                // 编辑时原数据

                if(data_loaded > 2 && factory.opts.isEdit && exists_on_edit && files !== exists_on_edit) {
                    angular.forEach(exists_on_edit.reverse(), function(file) {
                        files.unshift(file);
                    });
                }

                getter.assign(factory.scope, files || undefined);

                data_loaded++;

            });

            try {
                injector.get('Home.ConfigAPI').get_app_config('uploader').promise.then(function(data) {
                    max_size = data.max_upload_size || max_size;
                });
            } catch(e) {
                max_size = 5242880;
            }


            this.html = sprintf(tpl, {
                attr: factory.make_field_attr(config),
                bind_model: config['ng-model']
            });
        };

    });

    ones.global_module
        .service('Uploader.AttachmentAPI', [
            'ones.dataApiFactory',
            function(dataAPI) {
                var self = this;

                this.resource = dataAPI.getResourceInstance({
                    uri: 'uploader/attachment',
                    extra_methods: ['api_get', 'api_query']
                });

                this.config = {
                    app: 'uploader',
                    module: 'attachment',
                    table: 'attachment'
                };

            }
        ])
        /*
        * 格式化文件的尺寸
        * */
        .filter('to_upload_file_size', [function() {
            return function(byte) {
                var kb = byte/1024;
                var mb;
                if(kb > 1024) {
                    mb = kb/1024;
                }

                var result = mb ? mb : kb;
                var fix = mb ? 'MB' : 'KB';

                return parseFloat(result).toFixed(3) + fix;
            };
        }])
        /*
        * 返回上传时预览图
        * */
        .filter('to_upload_file_thumb', [function() {
            return function(file) {

                // 图片
                var mimes = ['image/jpeg', 'image/png', 'image/gif'];
                if(mimes.indexOf(file.filetype) >= 0) {
                    var src;
                    // 已存在文件
                    if(file.id) {
                        src = sprintf('%suploader/attachment/read/hash/%d_%s', ones.remote_entry, file.id, ones.caches.getItem('user.session_token'));
                    } else if(file.base64) {
                        src = sprintf('data:%s;base64,%s', file.filetype, file.base64);
                    } else {
                        return;
                    }


                    return sprintf('<img src="%s" />', src);
                }

            };
        }])
        /*
        * 返回上传文件的真实地址
        * */
        .filter('to_upload_file_realpath', [function() {
            return function(path) {
                if(path[0] === '/') {
                    return ones.remote_base + 'uploads' + path;
                }
                return path;
            }
        }])

    ;

})(window, window.angular, window.ones, window.io);