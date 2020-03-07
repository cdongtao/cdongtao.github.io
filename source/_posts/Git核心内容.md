---
title: Git��������
tags: [Git����]
categories: [�������]
---
## Git ��������Ҫ��
�ճ�������Ҫ����add,commit,status,fetch,push,rebase�ȣ���Ҫ�������գ�����������rebase��merge������fetch��pull������ȣ�����֮��>������cherry-pick��submodule��stash�ȹ���

## Git vs SVN
�ڰ汾�������֧�Ǻܳ�ʹ�õĹ��ܡ��ڷ����汾ǰ����Ҫ������֧�����д����󿪷�����Ҫ feature ��֧�����Ŷӻ����п�����֧���ȶ���֧�ȡ��ڴ��Ŷӿ��������У��������ڴ�����֧���л���֧����
Git ��֧��ָ��ָ��ĳ���ύ���� SVN ��֧�ǿ�����Ŀ¼���������ʹ Git �ķ�֧�л��ǳ�Ѹ�٣����Ҵ����ɱ��ǳ��͡�
���� Git �б��ط�֧��SVN �ޱ��ط�֧����ʵ�ʿ��������У�������������Щ����ûд�꣬��������������������⣬������ʹ�� Git������Դ������ط�֧�洢ûд��Ĵ��룬�����⴦������ٻص����ط�֧������ɴ��롣

## Git ���ĸ���
>Git ����ĵ�һ��������ǹ�������ͨ���ύ�����Ϊ������
>git add�ӹ������ύ���ݴ���
>git commit���ݴ����ύ�����زֿ�
>git push��git svn dcommit�ӱ��زֿ��ύ��Զ�ֿ̲�

![Git�ύ��������](/img/GitFolw.png "Git�ύ��������")

## Git������������
### Git����
>Git �û��������ļ�λ�� ~/.gitconfig
>Git �����ֿ�������ļ�λ�� ~/$PROJECT_PATH/.git/config

```
# �о���������
$ git config -l
# Ϊ�������ñ���
$ git config --global alias.co checkout
$ git config --global alias.ci commit
$ git config --global alias.st status
$ git config --global alias.br branch
# �����ύ����ʱ���û���Ϣ
$ git config [--global] user.name "[name]"
$ git config [--global] user.email "[email address]"
```

### ��ʼ��
```
# �ڵ�ǰĿ¼�½�һ��Git�����
$ git init
# ����һ����Ŀ����������������ʷ [Git only]
$ git clone [url]
```

### ��ɾ�ļ�
```
# ��ӵ�ǰĿ¼�������ļ����ݴ���
$ git add .
# ���ָ���ļ����ݴ���
$ git add <file1> <file2> ...
# ���ָ��Ŀ¼���ݴ�������������Ŀ¼
$ git add <dir>
# ɾ���������ļ������ҽ����ɾ�������ݴ���
$ git rm [file1] [file2] ...
# ֹͣ׷��ָ���ļ��������ļ��ᱣ���ڹ�����
$ git rm --cached [file]
# �����ļ������ҽ�������������ݴ���
$ git mv [file-original] [file-renamed]
���ļ��� file1 ��ӵ� .gitignore �ļ��Git ��ֹͣ���� file1 ��״̬��
```

### ��ѯ
```
# �鿴�������ļ��޸�״̬
$ git status
# �鿴�������ļ��޸ľ�������
$ git diff [file]
# �鿴�ݴ����ļ��޸�����
$ git diff --cached [file]
# �鿴�汾���޸ļ�¼
$ git log
# �鿴ĳ���ύ��¼
$ git log --author=someone
# �鿴ĳ���ļ�����ʷ�����޸�����
$ git log -p [file]
# �鿴ĳ���ύ�����޸�����
$ git show [commit]
```

### ��֧
```
# �г����б��ط�֧
$ git branch
# �г����б��ط�֧��Զ�̷�֧
$ git branch -a
# �½�һ����֧������Ȼͣ���ڵ�ǰ��֧
$ git branch [branch-name]
# �½�һ����֧�����л����÷�֧
$ git checkout -b [new_branch] [remote-branch]
# �л���ָ����֧�������¹�����
$ git checkout [branch-name]
# �ϲ�ָ����֧����ǰ��֧
$ git merge [branch]
# ѡ��һ�� commit���ϲ�����ǰ��֧
$ git cherry-pick [commit]
# ɾ�����ط�֧��-D ����ǿ��ɾ����֧
$ git branch -d [branch-name]
# ɾ��Զ�̷�֧
$ git push [remote] :[remote-branch]
```

### �ύ
```
# �ύ�ݴ������ֿ���
$ git commit -m [message]
# �ύ���������ݴ����ı仯ֱ�ӵ��ֿ���
$ git commit -a
# �ύʱ��ʾ���� diff ��Ϣ
$ git commit -v
# �ύ�ݴ����޸ĵ��ֿ������ϲ����ϴ��޸ģ����޸��ϴε��ύ��Ϣ
$ git commit --amend -m [message]
# �ϴ�����ָ����֧��Զ�ֿ̲�
$ git push [remote] [remote-branch]
```

### ��ȡ
```
# ����Զ�ֿ̲�����б䶯 (Git only)
$ git fetch [remote]
# ��ʾ����Զ�ֿ̲� (Git only)
$ git remote -v
# ��ʾĳ��Զ�ֿ̲����Ϣ (Git only)
$ git remote show [remote]
# ����һ���µ�Զ�ֿ̲⣬������ (Git only)
$ git remote add [remote-name] [url]
# ȡ��Զ�ֿ̲�ı仯�����뱾�ط�֧�ϲ���(Git only), ��ʹ�� Git-SVN����鿴������
$ git pull [remote] [branch]
# ȡ��Զ�ֿ̲�ı仯�����뱾�ط�֧����ϲ���(Git only), ��ʹ�� Git-SVN����鿴������
$ git pull --rebase [remote] [branch]
```

### ����
```
# �ָ��ݴ�����ָ���ļ���������
$ git checkout [file]
# �ָ��ݴ�����ǰĿ¼�������ļ���������
$ git checkout .
# �ָ���������ָ�� commit
$ git checkout [commit]
# �����ݴ�����ָ���ļ�������һ�� commit ����һ�£�������������
$ git reset [file]
# �����ݴ����빤����������һ�� commit ����һ��
$ git reset --hard
# ���õ�ǰ��֧��ָ��Ϊָ�� commit��ͬʱ�����ݴ�����������������
$ git reset [commit]
# ���õ�ǰ��֧��HEADΪָ�� commit��ͬʱ�����ݴ����͹���������ָ�� commit һ��
$ git reset --hard [commit]
# �½�һ�� commit�����ڳ���ָ�� commit
$ git revert [commit]
# ��δ�ύ�ı仯���ڴ�����
$ git stash
# �������������ݻָ�����ǰ������
$ git stash pop
```



