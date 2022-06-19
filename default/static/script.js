class Belay extends React.Component {
	constructor(props) {
	    super(props);
	    this.usernameHandler = this.usernameHandler.bind(this);
	    this.passwordHandler = this.passwordHandler.bind(this);
	    this.repasswordHandler = this.repasswordHandler.bind(this);
	    this.loginHandler = this.loginHandler.bind(this);
	    this.logoutHandler = this.logoutHandler.bind(this);
	    this.signupHandler = this.signupHandler.bind(this);
	    this.toggleLandingState = this.toggleLandingState.bind(this);
        console.log(this.props)
	   
	    this.state = {
	      username: '',
	      password: '',
	      repassword: '',
	      isLoggedIn: false,
	      session_token: null,
	      show_login: true
	    }
        console.log(this.state)
	}

	usernameHandler(e) {
        console.log("username handler")
		this.setState({username: e.target.value});
	}

	passwordHandler(e) {
		this.setState({password: e.target.value});
	}

	repasswordHandler(e) {
		this.setState({repassword: e.target.value})
	}

	toggleLandingState() {
		if (this.state.show_login == null) {
			this.setState({show_login: true});
		} else {
			this.setState({show_login: !this.state.show_login})
		}
		this.setState({
			username: "",
			password: "",
			repassword: ""
		});
	}

	loginHandler() {
		const password = this.state.password;
        const username = this.state.username;

		if (password == "") {
			alert("Please don't submit empty input.")
			return;
		}
		fetch("http://127.0.0.1:5000/api/login", {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({currentUserId: 0, username: username, password: password, auth: "NO"})
				}).then((response) => {
				if(response.status == 200) {
				response.json().then((data) => {
					document.cookie = "cookie= ;"
					document.cookie = "cookie=" + data.user_id + "/" + data.session_token;
					window.localStorage.setItem("session_token", data.session_token);
					window.localStorage.setItem("username", data.username);
					window.localStorage.setItem("user_id", data.user_id);
					this.setState({isLoggedIn: true});
					window.history.pushState({}, "", "/user/" + data.user_id);
				});
			} else {
				console.log(response.status);
				alert("wrong password")
				this.logoutHandler();
			}
				}).catch((response) =>{
				console.log(response);
				this.logoutHandler();
			})
	}

	signupHandler() {
		const username = this.state.username;
		const password = this.state.password;
		const repassword = this.state.repassword;
		if (username == "" || password == "" || repassword == "") {
			alert("Do not submit empty input.");
			return;
		} else if (password != repassword) {
			alert("Passwords don't match.");
			return;
		}
	    fetch("/api/signup", {
	      method: 'POST',
	      headers: {'Content-Type': 'application/json'},
	      body: JSON.stringify({username: username, password: password})
	    }).then((response) => {
	      if(response.status == 200) {
	        alert("Created user "+username);
	        document.getElementById("username").value = "";
	        document.getElementById("password").value = "";
	        document.getElementById("re-password").value = "";
	        this.setState({"username": "", "password": "", "repassword": ""});
	      } else {
	        alert("The username "+username+" already exists");
	      }
	    });
	}

	logoutHandler() {
		this.setState({isLoggedIn: false});
		localStorage.clear()
		window.location = "/";
	}

	authLogIn() {
		if (localStorage["user_id"]) {
			return true;
		}
		return false;
	}

	render() {

		var isLoggedIn = this.state.isLoggedIn;
		if (this.authLogIn()) {
			isLoggedIn = true;
		}
		console.log("show belay...");
		console.log("login in belay? " + isLoggedIn);
		if (this.state.show_login) {
			return (
				<div className="weblog">
					<Login
						isLoggedIn={isLoggedIn}
						username={this.state.username}
						password={this.state.password}
						usernameHandler={this.usernameHandler}
						passwordHandler={this.passwordHandler}
						loginHandler={this.loginHandler}
						logoutHandler={this.logoutHandler}
						toggleLandingState={this.toggleLandingState}
					/>
				</div>
			);
		} else if (this.state.show_login == false) {
            // console.log("sign stuck.")
			return (
				<div className="weblog">
					<Signup
						username={this.state.username}
					  	password={this.state.password}
					  	repassword={this.state.repassword}
					  	usernameHandler={this.usernameHandler}
					  	passwordHandler={this.passwordHandler}
					  	repasswordHandler={this.repasswordHandler}
					  	signupHandler={this.signupHandler}
					  	toggleLandingState={this.toggleLandingState}
					/> 
				</div>
			);
		} else {
			return
		}
		
	}
}

// Log In Component
class Login extends React.Component {
	render() {
		console.log("login? " + this.props.isLoggedIn);
		if(!this.props.isLoggedIn) {
			window.history.pushState({}, "", "/login");
			return (
				<div id="login-page" className="login-page">
					<div className="container-login">
				    	<div className="wrap-login">
							<div className="login-form">
								<span className="login-form-title">
                                    Start your journey
								</span>
								<div className="wrap-input">
									<label htmlFor="username" className="input">Username</label>
									<input id="username" className="input" type="text" value={this.props.username} onChange={this.props.usernameHandler}></input>
								</div>
								<div className="wrap-input">
									<label htmlFor="password" className="input">Password</label>
									<input id="password" className="input" type="password" value={this.props.password} onChange={this.props.passwordHandler}></input>
								</div>
								<div className="container-login-form-btn">
									<button id="login-login-btn" className="login-form-login-btn" onClick={this.props.loginHandler}>
									  Log In
									</button>
								</div>
								<ul className="login-more">									
									<li>
									    <span className="txt1">Don’t have an account?</span>
									    <a id="login-signup" className="txt2" onClick={this.props.toggleLandingState}>Sign up</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<Channel />
			);
		}
	}
}

class Channel extends React.Component {

	constructor(props) {
		super(props);
		this.createHandler = this.createHandler.bind(this);
		this.closeHandler = this.closeHandler.bind(this);
		this.createChannelHandler = this.createChannelHandler.bind(this);
		this.newChannelNameHandler = this.newChannelNameHandler.bind(this);
		this.channelDetailHandler = this.channelDetailHandler.bind(this);
		this.sendMessageHandler = this.sendMessageHandler.bind(this);
		this.newMessageHandler = this.newMessageHandler.bind(this);
		this.showReplyHandler = this.showReplyHandler.bind(this);
		this.closeThreadHandler = this.closeThreadHandler.bind(this);
		this.newReplyHandler = this.newReplyHandler.bind(this);
		this.sendReplyHander = this.sendReplyHander.bind(this);
		this.channelDeleteHandler = this.channelDeleteHandler.bind(this);
		this.showMoreMessagesHandler = this.showMoreMessagesHandler.bind(this);
		this.logOutHandler = this.logOutHandler.bind(this);
		this.backToChannelHandler = this.backToChannelHandler.bind(this);

		this.state = {
			channels: [],
			newChannelName: "",
			messages: [],
			replies: [],
			firstLoad: true,
			selectedChannelName: "",
			selectedChannelid: "",
			newMessage: "",
			newReply: "",
			selectedMessageId: "",
			selectedMessage: "",
			showSettingUsername: false,
			showBelay: false,
			sendReply: false

		};
	}
  
	backToChannelHandler() {
		const channelPage = document.getElementsByClassName("channel-bar-page")[0];
		channelPage.style.display = "block";
		const chatPage = document.getElementsByClassName("chat-page")[0];
		chatPage.style.display = "none";
	}

	// noChangeHandler() {
	// 	this.setState({showSettingUsername: false});
	// 	this.setState({showSettingEmail:false});

	// 	window.history.pushState({}, "", "/user/" + localStorage["user_id"]);
	// }

	showMoreMessagesHandler() {
		this.fetchMessages();
	}

	newReplyHandler(e) {
		this.setState({newReply: e.target.value});
	}

	closeThreadHandler() {
		document.getElementById("thread-page").style.display = "none";
		window.history.pushState({}, "", "/user/" + localStorage["user_id"] + 
								"?channel=" + this.state.selectedChannelid);
	}

	showReplyHandler(e){
		document.getElementById("thread-page").style.display = "block";
		this.setState({selectedMessageId: e.target.id});
		this.fetchReplies();
		this.fetchMessages();
		window.history.pushState({}, "", "/user/" + localStorage["user_id"] + 
								"?channel=" + this.state.selectedChannelid + 
								"&messageReply=" + e.target.id);
	}

	createHandler() {
		document.getElementById("sidebar-create-channel").style.display = "block";
    	document.getElementById("sidebar-create-btn").style.display = "none";
	}

	closeHandler() {
		document.getElementById("sidebar-create-channel").style.display = "none";
    	document.getElementById("sidebar-create-btn").style.display = "block";
	}

	newChannelNameHandler(e) {
		this.setState({newChannelName: e.target.value});
	}

	newMessageHandler(e) {
		this.setState({newMessage: e.target.value});
	}

	//post new reply
	sendReplyHander() {
		//post message
		const sender_id = localStorage["user_id"]
		const room_id = this.state.selectedChannelid;
		const body = this.state.newReply;
		var today = new Date(); 
		var now = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate() + ' ' + 
					today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		fetch("/api/messages", {
			method: "POST",
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({body: body, sender_id: sender_id, post_time: now, room_id: room_id, reply: "YES"})
		})
		.then((res) => {
			console.log("Reply sent!");
			document.getElementById("thread-page-send-text-area").value = "";
			return res.json()
		})
		.then((myJson) => {
			const reply_id = myJson["reply_id"];
			//post reply 
			fetch("/api/replies", {
				method: "POST",
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({reply_id: reply_id, original_mg_id: this.state.selectedMessageId})
			})
			.then((res) => {
				console.log("Reply added");
				this.fetchReplies();
				this.setState({sendReply: true});
				this.fetchMessages();
				this.setState({sendReply: false});
			})
		})
	}

	//get replies
	fetchReplies() {
		fetch("/api/replies")
			.then(res => {
				return res.json();
			})
			.then(myJson => {
				console.log(myJson);
				const res = myJson["replies"];
				console.log(res);
				console.log(this.state.selectedMessageId);
				this.setState({replies: [], selectedMessage: ""});
				res.forEach((reply) => {
					if (reply["original_mg_id"] == this.state.selectedMessageId) {
						this.setState({replies: reply["messages"], selectedMessage: reply["current_message"]});
					}
				});
				console.log(this.state.replies);
				if (document.getElementById("last-reply")) {
					document.getElementById("last-reply").scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
				}		
			});
	}


	//post new message
	sendMessageHandler() {
		const sender_id = localStorage["user_id"];
		const room_id = this.state.selectedChannelid;
		const body = this.state.newMessage;
		if (body == "") {
			alert("Please type your message!");
			return;
		}
		var today = new Date(); 
		var now = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate() + ' ' + 
					today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		fetch("/api/messages", {
			method: "POST",
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({body: body, sender_id: sender_id, post_time: now, room_id: room_id, reply: "NO"})
		})
		.then((res) => {
			console.log("Message sent!");
			document.getElementById("chat-page-send-text-area").value = "";
			this.setState({newMessage: ""});
			this.fetchChannels();
			this.fetchMessages();
		})
	}

	// create new channel
	createChannelHandler() {
		const newChannelName = this.state.newChannelName;
		if (newChannelName == "") {
			alert("Please give the channel a name!");
			return;
		}
		var today = new Date(); 
		var now = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate() + ' ' + 
					today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		const creator_id = localStorage['user_id'];
		fetch("/api/channels", {
			method: "POST",
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({channelname: newChannelName, create_time: now, creator_id: creator_id})
		})
		.then((res) => {
			if (res.status == 200) {
				console.log("Channel created!");
				this.fetchChannels();
				document.getElementById("sidebar-create-channel-name").value = "";
				this.setState({newChannelName: ""});
			}
		})
	}

	fetchMessages() {
		fetch("/api/messages")
			.then(res => {
				return res.json();
			})
			.then(myJson => {
				this.setState({messages: []});
				myJson["channels"].forEach((channel) => {
					if (channel["channel_id"] == this.state.selectedChannelid) {
						this.setState({messages: channel["messages"]}) 
					}
				});
				if (document.getElementById("last-message")) {
					document.getElementById("last-message").scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
				}
				this.updateLastMessage();
				if (!this.state.sendReply) {
					document.getElementById("chat-page-more-message").style.display = "none";
				}
			});
	}

	updateLastMessage() {
		const messages = this.state.messages;
		if (messages.length > 0) {
			const channel_id = this.state.selectedChannelid;
			const user_id = localStorage["user_id"];
			const last_mg_id = messages[messages.length - 1].mg_id;
			const current_total = this.state.messages.length;

			fetch("/api/last_message", {
			    method: 'POST',
			    headers: {'Content-Type': 'application/json'},
			    body: JSON.stringify({channel_id: channel_id, user_id:user_id, last_mg_id: last_mg_id, current_total: current_total})
			}).then((response) => {
				if (response.status == 200) {
					console.log("updated last_message");
				} else {
					alert("Something went wrong!");
				}
			}).catch((response) =>{
				console.log(response);
			});
		} else {
			console.log("trying to update last message but with empty messages");
		}
	}

	fetchChannels() {
		fetch("/api/channels")
			.then(res => {
				return res.json();
			})
			.then(myJson => {
				const channels = []
				const data = myJson["channels"]
				const currentUserId = localStorage['user_id'];
				data.forEach((channel) => {
					var number_of_unread = channel["number_of_messages"];
					channel["count"].forEach((count) => {
						if (count["user_id"] == currentUserId) {
							number_of_unread = count["unread"];
						}
					});
					if (number_of_unread > 0 && channel["channel_id"] == this.state.selectedChannelid) {
						console.log("show notification");
						document.getElementById("chat-page-more-message").style.display = "flex";
					}
					channels.push(
						<SiderbarChannel 
							channelname={channel["channel_name"]}
							creater_id={channel["creater_id"]}
							number_of_messages={number_of_unread}
							key={channel["channel_id"]}
							id={channel["channel_id"]}
							channelDetailHandler={this.channelDetailHandler}
							channelDeleteHandler={this.channelDeleteHandler}
						/>
					);
				});
				this.setState({channels: channels, firstLoad:false});
			});
	}

	channelDetailHandler(e) {
		const channel_id = e.target.id;
		this.setState({selectedChannelName: e.target.name, selectedChannelid: channel_id});
		this.fetchMessages();
		window.history.pushState({}, "", "/user/" + localStorage["user_id"] + "?channel=" + channel_id);
		if (window.matchMedia("(max-width: 768px)").matches) {
			const channelPage = document.getElementsByClassName("channel-bar-page");
			if (channelPage) {
				if(channelPage[0]) {
					channelPage[0].style.display = "none";
				}
			}
			const chatPage = document.getElementsByClassName("chat-page");
			if (chatPage) {
				if (chatPage[0]) {
					chatPage[0].style.display = "block";
				}
			}
		} 
	}

	channelDeleteHandler(e) {
		console.log("going to delete: " + e.target.name);
		const channel_id = e.target.name;
		fetch("/api/remove", {
			method: 'DELETE',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({channel_id: channel_id})
		}).then((response) => {
			if (response.status == 200) {
				console.log("Delete channel " + channel_id);
				this.fetchChannels();
				if (this.state.selectedChannelid == channel_id) {
					this.setState({selectedChannelName: ""});
				}
			} else {
				alert("Delete failed.");
			}
		}).catch((response) => {
			console.log(response);
		});
	}

	logOutHandler() {
		this.setState({showBelay: true});
		document.cookie = "cookie= ;"
		localStorage.clear();
		window.location = "/";
	}

	componentDidMount() {
	    this.interval = setInterval(() => {
	    	this.fetchChannels();
	    }, 1000);
	}

	componentWillUnmount() {
	    clearInterval(this.interval);
	}

	render() {
		if (this.state.showBelay) {
			return(
				<Belay />
			);
		} else {
			return (
				<div id="channel-page" className="channel-page">
					
					<ChannelBar 
						channels={this.state.channels}
						createHandler={this.createHandler}
						closeHandler={this.closeHandler}
						newChannelNameHandler={this.newChannelNameHandler}
						createChannelHandler={this.createChannelHandler}
						logOutHandler={this.logOutHandler}

					/>
					<ChatPage 
						messages={this.state.messages}
						channelname={this.state.selectedChannelName}
						newMessageHandler={this.newMessageHandler}
						sendMessageHandler={this.sendMessageHandler}
						showReplyHandler={this.showReplyHandler}
						showMoreMessagesHandler={this.showMoreMessagesHandler}
						currentUserId={localStorage["user_id"]}
						backToChannelHandler={this.backToChannelHandler}
					/>
					<ThreadPage 
						closeThreadHandler={this.closeThreadHandler}
						newReplyHandler={this.newReplyHandler}
						sendReplyHander={this.sendReplyHander}
						messages={this.state.replies}
						message={this.state.selectedMessage}
					/>
				</div>
			);
		}
	}
}

// Sign Up Component
class Signup extends React.Component {
	render() {
		window.history.pushState({}, "", "/signup");
        console.log("start signup")
		return (
	        <div className="signup-page">
				<div className="container-login">
					<div className="wrap-login">
						<div className="login-form">
							<span className="login-form-title">
								Come to signup
								<br />
								<a>register into here and start to chat</a>
							</span>
							<div className="wrap-input">
								<label htmlFor="username" className="input">Username</label>
								<input id="username" className="input" type="text" value={this.props.username} onChange={this.props.usernameHandler} />
							</div>
							<div className="wrap-input">
								<label htmlFor="password" className="input">Password</label>
								<input id="password" className="input" type="password" value={this.props.password} onChange={this.props.passwordHandler} />
							</div>
							<div className="wrap-input">
								<label htmlFor="re-password" className="input">Re-Enter Password</label>
								<input id="re-password" className="input" type="password" value={this.props.repassword} onChange={this.props.repasswordHandler} />
							</div>
							<div className="container-login-form-btn">
								<button id="login-signup-btn" className="login-form-login-btn" onClick={this.props.signupHandler}>
									Sign up
								</button>
							</div>
							<ul className="login-more">
							  <li>
							      <span className="txt1">Already have an account? </span>
							      <a id="login-signup" className="txt2" onClick={this.props.toggleLandingState}>Log In</a>
							   </li>
							</ul>
						</div>
					</div>
				</div>
	        </div>
		);
	}
}

class SidebarWelcome extends React.Component {
	render() {
		const username = this.props.username;
		return (
			<div className="sidebar-welcome">
				<h3>Welcome!</h3>
				<p id="sidebar-welcome-username">{username}</p>
				<button id="sidebar-welcome-logout" onClick={this.props.logOutHandler}>Log Out</button>
			</div>
		)
	}
}

class SiderbarCreateButton extends React.Component {
	render() {
		return (
			<div id="sidebar-container">
				<a id="sidebar-create-btn" onClick={this.props.createHandler}>+ Create</a>
				<div id="sidebar-create-channel">
					<div className="sidebar-create-channel-container">
						<div className="wrap-input">
			                <label className="input">New Channel</label>
							<input id="sidebar-create-channel-name" className="input" type="text" onChange={this.props.newChannelNameHandler}/>
						</div>
						<div className="container-login-form-btn">
							<button id="sidebar-create-channel-btn" className="sidebar-create-channel-btn" onClick={this.props.createChannelHandler}>
								Create
							</button>
						</div>
						<div className="container-login-form-btn">
							<button id="sidebar-create-channel-close-btn" className="sidebar-create-channel-close-btn" onClick={this.props.closeHandler}>
								Close
							</button>
						</div>
				    </div>
			    </div>
			</div>
		);
	}
}

class SiderbarChannel extends React.Component {
	render() {
		const channelname = this.props.channelname;
		const currentUserId = localStorage["user_id"]
		if (currentUserId == this.props.creater_id) {
			return (
				<div className="sidebar-channel-container">	
					<a id={this.props.id} className="sidebar-channel" onClick={this.props.channelDetailHandler} name={channelname}># {channelname}</a>
					<p id="sidebar-channel-unread-count-0" className="sidebar-channel-unread-count">{this.props.number_of_messages}</p>
					<button id="sidebar-channel-delete-btn" className="sidebar-channel-delete-btn" onClick={this.props.channelDeleteHandler} name={this.props.id}>delete</button>
				</div>
			);
		} else {
			return (
				<div className="sidebar-channel-container">
					<a id={this.props.id} className="sidebar-channel" onClick={this.props.channelDetailHandler} name={channelname}>{channelname}</a>
					<p id="sidebar-channel-unread-count-0" className="sidebar-channel-unread-count">{this.props.number_of_messages}</p>
				</div>
			);
		}
	}
}

class ChannelBar extends React.Component {
	render() {
		const username = localStorage['username']
		return (
			<div className="channel-bar-page"> 
				<SidebarWelcome 
					username={username}
					logOutHandler={this.props.logOutHandler}
					/>
				<div className="sidebar">
					<h3 className="sidebar-title">Channel</h3>
					{this.props.channels}
				</div>
				<SiderbarCreateButton 
					createHandler={this.props.createHandler}
					closeHandler={this.props.closeHandler}
					newChannelNameHandler={this.props.newChannelNameHandler}
					createChannelHandler={this.props.createChannelHandler}
					/>
			</div>
		);
	}
}

class ChatPageBar extends React.Component {
	render() {
		return (
			<div className="chat-page-upperbar">
				<div className="chat-page-title-container">
				    <h1 id="chat-page-title-name">&nbsp; # {this.props.channelname}</h1>
				</div>
			</div>
		);
	}
}

class ChatPageSender extends React.Component {
	render() {
		return (
			<div className="chat-page-send-container">
			    <div className="chat-page-send-form-container">
			        <label className="input"><b>Message</b></label>
					<div className="chat-page-send-form-text-container">
						<textarea id="chat-page-send-text-area" placeholder="Type message.." className="input" onChange={this.props.newMessageHandler} required></textarea>
						<br/>
						<button id="chat-page-send-btn" onClick={this.props.sendMessageHandler}>
							<img className="btn-pic" src="/static/images/send-message.png" />
						</button>
					</div>
			    </div>
			</div>
		);
	}
}


class Message extends React.Component {
	render() {
		const message = this.props.message;
		const body = message.body;
		const url = extractUrl(body);
		var img;
		if (url) {
			img = <img src={url} id="chat-page-img"/>
		}
		var replies = 0;
		if (message.replies) {
			replies = message.replies;
		}
		let reply;
		if (replies > 0) {
			reply = <div className="replies"> <a id={message.mg_id} className="chat-page-reply" onClick={this.props.showReplyHandler}> {replies} replies</a> </div>;
		} 
		let avatar;
		if (this.props.currentUserId == message.sender_id) {
			avatar = <img id="Avatar" src="http://localhost:5000/static/images/me.png"/>
		} else {
			avatar = <img id="Avatar" src="http://localhost:5000/static/images/other.png"/>
		}
		return (
			<div className="chat-page-content">
				<span id="time-span"> {message.post_time}</span>
				{avatar}
				<p className="chat-page-msg"> <strong>{message.username}</strong>: {body} </p>
				{img}
				{reply}
				<div className="reply-btn">
					<button id={message.mg_id} className="chat-page-reply-btn" onClick={this.props.showReplyHandler}>reply</button>
				</div>
			</div>
		);
	}
}


class Messages extends React.Component {
	render() {
		const messages = this.props.messages;
		const mgs = [];
		messages.forEach((message) => {
			mgs.push(
				<Message 
					message={message}
					showReplyHandler={this.props.showReplyHandler}
					key={message.mg_id}
					currentUserId={this.props.currentUserId}
					/>
			);
		});
		var today = new Date(); 
		var now = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate() + ' ' + 
					today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		return (
			<div className="chat-page-content-big-container" >
				<div id="chat-page-content-container">
					<div id="chat-page-more-message">
						<a id="chat-page-more-message-btn" onClick={this.props.showMoreMessagesHandler}>Click to Update Message</a>
					</div>
					{mgs}
				</div>
				<div id="last-message"/>
			</div>	
		)
	}
}


class ChatPage extends React.Component {
	render() {
		return (
			<div className="chat-page">
				<ChatPageBar 
					channelname={this.props.channelname}
					backToChannelHandler={this.props.backToChannelHandler}
					/>
				<Messages 
					messages={this.props.messages}
					showReplyHandler={this.props.showReplyHandler}
					showMoreMessagesHandler={this.props.showMoreMessagesHandler}
					currentUserId={this.props.currentUserId}
					/>
				<ChatPageSender 
					sendMessageHandler={this.props.sendMessageHandler}
					newMessageHandler={this.props.newMessageHandler}
					/>
			</div>
		);
	}
}


//Thread Page Part
// Sigle Reply Compent
class Reply extends React.Component {
	render() {
		return (
			<div className="thread-page-content">
				<p> {this.props.message.username}: {this.props.message.body}</p>
				<span>{this.props.message.post_time}</span>
			</div>
		);
	}
}

// Thread Page Component
class ThreadPage extends React.Component {
	render() {
		const messages = this.props.messages;
		const replies = [];
		const current_message = this.props.message;
		messages.forEach((message) => {
			replies.push(
				<Reply 
					message={message}
					key={message.mg_id}
					/>
			);
		});
		let title;
		if (current_message) {
			title = <h3 id="thread-page-title">{current_message.username}: {current_message.body}</h3>;
		} else {
			title = <h3 id="thread-page-title">No replies yet.</h3>;
		}
		return (
			<div id="thread-page">
				{title}
				<span id="thread-page-time"> {current_message.post_time}</span>
			    <div id="thread-page-container">
			    	{replies}
				    <a id="thread-close-btn" onClick={this.props.closeThreadHandler}>- Close</a>
				    <div className="thread-page-send-form-container">
				        <label className="input"><b>Reply</b></label>
				        <textarea id="thread-page-send-text-area" placeholder="Type message.." className="input" onChange={this.props.newReplyHandler} required></textarea>
				        <br/>
				        <button id="thread-page-send-btn" onClick={this.props.sendReplyHander}>
							<img className="btn-pic" src="/static/images/send-message.png" />
						</button>
				    </div>
				    <div id="last-reply"/>
				</div>
			</div>
		);
	}
}

function extractUrl(msg) {
    var urlRegex = /(https?:\/\/[^ ]*)/;
    var url = msg.match(urlRegex);
    if (url) {
    	return url[1];
    }
    return url;
}

// ========================================


ReactDOM.render(
  <Belay />,
  document.getElementById('root')
);

