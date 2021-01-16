---
title: Git Branch Guidelines
tags: [Tool,Git]
categories: [PluginTool]
---
## 规范
![001](/git/001.png "001")

### Master(主分支)
1. 用于部署生产环境(PROD);
2. 保护分支，禁止PUSH,只能merge;
3. 输入分支：release、hotfix/yyyyMMdd;

### Hotfix/yyyyMMdd(线上BUG修复分支)
1. 基于master分支新建;
2. 修复上线后，合并回master和develop分支;
3. 修复发布后删除;

### Release(预发布分支)
1. 用于部署预发布环境(UAT);
2. 保护分支，禁止PUSH,只能merge;
3. 输入分支：Feature/sprintXX;

### Develop(开发分支)
1. 包含最新的功能代码，新建feature/sprintXX 分支的基础;
2. 保护分支，禁止PUSH,只能merge;
3. 输入分支：hotfix/yyyyMMdd、test/sprintXX;

### Feature/sprintXX(功能分支)
1. 用于版本迭代(没有拆分到各个feature，一个迭代一个feature/sprintXX)，部署开发环境联调(DEV);
2. 基于develop新建;
3. 功能发布后删除;

### Test/SprintXX(功能测试分支)
1. 用于功能迭代的测试，部署测试环境(FAT);
2. 输入分支：feature/sprintXX;
3. 功能发布后删除;

## 分支操作规范
### Feature/SprintXX分支下使用rebase
解决提交路线图清晰问题，git pull默认是merge操作，可以使用如下命令进行rebase
```
git pull --rebase
//也可以做全局配置
git config --global pull.rebase true
git config --global branch.autoSetupRebase always
```

### Master/Release/Dev分支合并使用 no-ff
在merge 到Master,Dev分支，解决fast-forward 合并的路线图问题，这种 merge 的结果就是一条直线，无法明确看到切出一个新的 feature 分支，但是使用 no-ff就可以明显看出新feature分支的合并路线图
```
//合并sprint01 到 develop 分支
git merge --no-ff feature/sprint01
```

