const express = require('express')
const homeRouter = express.Router()
const Viewdata = require('../model/Viewdata')

function route(nav) {
  homeRouter.get('/request', function (req, res) {
    res.render('request', {
      nav,
      title: 'Request Data',
    })
  })

  homeRouter.get('/update', function (req, res) {
    console.log('cookies: ', req.cookies)
    res.render('updateinfo', {
      nav,
      title: 'Update the Data',
    })
  })

  homeRouter.post('/update', function (req, res) {
    const id = req.params._id
    const newData = {
      name: req.body.name,
      id: req.body.id,
      details: req.body.details,
      medication: req.body.medic,
    }
    Viewdata.findByIdAndUpdate(id, newData, function (err, patient) {
      if (err) console.log(err)
      else {
        console.log(patient)
      }
    })
  })
  return homeRouter
}

module.exports = route
