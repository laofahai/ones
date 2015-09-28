<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 9/25/15
 * Time: 20:12
 */

namespace Smtp\Service;


class MailService {

    static public $configs = [];

    static public $phpmailer = null;

    static public $error = [];

    /*
     * 发送邮件接口
     * @params array $to eg: [
     *   ['335454250@qq.com', 'Laofahai']
     * ]
     * */
    static public function send_to($to, $subject, $content, $sign_content=true) {

        if(!self::$configs) {
            $config_keys = [
                'smtp_host',
                'smtp_port',
                'smtp_user',
                'smtp_password',
                'smtp_enable_ssl',
                'smtp_from_address',
                'smtp_from_name',
                'smtp_sign_content'
            ];
            self::$configs = D('Home/Config')->get_kv_config_multi($config_keys);
        }

        if(!self::$phpmailer) {
            self::$phpmailer = new \PHPMailer();
            self::$phpmailer->Host = self::$configs['smtp_host'];
            self::$phpmailer->isSMTP();
            self::$phpmailer->SMTPAuth = true;
            self::$phpmailer->Port = self::$configs['smtp_port'];
            if(self::$configs['smtp_enable_ssl']) {
                self::$phpmailer->SMTPSecure = 'ssl';
            }
            self::$phpmailer->Username = self::$configs['smtp_user'];
            self::$phpmailer->Password = self::$configs['smtp_password'];

            self::$phpmailer->setFrom(self::$configs['smtp_from_address'], self::$configs['smtp_from_name']);
        }

        foreach($to as $to_info) {
            self::$phpmailer->addAddress($to_info[0], $to_info[1]);
        }

        self::$phpmailer->isHTML(true);
        self::$phpmailer->Subject = $subject;
        self::$phpmailer->Body = $content;
        self::$phpmailer->AltBody = $content;

        if($sign_content) {
            self::$phpmailer->Body .= nl2br("\n\n".self::$configs['smtp_sign_content']);
        }

        if(!self::$phpmailer->send()) {
            self::$error = self::$phpmailer->ErrorInfo;
            return false;
        } else {
            return true;
        }
    }
    
}