---
title: Git�����ܽ�
tags: [Git�ܽ�]
categories: [�������]
---
## Git �������°汾����
```
�鿴�Լ���git�汾:  git �Cversion
2.17.1֮ǰ�İ汾��git update
2.17.1֮��İ汾��git update-git-for-windows
```

## Git �鿴�ύ��¼����
```
�鿴���е�commit�ύ��¼��git log
�鿴���µ�commit��git show
�鿴ָ��commit hashID�������޸ģ�git show <commitId>
�鿴ĳ��commit�о���ĳ���ļ����޸ģ�git show <commitId> <filename>
�鿴������ʷ���Ա�ȷ��Ҫ�ص�δ�����ĸ��汾: git reflog
```

## Git��֧��������

>1.ɾ�����ط�֧��git branch -d branchName
>2.�ϲ�����ĳB��֧����ǰ��֧��git merge branchNameB
>	Ȼ����Ҫgit push ���ܰ�merge�������͵�Զ�̻����֧��

### 1.���ش����·�֧
```
�鿴�������з�֧��git branch    	ע:��*�ŵô�����ʾ��ǰ�÷�֧
�������ط�֧��git branch <name>
�л����ط�֧��git switch <name>   Git��switch������2.23�汾������������
�������أ�git checkout -b <name>
�����·�֧���͵�Զ�̻���(����Զ�̻����֧������Զ�̻����֧��ȡ��֧)��
git push --set-upstream origin <name>
OR
������֧:git branch <new_branch>
��Զ�̷�֧�������أ�git fetch origin dev��dev����֧����
������벢�л���֧��git checkout -b dev origin/RemoteDev (dev Ϊ���ط�֧����RemoteDevΪԶ�̷�֧��)
```

### 2. clone��֧(ǳ��¡��Ĳ���)
```
��ȡ���һ���ύ��¼��git clone --depth=1 -b dev  <URL>
��ǳ��ת��Ϊ�����Ĵ洢��,����ǳ��洢����ʩ�ӵ��������ƣ�
git fetch --unshallow
git pull  --unshallow 

���ڲֿ��������ػط�ʽclone��--depth=1
git clone --depth=1 -b dev <URL>
git branch dev
git switch dev
git pull �Cunshallow
git fetch ogrigin dev
git pull origin dev
```

### 3.�����շ�֧��Ҫ������
```
git branch <new_branch>
git checkout <new_branch>
ע��-r���滹�и��ŵ�+�ո�:git rm --cached -r . 
git clean -f �Cd
�շ�֧����:git commit --allow-empty -m "[empty] initial commit"
git push origin  <new_branch>
```

## Git�ύԶ�̻�����������
### A.��Զ�̻����֧�Աȣ�
```
��ǰ���ط�֧��git״̬�� git status
��ǰ���ط�֧�ݴ���룺 git stash
��ȡԶ�̻���Աȷ�֧������Ϣ:  git fetch
��ȥԶ�̻���Աȷ�֧��������Ϣ��git pull
ȡ���ݴ���벻ɾ���ݴ����:  git stash apply stash@{x}    x=0123456��..
	Orȡ���ݴ����ɾ���ݴ����:git apply
���鿴״̬�� git status
```

### B.�ύԶ�̻��棺
```
�鿴��֧״̬��git status
���뱾�ع�������git add . or git add <file>
���뱾�ػ�������git commit �Cm  <message>
����Զ�̻��棺git push
```

### C.push��������
```
�����ط�֧���͵�Զ�̻���(����Զ�̻����֧)������Զ�̻����֧��ȡ��֧��
git push --set-upstream origin <name>
ɾ��Զ�̷�֧��git push origin --delete dev
```

## Git stash����/��ԭ����
```
�鿴���������з�֧���ݼ�¼��git stash list
����ʱ��ӱ�ע�� git stash save "message"
��ʾ������Щ�Ķ���git stash show (Ĭ��ʹ�õ�һ������,��stash@{0})
  or git stash show  stash@{X}  X=0123456789
��ԭĳ������,������ѱ��ݼ�¼�б���ɾ����git stash apply 
  or git stash apply stash@{X}  X=0123456789
��ԭĳ������,����ѱ��ݼ�¼�б���ɾ����git stash pop 
  or git stash pop stash@{X}  X=0123456789
�ӱ����б���ɾ�������¼��git stash drop  stash@{X}  X=0123456789
ɾ�����б��ݼ�¼��git stash clear
```

## Git add����
```
git add .  ---���빤����
git add <file>  ---ָ��ĳ���ļ����뱾�ػ�����
git add .�������෴��git restore�ļ�����   
----��������������ĸı䣨git chechout �ļ�����������һ���ģ�
```

## Git�ĳ����ͻع�����
### A.������
```
���������ļ����޸ģ� git checkout -- path/to/file1 path/to/file2
	Or(git 2.23+) git restore --worktree path/to/file1 path/to/file2
�����������������ļ����޸ģ������������ļ����� git checkout -- .
	Or (git 2.23+) git restore --worktree .
��һ�������ļ��ع���ָ���汾��
git checkout HashID -- path/to/file1 path/to/file2
��һ�������ļ��ع���ָ���汾��ǰ2���汾��
git checkout HashID ~2 -- path/to/file1 path/to/file2
��һ�������ļ��ع���ָ����֧�汾��
git checkout develop -- path/to/file1 path/to/file2
���������������в��ܰ汾���Ƶ��ļ���Ŀ¼��git clean -fdx
```

### B.�ݴ���
```
����add���ݴ����Ĳ��ֱ��:
git reset -- path/to/file1 path/to/file2
	Or (git 2.23+) git restore --staged path/to/file1 path/to/file2
����add���ݴ��������б��: git reset -- .   Or (git 2.23+)git restore --staged .
```


### C.���زֿ�
>ע�⣺���������ݵ�ǰ�����ύ�����زֿ��commit��δpush��remote��
```
�޶����һ���ύ��commit message��
git commit --amend -m "�µ�log��Ϣ"
�ع�ĳ��commit�ı�������޸���ʷ�������������µ�commit��
git revert [HashID]
Ĩȥ��������commit��
git reset --hard HEAD~1  Or  git rebase -i HEAD~1��Ȼ����תdrop���
```


### D.Զ�ֿ̲�ƪ
>ע�⣺
>����Զ�ֿ̲���ʷ�����Ŷӹ�����ʷ�����������޸ģ�����һ�㲻���򲻵��ѣ����ܽ����޸�Զ����ʷ�Ĳ�����
>���һ��Ҫ�޸�Զ�ֿ̲���ʷ������ȥ��������Ϣ��һ��Ҫ��ǰ�����Ŷӹ�ͨ��ʹ��reset��rebase���лع���Ȼ��ʹ��git push -fǿ�����͡�
```
���Զ�ֿ̲����ʷ�ع�������ʹ��revert����
git revert [�汾��]
�ع����commit����ֻ��һ���ύ
git revert  [�汾��]
git commit -m "revert commit1 commit2 commit3"
```
