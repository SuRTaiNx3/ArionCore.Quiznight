export default class WS {
	
	constructor(base_url){
		this._baseUrl = base_url;
		
		this.Types = {
			None: 0,
			SetUsernameRequest: 1,
			SetUsernameResponse: 2,
			JoinRoomRequest: 3,
			JoinRoomResponse: 4,
			LeaveRoomRequest: 5,
			LeaveRoomResponse: 6,
			PlayerAnswerUpdateRequest: 7,
			PlayerAnswerUpdateResponse: 8,
			PlayerBuzzerRequest: 9,
			PlayerBuzzerResponse: 10,
			ModifyPlayerScoreRequest: 11,
			ModifyPlayerScoreResponse: 12,
			UpdatePointsSettingsRequest: 13,
			ResetBuzzerRequest: 14,
			ResetBuzzerResponse: 15,
			ConfirmAnswerRequest: 16,
			ConfirmAnswerResponse: 17,
			KickRequest: 18,
			KickResponse: 19,
		};
	}
	
	connect(onMessageEvent){
		this._onMessageEvent = onMessageEvent;
		this._socket = new WebSocket(this._baseUrl);
		this.registerEvents();
	}
	
	disconnect(){
		this._socket.close();
	}
	
	send(type, json){
		this._socket.send(type + '$' + json);
		//console.log("Message sent to server: Type="+ type + " JSON=" + json);
	}
	
	registerEvents(){
		// Open
		this._socket.onopen = () => {
			//console.log("WebSocket connection opened");		
		};
		
		this._socket.onmessage = (event) => {
			//console.log("Message from the server:", event.data);
			this.processMessage(event.data);
		};
		
		this._socket.onclose = (event) => {
			//console.log("WebSocket connection closed");
		};
		
		this._socket.onerror = (error) => {
			console.error("WebSocket error:", error);
		};
	}
	
	processMessage(message){
		
		var data = message.split('$');
		if(data.length != 2){
			console.log("ERROR: Message malformed!");
			return;
		}
		
		var type = parseInt(data[0]);
		var body = JSON.parse(data[1]);
		
		this._onMessageEvent(type, body);
	}
	
};