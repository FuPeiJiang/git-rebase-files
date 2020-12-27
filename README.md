add,edit,remove changes from past commits

I say changes, not files, because you can remove a file deletion, which is deleting a change(deletion), not deleting a file (it's actually adding a file)...

staged changes, added changes, cached changes are synonyms

# Features:
1. stash only staged
2. add staged to a past commit (by id) (only use this command to add, or else conflict)
3. remove staged (edit a past commit)<br>
##### most complicated:
4. move changes from `commitA` to `commitB`<br>
split `commitA` in 2 commits, then squash the one you want under or onto `commitB`

a) run command: edit a past commit<br>
b) unstage the changes you want to keep on this commit<br>
c) stage the changes you want to move to another commit<br>
d) commit with a message like `under update README.md` or `on top of foobar`<br>
e) stage the changes you wanted to keep on this commit<br>
f) run command: commit and continue rebase<br><br>
g) run command: interactive rebase (by commit id)<br>
h) for example: move `under commitB` under `commitB`,<br> select squash for `commitB` and reword for `under commitB`<br> (`commitB` will be squashed into `under commitB`)<br>
i) an edit commit message tab for `under commitB` will pop up, close it, another one will pop up.<br>
j) this is a merge commit message, but you wanted to add a change to `commitB`, so remove the other commit message and leave only `commitB`, or you can do what you want.

when you run commands, it will display errors, but usually they succeeded, check in your git GUI to see if they did.

