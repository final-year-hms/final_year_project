const Mam = require('@iota/mam')
const Converter = require('@iota/converter')
const provider = 'https://nodes.devnet.iota.org:443'

const fetch = (root, reportEvent, onFetchComplete) => {
  if (!provider || !root) return
  const promise = new Promise(async (resolve, reject) => {
    try {
      Mam.init(provider)
      const convertAndReport = (event) =>
        reportEvent(JSON.parse(Converter.trytesToAscii(event)))
      await Mam.fetch(root, 'public', null, convertAndReport)
      return resolve(onFetchComplete())
    } catch (error) {
      console.log('MAM fetch error', error)
      return reject()
    }
  })

  return promise
}

module.exports = fetch
