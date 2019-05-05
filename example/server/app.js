const http = require('http')
const socket = require('socket.io')
const Koa = require('koa')
const PP = require('../../package/pp/src/index')
const controllers = require('./controllers')


const app = new Koa()

const server = http.Server(app.callback())
const io = socket(server)
new PP(io, controllers)



server.listen(3000)