(function(){
    ones.installLang = {};
    angular.module("ones.install", [
            'ngRoute',
            "ones.configModule",
            "ones.common.filters",
            "ones.commonView"
        ])
        .config(["$routeProvider", function($route){
            $route
                .when("/step-1", {
                    templateUrl: appView("readAgreement.html", "install"),
                    controller: "ReadAgreementCtl"
                })
                .when("/step-2", {
                    templateUrl: appView("configure.html", "install"),
                    controller: "ConfigureCtl"
                })
                .when("/step-3", {
                    templateUrl: appView("initialize.html", "install"),
                    controller: "InitializeCtl"
                })
                .when("/step-4", {
                    templateUrl: appView("doInstall.html", "install"),
                    controller: "DoInstallCtl"
                })
                .otherwise({
                    redirectTo: "/step-1"
                });
        }])
        .run(["$rootScope", function($rootScope){
            var language = uriParamsGet("lang") || ones.defaultLanguage;
            $.getJSON("apps/install/i18n/"+language+".json", function(data){
                $rootScope.installLang = data.lang;
                $rootScope.$digest();
            });
        }])
        .service("ConfigureModel", ["ComView", "$rootScope", function(ComView, $rootScope){
            return {
                getFieldsStruct: function() {
                    return {
                        dbhost: {
                            value: "127.0.0.1",
                            displayName: $rootScope.installLang.dbhost,
                            helpText: $rootScope.installLang.helpText.dbhost
                        },
                        dbname: {
                            value: "ones",
                            displayName: $rootScope.installLang.dbname
                        },
                        dbpre: {
                            value: "x_",
                            displayName: $rootScope.installLang.dbpre
                        },
                        dbport: {
                            value: 3306,
                            displayName: $rootScope.installLang.dbport
                        },
                        dbuser: {
                            displayName: $rootScope.installLang.dbuser
                        },
                        dbpwd: {
                            displayName: $rootScope.installLang.dbpwd
                        }
                    };
                }
            };
        }])
        .service("InitModel", ["ComView", "$rootScope", function(ComView, $rootScope){
            return {
                getFieldsStruct: function() {
                    return {
                        email: {
                            inputType: "email",
                            displayName: $rootScope.installLang.adminEmail
                        },
                        username: {
                            displayName: $rootScope.installLang.adminUsername,
                            value: "admin"
                        },
                        truename: {
                            displayName: $rootScope.installLang.adminTruename,
                            value: "Administrator"
                        },
                        password: {
                            displayName: $rootScope.installLang.adminPwd
                        }
                    };
                }
            };
        }])
        .controller("MainCtl", ["$scope", "$location", "$rootScope", function($scope, $location, $rootScope){

            $scope.step = 1;

            $scope.configure = {};

            $scope.$watch(function(){
                return $rootScope.installLang;
            }, function(){
            });
            $scope.$watch("step", function(newVal, oldVal){
                if(!$scope.agreed && newVal !== 1) {
                    $location.url("/");
                }
            });

            var resetAlert = function() {
                $scope.alert = {
                    type: "info",
                    msg: null
                };
            }
            resetAlert();
            $scope.selectedLanguage = uriParamsGet("lang") || ones.defaultLanguage;
            $scope.languages = [
                {
                    alias: "zh-cn",
                    name: "Simplified Chinese"
                },
                {
                    alias: "en-us",
                    name: "English"
                }
            ];

            $scope.changeLanguage = function(){
                window.location.href="install.html?lang="+$scope.selectedLanguage;
            };


            $scope.hasNext = function() {
                return $scope.step < 4;
            }
            $scope.hasPrev = function() {
                return $scope.step > 1;
            }
            $scope.goNext = function() {
                if(typeof($scope.checkNext) == "function") {
                    if(false === $scope.checkNext()) {
                        return false;
                    }
                }
                resetAlert();
                $scope.step = parseInt($scope.step)+1;
                $location.url("/step-"+$scope.step);
            }
            $scope.goPrev = function() {
                $scope.step = parseInt($scope.step)-1;
                $location.url("/step-"+$scope.step);
            }

        }])
        .controller("ReadAgreementCtl", ["$scope", "$rootScope", function($scope, $rootScope){
            $scope.$parent.step = 1;
            $scope.agree = false;

            $.get("apps/install/i18n/license/"+$scope.selectedLanguage, function(data){
                $("#agreementContent").html(data);
            });

            $scope.$parent.checkNext = function(){
                if(!$scope.agree) {
                    $scope.$parent.alert.msg = $rootScope.installLang.mustAgree;
                    $scope.$parent.alert.type = "danger";
                }
                $scope.$parent.agreed = true;
                return $scope.agree;
            }
        }])
        .controller("ConfigureCtl", ["$scope", "FormMaker", "ConfigureModel", "$compile", "$rootScope",
            function($scope, FormMaker, model, $compile, $rootScope){

                $scope.$parent.step = 2;
                var fm = new FormMaker.makeForm($scope, {
                    fieldsDefine: model.getFieldsStruct(),
                    includeFoot: false
                });
                var formHTML = fm.makeHTML();
                $("#configureFormContainer").append($compile(formHTML)($scope));

                if($scope.$parent.configure.db) {
                    $scope.formData = $scope.$parent.configure.db;
                }

                $scope.$parent.checkNext = function() {
                    if(!$scope.form.$valid) {
                        $scope.$parent.alert.msg = $rootScope.installLang.fillTheForm;
                        $scope.$parent.alert.type = "danger";

                        return false;
                    }

                    $scope.$parent.configure.db = $scope.formData;

                };

            }])
        .controller("InitializeCtl", ["$scope", "FormMaker", "InitModel", "$compile", "$rootScope",
            function($scope, FormMaker, model, $compile, $rootScope){
                $scope.$parent.step = 3;
                var fm = new FormMaker.makeForm($scope, {
                    fieldsDefine: model.getFieldsStruct(),
                    includeFoot: false
                });
                var formHTML = fm.makeHTML();
                $("#initFormContainer").append($compile(formHTML)($scope));

                if($scope.$parent.configure.admin) {
                    $scope.formData = $scope.$parent.configure.admin;
                }

                $scope.$parent.checkNext = function() {
                    if(!$scope.form.$valid) {
                        $scope.$parent.alert.msg = $rootScope.installLang.fillTheForm;
                        $scope.$parent.alert.type = "danger";

                        return false;
                    }

                    $scope.$parent.configure.admin = $scope.formData;

                };

            }])
        .controller("DoInstallCtl", ["$scope", "$rootScope", "$http", "ones.config", "$sce", function($scope,$rootScope, $http, config, $sce){
            $scope.$parent.step = 4;

//            $scope.$parent.configure = {"db":{"dbhost":"127.0.0.1","dbname":"ones_install","dbpre":"x_","dbuser":"root","dbpwd":"root"},"admin":{"username":"admin","truename":"Administrator","email":"admin@admin.com","password":"123123"}};

            $scope.installMsgs = [];
            $scope.installProgress = {
                messages: [],
                type: "info"
            }

            /**
             *
             * */
            var trustHTML = function(lang, isLang) {
                isLang = isLang === false ? false : true;
                if(isLang) {
                    return $sce.trustAsHtml($rootScope.installLang[lang]);
                } else {
                    return $sce.trustAsHtml(lang);
                }

            }
            $scope.installProgress.messages.push(trustHTML("startInstall"));

            var installSteps = {
                _query: function(step, callback) {
//                    $http({
//                        method: "POST",
//                        url: config.BSU+"install",
//                        data: {
//                            step: step,
//                            data: $scope.$parent.configure
//                        }
//                    }).then(callback);
                    $http.post(config.BSU+"install", {
                        step: step,
                        data: $scope.$parent.configure
                    }).success(callback);
                },
                testDB: function() {
                    installSteps._query("testDB", function(rs){
                        if(rs.error) {
                            $scope.installProgress.type = "danger";
                            $scope.installProgress.messages.push(trustHTML("testDbConnectFailed"));
                            $scope.installProgress.messages.push(trustHTML(rs.msg, false));
                            return false;
                        } else {
                            $scope.installProgress.messages.push(trustHTML("testDbConnectSuccess"));
                            installSteps.importData()
                        }
                    });
                },
                importData: function() {
                    $scope.installProgress.messages.push(trustHTML("importingData"));
                    installSteps._query("importDB", function(rs){
                        if(rs.error) {
                            var msg = "SQL:"+rs.msg.replace("\n", "");
                            $scope.installProgress.type = "danger";
                            $scope.installProgress.messages.push(trustHTML("importFailed"));
                            $scope.installProgress.messages.push(trustHTML(msg, false));
                            return false;
                        } else {
                            $scope.installProgress.messages.push(trustHTML("completeImport"));
                            installSteps.importAdmin()
                        }
                    });
                },
                importAdmin: function() {
                    $scope.installProgress.messages.push(trustHTML("configuringAdmin"));
                    installSteps._query("init", function(rs){
                        if(rs.error) {
                            $scope.installProgress.type = "danger";
                            $scope.installProgress.messages.push(trustHTML("configureAdminFailed"));
                            return false;
                        } else {
                            $scope.installProgress.messages.push(trustHTML("completeConfigureAdmin"));
                            installSteps.clearData()
                        }
                    });
                },
                clearData: function() {
                    $scope.installProgress.messages.push(trustHTML("clearInstallData"));
                    installSteps._query("clearData", function(rs){
                        if(rs.error) {
                            $scope.installProgress.type = "danger";
                            $scope.installProgress.messages.push(trustHTML("clearInstallDataFailed"));
                            return false;
                        } else {
                            $scope.installProgress.messages.push(trustHTML("installComplete"));
                        }
                    });
                }
            };

            console.log();

            installSteps.testDB();

            //console.log(angular.toJson($scope.$parent.configure));
        }])

    ;
})();