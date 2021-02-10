const fs = require('fs')

let path = process.argv[2]
let contents = fs.readFileSync(path, 'utf-8').toString()

let arr = contents.split('\n')

for (let i = 0, len = arr.length; i < len; i++) {
  let line = arr[i]
  let commitMessage = line.slice(13)
  if (commitMessage.slice(0,4) === '--p:') {
    arr[i] = `drop${line.slice(4)}`
  }
}
fs.writeFileSync(path, arr.join('\n'), 'utf-8')
