const socket = io()
let username = ''
let userList = ''
let disconnect = false

let loginPage = document.querySelector('#loginPage')
let chatPage = document.querySelector('#chatPage')

let loginInput = document.querySelector('#loginNameInput')
let textInput = document.querySelector('#chatTextInput')

loginPage.style.display = 'flex'
chatPage.style.display = 'none'

function renderUserList(){
    let ul = document.querySelector('.userList')
    ul.innerHTML = ''

    userList.forEach(i => {
        ul.innerHTML += i != username ? `<li>${i}</li>`:`<li id="me">${i}</li>`
    })
}

function addMessage (type, msg, user) {
    let ul = document.querySelector('.chatList')

    switch(type) {
        case 'system':
            ul.innerHTML += `<li class="m-system">${msg}</li>`
        break
        case 'user':
            ul.innerHTML += username == user? 
            `<li class="m-user"><span class="me">${user}</span>${msg}</li>`:
            `<li class="m-user"><span>${user}</span>${msg}</li>`
        }
    ul.scrollTop = ul.scrollHeight
}

function request_login(e) {
    if(e.keyCode === 13) {
        let name = loginInput.value.trim()
        if(name != ''){
            socket.emit('join-request', name)
        }
    }
}
loginInput.addEventListener('keyup', request_login)

textInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13){
        let msg = textInput.value.trim()
        textInput.value = ''

        if(msg != '') {
            socket.emit('send-msg', msg)
        }
    }
})

socket.on('user-ok', (data) => {//retorno da join-request success
    username = data.user
    document.title = 'Chat ('+username+')'

    loginPage.style.display = 'none'
    chatPage.style.display = 'flex'
    textInput.focus()

    addMessage('system', 'Você entrou no chat!')

    userList = data.list
    renderUserList()
})
socket.on('user-used', (name) => {//retorno da join-request user-used 
    if(!disconnect){
        loginPage.innerHTML += `<p><span class="name">${name}</span> já tem. Escolha outro nome..</p>`
        loginInput.focus()
        loginInput.removeEventListener('keyup', request_login)
        loginInput.addEventListener('keyup', request_login)
    } else {
        addMessage('system', 'Você não pode retornar ao chat, entrou alguém com o mesmo nome!')
    }
})

socket.on('list-update', (data) => {
    if(data.joined){
        addMessage('system', `${data.joined} entrou no chat!`)
    }
    if(data.left){
        addMessage('system', `${data.left} saiu do chat!`)
    }

    userList = data.list
    renderUserList()
})

socket.on('show-msg', (data) => {
    addMessage('user', data.message, data.username)
})

socket.on('disconnect', () => {
    addMessage('system', 'Você foi desconectado!')
    disconnect = true
})
socket.on('reconnect_error', () => {
    addMessage('system', 'Tentando reconectar... Verifique seu acesso a Internet !')
})
socket.on('reconnect', () => {
    socket.emit('join-request', username)
})