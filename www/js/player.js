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

		this._textareaPlayerAnswer = $("#player-answer-box");
		this._playerBuzzerContainer = $("#player-buzzer");
		this._playerBuzzerImage = $('#buzzer-image');
		this._buttonConfirmUsername = $('#button-confirm-username');
		this._confirmUsernameSpinner = $('#username-loading');
		this._buttonLoginAnswer = $('#login-answer-button');
		this._imageContainer = $('#image-container');
		this._body = $('body');
		this._image = $("#image");
		this._imageOverlay = $('#image-overlay');
		this._imageQuestionIcon = $('#image-question-icon');
		this._imageRevealCountdown = $('#image-reveal-countdown');
		
		this._buttonLoginAnswer.prop('disabled', true);
		this._textareaPlayerAnswer.bind('input propertychange', e => this.sendAnswerText());
		this._playerBuzzerContainer.on( "click", e => this.playerBuzzerRequest());
		this._buttonConfirmUsername.on( "click", e => this.setUsernameRequest());
		this._buttonLoginAnswer.on( "click", e => this.loginAnswerRequest());
		this._confirmUsernameSpinner.hide();
		this._imageContainer.hide();
		
		this._body.keyup(e => {
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
		/*if(Cookies.get('USERNAME').length < 3){
			this._usernameModal.show();
		}else{
			$('#input-username').val(Cookies.get('USERNAME'));
			this.setUsernameRequest();
		}*/
	}
	
	initWS(onConnect){
		this._ws = new WS(this.WS_BASE_URL);
		this._ws.connect(() => onConnect(), (type, data) => {
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
				case this._ws.Types.ImageUploadResponse: // ImageUploadResponse
					this.imageUploadResponse(data);
					break;
				case this._ws.Types.ClearImageResponse: // ClearImageResponse
					this.clearImageResponse(data);
					break;
				case this._ws.Types.ShowImageResponse: // ShowImageResponse
					this.showImageResponse(data, false);
					break;
				default:
					console.log("UNKNOWN TYPE");
					break;
			}
		});
	}
	
	
	
	// --- Username and initial connection
	
	setUsernameRequest(){
		
		this._confirmUsernameSpinner.show();
		this._buttonConfirmUsername.prop("disabled", true);
		
		var username = username = $('#input-username').val(); // From modal
		Cookie.set("USERNAME", username, 7);
		
		var oldSessionId = Cookie.get("SESSION_ID");
		
		this.initWS(() => {
			this._ws.send(this._ws.Types.SetUsernameRequest, '{ "username": "' + username + '", "old_session_id": "' + oldSessionId + '" }');
		});
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
		
		var currentImage = data.room.image_as_base64;
		if(currentImage != null && currentImage.length > 32){
			this.imageUploadResponse(data.room);
			if(data.room.is_image_visible){
				this.showImageResponse('', true);
			}
		}
		
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
		
		
		this._textareaPlayerAnswer.prop("disabled", false);
		this._buttonLoginAnswer.prop('disabled', this._textareaPlayerAnswer.val().length <= 0);
		
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
		this._playerBuzzerImage.attr("src", "img/buzzer_dark_big.png");
	}
	
	enableBuzzer(){
		this._playerBuzzerImage.attr("src", "img/buzzer_big.png");
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
		var txt = this._textareaPlayerAnswer.val();
		this._buttonLoginAnswer.prop('disabled', txt.length <= 0);
		this._ws.send(this._ws.Types.PlayerAnswerUpdateRequest, '{ "answer": "' + btoa(txt) + '" }');
	}
	
	loginAnswerRequest(){
		this._textareaPlayerAnswer.prop("disabled", true);
		this._buttonLoginAnswer.prop('disabled', true);
		this._ws.send(this._ws.Types.LoginAnswerRequest, '');
		this.disableBuzzer();
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
	
	
	// --- Image Upload
	
	imageUploadResponse(data){
		this._image.css('opacity', 0);
		this._image.attr('src', data.image_as_base64);
		this._imageQuestionIcon.show();
		this._imageOverlay.css('background', '#00000099');
		this._imageContainer.show();
	}
	
	clearImageResponse(data){
		this._image.css('opacity', 0);
		this._image.attr('src', '#');
		this._imageContainer.hide();
	}
	
	showImageResponse(data, skipCountdown){
		this._imageQuestionIcon.hide();
		this._imageRevealCountdown.html('3');
		if(!skipCountdown){
			this._imageRevealCountdown.show();
			var count = 3;
			this._timer = setInterval(() => {
				count--;
				if (count === 0) {
					clearInterval(this._timer);
					this._imageRevealCountdown.hide();
					this._imageOverlay.css('background', '#00000000');
					this._image.css('opacity', 1);
				}else{
					this._imageRevealCountdown.html(count);
				}
			}, 1000);
		}else{
			this._imageRevealCountdown.hide();
			this._imageOverlay.css('background', '#00000000');
			this._image.css('opacity', 1);
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