---
title: Git命令总结
tags: [Git总结]
categories: [插件工具]
---
## Git 升级最新版本命令
```
查看自己的git版本:  git –version
2.17.1之前的版本：git update
2.17.1之后的版本：git update-git-for-windows
```

## Git 查看提交记录详情
```
查看所有的commit提交记录：git log
查看最新的commit：git show
查看指定commit hashID的所有修改：git show <commitId>
查看某次commit中具体某个文件的修改：git show <commitId> <filename>
查看命令历史，以便确定要回到未来的哪个版本: git reflog
```

## Git分支操作命令

>1.删除本地分支：git branch -d branchName
>2.合并本地某B分支到当前分支：git merge branchNameB
>	然后需要git push 才能把merge内容推送到远程缓存分支上

### 1.本地创建新分支
```
查看本地所有分支：git branch    	注:带*号得代表显示当前得分支
创建本地分支：git branch <name>
切换本地分支：git switch <name>   Git的switch命令是2.23版本发布的新命令
创建本地：git checkout -b <name>
设置新分支推送到远程缓存(创立远程缓存分支且设置远程缓存分支拉取分支)：
git push --set-upstream origin <name>
OR
创建分支:git branch <new_branch>
将远程分支拉到本地：git fetch origin dev（dev即分支名）
检出代码并切换分支：git checkout -b dev origin/RemoteDev (dev 为本地分支名，RemoteDev为远程分支名)
```

### 2. clone分支(浅克隆后的操作)
```
拉取最近一次提交记录：git clone --depth=1 -b dev  <URL>
非浅层转换为完整的存储库,消除浅层存储库所施加的所有限制：
git fetch --unshallow
git pull  --unshallow 

由于仓库过大采用迂回方式clone：--depth=1
git clone --depth=1 -b dev <URL>
git branch dev
git switch dev
git pull –unshallow
git fetch ogrigin dev
git pull origin dev
```

### 3.创建空分支需要清理缓存
```
git branch <new_branch>
git checkout <new_branch>
注意-r后面还有跟着点+空格:git rm --cached -r . 
git clean -f –d
空分支推送:git commit --allow-empty -m "[empty] initial commit"
git push origin  <new_branch>
```

## Git提交远程缓存流程命令
### A.与远程缓存分支对比：
```
当前本地分支得git状态： git status
当前本地分支暂存代码： git stash
获取远程缓存对比分支最新消息:  git fetch
拉去远程缓存对比分支得最新消息：git pull
取出暂存代码不删除暂存代码:  git stash apply stash@{x}    x=0123456…..
	Or取出暂存代码删除暂存代码:git apply
最后查看状态： git status
```

### B.提交远程缓存：
```
查看分支状态：git status
加入本地工作区：git add . or git add <file>
加入本地缓存区：git commit –m  <message>
推送远程缓存：git push
```

### C.push操作命令
```
将本地分支推送到远程缓存(创立远程缓存分支)且设置远程缓存分支拉取分支：
git push --set-upstream origin <name>
删除远程分支：git push origin --delete dev
```

## Git stash备份/还原命令
```
查看备份区所有分支备份记录：git stash list
备份时添加备注： git stash save "message"
显示做了哪些改动：git stash show (默认使用第一个备份,即stash@{0})
  or git stash show  stash@{X}  X=0123456789
还原某个备份,但不会把备份记录列表中删除：git stash apply 
  or git stash apply stash@{X}  X=0123456789
还原某个备份,但会把备份记录列表中删除：git stash pop 
  or git stash pop stash@{X}  X=0123456789
从备份列表中删除这个记录：git stash drop  stash@{X}  X=0123456789
删除所有备份记录：git stash clear
```

## Git add命令
```
git add .  ---加入工作区
git add <file>  ---指定某个文件加入本地缓存标记
git add .的作用相反：git restore文件名字   
----进行清除工作区的改变（git chechout 文件名的作用是一样的）
```

## Git的撤销和回滚命令
### A.工作区
```
撤销部分文件的修改： git checkout -- path/to/file1 path/to/file2
	Or(git 2.23+) git restore --worktree path/to/file1 path/to/file2
撤销工作区下所有文件的修改（不包括新增文件）： git checkout -- .
	Or (git 2.23+) git restore --worktree .
将一个或多个文件回滚到指定版本：
git checkout HashID -- path/to/file1 path/to/file2
将一个或多个文件回滚到指定版本的前2个版本：
git checkout HashID ~2 -- path/to/file1 path/to/file2
将一个或多个文件回滚到指定分支版本：
git checkout develop -- path/to/file1 path/to/file2
丢弃工作区中所有不受版本控制的文件或目录：git clean -fdx
```

### B.暂存区
```
撤销add到暂存区的部分变更:
git reset -- path/to/file1 path/to/file2
	Or (git 2.23+) git restore --staged path/to/file1 path/to/file2
撤销add到暂存区的所有变更: git reset -- .   Or (git 2.23+)git restore --staged .
```


### C.本地仓库
>注意：本部分内容的前提是提交到本地仓库的commit还未push到remote。
```
修订最后一次提交的commit message：
git commit --amend -m "新的log信息"
回滚某次commit的变更（不修改历史），但会生成新的commit：
git revert [HashID]
抹去本地最新commit：
git reset --hard HEAD~1  Or  git rebase -i HEAD~1（然后旋转drop命令）
```


### D.远程仓库篇
>注意：
>由于远程仓库历史属于团队公共历史，不能随意修改，所以一般不到万不得已，不能进行修改远程历史的操作。
>如果一定要修改远程仓库历史，比如去除敏感信息，一定要提前做好团队沟通，使用reset或rebase进行回滚，然后使用git push -f强制推送。
```
针对远程仓库的历史回滚，建议使用revert操作
git revert [版本号]
回滚多个commit，但只做一次提交
git revert  [版本号]
git commit -m "revert commit1 commit2 commit3"
```
