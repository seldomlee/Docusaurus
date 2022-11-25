---
title: ctfshow-misc入门
id: ctfshow-misc入门
---

<!-- more -->

## 前言

ctfshow misc入门，好久没打misc，随便练练



## 基本操作（1-4）

### misc1

图片就是flag

### misc2、misc4（修改后缀）

之前看的文件头总结：[各类文件的文件头尾总结_煜铭2011](https://blog.csdn.net/qq_29277155/article/details/98060616)
misc2 一个txt文件，看文件头是png后缀改成png就行

misc4给了6个txt文件，分别对应六种类型的文件，改后缀就可以了，六部分拼起来就可以得到flag

> png：头：89 50 4E 47 (‰PNG)，尾：49 45 4E 44 AE 42 60 82 (IEND®B`‚)
> jpg：头：FF D8，尾：FF D9
> bmp：头：42 4D (BM)
> gif：头：47 49 46 38 39 61 (GIF89a)，尾：00 3B
> tif：头：49 49 2A 00 (II*.)
> webp：头：52 49 46 46 (RIFF)

### misc3（bpg）

得到misc3.bpg，无法直接查看，下个工具就好：https://bellard.org/bpg/

windows下cmd输入bpgdec.exe 和 bpg图片的路径就会在当前目录下生成out.png，打开即可![](https://i.loli.net/2021/05/14/UfQVqmXdZ2HptE1.png)



## 信息附加

### misc5、6、7（在文件信息中）

用编辑器( hxd | winhex | 010editor | txt )打开，搜索即可看到flag

### misc8(文件隐写)

hint：flag在图片文件中
binwalk看到有文件隐写
linux下 foremost 分离即可

### misc9（图片块）

hint：flag在图片块里
编辑器打开搜索flag 
010editor打开的话可以在warning这里找到![](https://i.loli.net/2021/05/14/KjhFTG3iD6RVScd.png)

### misc10（IDA块、zlib）

原理八神师傅在群里说过，如下：

![](https://i.loli.net/2021/06/03/VfgSMyH6w8EpAQN.jpg)

解法1：binwalk一把梭
binwalk -e分离得到几个数据块，打开第一个即可

![](https://i.loli.net/2021/06/03/VkgHRyEfWlt48nU.png)

解法2：按照原理将这个IDA块zilb解压提取

010editor（像这样不破坏图片的一般都是插在图片末尾）跟着八神所说找IDA就行

![](https://i.loli.net/2021/06/03/7nAtgDrfcHqsQWv.png)

写个脚本引用zlib包解压一下

```python
import zlib
import binascii

IDAT = '789C4B2E492BCEC82FAF363635363235323132494C36B34C4E3233493333313637B3B030354C4C36B734A8050009960BD1'
str2 = bytes.fromhex(IDAT)
print(str2)
result = binascii.hexlify(zlib.decompress(str2))
print(result)
```

![](https://i.loli.net/2021/06/04/5uKzfSUyIe1QqVh.png)

```
输出结果：
63746673686f777b33353332353234323461633639636236346636343337363838353161633739307d
转为文本：
ctfshow{353252424ac69cb64f643768851ac790}
```

![](https://i.loli.net/2021/06/04/RaKmwrUMPZEV2QT.png)

### misc11（IDA块混淆）

010打开，看到有两个IDAT块，把试着把其中一个删掉另存为png，就可以显示另一个图片

![](https://i.loli.net/2021/06/04/JlzEMxTP1wCiYhU.png)

手动或者用[TweakPNG ](http://entropymine.com/jason/tweakpng/)都可以

![](https://i.loli.net/2021/06/04/h3MnteGIEHymLNr.png)

### misc12（同11）

同11，但这题足足有30个IDAT块，如果出题人设置的IDAT块有错的话可以用PNGDebugger跑一下

但这里都没有问题，只能手动测试。

删掉前8个IDAT块另存为PNG即可![](https://i.loli.net/2021/06/04/DKwaQWishnmLpHN.png)

### misc13（文件信息+字符混淆）

hint：flag在图片末尾

翻到底部，看到这一串有疑似ctfshow{ }的字符串

![](https://i.loli.net/2021/06/04/HPiAGUEdygsM5Ip.png)

```
ct¹f…s†hªoKw°{!aeS6¥eT446xc%4Ý8ïf«73•9b‚7ºeEb|2Td~1:däeñ6úeõ412fT8ñ329éal}
```

可以看到，每间隔一位取一字符可得到ctfshw{xxxx}，写个小脚本跑下就行，手动也可以

```python
import base64
a = "631A74B96685738668AA6F4B77B07B216114655336A5655434343678632534DD38EF66AB37103395391F628237BA6545627C3254647E313A64E465F136FA65F5341E3107321D665438F1333239E9616C7D"
b = ""
for i in range(0, len(a), 4):
    b += a[i:i+2]
print(base64.b16decode(b))
```

不过我咋跑都是ctfshow{ae6e 46c 48f739b7eb2d1de6e412f839a}，一直提交不上

问了下发现正确的是ctfshow{ae6e 3ea 48f518b7e42d7de6f412f839a}，似乎是下载文件的时候出了点问题

### misc14（jpg文件头）

hint：flag在那张图里

看提示是还藏着张图，binwalk一下可以看到位置，但是binwalk、foremost无法分离，手动一下

![](https://i.loli.net/2021/06/04/U5mDYLo3fTKatSI.png)

是在0x837，那么在010editor找到这里，把他前面那堆删掉再另存为jpg图片就可以了

![](https://i.loli.net/2021/06/04/3xLgBwPz14Ht9yX.png)

![ctfshow{ce520f767fc465b0787cdb936363e694}](https://i.loli.net/2021/06/04/1LISVYvZuFDsB7U.jpg)

### misc15（bmp隐写）

hint：flag被跳过去了

010打开就可以看到，这题的知识点是不破坏bmp结构下插入信息

![](https://i.loli.net/2021/06/04/MNmhxZ52arjktYQ.png)

### misc16（7Z）

binwalk -e 一把梭，好像和10差不多，不过这次flag在第二个7z的压缩包，区别是用了不同的压缩吧

![](https://i.loli.net/2021/06/04/3Uhlp5oGEyu6ZqA.png)



### misc17（zsteg）

hint：flag在图片数据里

binwalk可以发现有个破损的包,zteg打开，复制另存为图片就可以了

zsteg可以检测PNG和BMP图片里的隐写数据

