const express = require('express')
const bodyParser = require('body-parser')
const Mam = require('@iota/mam')
const Converter = require('@iota/converter')
const provider = 'https://nodes.devnet.iota.org:443'
const reqi = require('./sendiota')
const app = express()
const fs = require('fs')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

let state = Mam.init(provider)
state = JSON.parse(fs.readFileSync('state.json'))
console.log(state)

const publish = async function (packet, id) {
  const trytes = Converter.asciiToTrytes(JSON.stringify(packet))

  const message = Mam.create(state, trytes)
  state = message.state
  // console.info('THE state ')
  // console.log(state)

  fs.writeFileSync('state.json', JSON.stringify(state))

  await Mam.attach(message.payload, message.address)
  // console.info('The messaeg thing')
  // console.log(message)
  // console.log('\n\nThe Root is:')
  // console.log(message.root)
  reqi({id, root: message.root})
  fs.writeFileSync('root.txt', message.root)
  return message.root
}

app.post('/req', (req, res) => {
  console.log('Post req')
  console.log(req.body)
  if (JSON.stringify(req.body) == '{}') {
    res.sendStatus(400)
  } else {
    publish(req.body, req.body.patient_id)
    res.sendStatus(200)
  }
})

app.get('/req', (req, res) => {
  console.log('get req')
  console.log(req.query)
  if (JSON.stringify(req.query) == '{}') {
    res.sendStatus(400)
  } else {
    publish(req.query, req.query.patient_id)
    res.sendStatus(200)
  }
})

app.get('/', (req, res) => {
  res.redirect('/req')
})

app.listen(80, () => console.log('Listening on port 80'))
