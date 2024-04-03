import Cookie from './common/cookie.js';
import Theme from './common/theme.js';
import WS from './common/ws.js';

export default class Player {
	
	constructor(room_code, base_url, ws_base_url){

		this.ROOM_CODE = room_code;
		this.BASE_URL = base_url;
		this.WS_BASE_URL = ws_base_url;

        this._theme = new Theme();
		this._theme.applyTheme();
		
		this.initControls();
	}
	
	initControls(){

		$("#player-answer-box").bind('input propertychange', e => this.sendAnswerText());
		$("#player-buzzer").on( "click", e => this.playerBuzzerRequest());
		$('#button-confirm-username').on( "click", e => this.setUsernameRequest());
		$('#username-loading').hide();
		
		$('body').keyup(e => {
			if(e.keyCode == 32 && document.activeElement.id != 'player-answer-box'){
				this.playerBuzzerRequest();
				e.preventDefault();
			}
		});
		
		this._kickedModal = new bootstrap.Modal( 
			document.getElementById("modal-kicked"), { 
				keyboard: false,
				focus: true,
				backdrop: 'static'
			}
		);
		
		this._usernameModal = new bootstrap.Modal( 
			document.getElementById("modal-player-name"), { 
				keyboard: false,
				focus: true,
				backdrop: 'static'
			}
		);
		this._usernameModal.show();
	}
	
	initWS(){
		this._ws = new WS(this.WS_BASE_URL);
		this._ws.connect((type, data) => {
			switch(type){
				case this._ws.Types.SetUsernameResponse: // SetUsernameResponse
					this.setUsernameResponse(data);
					break;
				case this._ws.Types.JoinRoomResponse: // JoinRoomResponse
					this.joinRoomResponse(data);
					break;
				case this._ws.Types.PlayerAnswerUpdateResponse: // PlayerAnswerUpdateResponse
					this.updatePlayerAnswer(data);
					break;
				case this._ws.Types.PlayerBuzzerResponse: // PlayerBuzzerResponse
					this.playerBuzzerResponse(data);
					break;
				case this._ws.Types.ModifyPlayerScoreResponse: // ModifyPlayerScoreResponse
					this.modifyPlayerScore(data);
					break;
				case this._ws.Types.ResetBuzzerResponse: // ResetBuzzerResponse
					this.resetBuzzerResponse(data);
					break;
				case this._ws.Types.ConfirmAnswerResponse: // ConfirmAnswerResponse
					this.confirmAnswerResponse(data);
					break;
				case this._ws.Types.KickResponse: // KickResponse
					this.kickResponse(data);
					break;
				default:
					console.log("UNKNOWN TYPE");
					break;
			}
		});
	}
	
	
	
	// --- Username and initial connection
	
	setUsernameRequest(){
		
		$('#username-loading').show();
		$('#button-confirm-username').prop("disabled", true);
		
		var username = username = $('#input-username').val(); // From modal
		Cookie.set("USERNAME", username, 7);
		
		var oldSessionId = Cookie.get("SESSION_ID");
		
		this.initWS();
		setTimeout(() => {
			this._ws.send(this._ws.Types.SetUsernameRequest, '{ "username": "' + username + '", "old_session_id": "' + oldSessionId + '" }');
		}, "2000");
	}
	
	setUsernameResponse(data){
		Cookie.set("SESSION_ID", data.session_id, 7);
		this._ws.send(this._ws.Types.JoinRoomRequest, '{ "room_code": "' + this.ROOM_CODE + '" }');
	}
	
	
	
	// --- Join Room
	
	joinRoomResponse(data){
		this._isBuzzerOpen = data.room.is_buzzer_open;
		if(!this._isBuzzerOpen){
			this.disableBuzzer();
		}
		this.updatePlayerList(data.room.players);
		
		data.room.players.forEach(player => {
			if(player.has_buzzed){
				this.highlightBuzzerWinner(player.session_id);
			}
		});
		
		this._usernameModal.hide();
	}
	
	
	
	// --- Buzzer
	
	playerBuzzerRequest(){
		if(!this._isBuzzerOpen){ return; }
		
		var ticks = ((new Date().getTime() * 10000) + 621355968000000000);
		this._ws.send(this._ws.Types.PlayerBuzzerRequest, '{ "ticks": "' + ticks + '" }');
		this.disableBuzzer();
	}
	
	playerBuzzerResponse(data){
		
		this._isBuzzerOpen = false;
		this.disableBuzzer();
		
		this.highlightBuzzerWinner(data.winner_session_id);
		this.playBuzzerPressedSound();
	}
	
	highlightBuzzerWinner(session_id){
		var playerRow = this.getPlayerRowBySessionId(session_id);
		if(playerRow != null){
			$(playerRow).find('.img-player-buzzer').first().attr("src", "img/buzzer_small.png");
			$(playerRow).css("border", "1px solid red");
		}
	}
	
	resetBuzzerResponse(){
		this._isBuzzerOpen = true;
		this.enableBuzzer();
		
		$("[id=li-player]").css("border", "0px solid red");
		$(".img-player-buzzer").attr("src", "img/buzzer_dark_small.png");
	}
	
	confirmAnswerResponse(data){
		this.updatePlayerList(data.room.players);
		this.resetBuzzerResponse();
		
		if(data.was_correct){
			this.playCorrectAnswerSound();
		}else{
			this.playWrongAnswerSound();
		}
	}
	
	
	disableBuzzer(){
		$("#buzzer-image").attr("src", "img/buzzer_dark_big.png");
	}
	
	enableBuzzer(){
		$("#buzzer-image").attr("src", "img/buzzer_big.png");
	}
	
	playBuzzerPressedSound(){
		var audio = new Audio('sounds/beep.mp3');
		audio.play();
	}
	
	playCorrectAnswerSound(){
		var audio = new Audio('sounds/bing.mp3');
		audio.play();
	}
	
	playWrongAnswerSound(){
		var audio = new Audio('sounds/noet.mp3');
		audio.play();
	}
	
	
	// --- Score and live answer
	
	modifyPlayerScore(data){
		var relatedSessionId = data.related_session_id;
		var score = data.score;
		
		var playerRow = this.getPlayerRowBySessionId(relatedSessionId);
		if(playerRow != null){
			$(playerRow).find('#player-score').first().html(score);
		}
	}
	
	sendAnswerText(){
		var txt = $("#player-answer-box").val();
		this._ws.send(this._ws.Types.PlayerAnswerUpdateRequest, '{ "answer": "' + btoa(txt) + '" }');
	}
	
	
	
	// --- Kick
	
	kickResponse(data){
		
		if(data.session_to_remove == Cookie.get("SESSION_ID")){
			this._ws.disconnect();
			this._kickedModal.show();
		}else{	
			var playerRow = this.getPlayerRowBySessionId(data.session_to_remove);
			if(playerRow != null){
				$(playerRow).remove();
			}
		}
	}
	
	
	
	// --- Player related js logic
	
	getPlayerRowBySessionId(sessionId){
		return $('#li-player[data-session-id="'+ sessionId +'"]').first();
	}
	
	updatePlayerList(players){
		if(players == null){
			return;
		}
		
		players.sort((a, b) => b.score - a.score);
		var index = 1;
		var html = '';
		players.forEach(function(player){
			
			if(!player.is_connected){
				return;
			}
			
			html += `
				<li id="li-player" data-session-id="`+ player.session_id +`" class="list-group-item d-flex justify-content-between align-items-center">
					<div>
						<img class="img-player-buzzer" src="img/buzzer_dark_small.png" style="width: 42px"/>
						<span id="player-username">`+ player.username +`</span>
					</div>
					<span id="player-score" class="badge text-bg-primary rounded-pill">`+ player.score +`</span>
				</li>
			`;
			index++;
		});
		$('#player-list').html(html);
	}
};