/**
 * Created by nemo on 14-10-15.
 */
(function(window, angular, ones){
    'use strict';

    angular.module("ones.remind", [])
        .service("Remind.RemindAPI", ["$modal", "ones.dataApiFactory", function($modal, dataAPI){

            var self = this;

            this.config = {
                columns: 1
            };

            this.api = dataAPI.getResourceInstance({
                uri: "remind/remind"
            });

            this.structure = {
                user: {
                    required: false,
                    inputType: "select",
                    multiple: true,
                    dataSource: "Department.UserAPI",
                    nameField: "truename"
                },
                userGroup: {
                    required: false,
                    inputType: "select",
                    multiple: true,
                    dataSource: "AuthGroupRes",
                    nameField: "title"
                },
                department: {
                    required: false,
                    inputType: "select",
                    multiple: true,
                    dataSource: "Department.DepartmentAPI",
                    nameField: "prefix_name"
                }
            };

            this.getStructure = function() {
                return this.structure;
            };

            this.showRemindModal = function(scope, content, alias) {
                self.remindContent = content;
                self.alias = alias;
                self.modal = $modal({
                    scope: scope,
                    template: appView("modal.html", "remind")
                });
            };

            this.newRemind = function(remindTo) {
                self.api.save({
                    remindTo: remindTo,
                    msg: self.remindContent,
                    type: self.alias || "null"
                }).$promise.then(function(data){

                });
                self.modal.hide();
            };

            this.notifyDesktop = function(content, title, iconUrl) {
                if(!content) {
                    return;
                }

                title = title || "ONES Notify";
                iconUrl = iconUrl || "./common/statics/images/logo_mini_blue.png";

                if (window.webkitNotifications) {
                    //chrome老版本
                    if (window.webkitNotifications.checkPermission() == 0) {
                        var notif = window.webkitNotifications.createNotification(iconUrl, title, content);
                        notif.display = function() {}
                        notif.onerror = function() {}
                        notif.onclose = function() {}
                        notif.onclick = function() {this.cancel();}
                        notif.replaceId = 'Meteoric';
                        notif.show();
                    } else {
                        window.webkitNotifications.requestPermission($jy.notify);
                    }
                }
                else if("Notification" in window){
                    // 判断是否有权限
                    if (Notification.permission === "granted") {
                        var notification = new Notification(title, {
                            "icon": iconUrl,
                            "body": content,
                        });
                    }
                    //如果没权限，则请求权限
                    else if (Notification.permission !== 'denied') {
                        Notification.requestPermission(function(permission) {
                            // Whatever the user answers, we make sure we store the
                            // information
                            if (!('permission' in Notification)) {
                                Notification.permission = permission;
                            }
                            //如果接受请求
                            if (permission === "granted") {
                                var notification = new Notification(title, {
                                    "icon": iconUrl,
                                    "body": content
                                });
                            }
                        });
                    }
                }
            }
        }])

        .controller("RemindModalCtl", ["$scope", "Remind.RemindAPI", function($scope, remindAPI){

            $scope.remindFormConfig = {
                model: remindAPI,
                resource: remindAPI.api,
                opts: {
                    includeFoot: false
                }
            };

            $scope.doRemind = function(){
                remindAPI.newRemind($scope.formData);
            };

        }])

        .controller("NavRemindCtl", ["$scope", "Remind.RemindAPI", "$compile", function($scope, remind, $compile){
            $scope.reminds = [];

            var notified = false;

            var doQuery = function(){
                remind.api.query({
                    user_id: ones.userInfo.id
                }).$promise.then(function(data){
                    if(data === $scope.reminds) {
                        return;
                    }
                    $scope.reminds = data;
                });

                if($scope.reminds.length && !notified) {
                    var isWindowActive = ones.caches.getItem("ones.is.window.active");
                    if(false === isWindowActive) {
                        remind.notifyDesktop(l("lang.messages.you_have_new_notify"));
                        notified = true;
                    }
                }

            };

            doQuery();

            setInterval(function(){
                $scope.$apply(function(){
                    doQuery();
                });
            }, 100000);

            $scope.mark = function(evt) {
                var id = $(evt.target).parent().data("id");
                remind.api.update({
                    id: id
                }, {});
            };

        }])
    ;

})(window, window.angular, window.ones);