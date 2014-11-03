(function(window, ones, angular){
    angular.module("ones.firstTimeWizard", [])
        .service("FirstTimeWizard.WizardAPI", ["ones.dataApiFactory", "$popover", "$timeout", "$rootScope",
            function(dataAPI, $popover, $timeout, $rootScope){

                var self = this;

                this.api = dataAPI.getResourceInstance({
                    uri: "firstTimeWizard/firstTimeWizard"
                });

                //加载已忽略的提示
                ones.firstTimeWizarded = ones.caches.getItem("ones.firstTimeWizard.nodes");
                this.init = function() {
                    if(ones.firstTimeWizarded) {
                        return;
                    }
                    self.api.query().$promise.then(function(data){
                        ones.firstTimeWizarded = [];
                        angular.forEach(data, function(item){
                            ones.firstTimeWizarded.push(item.node_key);
                        });
                        ones.caches.setItem("ones.firstTimeWizard.nodes", ones.firstTimeWizarded);
                    });
                };

                /**
                 * API对外接口
                 * @param selector 显示popover的选择器
                 * @param key popover唯一KEY
                 * */
                this.showWizard = function(selector, key) {

                    if(ones.firstTimeWizarded && ones.firstTimeWizarded.indexOf(key) >= 0) {
                        return;
                    }

                    var content = l("lang.wizardMessages."+key+".body");
                    var wizardPop;

                    $timeout(function(){

                        wizardPop = $popover(angular.element(selector), {
                            title: l("lang.wizardMessages."+key+".title") || "Tips",
                            content: content,
                            trigger: "manual",
                            html: true,
                            contentTemplate: appView("popup.html", "firstTimeWizard")
                        });

                        $timeout(function(){
                            wizardPop.$scope.key = key;
                            wizardPop.$scope.doMarkPop =  function(key, forever) {
                                self.hideWizard(wizardPop, key, forever);
                            };
                            wizardPop.show();
                        }, 500);


                    }, 2000);
                };

                this.hideWizard = function(popObj, key, forever) {
                    forever = forever === false ? false : true;
                    self.api.save({
                        key: key
                    }).$promise.then(function(){
                        ones.firstTimeWizarded.push(key);
                        ones.caches.setItem("ones.firstTimeWizard.nodes", ones.firstTimeWizarded);
                        popObj.hide();
                    });
                };

            }])
        .run(["FirstTimeWizard.WizardAPI", function(wizard){
            wizard.init();
        }])
    ;
})(window, window.ones, window.angular);