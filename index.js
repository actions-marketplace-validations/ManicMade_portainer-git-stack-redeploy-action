const core = require("@actions/core")

let portainerUrl = core.getInput("portainerUrl")
const accessToken = core.getInput("accessToken")
const stackId = parseInt(core.getInput("stackId"))
const endpointId = parseInt(core.getInput("endpointId"))

if (isNaN(stackId)) {
  core.setFailed("Stack ID must be integer")
  process.exit(1)
}

let client

if (portainerUrl.includes("http:")) {
  client = require("http")
} else {
  client = require("https")

  if (!portainerUrl.includes("https:")) {
    portainerUrl = `https://${portainerUrl}`
  }
}

if (portainerUrl.substring(portainerUrl.length - 1) === "/") {
  portainerUrl = portainerUrl.substring(0, portainerUrl.length - 1)
}

core.setSecret(portainerUrl)
core.setSecret(accessToken)

const postData = JSON.stringify({
  pullImage: true,
  PullImage: true,
  RepositoryAuthentication: true,
  RepositoryPassword: "",
  RepositoryReferenceName: "",
  RepositoryUsername: "",
  env: [],
  prune: false,
})

const url = `${portainerUrl}/api/stacks/${stackId}/git/redeploy` + (isNaN(endpointId) ? "" : `?endpointId=${endpointId}`)

console.log("Hitting URL", url)
console.log("With data:", postData)

const req = client.request(url, {
  method: "PUT",
  headers: {
    "X-API-Key": accessToken,
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData)
  }
}, (res) => {
  if (res.statusCode !== 200) {
    core.setFailed('Not 200 - ' + res.statusMessage)
    process.exit(2)
  }
})
  .on("error", (error) => {
    core.setFailed('Error - ' + error.message)
    process.exit(3)
  })

req.write(postData)
req.end()
