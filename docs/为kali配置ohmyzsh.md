---
id: 为kali配置oh-my-zsh
title: 为kali配置oh-my-zsh
---

## 前言

官网：

[Oh My Zsh](https://ohmyz.sh/)

[ohmyzsh/ohmyzsh (github.com)](https://github.com/ohmyzsh/ohmyzsh)



## 先决条件

  - 类Unix操作系统：macOS，Linux，BSD
    Windows上：WSL2，cygwin或msys也可以运行

  - 已安装[Zsh](https://www.zsh.org/)，使用如下命令查看

    ```sh
    cat /etc/shells
    # 或者直接
    zsh --version
    ```

    假如未安装zsh就先安装一下：

    ```sh
    apt install zsh
    ```

  - 安装有`curl`或者`wget`（为方便后面安装ohmyzsh）

  - 安装有`git`（建议使用 v2.4.11 或更高版本）

## 安装

这里直接给GitHub上的：

> | 方法      | 命令                                                         |
> | --------- | ------------------------------------------------------------ |
> | **curl**  | `sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"` |
> | **wget**  | `sh -c "$(wget -O- https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"` |
> | **fetch** | `sh -c "$(fetch -o - https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"` |

不过我在安装的时候出现了一些问题，在我的vps上可以成功下载，但是在我的wsl下就不行，猜测是学校还是防火墙的问题？

解决方案：[installer: Failed to connect to github: Connection refused · Issue #9465 · ohmyzsh/ohmyzsh](https://github.com/ohmyzsh/ohmyzsh/issues/9465)

我选择直接把vps上的install.sh下到本地wsl里，然后运行它

```vps
sh install.sh
```

主题如下：[Themes · ohmyzsh/ohmyzsh Wiki (github.com)](https://github.com/ohmyzsh/ohmyzsh/wiki/Themes)

然后可以在`~/.zshrc`修改默认主题，
不过有些主题需要安装一些字体=-=，这里官方给的是[这个](https://github.com/powerline/fonts)

```sh
ZSH_THEME="af-magic" # (this is one of the fancy ones)
# see https://github.com/ohmyzsh/ohmyzsh/wiki/Themes#agnoster
```



## 安装插件

但是修改成zsh后我发现缺少了kali原来那种自动补全和高亮的效果，

搜索了一波发现可以安装插件来解决这个问题

### 自动补全

```
cd $ZSH/custom/plugins
git clone https://github.com/zsh-users/zsh-autosuggestions.git
```

### 语法高亮

```
cd $ZSH/custom/plugins
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git
```

### 修改`~/.zshrc`

```
vim ~/.zshrc
```

```sh
# 然后修改plugins=(git)为：（也就是把要用的插件加上）
plugins=(git zsh-autosuggestions zsh-syntax-highlighting)

# 添加source
source $ZSH/custom/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh
source $ZSH/custom/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
```

然后运行`~/.zshrc`使得配置生效：

```sh
source ~/.zshrc
```

然后重启终端即可

![](https://s2.loli.net/2022/03/29/Ik8SBDqt7p6vgOH.png)
