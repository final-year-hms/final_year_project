const express = require('express')
const infoRouter = express.Router()
const Registerdata = require('../model/Registerdata')
const fetch = require('../functions/fetchiota')

function route(nav) {
  let dat = {datar: []}
  console.log('')
  infoRouter.get('/', function (req, res) {
    if (req.cookies.id == undefined || req.cookies.id == '') {
      // If the user is not logged in the cookie will be empty
      res.redirect('/log')
    } else if (req.query.id == undefined || req.query.id == '') {
      //  if the id in the query is undefined or empty

      res.render('request', {
        nav,
        title: 'Request Data',
        data: dat.datar,
        userid: req.cookies.patient == 'true' ? req.cookies.id : '',
        patient: req.cookies.patient == 'true' ? 'hidden' : 'text',
        doctor: req.cookies.patient == 'true' ? '' : 'hidden',
        msg: '',
      })
    } else {
      console.log('There are some request here')

      console.log(req.query.id)
      console.log(typeof req.query.id)

      Registerdata.findOne({id: req.query.id})
        .then((result) => {
          console.log(`root: ${result.root}`)
          if (result.root == undefined || result.root == '') {
            res.render('request', {
              nav,
              title: 'Request Data',
              data: dat.datar,
              userid: req.cookies.patient == 'true' ? req.cookies.id : '',
              patient: req.cookies.patient == 'true' ? 'hidden' : 'text',
              doctor: req.cookies.patient == 'true' ? '' : 'hidden',
              msg: 'No data logged yet!!',
            })
          } else {
            fetch(
              result.root,
              (patdata) => {
                dat.datar.push(patdata)
                console.log(`new data`)
                console.log(patdata)
              },
              () => {
                console.log(`Final object: `)
                console.log(dat)
                res.render('request', {
                  nav,
                  title: 'Request Data',
                  data: dat.datar,
                  userid: req.cookies.patient == 'true' ? req.cookies.id : '',
                  patient: req.cookies.patient == 'true' ? 'hidden' : 'text',
                  doctor: req.cookies.patient == 'true' ? '' : 'hidden',
                  msg: '',
                })
                dat.datar = []
              }
            )
          }
        })
        .catch((e) => {
          console.log(e)
          res.render('request', {
            nav,
            title: 'Request Data',
            data: dat.datar,
            userid: req.cookies.patient == 'true' ? req.cookies.id : '',
            patient: req.cookies.patient == 'true' ? 'hidden' : 'text',
            doctor: req.cookies.patient == 'true' ? '' : 'hidden',
            msg: 'Some error occured please check the id',
          })
        })
    }
  })

  return infoRouter
}

module.exports = route
