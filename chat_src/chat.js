setTimeout(() => {
	const pagecontent = `
	<button id="openapp">Chat</button>
	<div id="container">
		<div id="messages"></div>
			<div id="inputs">
				<input autocomplete="off" id="message" placeholder="message"></input>
				<input autocomplete="off" id="recipient" placeholder="recipient (optional)"></input>
				<input autocomplete="off" id="username" placeholder="username"></input>
				<button id="send">send</button>
			</div>
		</div>
	<script src="main.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
	<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
	`

	let opened = false
	document.body.insertAdjacentHTML('beforeend', pagecontent)
	const container = document.getElementById("container")
	const openchat = document.getElementById("openapp")
	container.style.opacity = 0

	openchat.addEventListener("click", () => {
		if (opened) {
			container.style.opacity = 0
			container.style.pointerEvents = "none"
			opened = false
		} else {
			container.style.pointerEvents = "auto"
			container.style.opacity = 1
			opened = true
		}
	})


	timeOpened = new Date()
	console.log("hihhi")

	const send = document.getElementById("send")
	const message = document.getElementById("message")
	const recipient = document.getElementById("recipient")
	const username = document.getElementById("username")
	const messages = document.getElementById("messages")
	const notification = new Audio("notification.mp3")

	let usernameText = localStorage.getItem("username") || null
	username.value = usernameText
	send.addEventListener("click", sendMsg)

	function sendMsg() {
		if (message.value.trim() != "" && username.value.trim() != "") {
			const newMessage = document.createElement("div")
			newMessage.style.backgroundColor = "#9cffac"
			newMessage.className = "message sent"
			newMessage.textContent = `You: ${message.value}`
			messages.appendChild(newMessage)
			container.scrollTo({
				top: messages.scrollHeight,
				behavior: 'smooth'
			})
			let msg = [`${username.value}: ${message.value}`, recipient.value]
			socket.send(JSON.stringify({
				"method": "set",
				"user": "player",
				"project_id": "1135226211",
				"name": "☁ main",
				"value": encode(`[${msg[0]}, ${msg[1]}]`)
			}))
		}
		message.value = ""
	}

	function encode(text) {
		return text.split('').map(char => {
			let code = char.charCodeAt(0).toString().padStart(4, '0')
			return code
		}).join('')
	}

	function decode(encoded) {
		return encoded.match(/.{4}/g).map(num => String.fromCharCode(parseInt(num))).join('')
	}

	const socket = new WebSocket("wss://clouddata.turbowarp.org/")

	socket.addEventListener("open", () => { socket.send(JSON.stringify({ method: "handshake", user: "player", project_id: "1133733472" })) })

	socket.addEventListener("message", (resp) => {
		if (new Date() - timeOpened > 1000) {
			const newMessage = document.createElement("div")
			newMessage.className = "message received"
			let msgarray = decode(JSON.parse(resp.data).value).replace(/[^\w:,\s]/g, '').split(',').map(item => item.split(':').map(i => i.trim()))
			newMessage.textContent = `${msgarray[0][0]}: ${msgarray[0][1]}`
			if (msgarray[1] == username.value || msgarray[1] == "") {
				notification.currentTime = 0
				notification.play()
				messages.appendChild(newMessage)
				container.scrollTo({
					top: messages.scrollHeight,
					behavior: 'smooth'
				})
			}
		}
	})

	username.addEventListener("input", () => {
		localStorage.setItem("username", username.value)
	})

	document.addEventListener("keypress", (event) => {
		message.focus()
		if (event.key == "Enter") {
			sendMsg()
		}
	})

}, 0.1)