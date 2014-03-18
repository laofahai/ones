'use strict';
/**
 * 模型数据定义文件
 * */

var JXCModel = new Object();

JXCModel.models = {};

JXCModel.init = function(i18n){
    JXCModel.models.goodsModel = {
        id : {
            primary : true
        },
        name : {
            displayName: i18n.lang.name,
            type: text
        },
        category_id : {
            displayName: i18n.lang.category_name,
            inputType: select,
            resource: GoodsCategory
        }
    };
};


JXCModel.getModel = function(modelName) {
    if(modelName in JXCModel.models) {
        return JXCModel.models[modelName];
    }
}


/**
 * 
 * model定义为JSON，PHP/JS使用统一的MODEL定义？
 * 
 * foreignModel: GoodsCategory
 * foreignKey: id
 * foreignLabel: name 
 * inputType: select
 * 
 * **/