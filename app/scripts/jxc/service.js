angular.module("erp.jxc.services", [])
        .factory("JXCGoodsModel", function() {
            this.getFields = function(i18n, GoodsCategory){
                return {
                    id: {
                        primary: true
                    },
                    name: {
                        displayName: i18n.lang.name,
                        type: text
                    },
                    category_id: {
                        displayName: i18n.lang.category_name,
                        inputType: select,
                        resource: GoodsCategory.query()
                    }
                };
            };
        });