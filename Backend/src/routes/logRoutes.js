const express = require('express')
const logRouter = express.Router()
const Registerdata = require('../model/Registerdata')
let alert = require('alert')

function route(nav) {
  logRouter.get('/', function (req, res) {
    res.clearCookie('id')
    res.clearCookie('patient')
    res.render('login', {
      nav: [{link: '/', name: 'SignUp'}],
      title: 'Login',
      msg: '',
    })
  })

  logRouter.post('/login', function (req, res) {
    console.log('Hey')
    try {
      const id = req.body.id
      const pass = req.body.pass

      Registerdata.findOne({id: id}, function (err, user) {
        console.log(user)
        if (user === null) {
          res.render('login', {
            nav: [{link: '/', name: 'SignUp'}],
            title: 'Login',
            msg: 'Invalid Login details',
          })
        } else if (user.pass === pass) {
          // res.send("success")

          res.cookie('id', user.id)
          res.cookie('patient', user.patient)
          res.cookie('name', user.name)

          res.render('home', {
            nav,
            title: 'Home',
          })
        } else {
          res.render('login', {
            nav: [{link: '/', name: 'SignUp'}],
            title: 'Login',
            msg: 'Username or Password not matching',
          })
        }
      })
    } catch (error) {
      res.status(400).alert('Invalid Login Details', error)
    }
  })

  return logRouter
}

module.exports = route
