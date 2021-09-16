const util = require('util')
const exec = util.promisify(require('child_process').exec)
const http = require('http')
const path = require('path')

const { getReqData } = require('./utils')

const dirPathJoined = path.join('/', 'apps', 'portal')

const server = http.createServer(async req => {
	if (req.url !== '/update-portal-app') return

	const reqData = await getReqData(req)
	if (JSON.parse(reqData).ref !== 'refs/heads/master') return

	const execCommand = async command => {
		try {
			const { error, stderr, stdout } = await exec(command, {
				cwd: dirPathJoined,
			})

			if (error) {
				console.log(`error: ${error.message}`)
				return
			}

			if (stderr) {
				console.log(`stderr: ${stderr}`)
				return
			}

			console.log(`stdout: ${stdout}`)
		} catch (e) {
			console.log(e)
		}
	}

	await execCommand('git fetch origin')
	await execCommand('git pull origin master')
	await execCommand('docker-compose down')
	await execCommand('docker rmi portal_server portal_client')
	await execCommand('docker-compose up')
})

const PORT = 7095
server.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}/`)
})
