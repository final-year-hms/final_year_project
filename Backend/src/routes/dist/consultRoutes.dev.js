"use strict";

var express = require('express');

var consultRouter = express.Router();

var Registerdata = require('../model/Registerdata');

var ViewData = require('../model/Viewdata');

function route(nav, io) {
  var cid = '';
  consultRouter.get('/', function (req, res) {
    res.render('search', {
      nav: nav,
      title: 'Search Doctor',
      msg: ''
    });
  });
  consultRouter.post('/', function (req, res) {
    if (req.cookies.id == undefined || req.cookies.id == undefined) {
      res.redirect('/');
    }

    var name = req.body.name;
    var id = req.cookies.id;
    Registerdata.find({
      name: name
    }, function (err, user) {
      console.log(req.body.name);
      console.log(user);

      if (user.length == 0) {
        res.render('search', {
          nav: nav,
          title: 'Search Doctor',
          msg: 'No doctor found'
        });
      } else if (user[0].name == name) {
        ViewData.findOne({
          id: id
        }, function (err, data) {
          res.cookie('chat', data.messages[user[0].id]);
          res.redirect('/consult/chat');
        });
      } else {
        console.log('No doctor found');
      }
    });
  });
  consultRouter.get('/chat', function (req, res) {
    if (req.cookies.chat == '' || req.cookies.chat == undefined) {
      res.redirect('/');
    }

    cid = req.cookies.chat;
    res.render('chat');
  });
  consultRouter.post('/chat', function (req, res) {
    if (req.cookies.chat == '' || req.cookies.chat == undefined) {
      res.redirect('/');
    }

    var id = req.cookies.chat;
    ViewData.findOneAndUpdate({
      id: id
    }, {
      $push: {
        messages: {
          user: req.cookies.name,
          msg: req.body.msg
        }
      }
    }, {
      upsert: true
    }, function () {
      ViewData.findOne({
        id: id
      }, function (err, data) {
        var msgar = data.messages;
        console.log(msgar);
        res.render('chat', {
          messages: msgar
        });
      });
    });
    console.log(req.body);
  });
  io.on('connection', function (client) {
    console.log('Client connected through socket');
    ViewData.findOne({
      id: cid
    }, function (err, data) {
      if (data != null) {
        console.log(cid);
        var msgar = data.messages;
        client.emit('message', msgar);
        console.log(msgar);
      }
    });
    client.on('send', function (data) {
      console.log('Client sent :', data);

      if (data.msg.includes('PT0')) {
        console.log("That's an id");
        data.msg = '###' + data.msg;
      }

      ViewData.findOneAndUpdate({
        id: cid
      }, {
        $push: {
          messages: data
        }
      }, {
        upsert: true
      }, function () {
        ViewData.findOne({
          id: cid
        }, function (err, data) {
          console.log(cid);
          var msgar = data.messages;
          client.emit('message', msgar);
          client.broadcast.emit('message', msgar);
        });
      });
    });
  });
  return consultRouter;
}

module.exports = route;