# <?php exit; ?>

- backend:
  # 如跨域访问不可修改
  SESSION_TYPE:   DB
  SESSION_TABLE:  x_session
  SESSION_EXPIRE: 3600
  FactoryCodeFormat: [factory_code, standard, version]
  FactoryCodeSplit: "-"
  MAIL_FORM:      ONES Team Robots
  MAIL_ADDRESS:   ones_robot@163.com # 邮箱地址
  MAIL_SMTP:      smtp.163.com # 邮箱SMTP服务器
  MAIL_LOGINNAME: ones_robot@163.com # 邮箱登录帐号
  MAIL_PASSWORD:  thisisones # 邮箱密码
  MAIL_CHARSET:   UTF-8   #编码
  MAIL_AUTH:      true   #邮箱认证
  MAIL_HTML:      true   #true HTML格式 false TXT格式