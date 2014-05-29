angular.module("ones.doWorkflow.service", [])
        .service("DoCraftModel", ["$rootScope", function($rootScope) {
             return {
                 editAble: false,
                 deleteAble: false,
                 extraSelectActions: [
                    {
                        label: $rootScope.i18n.lang.actions.doCraft,
                        action: function($event, selectedItems){
                            var scope = this.scope;
                            var injector = this.injector;
                            var res = injector.get("DoCraftRes");
                            
                            if(selectedItems.length <= 0) {
                                return;
                            }
                            var ids = [];
                            angular.forEach(selectedItems, function(item){
                                ids.push(item.id);
                            });
                            
                            res.update({
                                id: ids.join(),
                                workflow: true,
                            }, {}, function(){});
                        }
                    }
                ],
                 getFieldsStruct: function() {
                     return {
                         id: {
                             primary: true,
                             cellFilter: "idFormat",
                             width: 80
                         },
                         plan_id: {
                             cellFilter: "idFormat",
                             width: 80
                         },
                         product: {
                             field: "goods_name"
                         },
                         standard_label: {
                             displayName: $rootScope.i18n.lang.standard
                         },
                         version_label: {
                             displayName: $rootScope.i18n.lang.version
                         },
                         current_craft: {
                             field: "processes.craft_name",
                             displayName: $rootScope.i18n.lang.current_craft
                         },
                         start_time: {
                             cellFilter: "dateFormat"
                         },
                         next_craft: {
                             field: "processes.next_craft_name",
                             displayName: $rootScope.i18n.lang.next_craft
                         },
                         num: {}
                     };
                 }
             };   
        }])
        ;