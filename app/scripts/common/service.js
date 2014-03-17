'use strict';

/**
 * 循环资源列表，定义资源
 * */
if(ResourcesDefine.length) {
    var sd;
    for(var i=0;i<ResourcesDefine.length;i++) {
        sd = ServicesDefine[i];
        ERP.factory(sd[0], ["$resource", "erp.config", function($resource, conf) {
            return $resource(
                conf.BSU+sd[1], sd[2]|{}
            );
        }]);
    }
}