---
title: Windows Powershell美化之oh-my-posh的配置经历
id: Windows Powershell美化
---

<!-- more -->


<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width="330" height="86" src="//music.163.com/outchain/player?type=2&id=1856449521&auto=0&height=66"></iframe>

```
# 上面播放器的代码如下（仅网易云外链链接，其他播放器请自行百度）
<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width="330" height="86" src="//music.163.com/outchain/player?type=2&id=1856449521&auto=0&height=66"></iframe>
# width(宽度) ; height(高度)
# type = 歌曲(1) | 歌单(2) | 电台(3)
# id = 歌曲ID号
# auto = 自动播放(1) | 手动播放(0)
```



本来说wsl的字体颜色太丑了，但是以前的颜色网站找不着了就搜了一波
结果不知咋地看到powershell的美化，因为太帅了就忘记了原本搜字体主题这一回事》
(后面又找到了：[Windows Terminal Themes](https://windowsterminalthemes.dev/))

效果图如下，但是还有很多选择啦，也不一定要选俺这种主题

![](https://i.loli.net/2021/11/03/BJKW27bG1wQeiaU.png)

## 字体安装

为啥要安装字体呢，因为主题里会有很多字符可能windows本身的字体并不支持，就会显示跟白板一样的符号，非常难看

这里推一个俺用的：[microsoft/cascadia-code: This is a fun, new monospaced font that includes programming ligatures and is designed to enhance the modern look and feel of the Windows Terminal. (github.com)](https://github.com/microsoft/cascadia-code)

或者来这：[Programming Fonts - Test Drive ](https://www.programmingfonts.org/) 找个自己喜欢的吧

下载之后解压，然后如下

![](https://i.loli.net/2021/11/03/UCJc4u5ISdPVAaY.png)

也可以在 设置-》字体设置 这里操作，把这些ttf文件拖到这里就可以：

![](https://i.loli.net/2021/11/03/21d9Gx7porEnXiB.png)

## 安装并配置

参考官方文档：
[Windows Terminal Custom Prompt Setup | Microsoft Docs](https://docs.microsoft.com/en-us/windows/terminal/tutorials/custom-prompt-setup#install-a-nerd-font)

直接命令行安装，不挂代理的话可能会很慢=-=

```powershell
Install-Module oh-my-posh -Scope CurrentUser
```

安装完成后，用这个命令查看所有主题

```powershell
Get-PoshThemes
```

![](https://i.loli.net/2021/11/03/VJ21C7mgLIQx8kl.png)

可以用这个命令来切换，但是只是在当前窗口有效，重启powershell就会恢复默认的，大概是起个预览的作用

```powershell
Set-PoshPrompt -Theme 主题名称
```

如果想一打开就是你喜欢的主题，需要修改配置文件：(用记事本打开配置文件，换成你自己的文本编辑器也行)

```powershell
notepad $PROFILE
```

然后在末尾加上如下内容（如果没有该配置文件的话会提示你要不要创建一个，点是就行）

```
Import-Module oh-my-posh
Set-PoshPrompt -Theme 主题名称
```

这样就设置完成了，是不是非常简单呢，来试试看吧

![](https://i.loli.net/2021/11/03/c8VIQCiLrnZJTyS.jpg)

又水一篇博客，我应该把配置wsl踩的坑也一起丢上来！