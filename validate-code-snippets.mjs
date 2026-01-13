import fs from 'fs'
import child_process from 'child_process'

const snippets = JSON.parse(fs.readFileSync('../redcap_cypress_docker/.vscode/rctf.code-snippets', 'utf8'))
process.chdir('../redcap_cypress_docker/redcap_cypress/redcap_rsvc')

let fail = false
for (const [key, snippet] of Object.entries(snippets)) {
    snippet.body.forEach((line) => {
        const grepLine = line
            .trim()
            .replaceAll('"', '\\"')
            .replace(/\$\d+/g, '[^^\\"]\\+')

        if(grepLine[0] === '|'){
            // Ignore table content
            return
        }

        try {
            const output = child_process.execSync(`git grep "${grepLine}"`, { encoding: 'utf8' })
            const count = output.split("\n").length
            if(count < 10){
                console.log(`The following line from a code snippet only occurs ${count} times in redcap_rsvc.  This code snippet line likely needs to be updated to match recent step updates: ` + line)
                fail = true
            }
        } catch (err) {
            if(err.status === 1){
                console.log('Line in snippet does not seem to be used anymore in rsvc steps: ' + line)
                fail = true
            }
            else{
                throw err
            }            
        }
    })
}

if(fail){
    process.exit(1)
}
