---
title: upload-labs靶场通关小记
id: upload-labs靶场通关小记
date: 2021-02-12 15:15:41
sidebar_position: 5
---

<!-- more -->

## 前言

近年了又忙又爱玩哈哈，之前的计划学习搁置了好多

这里是upload-labs的记录，上学期做过了但写的不是很详细，知识点也不是非常清晰，这次重新做一遍详细记录一下

大致思路如下，ps：除此之外还可能存在检查php标记<?，这时候用其他的标记就可以了

```php
ps：php手册中的四种php标记：
<?php ?>
<script language='php'></script>
<% %>
<? ?>:要使用 <? ?> 短标记,必须开启php.ini中的short_open_tag指令
    
PHP 有一个 echo 标记简写 <?=， 它是更完整的 <?php echo 的简写形式：
<?= 'print this string' ?> === <?php echo 'print this string' ?>
```

![官方的tips](https://i.loli.net/2021/02/13/NYtQUAPus7TxGbR.png)![思路](https://i.loli.net/2021/02/13/JuaItBbjfo9zws8.png)



## pass1（客户端-js检查）

### 分析

先随便上传一下~看到弹窗，f12一下能看到提交时的js验证，要求上传jpg、png、gif类型的文件（算是前端的白名单吧）

![](https://i.loli.net/2021/02/13/2D5qPnpJdzSa4jf.png)

客户端检查：上传非法文件，返回速度较快~

### bypass



#### 1、禁用js

##### 	a、burpsuite抓包删除所有js再发包~

![](https://i.loli.net/2021/02/13/FVlo1XSy2cizU9r.png)



![删除前](https://i.loli.net/2021/02/13/qRKdL5maXcxeP3H.png)

![删除后](https://i.loli.net/2021/02/13/fFNXHBO92mGStZk.png)

可以看到删除后所有js都被删掉了，这时候上传咱们的🐎就可以了



##### 	b、浏览器禁用js

如图是chorme禁用js的页面，edge和chorme类似（毕竟用的chorme内核）

![chorme设置-搜索-javascript](https://i.loli.net/2021/02/13/et3XBcxvV6UuaJw.png)

#### 2、将🐎后缀名改为允许的格式，抓包改回来即可

![2021021100205737.png](https://i.loli.net/2021/02/13/b8IM9rWXjLPNxQt.png)



最后右键打开就能得到上传文件的路径了，蚁剑连接即可

（找路径很有讲究==——自某次找错路径绕了三天的经历、）

![](https://i.loli.net/2021/02/13/PpDkXby6grBmaed.png)

## pass2（MIME-Type验证）

### 分析

老样☞，先上传🐎，然而被无情的驳回

![](https://i.loli.net/2021/02/13/CO4QZnmFEVw8Grz.png)

根据思路，看一下是检查后缀名，还是检查内容（或者都检查--）

这里准备了拥有相同内容`<?php phpinfo(); ?>`,但类型不同的🐎（文件后缀不同）

**也就是判断是否能够上传图片类型，非图片内容的文件**



![](https://i.loli.net/2021/02/13/1ODwIoL2xR3WFfv.png)



刚才php类型上传失败了，现在咱们上传jpg类型的试试

![](https://i.loli.net/2021/02/13/UY6eEcIPXFDVzOL.png)

显然是可以的

但是打开却不显示phpinfo，

是因为php不会对图片进行解析，后面的图片马也是一样，需要搭配文件包含漏洞使用

（或者修改配置使得图片也能解析）详情看后文

![](https://i.loli.net/2021/02/13/WbiL8XVsZH49rDG.png)

然后抓包看一下，二者的差别在于后缀名，还有Content-Type

![20210211003858612.png](https://i.loli.net/2021/02/13/cKYluSLhsoFX9RH.png)



将info.php改为info.jpg，报错

再尝试将content-type改为图片形式：`image/jpeg`成功！



### bypass

将传入的🐎抓包修改content-type为`image/jpeg`、`image/png`、`image/gif`，放包即可



源码（附解析）：

```php
$is_upload = false;
$msg = null;
if (isset($_POST['submit'])) {
    if (file_exists(UPLOAD_PATH)) {	#file_exists — 检查文件或目录是否存在
        if (($_FILES['upload_file']['type'] == 'image/jpeg') || ($_FILES['upload_file']['type'] == 'image/png') || ($_FILES['upload_file']['type'] == 'image/gif')) {#检查文件MIME类型是否为这三种，是则为文件名和上传路径赋值，从而使得move_uploaded_file()为真，上传成功
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH . '/' . $_FILES['upload_file']['name']            
            if (move_uploaded_file($temp_file, $img_path)) { #move_uploaded_file() - 将上传的文件移动到新位置
                $is_upload = true;
            } else {
                $msg = '上传出错！';
            }
        } else {
            $msg = '文件类型不正确，请重新上传！';
        }
    } else {
        $msg = UPLOAD_PATH.'文件夹不存在,请手工创建！';
    }
}
```

**关于MIME-Type的小知识：**

MIME(Multipurpose Internet Mail Extensions)多用途互联网邮件扩展类型。是设定某种扩展名的文件用一种应用程序来打开的方式类型，当该扩展名文件被访问的时候，浏览器会自动使用指定应用程序来打开。多用于指定一些客户端自定义的文件名，以及一些媒体文件打开方式。



**关于$_FILES的小知识：**

![$_FILES数组内容](https://i.loli.net/2021/02/13/eUsimQBMdZ3rX7v.png)



## pass3（黑名单-后缀名）

### 分析

上传一个🐎，tips:不允许上传.asp,.aspx,.php,.jsp后缀文件！

也就是说黑名单中都不能上传lo，**只针对黑名单中没有的后缀名，文件才能上传成功**

![](https://i.loli.net/2021/02/13/otYfysrCXbOJKzV.png)

### bypass

1、黑名单不全

诸如php1、php5、phtml这些都可以上传，使用这类的后缀名就行了（前提是能够解析，不然上传也没意义）

这里文件上传后名字会被更改。

注意中间件对不同文件类型的解析问题（一般是配置问题），不然就会出现上传成功却无法利用的情况

![](https://i.loli.net/2021/02/13/qHMEu6g7Qiv9KZO.png)

此处因为环境是用phpstudy搭建的，就无法解析php5，修改一下httpd.conf~

添加如下内容：`AddType application/x-httpd-php .php .phtml .php1 .php2 .php3 .php4 .php5`再重启一下即可

不过我再访问却是让我下载这个文件。。显然解析出问题了QAQ



2、此处没有过滤.htaccess，可以上传`.htaccess`文件（内容为`SetHandler application/x-httpd-php`），从而将所有文件解析为php。（具体看第四关~）



源码：

一般黑名单验证可以尝试

‘.’号（如：`a.php.`）、大小写（如PhP）、特殊字符（如：1.php::$DATA）、Apache后缀解析（.php.xxx为.php）等等

> windows在创建文件时会删除后缀名后的.和空格，并且后缀名为php.的文件也是可以当作php解析的（windows和linux环境都可以）

但这些在源码中都ban了

```php
$is_upload = false;
$msg = null;
if (isset($_POST['submit'])) {
    if (file_exists(UPLOAD_PATH)) {
        $deny_ext = array('.asp','.aspx','.php','.jsp');
        $file_name = trim($_FILES['upload_file']['name']);#trim();去掉字符串两端多余空格
        $file_name = deldot($file_name);# deldot();删除文件名末尾的点；‘.’号（如：`a.php.`）
        $file_ext = strrchr($file_name, '.');# strrchr();从删除"."的位置开始删除 “xxx.php.xxx”删除.xxx；
        $file_ext = strtolower($file_ext); # strtolower();；大小写（如PhP）
        $file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
        $file_ext = trim($file_ext); //收尾去空

        if(!in_array($file_ext, $deny_ext)) {
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH.'/'.date("YmdHis").rand(1000,9999).$file_ext;            
            if (move_uploaded_file($temp_file,$img_path)) {
                 $is_upload = true;
            } else {
                $msg = '上传出错！';
            }
        } else {
            $msg = '不允许上传.asp,.aspx,.php,.jsp后缀文件！';
        }
    } else {
        $msg = UPLOAD_PATH . '文件夹不存在,请手工创建！';
    }
}
```

## pass4（黑名单-.htaccess）

### 分析

ban：

```php
 $deny_ext = array(".php",".php5",".php4",".php3",".php2",".php1",".html",".htm",".phtml",".pht",".pHp",".pHp5",".pHp4",".pHp3",".pHp2",".pHp1",".Html",".Htm",".pHtml",".jsp",".jspa",".jspx",".jsw",".jsv",".jspf",".jtml",".jSp",".jSpx",".jSpa",".jSw",".jSv",".jSpf",".jHtml",".asp",".aspx",".asa",".asax",".ascx",".ashx",".asmx",".cer",".aSp",".aSpx",".aSa",".aSax",".aScx",".aShx",".aSmx",".cEr",".sWf",".swf",".ini");
```

可以看到禁用了更多类型，但没有禁用`.htaccess`，那么就可以先上传`.htaccess`，在上传木马~



#### 关于`.htaccess`：

**条件：**

php5.6以下不带nts的版本

服务器没有禁止.htaccess文件的上传，且服务商允许用户使用自定义.htaccess文件



**利用方式：**

上传覆盖.htaccess文件，重写解析规则，将上传的带有脚本马的图片以脚本方式解析。



**关于.htaccess文件内容：**

.htaccess文件解析规则的增加，是可以按照组合的方式去做的，具体需要自己多测试一下。

第一种、虽然好用，但是会误伤其他正常文件，动静大容易被发现

```
<IfModule mime_module>

AddHandler php5-script .gif     	#在当前目录下，只针对gif文件会解析成php代码执行
SetHandler application/x-httpd-php  #在当前目录下，所有文件都会被解析成php代码执行

</IfModule>
```

第二种、同1没太大区别

```
<IfModule mime_module>

AddType application/x-httpd-php .gif

</IfModule>
```



第三种、精确控制能被解析成php代码的文件，比较隐蔽
evil.gif即为上传的🐎名称+后缀

```
<FilesMatch "evil.gif"> 	#当前目录下，若匹配到evil.gif文件，则被解析成PHP代码执行

SetHandler application/x-httpd-php
AddHandler php5-script .gif    

</FilesMatch>
```

或

```
<FilesMatch "info">			#当前目录下，若匹配到名为info的文件，都会被解析为php代码
    SetHandler application/x-httpd-php
</FilesMatch>
```



### bypass

上传`.htaccess`文件：

```
<FilesMatch "info">
    SetHandler application/x-httpd-php
</FilesMatch>
```

然后上传名为info，任意后缀名的一句话🐎即可



## pass5（黑名单-利用.user.ini本地包含）

### 分析

在第四关基础上.htaccess也被禁用了

```php
$is_upload = false;
$msg = null;
if (isset($_POST['submit'])) {
    if (file_exists(UPLOAD_PATH)) {
        $deny_ext = array(".php",".php5",".php4",".php3",".php2",".html",".htm",".phtml",".pht",".pHp",".pHp5",".pHp4",".pHp3",".pHp2",".Html",".Htm",".pHtml",".jsp",".jspa",".jspx",".jsw",".jsv",".jspf",".jtml",".jSp",".jSpx",".jSpa",".jSw",".jSv",".jSpf",".jHtml",".asp",".aspx",".asa",".asax",".ascx",".ashx",".asmx",".cer",".aSp",".aSpx",".aSa",".aSax",".aScx",".aShx",".aSmx",".cEr",".sWf",".swf",".htaccess");
        $file_name = trim($_FILES['upload_file']['name']);
        $file_name = deldot($file_name);//删除文件名末尾的点
        $file_ext = strrchr($file_name, '.');
        $file_ext = strtolower($file_ext); //转换为小写
        $file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
        $file_ext = trim($file_ext); //首尾去空
        
        if (!in_array($file_ext, $deny_ext)) {
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH.'/'.$file_name;
            if (move_uploaded_file($temp_file, $img_path)) {
                $is_upload = true;
            } else {
                $msg = '上传出错！';
            }
        } else {
            $msg = '此文件类型不允许上传！';
        }
    } else {
        $msg = UPLOAD_PATH . '文件夹不存在,请手工创建！';
    }
}
```

这时可以利用`.user.ini`文件



#### .user.ini 和 php.ini：

##### php.ini

**php.ini**是php的核心配置文件，在 PHP 启动时被读取。



​	**但web目录的其他ini文件也可以被php识别**

##### .user.ini

**.user.ini**实际上就是一个可以由用户“自定义”的php.ini

而只有`PHP_INI_USER模式`、`PHP_INI_PERDIR模式（下表没有提到）`可以在 **.user.ini** 中设定

![](https://i.loli.net/2021/02/13/3av5Zf6eGdDcwu9.png)![](https://i.loli.net/2021/02/13/RCYt9k2ZgGIfQzM.png)

在此我们可以利用`.user.ini`本地包含文件，从而实现对🐎的解析

### 利用`.user.ini`本地包含文件

原理：利用.user.ini，使得目录下所有php文件自动包含某个文件~

条件：open_basedir没有被限制

（open_basedir是php.ini中的一个配置选项，可用于将用户访问文件的活动范围限制在指定的区域）

函数：（不一定要php文件，毕竟是官方文档）

```
auto_prepend_file：加载第一个php代码 前 先执行预加载该配置所指示的php文件，类似于在文件前调用了require()函数。

auto_append_file：加载第一个php代码 后 先执行预加载该配置所指示的php文件。类似，只是在文件后面包含。
```

利用：直接写在.user.ini中即可，test.jpg即为要包含的文件

```ini
auto_prepend_file=test.jpg
```



### bypass

1、准备`图片🐎`

一个正常图片 1.jpg；一个包含🐎的1.php文件；合并后得到名为2.jpg的图片🐎

```shell
#cmd中：
#/b指定以二进制格式复制、合并文件; 用于图像类/声音类文件
#/a指定以ASCII格式复制、合并文件。用于txt等文档类文件
copy  1.jpg/b + 1.php/a  2.jpg
```

或者直接十六进制打开图片，将一句话木马插入最底层

![](https://i.loli.net/2021/02/13/uOTLmlvSxt8aeRr.png)

2、准备`.user.ini`

 使用方法很简单，直接写在.user.ini中：

```ini
auto_prepend_file=ingo.jpg
```

`ingo.jpg`就是要包含的文件啦



3、找到目标服务器php可以正常访问的文件（应当与`.user.ini`在同一路径）

这里提示了readme.php

![](https://i.loli.net/2021/02/13/IlYt2H8sr5Dg6Cv.png)

那么直接访问readme.php就可以了

![](https://i.loli.net/2021/02/13/msP6WIU3ilG4yez.png)



## pass6（黑名单-大小写绕过）

### 分析

如下，去掉了`strtolower($file_ext)`函数（转换为小写）

```php
        $deny_ext = array(".php",".php5",".php4",".php3",".php2",".html",".htm",".phtml",".pht",".pHp",".pHp5",".pHp4",".pHp3",".pHp2",".Html",".Htm",".pHtml",".jsp",".jspa",".jspx",".jsw",".jsv",".jspf",".jtml",".jSp",".jSpx",".jSpa",".jSw",".jSv",".jSpf",".jHtml",".asp",".aspx",".asa",".asax",".ascx",".ashx",".asmx",".cer",".aSp",".aSpx",".aSa",".aSax",".aScx",".aShx",".aSmx",".cEr",".sWf",".swf",".htaccess",".ini");
        $file_name = trim($_FILES['upload_file']['name']);
        $file_name = deldot($file_name);//删除文件名末尾的点
        $file_ext = strrchr($file_name, '.');
        $file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
        $file_ext = trim($file_ext); //首尾去空
```

### bypass

因此直接大小写绕过对后缀名做手脚：

![](https://i.loli.net/2021/02/13/t6z3HOJNPckVU4b.png)

打开即可~

不过不知道之前apache配置错了一些啥--直接给我500了，明明以前还行QAQ

配置环境，苦不堪言

## pass7（黑名单-空格绕过）

### 分析

去掉了`trim($file_ext)`函数（首尾去空）

```php
$deny_ext = array(".php",".php5",".php4",".php3",".php2",".html",".htm",".phtml",".pht",".pHp",".pHp5",".pHp4",".pHp3",".pHp2",".Html",".Htm",".pHtml",".jsp",".jspa",".jspx",".jsw",".jsv",".jspf",".jtml",".jSp",".jSpx",".jSpa",".jSw",".jSv",".jSpf",".jHtml",".asp",".aspx",".asa",".asax",".ascx",".ashx",".asmx",".cer",".aSp",".aSpx",".aSa",".aSax",".aScx",".aShx",".aSmx",".cEr",".sWf",".swf",".htaccess",".ini");
        $file_name = $_FILES['upload_file']['name'];
        $file_name = deldot($file_name);//删除文件名末尾的点
        $file_ext = strrchr($file_name, '.');
        $file_ext = strtolower($file_ext); //转换为小写
        $file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
```

### bypass

空格绕过：

原理：在windows中，会自动去掉文件后缀名末尾处的空格

抓包，直接在`.php`后加空格即可成功上传：`".php "`

![](https://i.loli.net/2021/02/13/vgNeAFd2fKhQDxE.png)

## pass8（黑名单-"."绕过）

### 分析

去掉了`deldot($file_name)`(删除文件名末尾的点)

```php
        $deny_ext = array(".php",".php5",".php4",".php3",".php2",".html",".htm",".phtml",".pht",".pHp",".pHp5",".pHp4",".pHp3",".pHp2",".Html",".Htm",".pHtml",".jsp",".jspa",".jspx",".jsw",".jsv",".jspf",".jtml",".jSp",".jSpx",".jSpa",".jSw",".jSv",".jSpf",".jHtml",".asp",".aspx",".asa",".asax",".ascx",".ashx",".asmx",".cer",".aSp",".aSpx",".aSa",".aSax",".aScx",".aShx",".aSmx",".cEr",".sWf",".swf",".htaccess",".ini");
        $file_name = trim($_FILES['upload_file']['name']);
        $file_ext = strrchr($file_name, '.');
        $file_ext = strtolower($file_ext); //转换为小写
        $file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
        $file_ext = trim($file_ext); //首尾去空
```

### bypass

"."绕过：

原理：windows中php会自动去除后缀名中最后的 “.” 的符号

同pass7，抓包在后缀名末尾加上`.`：`.php.`

![](https://i.loli.net/2021/02/13/CZIt5d8uW3e6rDT.png)

## pass9（黑名单-::$DATA绕过）

### 分析

去掉了`str_ireplace('::$DATA', '', $file_ext)`函数 (去除字符串::$DATA)

```php
$deny_ext = array(".php",".php5",".php4",".php3",".php2",".html",".htm",".phtml",".pht",".pHp",".pHp5",".pHp4",".pHp3",".pHp2",".Html",".Htm",".pHtml",".jsp",".jspa",".jspx",".jsw",".jsv",".jspf",".jtml",".jSp",".jSpx",".jSpa",".jSw",".jSv",".jSpf",".jHtml",".asp",".aspx",".asa",".asax",".ascx",".ashx",".asmx",".cer",".aSp",".aSpx",".aSa",".aSax",".aScx",".aShx",".aSmx",".cEr",".sWf",".swf",".htaccess",".ini");
        $file_name = trim($_FILES['upload_file']['name']);
        $file_name = deldot($file_name);//删除文件名末尾的点
        $file_ext = strrchr($file_name, '.');
        $file_ext = strtolower($file_ext); //转换为小写
        $file_ext = trim($file_ext); //首尾去空
```

### bypass

::$DATA绕过：

原理：利用了Windows下NTFS文件系统的一个特性，即NTFS文件系统存储数据流的一个属性DATA。
当访问test.php::$DATA时，实际是请求test.php本身的数据

又说：windows下，php，在文件名后面加上`::$DATA`系统会把它当作文件流来进行处理，不会检测文件的后缀名，且保留::$DATA之前的文件名以及后缀

还有一个说法是：Windows系统下，如果上传的文件名中test.php::$DATA会在服务器上生成一个test.php的文件，其中内容和所上传文件内容相同，并被解析。



同7、8，抓包在后缀加上`::$DATA`即可：

![](https://i.loli.net/2021/02/13/5fzWIStRhy3Xqkr.png)

访问路径的时候要注意去掉后缀`::$DATA`才能成功访问，否则找不到文件

![](https://i.loli.net/2021/02/13/nZvWVDsTpyGKf2b.png)

## pass10（黑名单-代码审计）

### 分析

ps: 其他几题无非是都尝试一边，而这题在黑盒情况下属实不知该怎么做==

如下，可以看到对文件的上传路径进行了更改：拼接的是`$file_name`而不是`$file_ext`（pass5也是）

而在源码中$file_name的过滤措施只是简单的去掉文件名末尾的点，使用`'. .'`即可bypass（即`'. .'`经deldot()得到``'. '``）

            $img_path = UPLOAD_PATH.'/'.$file_name;
            $img_path = UPLOAD_PATH.'/'.date("YmdHis").rand(1000,9999).$file_ext;	#原

```php
$deny_ext = array(".php",".php5",".php4",".php3",".php2",".html",".htm",".phtml",".pht",".pHp",".pHp5",".pHp4",".pHp3",".pHp2",".Html",".Htm",".pHtml",".jsp",".jspa",".jspx",".jsw",".jsv",".jspf",".jtml",".jSp",".jSpx",".jSpa",".jSw",".jSv",".jSpf",".jHtml",".asp",".aspx",".asa",".asax",".ascx",".ashx",".asmx",".cer",".aSp",".aSpx",".aSa",".aSax",".aScx",".aShx",".aSmx",".cEr",".sWf",".swf",".htaccess",".ini");

        $file_name = trim($_FILES['upload_file']['name']);
        $file_name = deldot($file_name);//删除文件名末尾的点

        $file_ext = strrchr($file_name, '.');
        $file_ext = strtolower($file_ext); //转换为小写
        $file_ext = str_ireplace('::$DATA', '', $file_ext);//去除字符串::$DATA
        $file_ext = trim($file_ext); //首尾去空
        
        if (!in_array($file_ext, $deny_ext)) {
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH.'/'.$file_name;
            #原$img_path = UPLOAD_PATH.'/'.date("YmdHis").rand(1000,9999).$file_ext;
            if (move_uploaded_file($temp_file, $img_path)) {
                $is_upload = true;
            } else {
                $msg = '上传出错！';
            }
        }
```

### bypass

抓包，在后缀加上`'. .'`：

![](https://i.loli.net/2021/02/13/87fqU23YhwFBseS.png)

最终得到的文件后缀为`'. '`

![](https://i.loli.net/2021/02/13/Ufm2tkGdD14Hai9.png)

## pass11（黑名单-双写绕过）

### 分析

直接上传，发现将后缀名置换为空了，这时候可以试一下大小写、双写

![](https://i.loli.net/2021/02/13/tHw2vsWTYKxJb7f.png)

### bypass

大小写（PhP）仍被置换为空

尝试双写绕过：

![](https://i.loli.net/2021/02/13/ZJQNa5wS814hl7F.png)

成功啦

看一下源码**（将符号数组deny_ext的全部置换为空）**

```php
$deny_ext = array("php","php5","php4","php3","php2","html","htm","phtml","pht","jsp","jspa","jspx","jsw","jsv","jspf","jtml","asp","aspx","asa","asax","ascx","ashx","asmx","cer","swf","htaccess","ini");

        $file_name = trim($_FILES['upload_file']['name']);
        $file_name = str_ireplace($deny_ext,"", $file_name);#将符号数组deny_ext的全部置换为空
        $temp_file = $_FILES['upload_file']['tmp_name'];
        $img_path = UPLOAD_PATH.'/'.$file_name;        
```



## pass12（白名单-00截断GET）

### 分析

随便上传个php文件，提示只能上传jpg、png、gif（白名单）

![](https://i.loli.net/2021/02/13/5cjsuKXEQq9l7Bg.png)

源码：

```php
$ext_arr = array('jpg','png','gif');
    $file_ext = substr($_FILES['upload_file']['name'],strrpos($_FILES['upload_file']['name'],".")+1);
    if(in_array($file_ext,$ext_arr)){
        $temp_file = $_FILES['upload_file']['tmp_name'];
        $img_path = $_GET['save_path']."/".rand(10, 99).date("YmdHis").".".$file_ext;
```

提示：上传路径可控，即可通过url传参`save_path`控制最终路径

```php
 $img_path = $_GET['save_path']."/".rand(10, 99).date("YmdHis").".".$file_ext;
```

由此：

1.上传后缀为jpg | png | gif 的文件实现上传

2.利用save_path实现00截断

### bypass

00截断：

这里是通过上传save_path截断文件名~

条件：

> PHP < 5.3.4
>
> magic_quotes_gpc 关闭

原理：

> `0x00`是字符串的结束标志符，所以php在读取到`0x00`时就不会再往后读取，可以利用这些截断字符后面不需要的内容
>
> php的一些函数的底层是C语言，而move_uploaded_file就是其中之一，遇到0x00会截断
>
> 0x表示16进制，URL中%00解码成16进制就是0x00

利用：

1.上传info.jpg（要抓包！！！）

```php
<?php phpinfo(); ?>
```

抓包：

url中传参控制上传路径：`save_path=../upload/info.php%00`

![](https://i.loli.net/2021/02/13/lw5OPL4GNtpTmAa.png)

上传后得到的路径为：![](https://i.loli.net/2021/02/13/Q3HwEo7D6nxcvuO.png)

如果直接访问会404，要删掉php后面那一段才能成功访问，如下：

![](https://i.loli.net/2021/02/13/yH6smeXqw3DAE8L.png)

## pass13（白名单-00截断post）

### 分析

随便上传个php文件，提示只能上传jpg、png、gif（白名单）

![](https://i.loli.net/2021/02/13/5cjsuKXEQq9l7Bg.png)

源码：与12不同的是：`$_POST['save_path']`使用post传参

```php
 $ext_arr = array('jpg','png','gif');
    $file_ext = substr($_FILES['upload_file']['name'],strrpos($_FILES['upload_file']['name'],".")+1);
    if(in_array($file_ext,$ext_arr)){
        $temp_file = $_FILES['upload_file']['tmp_name'];
        $img_path = $_POST['save_path']."/".rand(10, 99).date("YmdHis").".".$file_ext;
```



### bypass

因为是POST型，无法在url中修改

先将路径改为`../upload/info.phpa`；这里的a是为了方便后面修改为0x00

![](https://i.loli.net/2021/02/13/Wnyzeft93PbLgoG.png)

00截断的00是ascii码中字符串终止的标志，十六进制的0x00亦同，因此我们选择hex，然后找到a的十六进制61所在，将其改为00

![](https://i.loli.net/2021/02/13/LefqkVtg7c8ayH9.png)

放包即可

访问时同12，需将php后的东西都删掉，不然就会404

![删掉前](https://i.loli.net/2021/02/13/jtyLAs6GxVzQmgF.png)
![删掉后](https://i.loli.net/2021/02/13/cFpTkiMxnRU164I.png)



## pass14（图片🐎）

### 分析

如图：

![](https://i.loli.net/2021/02/13/nbCm3BrocN8FweK.png)

那么咱们就来上传图片🐎吧

并且提示：本pass检查图标内容开头2个字节

也就是说单纯包含一句话木马，只是修改个后缀名是不行的，必须具有图片特征(也就是图片头啦)。在很多ctf题也有这样的要求~

> 取一部分--
>
> JPG:`ÿØÿà..JFIF..........ÿ` 
>
> ​			hex:`FF D8 FF E0 00 10 4A 46 49 46 00 01 01 00 00 01 00 01 00 00 FF`
>
> 
>
> PNG:`‰PNG........IHDR`	
>
> ​			hex:`89 50 4E 47 0D 0A 1A 0A 00 00 00 0D 49 48 44 52`
>
> 
>
> GIF: `GIF89a#`						
>
> ​			hex:`47 49 46 38 39 61 23`

并且图片马需要搭配文件包含漏洞使用~

### bypass

1、准备`图片🐎`

图片马的原理是不破坏文件本身的渲染情况下找一个空白区进行填充代码，一般会是图片的注释区

一个正常图片 1.jpg；一个包含🐎的1.php文件；合并后得到名为2.jpg的图片🐎

```shell
#cmd中：
#/b指定以二进制格式复制、合并文件; 用于图像类/声音类文件
#/a指定以ASCII格式复制、合并文件。用于txt等文档类文件
copy  1.jpg/b + 1.php/a  2.jpg
```

或者直接十六进制打开图片，将一句话木马插入最底层

![](https://i.loli.net/2021/02/13/uOTLmlvSxt8aeRr.png)

2、上传木马，然后利用文件包含漏洞读取

这里我们利用的是upload-labs自带的include.php，路径如下

![](https://i.loli.net/2021/02/13/ag5bkDSr2vVnYAw.png)

传参 `file=图片🐎路径`即可,如下

![](https://i.loli.net/2021/02/13/KdpkFAJ9ZP14GHI.png)

此处我上传的图片马分为两部分，属于图片部分的仅是上图窗口左上角那些，作为判断图片类型的标准

源码：

```php
function getReailFileType($filename){
    $file = fopen($filename, "rb");
    $bin = fread($file, 2); //只读2字节；读取上传文件的前两个字节内容
    fclose($file);
    $strInfo = @unpack("C2chars", $bin);    #unpack解码
    $typeCode = intval($strInfo['chars1'].$strInfo['chars2']);    #转换为10进制（默认为10进制）
    $fileType = '';    
    switch($typeCode){      #根据转换后的结果判断图片类型
        case 255216:            
            $fileType = 'jpg';
            break;
        case 13780:            
            $fileType = 'png';
            break;        
        case 7173:            
            $fileType = 'gif';
            break;
        default:            
            $fileType = 'unknown';
        }    
        return $fileType;
}
```

## pass15（图片🐎-getimagesize）

### 分析

同样是上传图片马，来看一下判断函数~

tips:使用getimagesize()检查是否为图片文件

源码：

```php
function isImage($filename){
    $types = '.jpeg|.png|.gif';
    if(file_exists($filename)){
        $info = getimagesize($filename);    		#获取图像信息，返回值为包含图像信息的数组
        $ext = image_type_to_extension($info[2]);	#获取图像类型的文件扩展名
        if(stripos($types,$ext)>=0){
            return $ext;
        }else{
            return false;
        }
    }else{
        return false;
    }
}
```

```php
相关的函数说明：
getimagesize(string $filename [,array &$imageinfo])//获取图像信息，返回一个数组
/*
返回的数组中，	索引0：图像宽度像素值
			 索引1：图像高度像素值
			 索引2：图像类型，1=GIF，2=JPG，3=PNG，4=SWF，5=PSD，6=BMP，7=TIFF_II，8=TIFF_MM，9=JPC，10=JP2，11=JPX，12=JB2，13=SWC，14=IFF，15=WBMP，16=XBM，17=ICO，18=COUNT
			 索引3：图像宽度和高度的字符串
			 索引bits：图像的每种颜色的位数，二进制格式
			 索引channels：图像的通道值
			 索引mime：图像的MIME信息
*/
image_type_to_extension(int $imagetype [,bool $include_dot = TRUE])//获取图像类型的文件扩展名
/*
include_dot是否在扩展名前加点。默认为TRUE
*/
```

### bypass

经过测试，之前使用的仅含图片头的png和gif文件都能成功上传，但jpg类型却不行（why？？）

因此我们需要传入一个完整的图片与🐎拼接



选择图片的时候要确保不含会引发语法错误的图片

比如我选择的一个图片因为含有 ` 反引号就引发了语法错误：

![](https://i.loli.net/2021/02/13/ekRvSByhCEaODQj.png)

换一个图片就可以啦：

![](https://i.loli.net/2021/02/13/pOd4ojxsmPbQvBN.png)

最终：

![](https://i.loli.net/2021/02/13/Z8Vs3vfjFog5xlN.png)



## pass16（图片🐎-exif_imagetype）

需要开启php_exif模块

### 分析

源码：

```php
function isImage($filename){
    //需要开启php_exif模块
    $image_type = exif_imagetype($filename); #读取一个图像的第一个字节并检查其签名，判断一个图像的类型
    switch ($image_type) {
        case IMAGETYPE_GIF:
            return "gif";
            break;
        case IMAGETYPE_JPEG:
            return "jpg";
            break;
        case IMAGETYPE_PNG:
            return "png";
            break;    
        default:
            return false;
            break;
    }
}
```



### bypass

按道理上传pass15的图像能过这里也能过，不过不知为啥点击上传之后啥都没了--

除了pass16其他的都挺正常的

![](https://i.loli.net/2021/02/13/KdN9o3rWCQcvDLq.png)



## pass17（图片🐎-重新渲染）

### 分析

判断后缀与MIME类型是否符合要求，符合后生成新图像（内容不正确会失败，返回false，相当于多了一次验证），生成新图像失败就`unlink`删除，成功就根据系统时间给文件命名，再通过`imagejpeg`类似函数使用原图像资源创建新图像（二次渲染）

源码：

```php
调用了php的GD库，提取了文件中的图片数据，然后再重新渲染，这样图片中插入的恶意代码就会被过滤掉了
// 获得上传文件的基本信息，文件名，类型，大小，临时文件路径
    $filename = $_FILES['upload_file']['name'];
    $filetype = $_FILES['upload_file']['type'];
    $tmpname = $_FILES['upload_file']['tmp_name'];

    $target_path=UPLOAD_PATH.'/'.basename($filename);

    // 获得上传文件的扩展名
    $fileext= substr(strrchr($filename,"."),1);

    //判断文件后缀与类型，合法才进行上传操作
    if(($fileext == "jpg") && ($filetype=="image/jpeg")){
        if(move_uploaded_file($tmpname,$target_path)){
            //使用上传的图片生成新的图片
            $im = imagecreatefromjpeg($target_path);

            if($im == false){
                $msg = "该文件不是jpg格式的图片！";
                @unlink($target_path);
            }else{
                //给新图片指定文件名
                srand(time());
                $newfilename = strval(rand()).".jpg";
                //显示二次渲染后的图片（使用用户上传图片生成的新图片）
                $img_path = UPLOAD_PATH.'/'.$newfilename;
                imagejpeg($im,$img_path);
                @unlink($target_path);
                $is_upload = true;
            }
        } else {
            $msg = "上传出错！";
        }

    }else if(($fileext == "png") && ($filetype=="image/png")){
        if(move_uploaded_file($tmpname,$target_path)){
            //使用上传的图片生成新的图片
            $im = imagecreatefrompng($target_path);

            if($im == false){
                $msg = "该文件不是png格式的图片！";
                @unlink($target_path);
            }else{
                 //给新图片指定文件名
                srand(time());
                $newfilename = strval(rand()).".png";
                //显示二次渲染后的图片（使用用户上传图片生成的新图片）
                $img_path = UPLOAD_PATH.'/'.$newfilename;
                imagepng($im,$img_path);

                @unlink($target_path);
                $is_upload = true;               
            }
        } else {
            $msg = "上传出错！";
        }

    }else if(($fileext == "gif") && ($filetype=="image/gif")){
        if(move_uploaded_file($tmpname,$target_path)){
            //使用上传的图片生成新的图片
            $im = imagecreatefromgif($target_path);
            if($im == false){
                $msg = "该文件不是gif格式的图片！";
                @unlink($target_path);
            }else{
                //给新图片指定文件名
                srand(time());
                $newfilename = strval(rand()).".gif";
                //显示二次渲染后的图片（使用用户上传图片生成的新图片）
                $img_path = UPLOAD_PATH.'/'.$newfilename;
                imagegif($im,$img_path);

                @unlink($target_path);
                $is_upload = true;
            }
        } else {
            $msg = "上传出错！";
        }
    }else{
        $msg = "只允许上传后缀为.jpg|.png|.gif的图片文件！";
    }
}
```

相关函数：

```php
basename(string $path [,string $suffix]) //返回路径中的文件名部分
imagecreatefromjpeg(string $filename)
imagecreatefrompng(string $filename) 
imagecreatefromgif(string $filename) //由文件或URL创建一个新图像，内容不对则失败返回false，成功后返回图像资源
srand([int $seed ]) //用seed播下随机数发生器种子
strval(mixed $var) //返回字符串类型的var
imagejpeg(resource $image [,string $filename [,int $quality]])//从image图像以filename为文件名创建一个JPEG图像
imagepng(resource $image [,string $filename]) //从 image 图像以filename为文件名创建一个PNG图像或文件
imagegif(resource $image [,string $filename]) //从 image 图像以filename为文件名创建一个GIF图像或文件
```



### bypass

使用容易绕过二次渲染的gif文件

1、制作gif格式的图片🐎，上传。

2、尝试是否能利用，若不能利用则将其下载，与原🐎进行比较，寻找二次渲染不改变的地方插入🐎

（jpg原理类似，而png可以将🐎放在CBC或者IDAT块来绕过二次渲染）

![渲染后](https://i.loli.net/2021/02/13/JLmRVfIl4TSWvsi.png)

![插入](https://i.loli.net/2021/02/13/IxFM4hN5UVGiJnQ.png)

成功利用：


![成功解析](https://i.loli.net/2021/02/13/lT3AnLyM9vtFRH8.png)

## pass18（白名单-条件竞争-文件删除）

### 分析

tips：`只允许上传.jpg|.png|.gif类型文件！`，需要代码审计

源码：

```php
$is_upload = false;
$msg = null;

if(isset($_POST['submit'])){
    $ext_arr = array('jpg','png','gif');
    $file_name = $_FILES['upload_file']['name'];
    $temp_file = $_FILES['upload_file']['tmp_name'];
    $file_ext = substr($file_name,strrpos($file_name,".")+1);#获取文件后缀
    #strrops,计算指定字符串在目标字符串中最后一次出现的位置，这里目的是返回"."在filename中最后出现的位置
    $upload_file = UPLOAD_PATH . '/' . $file_name;

    if(move_uploaded_file($temp_file, $upload_file)){#将上传的文件移动到新位置
        if(in_array($file_ext,$ext_arr)){#检查文件后缀，符号jpg|png|gif则重命名
             $img_path = UPLOAD_PATH . '/'. rand(10, 99).date("YmdHis").".".$file_ext;#文件重命名
             rename($upload_file, $img_path); #将upload_file重命名为img_path 
             $is_upload = true;
        }else{#不符合则删除文件
            $msg = "只允许上传.jpg|.png|.gif类型文件！";
            unlink($upload_file);#不符合则使用unlink函数删除
        }
    }else{
        $msg = '上传出错！';
    }
}
```

我们上传的文件会被存放在临时文件夹中，并且后端对文件进行判断与删除时需要一定时间

尝试条件竞争

通过发送并发包（也就是发很多个包~重复上传php文件），利用后端判断、删除的时间差，不断访问我们上传的文件（目的时让中间件解析上传文件）



因为我们上传的php文件最终都会被删除，因此最终绕过的方法是上传内容为`<?php fputs(fopen('info.php','w'),'<?php phpinfo(); ?>');?>`的php文件，再不断访问上传文件达成解析的目的。

解析成功的话就能在同目录下写入一个包含`<?php phpinfo(); ?>`的info.php文件了

### bypass

条件竞争：（多线程、同时、同一个文件）

发生在多个线程同时访问同一个共享代码、变量、文件等没有进行锁操作或者同步操作的场景中

由此进行bypass



1、抓上传包和访问包；并发送到intruder模块

![](https://i.loli.net/2021/02/13/3Uwh12sjIaq6Hgf.png)![](https://i.loli.net/2021/02/13/Dkfr7MCcu1eOyTL.png)

2、利用intruder重复发送、访问，从而达成解析上传文件的目的~

在url中添加参数a=1（作为payload的攻击参数），payload选择numeber输个合适的范围就可以了

![](https://i.loli.net/2021/02/13/maQlK6NdA9tCcgo.png)

将线程数调大

![](https://i.loli.net/2021/02/13/t6T3eJYRMp1yizc.png)

状态码回显200，访问成功了，说明其中的代码被成功解析

![](https://i.loli.net/2021/02/13/cqOZ7MaA6f2XLYy.png)

尝试访问：

![](https://i.loli.net/2021/02/13/4vGt5wQp3dFqV8i.png)

成功啦



## pass19（白名单-条件竞争-）

### 分析

```php
//index.php
$is_upload = false;
$msg = null;
if (isset($_POST['submit']))
{
    require_once("./myupload.php");
    $imgFileName =time();
    $u = new MyUpload($_FILES['upload_file']['name'], $_FILES['upload_file']['tmp_name'], $_FILES['upload_file']['size'],$imgFileName);
    $status_code = $u->upload(UPLOAD_PATH);
    switch ($status_code) {
        case 1:
            $is_upload = true;
            $img_path = $u->cls_upload_dir . $u->cls_file_rename_to;
            break;
        case 2:
            $msg = '文件已经被上传，但没有重命名。';
            break; 
        case -1:
            $msg = '这个文件不能上传到服务器的临时文件存储目录。';
            break; 
        case -2:
            $msg = '上传失败，上传目录不可写。';
            break; 
        case -3:
            $msg = '上传失败，无法上传该类型文件。';
            break; 
        case -4:
            $msg = '上传失败，上传的文件过大。';
            break; 
        case -5:
            $msg = '上传失败，服务器已经存在相同名称文件。';
            break; 
        case -6:
            $msg = '文件无法上传，文件不能复制到目标目录。';
            break;      
        default:
            $msg = '未知错误！';
            break;
    }
}

//myupload.php
class MyUpload{

  var $cls_arr_ext_accepted = array(
      ".doc", ".xls", ".txt", ".pdf", ".gif", ".jpg", ".zip", ".rar", ".7z",".ppt",
      ".html", ".xml", ".tiff", ".jpeg", ".png" );

  /** upload()
   **
   ** Method to upload the file.
   ** This is the only method to call outside the class.
   ** @para String name of directory we upload to
   ** @returns void
  **/
  function upload( $dir ){
    
    $ret = $this->isUploadedFile();# 判断文件是否是通过 HTTP POST 上传的
    
    if( $ret != 1 ){
      return $this->resultUpload( $ret );
    }

    $ret = $this->setDir( $dir );
    if( $ret != 1 ){
      return $this->resultUpload( $ret );
    }

    $ret = $this->checkExtension();
    if( $ret != 1 ){
      return $this->resultUpload( $ret );
    }

    $ret = $this->checkSize();
    if( $ret != 1 ){
      return $this->resultUpload( $ret );    
    }
    
    // if flag to check if the file exists is set to 1
    if( $this->cls_file_exists == 1 ){
      
      $ret = $this->checkFileExists();
      if( $ret != 1 ){
        return $this->resultUpload( $ret );    
      }
    }

    // if we are here, we are ready to move the file to destination
    $ret = $this->move();
    if( $ret != 1 ){
      return $this->resultUpload( $ret );    
    }

    // check if we need to rename the file
    if( $this->cls_rename_file == 1 ){
      $ret = $this->renameFile();
      if( $ret != 1 ){
        return $this->resultUpload( $ret );    
      }
    }
      
    // if we are here, everything worked as planned :)
    return $this->resultUpload( "SUCCESS" );
  
  }
};
```

依次检查文件是否存在、文件名是否可写、检查后缀（白名单）、检查文件大小、检查临时文件存在、保存到临时目录里、然后再重命名



与pass18的相比，增添了检查文件后缀的waf，要求文件后缀必须是 jpg | png | gif



### bypass

#### 条件竞争（重命名）+ 图片马 + 文件包含

上传图片🐎，利用include.php文件包含写入shell

这里想要解析图片🐎需要利用文件包含漏洞，使用自带的include.php就行了

图片🐎插入语句仍为：`<?php fputs(fopen('info.php','w'),'<?php phpinfo(); ?>');?>`

像pass18一样，抓上传包和访问包不断重发，利用重命名的时间差即可成功访问文件

（这里可能源码有问题，upload和文件名少了/；如upload/compare.jpg变成了uploadcompare.jpg;访问的时候注意一下）

![](https://i.loli.net/2021/02/13/N1qoDxCHAzZkT6a.png)

可以看到info被成功写入了，访问即可

![](https://i.loli.net/2021/02/13/eKmtIRpy3aj2XkP.png)



#### 条件竞争（重命名）+ 利用apache解析漏洞

官方环境要求使用的apache版本为2.4.10；可以使用apache解析漏洞

> apache解析漏洞：
> Apache默认一个文件可以有多个以点.分割的后缀，当右边的后缀无法识别，则继续向左识别，发现后缀是php,交个php处理这个文件。（即从右向左识别，遇到无法无法识别的后缀则跳过）

因此我们可以上传后缀为`.php.jpg`的文件，然后不断访问`xxx.php.jpg`即可解析

该文件插入语句仍为：`<?php fputs(fopen('info.php','w'),'<?php phpinfo(); ?>');?>`

解析后生成info.php在同目录下，访问即可

（似乎直接以该文件作为🐎来连接也可以？）



## pass20（黑名单）

### 分析

![](https://i.loli.net/2021/02/13/xMJU9omDzHsjWB8.png)

允许我们自定义文件名，但存在黑名单，无法直接上传php这些后缀

tips：本pass的取文件名通过$_POST来获取。

```php
 $deny_ext = array("php","php5","php4","php3","php2","html","htm","phtml","pht","jsp","jspa","jspx","jsw","jsv","jspf","jtml","asp","aspx","asa","asax","ascx","ashx","asmx","cer","swf","htaccess");

        $file_name = $_POST['save_name'];
        $file_ext = pathinfo($file_name,PATHINFO_EXTENSION);
```

### bypass

之前黑名单绕过的大部分姿势都可以用上,比如大小写绕过啥的都可以

#### 00截断

具体原理看pass13，00截断要注意版本

![](https://i.loli.net/2021/02/13/zq2xaVO5isE4keb.png)

访问即可~

![](https://i.loli.net/2021/02/13/rRmhWJ9s4BSKAtI.png)



#### "."点号绕过

windows中php会自动去除后缀名中最后的 “.” 的符号

![](https://i.loli.net/2021/02/13/BP9pRLf74Ss8UKN.png)

#### 空格绕过

![](https://i.loli.net/2021/02/13/7nwLtzky4pdb68a.png)



#### ::$DATA绕过

![](https://i.loli.net/2021/02/13/H1NB3Jq8aoP42Vb.png)



## pass21（白名单-源自CTF代码审计）

### 分析

源自CTF-代码审计一波

```php
$is_upload = false;
$msg = null;
if(!empty($_FILES['upload_file'])){
    //检查MIME；修改Content-Type即可bypass
    $allow_type = array('image/jpeg','image/png','image/gif');
    if(!in_array($_FILES['upload_file']['type'],$allow_type)){
        $msg = "禁止上传该类型文件!";
    }else{
        //检查文件名
        $file = empty($_POST['save_name']) ? $_FILES['upload_file']['name'] : $_POST['save_name'];
        if (!is_array($file)) {#非数组则用explode('.', strtolower($file))分割为数组（以 . 分割）
            
            $file = explode('.', strtolower($file));#即利用 . 将文件名和后缀分离，方便后续操作
  #explode() 返回由字符串组成的数组，每个元素都是string的一个子串，它们被字符串delimiter作为边界点分割出来 
        
        }

        $ext = end($file);#取文件后缀，即数组最后一个（end()函数）
        $allow_suffix = array('jpg','png','gif');#判断后缀是否为jpg|png|gif；
        if (!in_array($ext, $allow_suffix)) {
            $msg = "禁止上传该后缀文件!";
        }else{
            
            $file_name = reset($file) . '.' . $file[count($file) - 1];
            #reset将数组指针指向数组第一个单元；count()获取file元素个数，count($file)-1即元素个数-1
            #即拼接 文件名(数组第一个单元) + . + 数组倒数第二个单元；
            
            $temp_file = $_FILES['upload_file']['tmp_name'];
            $img_path = UPLOAD_PATH . '/' .$file_name;
            if (move_uploaded_file($temp_file, $img_path)) {
                $msg = "文件上传成功！";
                $is_upload = true;
            } else {
                $msg = "文件上传失败！";
            }
        }
    }
}else{
    $msg = "请选择要上传的文件！";
}
```

由此：

1.检查MIME：修改Content-Type即可bypass

2.检查后缀名：将文件名分割取末尾元素判断，因此文件最后一个后缀必须为`jpg | png | gif`

3.重新拼接文件名：拼接 `文件名(数组第一个单元)` + `.` + `数组倒数第二个单元`；

若传入值为非数组则用`explode('.', strtolower($file))`分割为数组(以 . 分割)，为使数组值可控，需以数组形式传入

控制传入参数的数组值：`save_name[0]=info.php` ; `save_name[2]=gif`；（此处save_name[1]默认为空）

故最终拼接得到的文件名为:`save_name[0]=info.php` + `save_name[1]=null`即得`info.php `，实现绕过

### bypass

如下：抓包修改即可~


![](https://i.loli.net/2021/02/13/JZBYD9wqtifINnT.png)

最终

![](https://i.loli.net/2021/02/13/iKWd4Xn658behPG.png)

# 结语

写了两天总算写完了~过年第一章！

新年快乐♥