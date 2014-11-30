<?php
/*
**************************************************************************************
*	CurlAxel Class by JokerHacker
*	This class is used to make parallel connections to download files.
*	This is the first release, for feedback send mail to jokerhacker.jacer@gmail.com
*	This class is made to help PHP community. Pleas keep it away from commercial use.
**************************************************************************************
*/

class CurlAxel {
    /*
     * url to download, set by setUrl method
     * string
     */
    private $url = "";

    /*
     * custom filename, set by setFilename method (or automatically)
     * string
     */
    private $filename = "";

    /*
     * user curl option array to be passed to curl
     * array
     */
    private $optarray = array();

    /*
     * maintain curl multithread connections
     * curl_multi handle
     */
    private $megaconnection;

    /*
     * store partfile names
     * array
     */
    private $partnames = array();

    /*
     * temporary directory used by CurlAxel to store partfiles and logs
     * string
     */
    private $tempdir = "/temp/";

    /*
     * final download directory
     * string
     */
    private $downdir = "/downloads/";

    /*
     * number of splits (connections)
     * integer
     */
    private $partcount = 5;


    /*
     *
     * options activated on user request
     * inialized as false(bool)
     * once used, type will be changed depending on each fonction
     *
     */

    /* bool */
    private $log = false;

    /* bool */
    private $progress = false;

    /* string */
    private $cookies = false;

    /* string */
    private $cookiesfile = false;

    /* string */
    private $proxy = false;

    /* string */
    private $proxyauth = false;

    /* string */
    private $auth = false;

    /* integer */
    private $maxspeed = false;

    /* integer */
    private $minspeed = false;

    /* integer */
    private $minspeedtime = false;

    /*---------------------------------------
     *
     * end of user activated options
     *
     *--------------------------------------- */

    /*
     * as default, buffer size is set to 64Mb
     * integer
     */
    private $buffersize = 67108864;

    /*
     * current CurlAxel version
     */
    public $version = "1.0 beta 20/12/11";

    /*
     * good old construct medhod ;)
     */
    function __construct() {

    }

    /*
     * check and create folders if needed
     */
    private function init() {
        /* create temp dir */
        $this->tempdir = $this->tempdir;
        if(!is_dir($this->tempdir)) mkdir($this->tempdir);

        /* create download dir */
        $this->downdir = $this->downdir;
        if(!is_dir($this->downdir)) mkdir($this->downdir);
    }

    /*
     * activate/desactivate log
     */
    function activeLog($is) {
        $this->log = (bool)$is;
    }

    /*
     * set number of splits (connections)
     */
    function setParts($num) {
        $this->partcount = (int)$num;
    }

    /*
     * set temporary directory
     */
    function setTempDir($dir) {
        $this->tempdir = $dir;
    }

    /*
     * set download directory
     */
    function setDownloadDir($dir) {
        $this->downdir = $dir;
    }

    /*
     * set cookies as a string (if is set, cookiesfile is ignored)
     */
    function setCookies($cookies) {
        $this->cookies = (string)$cookies;
    }

    /*
     * set path of the cookie file
     */
    function setCookiesFile($cookiesfile) {
        $this->cookiesfile = (string)$cookiesfile;
    }

    /*
     * set proxy ip/port/auth
     */
    function setProxy($server, $port, $username = '', $password = '') {
        $this->proxy = $server . ':' . $port;
        if(($username != '') or ($password != '')) {
            $this->proxyauth = $username . ':' . $password;
        }
    }

    /*
     * set connection auth
     */
    function setAuth($username, $password) {
        $this->auth = $username . ':' . $password;
    }

    /*
     * set maximum speed limit
     */
    function setMaxSpeed($speed) {
        $this->maxspeed = (integer)$speed;
    }

    /*
     * set minimum speed limit
     */
    function setMinSpeed($speed, $time) {
        $this->minspeed = (integer)$speed;
        $this->minspeedtime = (integer)$time;
    }

    /*
     * user personalized curl options
     */
    function setCurlOpts($opts) {
        $this->optarray = $opts;
    }

    /*
     * activate/desactivate progressbars
     */
    public function setProgressCallback($is=false) {
        $this->progress = (bool)$is;
    }

    /*
     * set file merge memory buffersize
     */
    function setBufferSize($buffersie){
        $this->buffersize = (int)$buffersie;
    }

    /*
     * returns filesize from url
     * (integer) filesize on success
     * (bool) false on fail
     */
    function getFileSize($url) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_exec($ch);
        $filesize = curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);
        curl_close($ch);
        if ($filesize)
            return $filesize;
        else return false;
    }

    /*
     * check the server behaviour against multithread connections
     * (bool) true if curl_multi is applicable
     * (bool) false on fail
     */
    function isMT($url) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_NOBODY, false); // Range in HEAD request is ignored in many servers
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
        curl_setopt($ch, CURLOPT_RANGE, 100-200);
        curl_exec($ch);
        $info = curl_getinfo($ch);
        curl_close($ch);
        if($info['download_content_length'] != 100) return false;
        else return true;
    }

    /*
     * set url to download
     * (bool) true if url is accepted
     * (bool) false on fail
     */
    function setUrl($url) {
        /* regex pattern for http(s)/ftp links only */
        $pattern = "/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:\/~\+#]*[\w\-\@?^=%&amp;\/~\+#])?/i";

        if (preg_match($pattern, $url)) {
            $this->url = $url;
            return true;
        }
        else return false;
    }

    /*
     * set a filename
     * (bool) true on success
     * (bool) false if failed
     */
    function setFilename($filename) {
        if (is_string($filename)) {
            /* remove forbidden characters from filename */
            $forbidden = '<>:"/\\|?*\'@#+~{}[]^';
            str_replace(str_split($forbidden), '', $filename);
            $this->filename = $filename;
            return true;
        }
        return false;
    }

    /*
     * extract needed file infos
     */
    private function parseFile($issplit = true) {
        $filename = basename(urldecode($this->url));
        if ($this->filename == '') {
            $this->filename = $filename;
        }
        $size = $this->getFileSize($this->url);
        $this->size = $size;

        /* make splits */
        if($issplit) {
            $this->splits = range(0, $size, ceil($size/$this->partcount));
        }
    }

    /*
     * download file using multithreaded connections
     */
    function fast_download() {
        /* init CurlAxel folders */
        $this->init();

        $this->parseFile();

        /* init log if activated */
        if($this->log) $log = fopen($this->tempdir . 'log.txt', 'a+');
        /* loop for creating curl handles */
        for ($i = 0; $i <= sizeof($this->splits)-1; $i++) {

            /* init curl*/
            $ch[$i] = curl_init();

            /* user option array */
            curl_setopt_array($ch[$i], $this->optarray);

            /* CurlAxel config */
            curl_setopt($ch[$i], CURLOPT_URL, $this->url);
            curl_setopt($ch[$i], CURLOPT_RETURNTRANSFER, false);
            curl_setopt($ch[$i], CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch[$i], CURLOPT_FOLLOWLOCATION, true);

            /* init log for current curl handle  */
            if($this->log) {
                curl_setopt($ch[$i], CURLOPT_VERBOSE, true);
                curl_setopt($ch[$i], CURLOPT_STDERR, $log);
            }

            /* set the progress CallBack function
             * TODO: add other progress outputs (xml, db and text)
             */
            if ($this->progress) {
                curl_setopt($ch[$i], CURLOPT_NOPROGRESS, false);

                /* init a jquery progress bar */
                echo '<span id="pb'. $i .'"></span>
				<script>(function() {$("#pb'. $i .'").progressBar();})</script>';

                /* create a temporary progress function for current curl
                 * handle and register it
                 */
                $progress = function($download_size, $downloaded, $upload_size, $uploaded) use ($i) {
                    static $sprog = 0;
                    @$prog = ceil($downloaded*100/$download_size);
                    if(!isset($time)) static $time = 0;
                    if (($prog > $sprog) and ((time() >= $time+1) or ($time == 0) or ($downloaded ==  $download_size))){
                        $sprog = $prog;
                        echo '<script>$("#pb'. $i .'").progressBar(\'. $sprog. \');</script>';
                        $time = time();
                    }
                };
                curl_setopt($ch[$i], CURLOPT_PROGRESSFUNCTION, $progress);
                curl_setopt($ch[$i], CURLOPT_BUFFERSIZE, 10*1024*1024);
            }

            /* set the cookies */
            /* look for cookies string first */
            if ($this->cookies) {
                curl_setopt($ch[$i], CURLOPT_COOKIE, $this->cookies);
            }
            /* then check for cookies file */
            elseif ($this->cookiesfile) {
                curl_setopt($ch[$i], CURLOPT_COOKIEFILE, $this->cookiesfile);
            }

            /* set the proxy */
            if ($this->proxy) {
                curl_setopt($ch[$i], CURLOPT_HTTPPROXYTUNNEL, TRUE);
                curl_setopt($ch[$i], CURLOPT_PROXY, $this->proxy);
                /* if proxy auth is set */
                if($this->proxyauth)
                    curl_setopt($ch[$i], CURLOPT_PROXYUSERPWD, $this->proxyauth);
            }

            /* set maximum speed limit */
            if($this->maxspeed) {
                curl_setopt($ch[$i], CURLOPT_MAX_RECV_SPEED_LARGE, $this->maxspeed);
            }

            /* set minimum speed limit */
            if($this->minspeed) {
                curl_setopt($ch[$i], CURLOPT_LOW_SPEED_LIMIT, $this->minspeed);
                curl_setopt($ch[$i], CURLOPT_LOW_SPEED_TIME, $this->minspeedtme);
            }

            /* binary transfer to ensure losslessness */
            curl_setopt($ch[$i], CURLOPT_BINARYTRANSFER, true);

            /* not to use old cached connections */
            curl_setopt($ch[$i], CURLOPT_FRESH_CONNECT, true);

            /* connection timeout limit
             * TODO: make it optional
             */
            curl_setopt($ch[$i], CURLOPT_CONNECTTIMEOUT, 10);

            /* register current part filename created by this handle */
            $this->partnames[$i] = $this->filename . $i;

            /* lock the part file */
            $bh[$i] = fopen($this->tempdir . $this->partnames[$i], 'w+');

            /* register the locked part file as current curl handle output */
            curl_setopt($ch[$i], CURLOPT_FILE, $bh[$i]);

            /* set part range */
            $x = ($i == 0 ? 0 : $this->splits[$i]+1);
            if($i == sizeof($this->splits)-1) {
                $range = $x.'-';
            } else {
                $y = $this->splits[$i+1];
                $range = $x.'-'.$y;
            }
            curl_setopt($ch[$i], CURLOPT_RANGE, $range);

            /* register the current curl handle to be executed */
            curl_multi_add_handle($this->megaconnection, $ch[$i]);
        }

        /*
         * execute connections!
         */
        $active = null;
        do {
            $mrc = curl_multi_exec($this->megaconnection, $active);
        } while ($mrc == CURLM_CALL_MULTI_PERFORM);
        while ($active && $mrc == CURLM_OK) {
            if (curl_multi_select($this->megaconnection) != -1) {
                do {
                    $mrc = curl_multi_exec($this->megaconnection, $active);
                } while ($mrc == CURLM_CALL_MULTI_PERFORM);
            }
        }

        /* create final file */
        $finalpath = $this->downdir . $this->filename;
        $final = fopen($finalpath, "w+");

        /*
         * merge splits into final file
         */
        for ($i = 0; $i <= sizeof($this->splits)-1; $i++) {
            $partpath = $this->tempdir . $this->partnames[$i];

            /* !important : reset file handle index */
            fseek($bh[$i], 0, SEEK_SET);

            /* load parts and write to final file */
            while (!feof($bh[$i])) {
                $contents = fread($bh[$i], $this->buffersize);
                fwrite($final, $contents);
            }
            /* close current file handle */
            fclose($bh[$i]);

            /* remove part file */
            unlink($partpath);
        }
        fclose($final);
    }

    /*
     * download file using a single connection
     */
    function slow_download() {
        /* init CurlAxel folders */
        $this->init();

        $this->parseFile(false);

        /* init log if activated */
        if($this->log) $log = fopen($this->tempdir . 'log.txt', 'a+');

        /* init curl*/
        $ch = curl_init();

        /* user option array */
        curl_setopt_array($ch, $this->optarray);

        /* CurlAxel config */
        curl_setopt($ch, CURLOPT_URL, $this->url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 3);

        /* init log for current curl handle  */
        if($this->log) {
            curl_setopt($ch, CURLOPT_VERBOSE, true);
            curl_setopt($ch, CURLOPT_STDERR, $log);
        }

        /* set the cookies */
        /* look for cookies string first */
        if ($this->cookies) {
            curl_setopt($ch, CURLOPT_COOKIE, $this->cookies);
        }
        /* then check for cookies file */
        elseif ($this->cookiesfile) {
            curl_setopt($ch, CURLOPT_COOKIEFILE, $this->cookiesfile);
        }

        /* set the proxy */
        if ($this->proxy) {
            curl_setopt($ch, CURLOPT_HTTPPROXYTUNNEL, TRUE);
            curl_setopt($ch, CURLOPT_PROXY, $this->proxy);
            if($this->proxyauth)
                curl_setopt($ch, CURLOPT_PROXYUSERPWD, $this->proxyauth);
        }

        /* set maximum speed limit */
        if($this->maxspeed) {
            curl_setopt($ch, CURLOPT_MAX_RECV_SPEED_LARGE, $this->maxspeed);
        }

        /* set minimum speed limit */
        if($this->minspeed) {
            curl_setopt($ch, CURLOPT_LOW_SPEED_LIMIT, $this->minspeed);
            curl_setopt($ch, CURLOPT_LOW_SPEED_TIME, $this->minspeedtme);
        }

        /* binary transfer to ensure losslessness */
        curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);

        /* not to use old cached connections */
        curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);

        /* connection timeout limit
         * TODO: make it optional
         */
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

        /* lock output file */
        $bh = fopen($this->downdir . $this->filename , 'w+');

        /* register file handle to curl */
        curl_setopt($ch, CURLOPT_FILE, $bh);

        /* execute! */
        curl_exec($ch);

        curl_close($ch);
    }

    /*
     * determines which type of download to use
     */
    function download() {
        /* check if curl multi is applicable and determine filesize */
        $isMT = $this->isMT($this->url);
        $isMT = false;
        $size = $this->getFileSize($this->url);

        if($isMT and $size > 5*1024*1024 /* 5Mb */) {
            /* initiate curl_multi handle */
            $this->megaconnection = curl_multi_init();

            /* start download using curl_multi handle */
            $this->fast_download();
        } else {
            /* start download using single curl handle */
            $this->slow_download();
        }
    }
}
