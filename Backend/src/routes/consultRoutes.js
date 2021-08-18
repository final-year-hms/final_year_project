const express = require('express')
const consultRouter = express.Router()

const Registerdata = require('../model/Registerdata')
const ViewData = require('../model/Viewdata')

const createChat = async (sid, rid, res) => {
  ViewData.findOne({id: rid}, (err, data) => {
    console.log(data)
    if (
      data.messages[sid] == undefined ||
      data.messages[sid] == null ||
      data.messages[sid] == ''
    ) {
      console.log("Couldn't find chat id in other side too")
      let result = ''
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      for (var i = 0; i < 10; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length)
        )
      }

      ViewData.create({id: result, messages: []}, () => {
        ViewData.findOneAndUpdate(
          {id: rid},
          {$set: {messages: {[sid]: result}}},
          {upsert: true},
          (err, resp) => {
            console.log('Callback after setting id at the other side')
            console.log('Error:', err)
            console.log('Response: ', resp)
          }
        )
          .then(() => {
            ViewData.findOneAndUpdate(
              {id: sid},
              {$set: {messages: {[rid]: result}}},
              {upsert: true},
              (response) => {
                console.log('Callback after setting id at this side')
                console.log('Response: ', response)
                res.cookie('chat', result)
                res.redirect('/consult/chat')
              }
            )
          })
          .catch((error) => {
            console.log('Error: ', error)
          })
      })
    } else {
      console.log('Found chat id on the other side as', data.messages[sid])
      console.log('Finding ', sid, ' and updating message ', data.messages[sid])

      ViewData.findOne({id: sid}, (ferr, fres) => {
        let msgobj = fres.messages
        msgobj[rid] = data.messages[sid]
        console.log('New expected object is: ', msgobj)
        ViewData.updateOne(
          {id: sid},
          {$set: {messages: msgobj}},
          {upsert: true},
          () => {
            res.cookie('chat', data.messages[sid])
            res.redirect('/consult/chat')
          }
        )
      })
    }
  })
}

const createUser = async (id, name, res, nav) => {
  console.log(`Create user ${name} with id ${id} `)
  await ViewData.create(
    {
      name,
      id,
      messages: {a: 'a'},
    },
    () => {
      res.render('search', {
        nav,
        title: 'Search Doctor',
        msg: 'Please search again to start the chat',
      })
    }
  )
}

function route(nav, io) {
  let cid = ''
  consultRouter.get('/', function (req, res) {
    res.render('search', {
      nav,
      title: 'Search Doctor',
      msg: '',
    })
  })

  consultRouter.post('/', function (req, res) {
    if (req.cookies.id == undefined || req.cookies.id == undefined) {
      res.redirect('/')
    }

    const name = req.body.name
    const id = req.cookies.id
    const patient = req.cookies.patient == 'true' ? true : false

    const query = patient ? {name, patient: false} : {name}

    Registerdata.find(query, function (err, user) {
      console.log(req.body.name)
      console.log(user)

      if (user.length == 0) {
        res.render('search', {
          nav,
          title: 'Search Doctor',
          msg: patient ? 'No doctor found' : 'No Doctor or Patient found',
        })
      } else if (user[0].name == name) {
        console.log('Doctor Found')
        ViewData.findOne({id}, (err, data) => {
          if (data == null) {
            console.log('User is not available in viewdata')
            createUser(id, req.cookies.name, res, nav)
          } else if (
            data.messages == undefined ||
            JSON.stringify(data.messages) == '{}'
          ) {
            console.log('messages is empty')

            createChat(id, user[0].id, res)
          } else {
            if (
              data.messages[user[0].id] == undefined ||
              JSON.stringify(data.messages[user[0].id]) == '{}'
            ) {
              console.log("The current user's chat is n/a")
              createChat(id, user[0].id, res)
            } else {
              res.cookie('chat', data.messages[user[0].id])
              res.redirect('/consult/chat')
            }
          }
        })
      } else {
        console.log('No doctor found')
      }
    })
  })

  consultRouter.get('/chat', (req, res) => {
    if (req.cookies.chat == '' || req.cookies.chat == undefined) {
      res.redirect('/')
    }

    cid = req.cookies.chat

    res.render('chat')
  })

  consultRouter.post('/chat', (req, res) => {
    if (req.cookies.chat == '' || req.cookies.chat == undefined) {
      res.redirect('/')
    }
    const id = req.cookies.chat

    ViewData.findOneAndUpdate(
      {id},
      {$push: {messages: {user: req.cookies.name, msg: req.body.msg}}},
      {upsert: true},
      () => {
        ViewData.findOne({id}, (err, data) => {
          let msgar = data.messages
          console.log(msgar)
          res.render('chat', {messages: msgar})
        })
      }
    )
    console.log(req.body)
  })

  io.on('connection', (client) => {
    console.log('Client connected through socket')
    ViewData.findOne({id: cid}, (err, data) => {
      if (data != null) {
        console.log(cid)
        let msgar = data.messages
        client.emit('message', msgar)
        console.log(msgar)
      }
    })

    client.on('send', (data) => {
      console.log('Client sent :', data)
      if (data.msg.includes('PT0')) {
        console.log("That's an id")
        data.msg = '###' + data.msg
      }
      ViewData.findOneAndUpdate(
        {id: cid},
        {$push: {messages: data}},
        {upsert: true},
        () => {
          ViewData.findOne({id: cid}, (err, data) => {
            console.log(cid)
            let msgar = data.messages
            client.emit('message', msgar)
            client.broadcast.emit('message', msgar)
          })
        }
      )
    })
  })

  return consultRouter
}

module.exports = route
