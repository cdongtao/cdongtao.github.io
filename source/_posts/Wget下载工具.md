---
title: Wget批量下载
tags: [Wget]
categories: [PluginTool]
---

## 安装

wget 上是一个命令行下载工具,下载一个 windows 下可用的版本：[Windows binaries of GNU Wget](https://eternallybored.org/misc/wget/);

方式一:
把下载好的 wget.exe 文件放到 C:\Windows\System32 目录下就可以用了。去命令行下用:wget -V 来测试一下，如果出现 wget 信息则 wget 命令就可以正常使用了。

方式二:

1. 打开『系统属性』，点击左侧的『高级系统设置』
2. 点击『高级』选项卡，然后点击『环境变量』
3. 点击环境变量中的『 Path 』然后点击『编辑』

## 应用

用 wget 发送 post 请求

    wget --post-data="DDDDD=学号&upass=密码&0MKKey=" http://10.3.8.211

## 使用命令

而要让档案自动储存到指令的目录下，则需要借用-P 这个参数，可以使用以下的指令

    wget -P 目录 网址
    举例来说，如果你要放到/root底下，你可以打下列的指令：
    wget -P /root 网址
    wget -P D:\xxx.zip http://www.xdown.com/xxx.zip
    wget -O "D:\xxx.zip" http://www.xdown.com/xxx.zip

用 wget 下载东西，的确很方便，它会自动重连并断点续传。让人很放心。
经常要下载一个网站或网站的某个目录。
下载一个目录，例如下载网站 www.example.com/目录 mydir 下的所有内容

    命令如下：
    wget -r -p -k -np -nc -e robots=off http://www.example.com/mydir/
    如果要想下载整个网站，最好去除-np参数。
    wget -r -p -k -nc -e robots=off http://www.example.com/mydir/

    -r 递归；对于HTTP主机，wget首先下载URL指定的文件，然后（如果该文件是一个HTML文档的话）递归下载该文件所引用（超级连接）的所有文件（递 归深度由参数-l指定）。对FTP主机，该参数意味着要下载URL指定的目录中的所有文件，递归方法与HTTP主机类似。
    -c 指定断点续传功能。实际上，wget默认具有断点续传功能，只有当你使用别的ftp工具下载了某一文件的一部分，并希望wget接着完成此工作的时候，才 需要指定此参数。

    -nc 不下载已经存在的文件
    -np 表示不追溯至父目录，不跟随链接，只下载指定目录及子目录里的东西；
    -p 下载页面显示所需的所有文件。比如页面中包含了图片，但是图片并不在/yourdir目录中，而在/images目录下，有此参数，图片依然会被正常下 载。

    -k 修复下载文件中的绝对连接为相对连接，这样方便本地阅读。
    -o down.log 记录日记到down.log
    -e robots=off 忽略robots.txt
