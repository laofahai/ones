(function(ones, angular){
    'use strict';
    /**
     * ONES前端缓存对象，用于当前页面生命周期中的数据缓存及持久化缓存。
     * 使用ones.caches._cachesData对象，localStorage和sessionStorage三种方式存储
     * */
    ones.caches = {
        /**
         * @params k
         * @params v
         * @params persistence default:undefined
         *  可接受：-1: 使用ones.caches.cacheData 刷新/关闭清除
         *         1  使用localStorage
         *         0 使用sessionStorage 当前页面生命周期，关闭页面清除
         * @param toJson 是否存储为JSON字符串，用于对象存储
         * */
        setItem: function(k, v, persistence, toJson) {

            if(angular.isObject(v) || angular.isArray(v)) {
                toJson = true;
            }

            if(undefined == persistence) {
                persistence = 1;
            }

            switch(persistence) {
                case -1:
                    ones.caches._cachesData[k] = v;
                    break;
                case 1:
                    if(toJson) {
                        v = angular.toJson(v);
                    }
                    localStorage.setItem(k, v);
                    break;
                case 0:
                    if(toJson) {
                        v = angular.toJson(v);
                    }
                    sessionStorage.setItem(k, v);
                    break;
            }
            return v;
        },
        getItem: function(k) {
            var v = ones.caches._cachesData[k];

            if(undefined == v) {
                v = sessionStorage.getItem(k);
            }

            if(null == v) {
                v = localStorage.getItem(k);
            }

            try {
                v = angular.fromJson(v);
            } catch(e) {}

            return v;

        },
        removeItem: function(k){
            delete(ones.caches._cachesData[k]);
            sessionStorage.removeItem(k);
            localStorage.removeItem(k);
        },
        clear: function(level) {
            switch(level) {
                case -1:
                    ones.caches._cachesData = {};
                    break;
                case 0:
                    sessionStorage.clear();
                    break;
                case 1:
                    localStorage.clear();
                    break;
                default:
                    localStorage.clear();
                    sessionStorage.clear();
                    ones.caches._cachesData = {};
            }
        },
        _cachesData: {}
    };

})(window.ones, window.angular);