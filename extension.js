const vscode = require('vscode')
const window = vscode.window
const fs = require('fs')
const child_process = require('child_process')
const { get } = require('https')
const path = require('path')
const shell = require('shelljs')
const p = console.log.bind(console)
const trash = require('trash')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	shell.config.execPath = shell.which('node').toString()
	var savedGitRoot, savedCommitId
	var notTerminalExist = true, terminal

	context.subscriptions.push(vscode.commands.registerCommand('git-rebase-files.apply-gitignore', async function () {
		try {
			const gitRoot = await getGitRoot()
			if (!gitRoot)
				return

			//check if there are changes

			// git diff --cached --name-only
			// git diff --untracked --name-only
			var output

			areThereUncomitted()

			output = shell.exec('git rm -r --cached .', { cwd: gitRoot })
			if (output.code === 0) { p(output) } else { return }

			output = shell.exec('git add .', { cwd: gitRoot })
			if (output.code === 0) { p(output) } else { return }

			function areThereUncomitted() {

				output = shell.exec('git ls-files --other --directory --exclude-standard', { cwd: gitRoot })
				if (output.code === 0) { p(output) } else { return }
				if (output.toString() !== "") {
					throw "uncommitted changes: " + output
				}

				output = shell.exec('git update-index --refresh', { cwd: gitRoot })
				if (output.code === 0) { p(output) } else { throw "uncommitted unstaged changes" }


				output = shell.exec('git diff-index --quiet HEAD --', { cwd: gitRoot })
				if (output.code === 0) { p(output) } else { throw "uncommitted changes in index" }

			}

		} catch (error) {
			const strError = error.toString()
			console.log(strError)
			vscode.window.showInformationMessage(strError)
		}
	}))

	context.subscriptions.push(vscode.commands.registerCommand('git-rebase-files.stash-staged-only', async function () {
		try {
			const gitRoot = await getGitRoot()
			if (!gitRoot)
				return

			const stashMessage = await window.showInputBox({ prompt: "please put a stash message" })
			if (stashMessage === undefined)
				throw "canceled stash message"

			var output

			output = shell.exec('git stash --keep-index --include-untracked', { cwd: gitRoot })
			if (output.code === 0) { p(output) } else { return }
			if (stashMessage) {
				output = shell.exec(`git stash push -m "${stashMessage}"`, { cwd: gitRoot })
			} else {
				output = shell.exec('git stash push -m "staged stash"', { cwd: gitRoot })
			}
			if (output.code === 0) { p(output) } else { return }
			output = shell.exec('git stash apply "stash@{1}" --index', { cwd: gitRoot })
			if (output.code === 0) { p(output) } else { return }

			//attention, this is async
			dropIndex() //we can do this since we stashed our stuff

			async function dropIndex() {
				var output
				// output = shell.exec(`git diff --name-only`, { cwd: gitRoot })
				output = shell.exec(`git diff --name-only --cached`, { cwd: gitRoot })
				// output = shell.exec(`git diff --name-only --cached | xargs -d '\\n' sh -c 'for arg do echo "$arg"; cd "$arg"; done' _`, { cwd: gitRoot })
				// output = shell.exec(`printf "a\\nb" | xargs sh -c 'for arg do echo "\$arg"; cd "\$arg"; done' _`, { cwd: gitRoot })

				// console.log(`printf "a\\nb" | xargs -d \$'\n' sh -c 'for arg do echo "\$arg"; cd "\$arg"; done' _`, { cwd: gitRoot });
				const staged = output.slice(0, -1)
				if (output.code === 0) { p(staged) } else { return }
				var length, i

				if (!staged) {
					throw "nothing staged"
				}

				const stagedAr = staged.split('\n')
				length = stagedAr.length

				const untracked = shell.exec(`git diff --cached --name-only --diff-filter=A`, { cwd: gitRoot })
				if (output.code === 0) { p(output) } else { return }
				const untrackedAr = untracked.slice(0, -1).split('\n')

				console.log("untrackedAr", untrackedAr)
				console.log("stagedAr", stagedAr)

				for (i = 0; i < length; i++) {
					const relativePath = stagedAr[i]
					// p("ok", stagedAr[i])
					output = shell.exec(`git reset HEAD`, { cwd: gitRoot })
					if (output.code === 0) { p(output) } else { return }

					if (untrackedAr.includes(relativePath)) {
						//reeeeeeeeeeeeeeeeeeeeeeeeeee

						await trash(path.join(gitRoot, relativePath))
						console.log(path.join(gitRoot, relativePath))
					} else {
						console.log(`git checkout -- "${relativePath}"`)
						output = shell.exec(`git checkout -- "${relativePath}"`, { cwd: gitRoot })
						if (output.code === 0) { p(output) } else { return }
					}
				}
			}
		} catch (error) {
			const strError = error.toString()
			console.log(strError)
			vscode.window.showInformationMessage(strError)
		}
	}))

	context.subscriptions.push(vscode.commands.registerCommand('git-rebase-files.stash-unstaged-only', async function () {
		try {
			const gitRoot = await getGitRoot()
			if (!gitRoot)
				return

			var output

			output = shell.exec('git commit --message "WIP"', { cwd: gitRoot })
			if (output.code === 0) { p(output) } else { return }

			output = shell.exec('git stash -u', { cwd: gitRoot })
			if (output.code === 0) { p(output) } else { return }

			output = shell.exec('git reset --soft HEAD^', { cwd: gitRoot })
			if (output.code === 0) { p(output) } else { return }

		} catch (error) {
			const strError = error.toString()
			console.log(strError)
			vscode.window.showInformationMessage(strError)
		}
	}))

	context.subscriptions.push(vscode.commands.registerCommand('git-rebase-files.add-staged-to-past-commit', async function () {
		try {
			const gitRoot = await getGitRoot()
			if (!gitRoot)
				return



			const commitId = (await window.showInputBox({ prompt: "commit id" })).slice(0, 7)
			if (!commitId)
				throw "no commit id"


			console.log((commitId))

			var output

			shell.env["GIT_SEQUENCE_EDITOR"] = "true"
			output = shell.exec(`git rebase --interactive --autosquash "${commitId}^"`, { cwd: gitRoot })
			if (output.code === 0) { p(output) } else { return }

		} catch (error) {
			const strError = error.toString()
			console.log(strError)
			vscode.window.showInformationMessage(strError)
		}
	}))

	context.subscriptions.push(vscode.commands.registerCommand('git-rebase-files.edit-past-commit', async function () {
		try {
			const gitRoot = await getGitRoot()
			if (!gitRoot)
				return

			const commitId = (await window.showInputBox({ prompt: "commit id" })).slice(0, 7)
			if (!commitId)
				throw "no commit id"

			savedGitRoot = gitRoot; savedCommitId = commitId

			console.log((commitId))

			output = shell.exec('git stash --include-untracked', { cwd: gitRoot })
			if (output.code === 0) { p(output) } else { return }

			var output
			shell.env["GIT_SEQUENCE_EDITOR"] = `sed -i -re 's/^pick ${commitId}/e ${commitId}/'`
			console.log(`sed -i -re 's/^pick ${commitId}/e ${commitId}/'`)
			output = shell.exec(`git rebase -i "${commitId}^"`, { cwd: gitRoot })
			if (output.code === 0) { p(output) } else { return }
			// 
			output = shell.exec(`git checkout "${commitId}"`, { cwd: gitRoot })
			if (output.code === 0) { p(output) } else { return }
			// 
			output = shell.exec(`git reset --soft "${commitId}^"`, { cwd: gitRoot })
			if (output.code === 0) { p(output) } else { return }

		} catch (error) {
			const strError = error.toString()
			console.log(strError)
			vscode.window.showInformationMessage(strError)
		}
	}))

	context.subscriptions.push(vscode.commands.registerCommand('git-rebase-files.commit-and-continue-rebase', async function () {
		try {
			if (!savedGitRoot)
				throw "no savedGitRoot from git-rebase-files.edit-past-commit"
			if (!savedCommitId)
				throw "no savedCommitId from git-rebase-files.edit-past-commit"

			var output

			output = shell.exec(`git commit -C "${savedCommitId}"`, { cwd: savedGitRoot })
			if (output.code === 0) { p(output) } else { return }

			output = shell.exec(`git rebase --continue`, { cwd: savedGitRoot })
			if (output.code === 0) { p(output) } else { return }

		} catch (error) {
			const strError = error.toString()
			console.log(strError)
			vscode.window.showInformationMessage(strError)
		}
	}))

	context.subscriptions.push(vscode.commands.registerCommand('git-rebase-files.gitlens_interactive-rebase', async function () {
		try {
			const gitRoot = await getGitRoot()
			if (!gitRoot)
				return

			const commitId = (await window.showInputBox({ prompt: "commit id" })).slice(0, 7)
			if (!commitId)
				throw "no commit id"

			var output

			if (notTerminalExist) {
				notTerminalExist = false
				terminal = vscode.window.createTerminal("Code")
			}
			terminal.sendText(`cd "${gitRoot}"`)
			terminal.sendText(`git rebase --interactive "${commitId}^"`)


		} catch (error) {
			const strError = error.toString()
			console.log(strError)
			vscode.window.showInformationMessage(strError)
		}
	}))
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}

function getGitRoot() {
	return new Promise(async (resolve) => {
		try {
			const activeEditor = window.activeTextEditor
			var fullPath
			if (activeEditor) {
				const document = activeEditor.document

				fullPath = document.fileName.replace(/\\/g, '/')
			}

			const input = await window.showInputBox({ value: fullPath, prompt: "git repo path or subpath" })
			var dirToCheck, lastSlash
			if (fs.lstatSync(input).isDirectory()) {
				dirToCheck = input
			} else {
				lastSlash = input.lastIndexOf('/')
				if (lastSlash != -1) {
					dirToCheck = input.slice(0, lastSlash + 1)
				} else {
					vscode.window.showInformationMessage("path is not a dir and has no parent dir")
					return
				}
			}
			resolve(child_process.execSync('git rev-parse --show-toplevel', { cwd: dirToCheck }).toString().slice(0, -1))
		} catch (error) {
			const strError = error.toString()
			if (strError.includes("Error: ENOENT: no such file or directory")) {
				vscode.window.showInformationMessage("path is not a dir and has no parent dir")
				console.log(strError)
				return
			}
			console.log(strError)
			resolve(false)
		}
	})
}