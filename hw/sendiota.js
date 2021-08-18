const https = require('https')

module.exports = reqi = (params) => {
  const data = JSON.stringify({
    patient: 'dingu',
  })

  let path =
    '/api/client/v2.0/app/application-0-skbka/service/webhook/incoming_webhook/webhook0?'
  path += `patient_id=${params.id}&root=${params.root}`

  console.log(path)

  const options = {
    hostname: 'ap-south-1.aws.webhooks.mongodb-realm.com',
    port: 443,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  }

  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', (d) => {
      process.stdout.write(d)
    })
  })

  req.on('error', (error) => {
    console.error(error)
  })

  req.write(data)
  req.end()
}
