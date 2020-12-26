// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode')
const window = vscode.window
const fs = require('fs')
const child_process = require('child_process')
const { get } = require('https')
const path = require('path')
const shell = require('shelljs')


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// const isWin = process.platform === "win32"
	// const gitPath = getGitPath()
	// const gitBashPath = '"' + path.join(path.dirname(path.dirname(gitPath)), "git-bash") + '"'

	context.subscriptions.push(vscode.commands.registerCommand('git-rebase-files.stash-staged-only', async function () {
		// return
		try {

			const gitRoot = await getGitRoot()
			if (!gitRoot)
				return

				shell.exec('git diff')
			// console.log("gitBashPath", gitBashPath)
			return
			var output = child_process.execSync(gitBashPath + " echo foo && echo bar").toString()
			console.log(output)


		} catch (error) {
			const strError = error.toString()
			console.log(strError)
			vscode.window.showInformationMessage(strError)
		}
	}))

	context.subscriptions.push(vscode.commands.registerCommand('git-rebase-files.helloWorld', async function () {
		// return
		try {

			const gitRoot = await getGitRoot()
			if (!gitRoot)
				return

			const commitId = await window.showInputBox({ prompt: "commit id" })
			if (!commitId)
				throw "no commit id"



			// var repoName
			// var lastSlash = gitRoot.lastIndexOf('/')
			// if (lastSlash != -1) {
			// repoName = gitRoot.slice(lastSlash + 1)
			// } else {
			// vscode.window.showInformationMessage("path is not a dir and has no parent dir")
			// return
			// }



		} catch (error) {
			const strError = error.toString()
			console.log(strError)
			vscode.window.showInformationMessage(strError)
		}


	}))



	function getGitPath() {
		if (isWin) {
			// const whereGit = child_process.execSync('where git').toString()
			// const whereGit = child_process.execSync('where git').toString().slice(0, -1)
			// const whereGit = child_process.execSync('where git').toString().slice(0, -2)
			const whereGit = child_process.execSync('where git').toString()
			return whereGit.slice(0, whereGit.indexOf("\n") - 1)
		} else {
			const whichGit = child_process.execSync('which git').toString()
			// console.log(whichGit.slice(0,-1))
			return whichGit.slice(0, -1)
			//  child_process.execSync('which git').toString().slice(0, -1)
		}
	}
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
/* exec('cat *.js missing_file | wc -l', (error, stdout, stderr) => {
	if (error) {
	  console.error(`exec error: ${error}`);
	  return;
	}
	console.log(`stdout: ${stdout}`);
	console.error(`stderr: ${stderr}`);
  }); */


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

			// const gitRoot = 
			resolve(child_process.execSync('git rev-parse --show-toplevel', { cwd: dirToCheck }).toString().slice(0, -1))

			// child_process.exec('git rev-parse --show-toplevel', { cwd: dirToCheck }, (error, stdout) => {
			// if (error) {
			// console.error(`exec error: ${error}`)
			// resolve(false)
			// }
			// const gitRoot = stdout.slice(0, -1)
			// 
			// resolve(gitRoot)
			// })


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
