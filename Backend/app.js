const {name} = require('ejs')
const express = require('express')
const socket = require('socket.io')
const path = require('path')
const app = new express()

const port = process.env.PORT || 4000
const static_path = path.join(__dirname, './public')
const bodyParser = require('express').json
const cookieParser = require('cookie-parser')

const nav = [
  {link: '/home', name: 'Home'},
  {link: '/log', name: 'Log Out'},
]

const server = app.listen(port, () => {
  console.log('Server ready at http://localhost:' + port)
})

const io = socket(server)

const regRouter = require('./src/routes/regRoutes')(nav)
const homeRouter = require('./src/routes/homeRoutes')(nav)
const logRouter = require('./src/routes/logRoutes')(nav)
const infoRouter = require('./src/routes/infoRoutes')(nav)
const consultRouter = require('./src/routes/consultRoutes')(nav, io)

app.use(bodyParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(static_path))
app.use(cookieParser())
app.set('view engine', 'ejs')
app.set('views', './src/views')
app.use('/home', homeRouter)
app.use('/signup', regRouter)
app.use('/request', infoRouter)
app.use('/log', logRouter)
app.use('/consult', consultRouter)
// app.use('/add', addRouter)

app.get('/', function (req, res) {
  res.clearCookie('id')
  res.clearCookie('patient')
  res.render('login', {
    nav: [{link: '/signup', name: 'SignUp'}],
    title: 'Login',
    msg: '',
  })
})

app.get('/signup', function (req, res) {
  res.render('register', {
    nav: [{link: '/', name: 'Login'}],
    title: 'Sign Up',
  })
})

app.get('/home', function (req, res) {
  res.render('home', {
    nav,
    title: 'Home',
  })
})
