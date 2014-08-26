<?php
/**
 * 封装基于curl的HTTP类库
 *
 * @file    class_httplib.php
 * @author	qaulau@hotmail.com
 * @date    2013-8-1
 */

class httplib{

    private $response;
    private $response_header;
    private $response_data;
    private $response_info;
    private $response_httpcode;
    private $timeout = 30;
    private $cookie = '';
    private $useragent = 'PHP-HttpLib-v1.0';
    private $request_header = array();
    private $starttime;
    private $request_proxy = array();
    private $request_method;

    public function __construct(){
        $this->starttime = self::_microtime();
        //能有效提高POST大于1M数据时的请求速度
        $this->set_header('Expect');
    }

    /**
     * 设置cookie(可选)
     * @param <array|string> $cookie
     */
    public function set_cookie($cookie = ''){
        if (is_array($cookie)){
            $cookies = array();
            foreach ($cookie as $k => $v){
                $cookies[] = $k.'='.$v;
            }
            $this->cookie .= implode('; ', $cookies);
        }else{
            $this->cookie .= $cookie;
        }
    }

    /**
     * 设置用户浏览器信息(可选)
     * @param string $useragent : 浏览器代理信息
     */
    public function set_useragent($useragent = ''){
        $this->useragent = $useragent;
    }

    /**
     * 设置头部伪造IP(可选)，对某些依靠头部信息判断ip的网站有效
     * @param string $ip ： 需要伪造的ip
     */
    public function set_forgeip($ip){
        $this->set_header('CLIENT-IP',$ip);
        $this->set_header('X-FORWARDED-FOR',$ip);
    }

    /**
     * 添加请求头部信息
     * @param string $k
     * @param string $v
     */
    public function set_header($k,$v = ''){
        if (!empty($k)){
            $this->request_header[] = $k.':'.$v;
        }
    }

    /**
     * 设置超时时间(可选)
     * @param int $sec
     */
    public function set_timeout($sec){
        if($sec > ini_get('max_execution_time')) @set_time_limit($sec);
        $this->timeout = $sec;
    }

    /**
     * 设置代理(可选)，如对方限制了ip访问或需要隐藏真实ip
     * @param string $host	：代理服务器（ip或者域名）
     * @param int	 $port	：代理服务端口
     * @param string $user	：用户名（如果有）
     * @param string $pass	：用户密码（如果有）
     */
    public function set_proxy($host,$port = '',$user = '',$pass = ''){
        $this->request_proxy = array('host'=>$host,'port'=>$port,'user'=>$user,'pass'=>$pass);
    }

    /**
     * 请求url
     * @param string $url		: 请求的地址
     * @param <array|string> $postdata :该项如果填写则为POST方式，否则为GET方式;如需上传文件,需在文件路径前加上@符号
     * @param string $referer	: 来路地址，用于伪造来路
     */
    public function request($url,$postdata = '',$referer=''){
        $postdata["SOURCE"] = $_SERVER["HTTP_REFERER"];
        $ch = $this->_http_request($url,$postdata,$referer);
        if ($postdata == ''){
            $this->request_method = 'GET';
        }else{
            $this->request_method = 'POST';
        }
        $this->response = curl_exec($ch);
        if ($this->response === false) {
            //throw new Exception('cURL resource: ' . (string) $ch . '; cURL error: ' . curl_error($ch) . ' (' . curl_errno($ch) . ')');
            $this->response_httpcode = 204; //没有内容，请求失败
            $this->response_data = 'URL：'.$url.' cURL resource: ' . (string) $ch . '; cURL error: ' . curl_error($ch) . ' (' . curl_errno($ch) . ')';
            return false;
        }
        $this->_process_response($ch);
        curl_close($ch);
        return $this->response;
    }

    /**
     * 获取响应的所有信息
     */
    public function get_response(){
        return $this->response;
    }

    /**
     * 获取响应的header信息
     * @param string $key	: (可选)header头部信息标示如获取Set-Cookie
     * @return string
     */
    public function get_header($key = ''){
        if ($key == ''){
            return $this->response_header;
        }
        if (!isset($this->response_header[$key])){
            return NULL;
        }
        return $this->response_header[$key];
    }

    /**
     * 获取响应的cookie
     * @param boolean $assoc : 选择true将返回数组否则返回字符串
     */
    public function get_cookie($assoc = false){
        $cookies = $this->get_header('Set-Cookie');
        if ($cookies){
            foreach ($cookies as $v){
                $cookieinfo = explode(';', $v);
                if(strpos($this->cookie,$cookieinfo[0]) === FALSE){
                    $this->cookie .= $cookieinfo[0];
                    $this->cookie .= '; ';
                }
            }
        }
        if ($assoc && $this->cookie){
            $cookie = substr($this->cookie, 0,-3);
            $cookie = explode('; ', $cookie);
            $cookies = array();
            foreach ($cookie as $v){
                $cookieinfo = explode('=', $v);
                $cookies[$cookieinfo[0]] = $cookieinfo[1];
            }
            return $cookies;

        }
        return $this->cookie;
    }

    /**
     * 获取响应的页面数据即页面代码
     */
    public function get_data(){
        return $this->response_data;
    }

    /**
     * 获取响应的网页编码
     */
    public function get_charset(){
        $content_type = $this->get_header('Content-Type');
        if ($content_type) {
            preg_match('/charset=(.+)/i', $content_type, $matches);
            if (isset($matches[1])){
                return strtoupper(trim($matches[1]));
            }
        }
        return NULL;
    }

    /**
     * 获取连接资源的信息（返回数组）
     */
    public function get_info(){
        return $this->response_info;
    }

    /**
     * 获取响应的网页状态码 (注：200为正常响应)
     */
    public function get_statcode(){
        return $this->response_httpcode;
    }

    /**
     * 获取请求方法
     */
    public function  get_method(){
        return $this->request_method;
    }

    /**
     * 获取请求时间
     */
    public function get_requesttime(){
        return self::_microtime() - $this->starttime;
    }

    /**
     * 处理响应的数据
     * @param resource $ch
     */
    private function _process_response($ch = null){
        if (is_resource($ch)) {
            $content_size = curl_getinfo($ch,CURLINFO_CONTENT_LENGTH_DOWNLOAD);
            if($content_size > 0){
                $this->response_header = substr($this->response, 0, -$content_size);
                $this->response_data = substr($this->response, -$content_size);
            }else{
                $header_size = curl_getinfo($ch,CURLINFO_HEADER_SIZE);
                $this->response_header = substr($this->response, 0, $header_size);
                $this->response_data = substr($this->response, $header_size);
            }
            $this->response_httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $this->response_info = curl_getinfo($ch);
            //分解响应头部信息
            $this->response_header = explode("\r\n\r\n", trim($this->response_header));
            $this->response_header = array_pop($this->response_header);
            $this->response_header = explode("\r\n", $this->response_header);
            array_shift($this->response_header); //开头为状态
            //分割数组
            $header_assoc = array();
            foreach ($this->response_header as $header) {
                $kv = explode(': ', $header);
                if($kv[0] == 'Set-Cookie'){
                    $header_assoc['Set-Cookie'][] = $kv[1];
                }else{
                    $header_assoc[$kv[0]] = $kv[1];
                }
            }
            $this->response_header = $header_assoc;
        }
        return false;
    }

    /**
     * 请求数据
     * @param string $url
     * @param string|array $post_data
     * @param string $referer
     */
    private function _http_request($url,$post_data,$referer=''){
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HEADER, 1);
        curl_setopt($ch, CURLOPT_USERAGENT, $this->useragent);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->timeout);
        //强制使用IPV4协议解析域名，否则在支持IPV6的环境下请求会异常慢
        @curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        if ($post_data){
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
        }
        if ($this->cookie){
            curl_setopt($ch, CURLOPT_COOKIE, $this->cookie);
        }
        if ($referer){
            curl_setopt($ch, CURLOPT_REFERER, $referer);
        }
        if ($this->request_header){
            curl_setopt($ch, CURLOPT_HTTPHEADER, $this->request_header);
        }
        if ($this->request_proxy) {
            curl_setopt($ch, CURLOPT_HTTPPROXYTUNNEL, true);
            $host = $this->request_proxy['host'];
            $host .= ($this->request_proxy['port']) ? ':' . $this->request_proxy['port'] : '';
            curl_setopt($ch, CURLOPT_PROXY, $host);
            if (isset($this->request_proxy['user']) && isset($this->request_proxy['pass'])) {
                curl_setopt($ch, CURLOPT_PROXYUSERPWD, $this->request_proxy['user'] . ':' . $this->request_proxy['pass']);
            }
        }
        return $ch;
    }

    private static function _microtime(){
        return array_sum(explode(' ', microtime()));
    }
}