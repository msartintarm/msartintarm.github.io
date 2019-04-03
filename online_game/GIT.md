###[Back to README](README.md)

##How to Use Git
This isn't directly related to the project, but it's pretty important for the (two) 
  contributors to know how to properly configure and use Git.

####Config
- We don't want Emacs backup files with a trailing `~` to be seen by Git: `echo "*~" >> .gitignore`
 - Note that out rep has a much more comprehensive `.gitignore` file and we can just use this instead.
- All commits get pushed to their upstream remote branch: `git config --global push.default upstream`
- Rebase from remote branches by default: `git config --global branch.autosetuprebase remote`
- Enable color highlighting by default: `git config --global color.ui "auto"`
- We don't really care about whitespace in our files - tell Git to ignore it. `git config --global apply.whitespace nowarn`

###Workflow in Git
- Checking the project out: `git clone GitHubUserName@https://github.com/msartintarm/webgl.git .`
- Create a new Github repository: `git remote add masterBranch git@github.com:msartintarm/the_project.git`

To do a task 
- Update code to latest version: `git fetch; git rebase origin/master` OR `git pull` (config adds `--rebase` flag)
- Create and switch to the new branch: `git checkout -b the_task origin/master`
- IMPORTANT: Must say it tracks remote branch XXX from origin by **rebasing**. Otherwise, config isn't set up.
- make changes ...
- commit changes: `git commit -am "i did something good"`
- notice you forgot something: `git commit -a --amend`
- `git status` - if your branch is behind its upstream version, do a [rebase](README.md#git-rebase)
- If you do a rebase, you have to make sure your changes don't erase anything intended.:
- ...Create a new branch on origin with your branch's name: `git push origin the_task`
- ...Go to https://github.com/msartintarm/webgl/commits/the_task and make sure nothing\
's being erased. IMPORTANT
- ...If some changes are unintended, undo them, `git commit --amend`,  and repeat
- Once it looks good, send commit to origin/master: `git push`
- ...if you get an error message about nothing being upstream, it must not have been set correctly.
- ...track the remote branch before you try to push again: `git branch --set-upstream the_branch origin/master`
- You can't use the current branch anymore. delete it: `git branch -d the_task`

###Git Rebase
After you commit but before you push your changes to the remote branch, you have to
 apply any changes made to it since you last modified your code.
- `git rebase origin/master`
- Git will tell you if it can't merge a file automatically.
- Browse affected files and select the right code to keep
- Add file again to resolve: `git add file.js`
- Mark rebase as resolved: `git rebase --continue`
- Check to ensure everything works before you push.
- If you screw your files up in the rebase, abort and try again: `git rebase --abort`
- Message

###Misc. Git stuff
- Viewing changes after files are modified: `git status`
- See active repositories: `git remote -v`
- See which changes are in the current branch: `git log [--oneline]` 
- See all changes in every branch at once: `git log --graph --all --oneline`
- See which branches (local and remote) exist: `git branch -a`
- Marking a version in your project: `git tag -a v_1.0 -m "version 1 out"`
- Showing important versions: `git tag` or `git show v_1.0`
- `git diff --color changedFile.js`

##How To Debug
You have a branch `mistaken_branch` with tons of changes and something's broken. You have no 
clue how long it'll take to find and fix. The way to proceed is narrow down the differences
between your branch and origin/master, one-by-one.
I wouldn't spend more than half an hour doing either of the following.
Start at `1` and work your way down - each step is increasingly complex.

###1. Remove your changes one-by-one until something's fixed.
- Push changes to GitHub on your 'test' branch: `git push origin mistaken_branch`
- See what you've changed.
- Start removing changes from your local copy to unbreak head.

###2. Add your changes one-by-one until something's broken.
- Check out a new branch from origin/master: `git checkout -b mistake_fixer origin/master`
- Start adding suspicious changes you see on GitHub to this branch.
- Something that DOESN'T break code, you can directly put on master: `git push`
- Switch to your test branch and update with changes: `git checkout mistaken_branch; git pull`
- Update remote branch (changes already on master will be reflected): `git push -f origin mistaken_branch`
- Switch back to mistake fixer: `git checkout mistake_fixer`, and keep adding changes.
This will be tedious, but attacking the problem from two angles rather than one will keep you from being stuck.
