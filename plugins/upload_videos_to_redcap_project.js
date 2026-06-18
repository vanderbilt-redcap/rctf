#!/usr/bin/env node
const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

/**
 * This tool fetches the results of the latest cloud run
 * Facilitates uploading the video results to REDCap project via REDCap API
 * Videos push to the File Repo when a feature has been marked as passed
 */
export class UploadVideoToREDCapProject {
    constructor(results) {
        console.log('Running UploadVideoToREDCapProject')

        const redcap_api_token = process.env.REDCAP_API_TOKEN
        if(!redcap_api_token){
            throw new Error('No REDCap API token found.')
        }

        const project_id = process.env.PROJECT_ID
        if(!project_id){
            throw new Error('No Project ID found.')
        }

        this.redcap_api_url = process.env.REDCAP_API_URL
        if(!this.redcap_api_url){
            throw new Error('No REDCap API URL found.')
        }

        // Replace slashes to ensure paths are consistent on Windows & Linux
        const video_path = results.video.split(path.sep).join("/")

        if(this.redcap_api_url.includes('redcap.loc')){
            // This is local environment.  Do not check the cert.
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }

        //Get the Folder ID
        this.promise = this.redcap_project_query(new URLSearchParams({
            token: redcap_api_token, // Replace with actual token if not using environment variables
            content: 'fileRepository',
            action: 'list',
            format: 'json',
            returnFormat: 'json'
        })).then((response) => {
            return new Promise((resolve, reject) => {
                const folder = response.find(r => r.name === "Automated Videos");

                if (folder) {
                    resolve(folder.folder_id)
                } else {
                    reject('Automated Videos folder not found');
                }
            })
        }).then(async (folder_id) => {
            let dataToSave = []

            return this.redcap_project_query(new URLSearchParams({
                token: redcap_api_token, // Replace with actual token if not using environment variables
                content: 'fileRepository',
                action: 'list',
                folder_id: folder_id,
                format: 'json',
                returnFormat: 'json'
            })).then((uploaded_feature_videos) =>{
                const filename = video_path.split('/').pop()

                const frs_id = filename.split(' ')[0]
                console.log(`Uploading ${frs_id}`)
                
                if(uploaded_feature_videos.find(r => r.name === filename)){
                    console.log(`ALREADY UPLOADED: ${filename}`)
                } else {
                    console.log(`NEW UPLOAD: ${filename}`)
                    console.log(`FILE PATH: ${video_path}`)

                    const feature_content = fs.readFileSync(results.spec.absolute, 'utf8')
                    const passingDuration = results.stats.duration/1000
                    const linuxVersion = this.get_linux_version()
                    const cloudMachineNumber = Number(process.env.CIRCLE_NODE_INDEX || 0) + 1

                    const recordData = {
                        record_id: -1, // We're required to specify something, but the value doesn't matter since forceAutoNumber is true
                        frs_id: frs_id,
                        feature_test_script: feature_content,
                        projects_feature: this.get_referenced_files(feature_content),
                        testing_method: 'automated',
                        feature_test_outcome: 1,
                        date_test_run: new Date().toISOString().slice(0, 10),
                        cloud_machine_number: cloudMachineNumber,
                        circle_test_env: `<ul><li>Operating System: Linux ${linuxVersion}</li><li>Testing Platform: Cypress v${results.cypressVersion}</li><li>Browser: Chrome v${results.browser.version}</li></ul>`,
                    }

                    if (passingDuration) {
                        const durationMinutes = String(Math.floor(passingDuration / 60)).padStart(2, '0')
                        const durationSeconds = String(Math.floor(passingDuration % 60)).padStart(2, '0')
                        recordData.time_test = `${durationMinutes}:${durationSeconds}`
                    }
                    
                    dataToSave.push(recordData)

                    if (!fs.existsSync(video_path)) {
                        throw new Error(`Video file does not exist at path: ${video_path}`)
                    }

                    return this.upload_video_file(redcap_api_token, folder_id, filename, video_path)
                }
            }).then(() => {
                return this.redcap_project_query(new URLSearchParams({
                    token: redcap_api_token, // Replace with actual token if not using environment variables
                    content: 'record',
                    action: 'import',
                    format: 'json',
                    returnFormat: 'json',
                    overwriteBehavior: 'overwrite',
                    forceAutoNumber: 'true',
                    data: JSON.stringify(dataToSave, null, 2),
                })) .then(json => {
                    if(json.count !== dataToSave.length){
                        throw `Expected to save ${dataToSave.length} records but received a count of ${json.count} instead`
                    }

                    console.log(`Finished uploading ${results.spec.name}`)
                })
            })
        })
    }

    redcap_project_query(payload, headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
    }) {
        return  fetch(this.redcap_api_url, {
            method: 'POST',
            headers: headers,
            body: payload
        }).then(response => response.json())  // Parse the JSON response
        .then(json => {
            if(json.error){
                throw new Error('An error occurred during the REDCap API call: ' + json.error)
            }

            return json
        })
    }

    // This function was copied from the redcap-functional-requirements External Module
    get_referenced_files(featureContent) {
        const ignoredPhrases = [
            'Scenario:',
            'should see',
            'should NOT see',
            'into the input field',
            'the downloaded CSV with filename',
            'icon for the File Repository file named',
            'I download a file',
            'I check the checkbox',
            'I click on the link labeled "consent.pdf"',
        ]

        const lines = featureContent.split("\n")
        let referencedFiles = {} // Use an object to automatically collapse duplicates
        forEachLine: for (let lineIndex in lines){
            let line = lines[lineIndex].trim()

            for (const phrase of ignoredPhrases){
                if(line.includes(phrase)){
                    continue forEachLine
                }
            }

            if(line.includes('upload the following file')){
                while(true){
                    lineIndex++
                    const matches = [...lines[lineIndex].matchAll(/\|(.*)\|/g)]
                    if(matches.length === 0){
                        continue forEachLine
                    }

                    for (const match of matches) {
                        const filename = match[1].trim()
                        referencedFiles[filename] = true
                    }
                }
            }

            const matches = line.matchAll(/["']([^"'@]*\.[A-z][A-z][A-z][A-z]?)["']/g)
            for (const match of matches) {
                const filename = match[1]
                const extension = filename.split('.').pop()

                if([
                    'DEV',
                    'PROD',
                    'copy',
                    'php',
                ].includes(extension)){
                    continue
                }

                referencedFiles[filename] = true
            }
        }

        return Object.keys(referencedFiles).join("\n")
    }

    async get_filenames_recursively(dir) {
        const subdirs = await readdir(dir)
        const files = await Promise.all(subdirs.map(async (subdir) => {
            const res = path.resolve(dir, subdir)
            return (await stat(res)).isDirectory() ? this.get_filenames_recursively(res) : res.replaceAll('\\', '/')
        }))

        return files.reduce((a, f) => a.concat(f), [])
    }

    get_linux_version() {
        try {
            const osRelease = fs.readFileSync('/etc/os-release', 'utf8')
            const m = osRelease.match(/^PRETTY_NAME="(.+)"$/m)
            return m ? m[1] : 'unknown'
        } catch {
            return 'unknown'
        }
    }

    async upload_video_file(redcap_api_token, folder_id, filename, videoPath) {
        const fileBuffer = fs.readFileSync(videoPath)
        const form = new FormData()

        form.append('token', redcap_api_token)
        form.append('content', 'fileRepository')
        form.append('action', 'import')
        form.append('folder_id', String(folder_id))
        form.append('filename', filename)
        form.append('file', new Blob([fileBuffer]), filename)

        const response = await fetch(this.redcap_api_url, {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: form
        })

        if (!response.ok) {
            throw new Error(`Video upload failed with status ${response.status}`)
        }
    }
}
