import Cookie from './common/cookie.js';
import Theme from './common/theme.js';
import WS from './common/ws.js';
import Helper from './common/helper.js';

export default class Moderator {
	
	constructor(room_code, base_url, ws_base_url){
		
		this.ROOM_CODE = room_code;
		this.BASE_URL = base_url;
		this.WS_BASE_URL = ws_base_url;
		
		this.initControls();
		this.initWS(() => {
			this.setUsernameRequest();
		});
	}
	
	initControls(){
		
		this._inputScorePerCorrectAnswer = $('#input-score-per-correct-answer');
		this._inputScorePerWrongAnswer = $('#input-score-per-wrong-answer');		
		this._buttonResetBuzzer = $('#reset-buzzer-button');
		this._inputCopyRoomCode = $('#copy-room-code-input');
		this._buttonCopyRoomCode = $('#copy-room-code-button');
		
		this._buttonKickPlayer = $('#kick-player');
		
		this._buttonResetImage = $('#reset-image-button');
		this._buttonShowImage = $('#show-image-button');
		this._imageDropArea = $('#drop-area');
		this._droppedImage = $('#dropped-image');
		this._droppedImageOverlay = $('#dropped-image-overlay');
		this._invisibleIcon = $('#image-invisible-icon');
		this._dropText = $('#drop-text');
		this._imageUploadSpinner = $('#image-upload-spinner');
		this._imageRevealCountdown = $('#image-reveal-countdown');
		
		this._inputScorePerCorrectAnswer.bind('input propertychange', e => this.updatePointsSettings(e));
		this._inputScorePerWrongAnswer.bind('input propertychange', e => this.updatePointsSettings(e));
		
		this._buttonResetBuzzer.on('click', e => this.resetBuzzerRequest(e));
		this._buttonKickPlayer.on('click', e => this.kickRequest(e));
		
		this._inputCopyRoomCode.val(this.ROOM_CODE);
		
		this._buttonCopyRoomCode.on('click', e => {
			this._buttonCopyRoomCode.toggle('highlight', {}, 500, () => {
				this._buttonCopyRoomCode.removeAttr('style').show();
			});
			this.copyRoomCode();
		});
		
		this._modalKickConfirm = new bootstrap.Modal( 
			document.getElementById("modal-kick-confirm"), { 
				keyboard: false,
				focus: true,
				backdrop: 'static'
			}
		);
		
		// Image stuff
		this._imageUploadSpinner.hide();
		this._droppedImage.hide();
		this._invisibleIcon.hide();
		this._dropText.show();
		
		this._buttonResetImage.on('click', e => {
			this._ws.send(this._ws.Types.ClearImageRequest, '');
		});
		this._buttonShowImage.on('click', e => {
			this._ws.send(this._ws.Types.ShowImageRequest, '');
		});
		
		this._imageDropArea.on('dragenter', (e) => {
			e.preventDefault();
		});
		this._imageDropArea.on('dragover', (e) => {
			e.preventDefault();
			this._imageDropArea.css('border-color', '#fff');
		});
		this._imageDropArea.on('dragleave', (e) => {
			e.preventDefault();
			this._imageDropArea.css('border-color', '#3b3b3b');
		});

		this._imageDropArea.on('drop', (e) => {
			e.preventDefault();
			
			this._invisibleIcon.hide();
			this._dropText.hide();
			this._imageUploadSpinner.show();
			this._imageDropArea.css('border-color', '#3b3b3b');
			
			var image = e.originalEvent.dataTransfer.files[0];
			
			Helper.getBase64(image, 
				(imageAsBase64) => {
					this._ws.send(this._ws.Types.ImageUploadRequest, '{ "image_as_base64": "' + imageAsBase64 + '" }');
				},
				(err) => {
					console.log(err);
				}
			);
		});
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
					this.playerAnswerUpdateResponse(data);
					break;
				case this._ws.Types.PlayerBuzzerResponse: // PlayerBuzzerResponse
					this.playerBuzzerResponse(data);
					break;
				case this._ws.Types.ResetBuzzerResponse: // ResetBuzzerResponse
					this.resetBuzzerResponse();
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
				case this._ws.Types.LoginAnswerResponse: // LoginAnswerResponse
					this.loginAnswerResponse(data);
					break;
				default:
					console.log("UNKNOWN TYPE");
					break;
			}
		});
	}
	
	
	// --- Username and initial connection
	
	setUsernameRequest(){
		
		var username = "MODERATOR";
		Cookie.set("USERNAME", username, 7);
		
		var oldSessionId = Cookie.get("SESSION_ID");
		
		setTimeout(() => {
			this._ws.send(this._ws.Types.SetUsernameRequest, '{ "username": "' + username + '", "old_session_id": "' + oldSessionId + '" }');
		}, "2000");
	}
	
	setUsernameResponse(data){
		this._isBuzzerOpen = true;
		Cookie.set("SESSION_ID", data.session_id, 7);
		this._ws.send(this._ws.Types.JoinRoomRequest, '{ "room_code": "' + this.ROOM_CODE + '", "is_moderator": true }');
	}
	
	
	
	// --- Join Room
	
	joinRoomResponse(data){
		this.updatePlayerList(data.room.players);
		if(!data.room.is_buzzer_open){
			this._buttonResetBuzzer.prop('disabled', false);
		}
		
		var currentImage = data.room.image_as_base64;
		if(currentImage != null && currentImage.length > 32){
			this.imageUploadResponse(data.room);
			if(data.room.is_image_visible){
				this.showImageResponse(null, true);
			}
		}
		
		data.room.players.forEach(player => {
			if(player.has_buzzed){
				this.highlightBuzzerWinner(player.session_id);
			}
		});
		
		$('#loading-overlay').hide();
	}
	
	
	
	// --- Buzzer
	
	playerBuzzerResponse(data){
		this.highlightBuzzerWinner(data.winner_session_id);
		this.playBuzzerPressedSound();
	}
	
	highlightBuzzerWinner(session_id){
		var playerRow = this.getPlayerRowBySessionId(session_id);
		if(playerRow != null){
			$(playerRow).find('.img-player-buzzer').first().attr("src", "img/buzzer_small.png");
			$(playerRow).css("border", "2px solid red");
			$(playerRow).css("border-style", "double");
			
			$(playerRow).find('.player-action-buttons').show();
			
			this._isBuzzerOpen = false;
			this._buttonResetBuzzer.prop('disabled', false);
		}
	}
	
	resetBuzzerRequest(e){
		this._ws.send(this._ws.Types.ResetBuzzerRequest, '{ }');
	}
	
	resetBuzzerResponse(){
		this._buttonResetBuzzer.prop('disabled', true);
		$(".player-action-buttons").hide();
		$("[id=tr-player]").css("border", "2px solid transparent");
		$("[id=tr-player]").css("border-style", "double");
		$(".img-player-buzzer").attr("src", "img/buzzer_dark_small.png");
		$('#ta-player-answer').css('border-color', '#532a2a');
	}
	
	acceptAnswer(e){
		var playerSessionId = $(e.target).closest('#tr-player').data("session-id");
		this._ws.send(this._ws.Types.ConfirmAnswerRequest, '{ "player_session_id": "' + playerSessionId + '", "was_correct": true }');
	}
	
	declineAnswer(e){
		var playerSessionId = $(e.target).closest('#tr-player').data("session-id");
		this._ws.send(this._ws.Types.ConfirmAnswerRequest, '{ "player_session_id": "' + playerSessionId + '", "was_correct": false }');
	}
	
	confirmAnswerResponse(data){
		this._buttonResetBuzzer.prop('disabled', true);
		this.updatePlayerList(data.room.players);
		
		if(data.was_correct){
			this.playCorrectAnswerSound();
		}else{
			this.playWrongAnswerSound();
		}
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
	
	playerAnswerUpdateResponse(data){
		var fromSessionId = data.session_id;
		var answer = atob(data.answer);
		
		var playerRow = this.getPlayerRowBySessionId(fromSessionId);
		if(playerRow != null){
			$(playerRow).find('#ta-player-answer').first().val(answer);
		}
	}

	modifyPlayerScore(e){
		var playerSessionId = $(e.target).closest('#tr-player').data("session-id");
		var newScore = parseInt($(e.target).val());
		
		this._ws.send(this._ws.Types.ModifyPlayerScoreRequest, '{ "session_id": "' + playerSessionId + '", "score": "' + newScore + '" }');
	}
	
	updatePointsSettings(e){
		var pointsCorrect = this._inputScorePerCorrectAnswer.val();
		var pointsWrong = this._inputScorePerWrongAnswer.val();
		
		this._ws.send(this._ws.Types.UpdatePointsSettingsRequest, '{ "points_correct": "' + pointsCorrect + '", "points_wrong": "' + pointsWrong + '" }');
	}
	
	loginAnswerResponse(e){
		var playerRow = this.getPlayerRowBySessionId(e.player_session_id);
		if(playerRow != null){
			$(playerRow).find('#ta-player-answer').first().css("border-color", "#338152");
			$(playerRow).find('.player-action-buttons').show();
			this._buttonResetBuzzer.prop('disabled', false);
		}
	}
	
	
	// --- Kick
	
	kickPlayerModal(e){
		var playerUsername = $(e.target).closest('#tr-player').find('#td-player-username').html();
		$('#username-to-kick').html(playerUsername);
		
		var playerSessionId = $(e.target).closest('#tr-player').data("session-id");
		$('#kick-player-session-id').val(playerSessionId);
		
		this._modalKickConfirm.show();
	}
	
	kickRequest(e){
		var playerSessionId = $('#kick-player-session-id').val();
		this._ws.send(this._ws.Types.KickRequest, '{ "session_to_remove": "' + playerSessionId + '" }');
	}
	
	kickResponse(data){
		var playerRow = this.getPlayerRowBySessionId(data.session_to_remove);
		if(playerRow != null){
			$(playerRow).remove();
		}
	}
	
	
	// --- Image Upload
	
	imageUploadResponse(data){
		this._imageUploadSpinner.hide();
		this._buttonResetImage.prop('disabled', false);
		this._buttonShowImage.prop('disabled', false);
		this._droppedImage.show();
		this._droppedImage.attr('src', data.image_as_base64);
		this._invisibleIcon.show();
		this._dropText.hide();
		this._droppedImageOverlay.css('background', '#00000099');
	}
	
	clearImageResponse(data){
		this._buttonResetImage.prop('disabled', true);
		this._buttonShowImage.prop('disabled', true);
		this._droppedImage.hide();
		this._droppedImage.attr('src', '#');
		this._invisibleIcon.hide();
		this._dropText.show();
	}
	
	showImageResponse(data, skipCountdown){
		this._buttonShowImage.prop('disabled', true);
		this._invisibleIcon.hide();
		this._imageRevealCountdown.html('3');
		if(!skipCountdown){
			this._imageRevealCountdown.show();
			var count = 3;
			this._timer = setInterval(() => {
				count--;
				if (count === 0) {
					clearInterval(this._timer);
					this._imageRevealCountdown.hide();
					this._droppedImageOverlay.css('background', '#00000000');
				}else{
					this._imageRevealCountdown.html(count);
				}
			}, 1000);
		}else{
			this._imageRevealCountdown.hide();
			this._droppedImageOverlay.css('background', '#00000000');
		}
	}
	
	
	// --- Moderator related js logic
	
	getPlayerRowBySessionId(sessionId){
		return $('#tr-player[data-session-id="'+ sessionId +'"]').first();
	}
	
	copyRoomCode(){
		navigator.clipboard.writeText(this.BASE_URL + '?rc=' + this.ROOM_CODE);
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
			
			var currentAnswer = '';
			if(player.current_answer != null){
				currentAnswer = player.current_answer;
			}
			
			html += `
				<tr class="player-row" id="tr-player" data-session-id="`+ player.session_id +`" data-answer-logged-in="`+ player.answer_logged_in +`" data-has-player-buzzed="`+ player.has_buzzed +`">
					<th scope="row">`+ index +`</th>
					<td id="td-player-buzzer"><img class="img-player-buzzer" src="img/buzzer_dark_small.png"/></td>
					<td id="td-player-username">`+ player.username +`</td>
					<td id="td-player-score"><input id="input-player-score" type="number" value="`+ player.score +`"></td>
					<td id="td-player-answer"><textarea id="ta-player-answer" rows="1" disabled>` + currentAnswer + `</textarea></td>
					<td id="td-player-correct">`+ player.correct +`</td>
					<td id="td-player-wrong">`+ player.wrong +`</td>
					<td id="td-player-buttons">
						<div class="btn-list player-action-buttons">
							<button type="button" class="btn btn-success btn-icon accept-answer-button">
								<svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M5 12l5 5l10 -10"></path></svg>
							</button>
							<button type="button" class="btn btn-danger btn-icon decline-answer-button">
								<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
							</button>
						</div>
					</td>
					<td id="td-player-kick" class="text-end">
						<button type="button" class="btn btn-warning btn-icon kick-player-button">
							<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-user-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h3.5" /><path d="M22 22l-5 -5" /><path d="M17 22l5 -5" /></svg>
						</button>
					</td>
				</tr>
			`;
			index++;
		});
		$('#player-table-tbody').html(html);
		
		$('#input-player-score').bind('input propertychange', e => this.modifyPlayerScore(e));
		$('.accept-answer-button').on('click', e => this.acceptAnswer(e));
		$('.decline-answer-button').on('click', e => this.declineAnswer(e));
		$('.kick-player-button').on('click', e => this.kickPlayerModal(e));
		
		var enableReset = false;
		
		$(".player-row").each((i, e) => {
			var answerLoggedIn = $(e).data('answer-logged-in');
			var hasBuzzed = $(e).data('has-player-buzzed');
			
			if(hasBuzzed){
				$(e).find('.img-player-buzzer').first().attr('src', 'img/buzzer_small.png');
				$(e).css('border", "2px solid red');
				$(e).css('border-style", "double');
				$(e).find('.player-action-buttons').show();
			}
			
			if(answerLoggedIn){
				$(e).find('.player-action-buttons').show();
				$(e).find('#ta-player-answer').first().css('border-color', '#338152');
			}
			
			if(!hasBuzzed && !answerLoggedIn){
				$(e).find('.player-action-buttons').hide();
			}
			
			if(!enableReset && (hasBuzzed || answerLoggedIn)){
				enableReset = true;
			}
			
		}).get();
		this._buttonResetBuzzer.prop('disabled', !enableReset);
	}
};