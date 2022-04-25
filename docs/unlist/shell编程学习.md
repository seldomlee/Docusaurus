---
title: shell编程学习
id: shell编程学习
---

<!-- more -->



## shell基础

算是学习[Shell脚本：Linux Shell脚本学习指南（超详细） (biancheng.net)](http://c.biancheng.net/shell/)的一些笔记吧

### 啥是shell

- 操作系统可以分为内核(kernel)和外壳(shell)，其中shell是操作系统和外部的接口，主要是充当用户和内核的桥梁。

- shell管理着用户和操作系统间的交互，不同系统有不同shell：
  如bash(Linux 的默认 shell)、csh、sh、windows powershell等

  像windows中的桌面(explorer.exe)就是图形shell，而cmd就是命令行shell

- shell是一个程序，一般放在`/bin`或是`/usr/bin`下
  linux中可用shell都记录在一个纯文本文件`/etc/shells`中
  当前使用的shell也被存放在环境变量`SHELL`中

  ```sh
  cat /etc/shells
  echo $SHELL
  ```

  ![](https://s2.loli.net/2022/04/17/VdN2ejhsyxpOLDS.png)

  

- 区别一下dos和shell：

  - dos是disk os，是一个完整的操作系统
  - shell是一个壳层，相对于kernel（核）是操作系统最外面的部分

### 如何进入shell

#### 方法1--进入linux控制台

这种方法属于让linux系统退出图形化界面，进入控制台模式

现代linux系统启动时会自动创建几个虚拟控制台，其中一个共图形桌面程序使用，其余的保留原生控制台的样子

切换方法：`Ctrl+Alt+Fn(n=1,2,3,4,5)`，通常来说1号控制台是图形桌面程序

#### 方法2--linux终端

这种就是直接用linux桌面环境中的终端模拟包，也就是terminal

### shell命令

Shell 命令又包括内置命令和外部命令

- 一个内置命令就是一个内部的函数
  一个外部命令就是一个应用程序

- 可以使用`type`来确定一个命令是内置命令还是外部命令

  ![](https://s2.loli.net/2022/04/17/RHc8NYZW49E63Ba.png)

- 至于外部程序是如何变成shell命令的呢？
  这离不开环境变量`PATH`，它保存了shell对外部命令的查找路径。
  输入外部命令后，shell就会在这些路径中寻找同名文件，如果找不到也不会去其他地方寻址，会直接报错

  ```sh
  echo $PATH
  ```

  不同的路径间以`:`分隔
  ![](https://s2.loli.net/2022/04/17/rgjAoIMwGDW4LlX.png)

- 根据上面的说法，自己用C/C++写一个程序把它放在环境变量指向的路径中，或者修改PATH添加路劲，就可以让我们的程序称为shell命令
  （想到环境变量劫持提权）

Shell命令的基本格式如下：（命令后的所有数据都以参数形式传递给了函数）

```sh
command [选项] [参数]
```

### shell的运行方式

> Shell 一共有四种运行方式：
>
> - 交互式的登录 Shell；
> - 交互式的非登录 Shell；
> - 非交互式的登录 Shell；
> - 非交互式的非登录 Shell。

#### 判断是否为交互式

判断方法：

1) 查看变量-的值，如果值中包含了字母i，则表示交互式（interactive）

```sh
echo $-
```

2) 查看变量`PS1`的值，如果非空，则为交互式，否则为非交互式，因为非交互式会清空该变量

```
echo $PS1 
```

![](https://s2.loli.net/2022/04/17/txpdkMwDj6ZCh5l.png)

#### 判断是否为登录式

只需执行`shopt login_shell`即可：

- `on`表示为登录式
- `off`为非登录式。

那么要同时判断是否为交互式和登录式，可以简单使用如下的命令：

```sh
echo $PS1; shopt login_shell
# 或者
echo $-; shopt login_shell
```

> 1. Linux 控制台(非终端) 或 ssh 登录 Shell —— 为交互式的登录 Shell
> 2. 执行bash命令时 —— 默认为非登录，增加 `--login`(简写`-l`)后变为登录式
> 3. 使用由`()`包围的**组命令**或者**命令替换**进入子 Shell 时——子 Shell 会继承父 Shell 的交互和登录属性
> 4. ssh执行远程命令但不登录时 —— 为非交互非登录式
> 5. linux桌面环境下打开终端 —— 为交互式非登录式

### shell配置文件

> 无论哪种方式的shell，Bash Shell 在启动时总要配置其运行环境，例如初始化环境变量、设置命令提示符、指定系统命令路径等。
>
> 这个过程是通过加载一系列配置文件完成的，这些配置文件其实就是 Shell 脚本文件。
>
> 与 Bash Shell 有关的配置文件主要有 `/etc/profile`、`~/.bash_profile`、`~/.bash_login`、`~/.profile`、`~/.bashrc`、`/etc/bashrc`、`/etc/profile.d/*.sh`，不同的启动方式会加载不同的配置文件。
>
> `~`表示用户主目录，`*`为通配符

- 如果是登录式的 Shell
  1. 首先会读取和执行**所有用户的全局配置文件**:` etc/profiles`
  2. 接着会到用户主目录(~)中寻找**用户个人的配置文件**:`~/.bash_profile`、`~/.bash_login` 或者 `~/.profile`

- 如果是非登录式的shell

  - 就不会读取上述所说的配置文件，而是直接读取`~/.bashrc`

    (**~/.bashrc 文件还会嵌套加载 /etc/bashrc**)

- 综上，无论登录还是非登录，都会加载`~/.bashrc`，
  那么可以将自己的一些代码添加到其中，
  也可以以引用文件的形式将自己编写的代码文件引入到其中
  （eg：编写一个xxx.sh，在~/.bashrc中使用如../xxx.sh的形式将其引入）



## shell编程

### 变量

#### 定义变量

命名规范：

- 变量名由数字、字母、下划线组成

- 必须以字母或者下划线开头

- 不能使用 Shell 里的关键字（通过 help 命令可以查看保留关键字）

  PS：`=`旁不能有空格

```
name=value
name='value'
name="value"
```

> 这里要注意单双引号的区别：
>
> 单引号`''`包裹的内容会原样输出
>
> 双引号`""`包裹的内容在输出时，会先解析里面的变量和命令
>
> 
>
> 也可以将命令的执行结构赋给变量：
>
> 一是用反引号，二是用`$()`
>
> ```
> variable=`command`
> variable=$(command)
> ```
>
> ![](https://s2.loli.net/2022/04/18/dK3OEhClc2okwY8.png)

#### 只读变量

可以用 `readonly` 命令可以将变量定义为只读变量

#### 删除变量

可以用`unset`命令删除变量

（变量被删除后不能再次使用；unset 命令不能删除只读变量）

![](https://s2.loli.net/2022/04/18/ptW4Fy5VfgRP2q1.png)

#### 使用变量

只要在变量名前加上`$`即可使用已定义的变量
可以加上`{}`帮助解释器确认变量名的边界

```
name=123
echo $name
echo ${name}
```

![](https://s2.loli.net/2022/04/18/lO2pkma8xNjChTX.png)

#### 变量的作用域

- 局部变量：只能在函数内部使用

  （要想变量的作用域仅限于函数内部，可以在定义时加上`local`命令）

  ```shell
  function func(){
      local a=99
  }
  ```

- 全局变量：可以在当前 Shell 进程中使用，在 Shell 函数中定义的变量默认也是全局变量

- 环境变量：可以在子进程中使用
