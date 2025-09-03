const express = require('express')
const path = require('path')
const http = require('http')
const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

server.listen(3000)

app.use(express.static(path.join(__dirname, 'public')))

let connectedUsers = []

io.on('connection', (socket) => {
    socket.on('join-request', (username) => {
        if(!connectedUsers.includes(username) && username){
            socket.username = username
            connectedUsers.push( username )
            obj = {user: username, list: connectedUsers}

            socket.emit('user-ok', obj)
            socket.broadcast.emit('list-update', {
                joined: username,
                list: connectedUsers
            })
        } else {
            socket.emit('user-used', username)
        }
    })
    socket.on('disconnect', () =>  {
        connectedUsers = connectedUsers.filter(u => u != socket.username)
        console.log(connectedUsers)
        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connectedUsers
        })
    })
    socket.on('send-msg', (msg) => {
        let obj = {
            username: socket.username,
            message: msg
        }
        socket.emit('show-msg', obj)
        socket.broadcast.emit('show-msg', obj)
    })
})