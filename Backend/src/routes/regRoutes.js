const express = require('express')
const regRouter = express.Router()
const Registerdata = require('../model/Registerdata')
const ViewData = require('../model/Viewdata')

function router(nav) {
  // regRouter.get('/',function(req,res){
  //     res.render('register',{
  //         nav,
  //         title: 'Signup'
  //     })
  // })
  regRouter.get('/', function (req, res) {
    res.render('register', {
      nav: [{link: '/', name: 'Login'}],
      title: 'Sign Up',
    })
  })
  regRouter.post('/register', async (req, res) => {
    try {
      const pass = req.body.pass
      const cpass = req.body.cpass
      if (pass === cpass) {
        const registeruser = new Registerdata({
          name: req.body.name,
          phn: req.body.phn,
          email: req.body.email,
          id: req.body.id,
          pass: req.body.pwd,
          cpass: req.body.conp,
          patient: true,
        })

        await registeruser.save()

        await ViewData.create({
          name: req.body.name,
          id: req.body.id,
          messages: {},
        })

        res.render('login', {
          nav,
          title: 'Login',
          msg: '',
        })
      } else {
        res.send('passwords not matching')
      }
    } catch (error) {
      res.status(400).send(error)
    }
  })

  return regRouter
}

module.exports = router
