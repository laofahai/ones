# <?php exit; ?>

- backend:
  # 如跨域访问不可修改
  SESSION_TYPE:   DB
  SESSION_TABLE:  x_session
  SESSION_EXPIRE: 3600
  MAIL_CHARSET:   UTF-8   #编码
  MAIL_AUTH:      true   #邮箱认证
  MAIL_HTML:      true   #true HTML格式 false TXT格式