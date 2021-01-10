---
title: Docker安装
tags: [ Docker/CICD]
categories: [DevOps]
---
[Docker入门](https://mp.weixin.qq.com/s/wquwxxGP2vW7dPfGBvR_Hg)

## 安装docker(适用CentOS 7.x / Docker CE)
```
yum install -y yum-utils device-mapper-persistent-data lvm2
# repo建议使用阿里云的，官方的docker，国内连接起来不稳定
yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
yum clean all # 清理yum
yum makecache fast # 生成yum repo缓存
yum install docker-ce # 安装docker社区版本
systemctl enable docker # 设置为开机启动
systemctl start docker # 启动docker服务
```

### 设置镜像加速器
```
vim /etc/systemd/system/multi-user.target.wants/docker.service
# registry-mirror用的是阿里云的Hub加速器，可以在https://dev.aliyun.com/search.html申请自己的专属加速器地址
# 找到ExecStart=这行，添加 --registry-mirror=https://xxxx.mirror.aliyuncs.com #使用阿里云加速
ExecStart=/usr/bin/dockerd --registry-mirror=https://xxxx.mirror.aliyuncs.com
```

### 配置docker私服地址（可选）
```
vim /etc/systemd/system/multi-user.target.wants/docker.service
# 找到ExecStart=这行，添加 --insecure-registry=hub.xxx.com
ExecStart=/usr/bin/dockerd --registry-mirror=https://xxxx.mirror.aliyuncs.com --insecure-registry=hub.xxx.com
```

### 自定义docker存储目录（可选）
```
vim /etc/systemd/system/multi-user.target.wants/docker.service
# 找到ExecStart=这行，添加  --graph /opt1/docker
ExecStart=/usr/bin/dockerd --registry-mirror=https://xxxx.mirror.aliyuncs.com --insecure-registry=hub.xxx.com  --graph /opt1/docker
```

### 重启Docker
```
systemctl daemon-reload # 重新加载daemon
systemctl restart docker # 重启docker
```

