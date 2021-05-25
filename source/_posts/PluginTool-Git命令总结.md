---
title: Git命令总结
tags: [Tool,Git]
categories: [PluginTool]
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
查看所有的commit提交树形结构记录:git log --oneline --decorate --color --graph
查看最新的commit：git show
查看指定commit hashID的所有修改：git show <commitId>
查看某次commit中具体某个文件的修改：git show <commitId> <filename>
查看命令历史，以便确定要回到未来的哪个版本: git reflog
```

## merge操作命令
* git merge --abort : 将会抛弃合并过程并且尝试重建合并前的状态
注:当合并开始时如果存在未commit的文件，git merge --abort在某些情况下将无法重现合并前的状态。(特别是这些未commit的文件在合并的过程中将会被修改时)
* git config branch.master.mergeoptions "--no-ff" : 如果想对特定分支(如master)禁用fast forward
* git config merge.ff false : 禁用所有分支(fast foward)
* git config --global core.mergeoptions --no-edit : 如何关闭git pull产生的merge 信息
* git config --global pull.rebase true :设置默认pull时从新定基
* git config --global branch.<name>.rebase true : 设置某个分支pull时从新定基
* git merge branch/commitId --on-ff --squash --no-edit -m "#12345" merge
* git merge branch/commitId --on-ff --no-edit -m "#12345" merge

### --log[=<n>]和 --no-log
--log[=<n>]将在合并提交时，除了含有分支名以外，还将含有最多n个被合并commit节点的日志信息。
--no-log并不会列出被合并分支得提交信息。
### --edit和-e以及--no-edit 
--edit和-e用于在成功合并、提交前调用编辑器来进一步编辑自动生成的合并信息。因此使用者能够进一步解释和判断合并的结果。
--no-edit参数能够用于接受自动合并的信息（通常情况下并不鼓励这样做）。
### --ff命令
--ff是指fast-forward命令。当使用fast-forward模式进行合并时，将不会创造一个新的commit节点。默认情况下，git-merge采用fast-forward模式。
关于fast-forward模式的详细解释，请看我的另一篇文章：一个成功的Git分支模型的“关于fast forward”一节。
### --no-ff命令
即使可以使用fast-forward模式，也要创建一个新的合并节点。这是当git merge在合并一个tag时的默认行为。


## Git分支操作命令

>1.删除本地分支：git branch -d branchName
>2.合并本地某B分支到当前分支：git merge branchNameB
>	然后需要git push 才能把merge内容推送到远程缓存分支上

### 本地创建新分支
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

### clone分支(浅克隆后的操作)
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

### 创建空分支需要清理缓存
```
git branch <new_branch>
git checkout <new_branch>
git rm --cached -r . :注意-r后面还有跟着点+空格 
git clean -f –d
或者 
git rm -rf . #清除所有git文件历史，为了空白分支
git clean -d -fx #会清除所有git clone下的所有文件，只剩.git
空分支推送:git commit --allow-empty -m "[empty] initial commit"
git push origin  <new_branch>
```

## Git提交远程缓存流程命令
### 与远程缓存分支对比：
```
当前本地分支得git状态： git status
当前本地分支暂存代码： git stash
获取远程缓存对比分支最新消息:  git fetch
拉去远程缓存对比分支得最新消息：git pull
取出暂存代码不删除暂存代码:  git stash apply stash@{x}    x=0123456…..
	Or取出暂存代码删除暂存代码:git apply
最后查看状态： git status
```

### 提交远程缓存：
```
查看分支状态：git status
加入本地工作区：git add . or git add <file>
加入本地缓存区：git commit –m  <message>
推送远程缓存：git push
```

### push操作命令
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

## 撤销命令reset/revert
### Git reset(修改commit记录)
git reset hashId 重置改变分支"游标"指向,适用版本回退,都不保留回退版本之后的版本记录;hard,soft,miexd对回退版本之后已经提交的版本内容处理
git reset --hard hashId 回退到某一个版本，清空暂存区，将已提交的内容版本恢复到本地,本地内容被恢复覆盖
git reset --soft hashId 回退到某一个版本，不清空暂存区，将已提交的内容版本复制到本地,不影响本地内容
git reset --mixed hashId 回退到某一个版本，不清空暂存区，将已提交的内容版和本地已提交内容全部恢复到暂存区,不影响本地内容
注:如果reset后重新push,会记录在reset后hashId后面

### Git revert(保持commit记录)
git revert commitId:
将在当前版本将指定commitId的版本提交删除(撤销),直接生成新的commitId提交,接在最新提交的版本后面

git revert 与 git reset 区别:
git reset:需要重新push,而且不保留恢复指定版本之后的记录,可以通过hard,soft,miexd对回退版本之后已经提交的版本内容处理
git rever:将某commitId版本删除,且保留此版本之后的提交的版本，

## Git remote命令
git remote -v 显示远程库详细信息
git remote remove branchName 删除远程库


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

git修改远程仓库地址 
方法有三种：
1.修改命令
git remote origin set-url [url]
2.先删后加
git remote rm origin
git remote add origin [url]
3.直接修改config文件
```

## rebase(变基)命令
### 改变产生分支起点位置
dev:git rebase <branchA>//会将当前dev分支的提交复制到指定的branchA分支之上
git rebase --continue
git rebase --abort
![git-rebase1](/img/git-rebase1.png "git-rebase1")
![git-rebase2](/img/git-rebase2.png "git-rebase2")

上面这个例子展示了在 master 分支上的变基，提交创建新的hash时会修改项目的历史记录。但是，在更大型的项目中，你通常不需要这样的操作。

变基与合并区别：
　　有一个重大的区别：Git 不会尝试确定要保留或不保留哪些文件。我们执行rebase的分支总是含有我们想要保留的最新近的修改！这样我们不会遇到任何合并冲突，而且可以保留一个漂亮的、线性的 Git 历史记录；git merge 需要解决冲突才能合并

注:因为dev分支 git rebase 只是改变了dev最初产生分支的指针,指针指向了master在最新提交后面形成直线,同样的会合并最新提交代码，冲突部分以dev分支为主,有覆盖的master分支的危险,因此要使用该命令时,先把最新更新分支pull到dev,解决冲突后再rebase.

### git rebase --onto(截取区间做新分支)
// branch:分支名称 , 截取区间为: (fromCommitedId,toCommitedId]
git rebase --onto branch fromCommitedId toCommitedId

步骤:
1.当前工作空间---分支A
2.从当前工作的分支新建一个分支,并且换到该分支----git checkout -b newbranch
3.git rebase --onto B fromCommitedId toCommitedId
4.生成一个基于B分支和选择的提交区间(fromCommitedId,toCommitedId]的片段生成一个新的分支（detached Head）

### 修改commit后提交记录
#### Git修改最近后一次commit信息
1.git commit --amend : 然后就会进入vim模式
2.点击i编辑模式,按esc键退出编辑模式,:q退出，:wq保存退出

#### 修改更早提交信息
1.git rebase -i commitId 或  git rebase -i HEAD~3
	选取commitId，需要比要修改版本commitId向前一版本(见备注);head后数字代表从head开始不包括head,向后退3个版本
2.点击i编辑模式,将需要修改commit行的pick 改为r或reword,按esc键退出编辑模式,:q退出，:wq保存退出
3.自动跳回到上一步修改为r的版本修改,如果修改多个版本，每一次wq后都会到一个修改的r版本
注:commitId选取规则如图:要修改2，则需要选比2更早一条commitId作为基版,因为是在3上面提交后才有2
	![Git更改commit信息](/img/Git更改commit信息.png "Git更改commit信息")

注: git rebase -i commitId 或  git rebase -i HEAD~3 后可以将进入vim模式,按i修改替换文件pick命令及作用有:
	reword:修改提交信息
	edit:修改此提交
	squash:将提交融合到前一个提交中
	fixup:将提交融合到前一个提交中，不保留该提交的日志消息
	exec:在每个提交上运行我们想要 rebase 的命令
	drop:移除该提交

#### Cherry-picking(拣选)
master:git Cherry-picking <dev-commitId> //将dev分支上的某个提交merge到master,而不是dev全部提交
注意与git merge commitId 区别

假设 dev 分支上的提交 76d12 为 index.js 文件添加了一项修改，而我们希望将其整合到 master 分支中。我们并不想要整个 dev 分支，而只需要这个提交
![Cherry-picking1](/img/Cherry-picking1.png "Cherry-picking1")

#### Reflog(还原)
git reflog:是一个非常有用的命令,可以展示已经执行过的所有动作的日志。包括合并、重置、还原，基本上包含你对你的分支所做的任何修改。.
根据 reflog 提供的对比分支信息通过重置 HEAD 来轻松地重做！
假设我们实际上并不需要合并原有分支。当我们执行 git reflog 命令时，我们可以看到这个 repo 的状态在合并前位于 HEAD@{1}。那我们就执行一次 git reset，将 HEAD 重新指向在 HEAD@{1} 的位置。
![reflog1](/img/reflog1.png "reflog1")
![reflog2](/img/reflog2.png "reflog2")

## 解决冲突
<<<<<<< HEAD
Creating a new branch is quick & simple
=======
Creating a new branch is quick AND simple
>>>>>>> feature1

1.在<<<<<<<  =======之间为自己的代码
2.在=======  >>>>>>>之间为别人的代码。
如果保留自己的代码，将别人的代码删掉即可。

