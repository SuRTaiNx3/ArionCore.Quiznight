import Cookie from './common/cookie.js';
import Theme from './common/theme.js';
import WS from './common/ws.js';

export default class Moderator {
	
	constructor(room_code, base_url, ws_base_url){
		
		this.ROOM_CODE = room_code;
		this.BASE_URL = base_url;
		this.WS_BASE_URL = ws_base_url;
		
		this.initControls();
		this.initWS();
		this.setUsernameRequest();
	}
	
	initControls(){
		
		$('#input-score-per-correct-answer').bind('input propertychange', e => this.updatePointsSettings(e));
		$('#input-score-per-wrong-answer').bind('input propertychange', e => this.updatePointsSettings(e));
		
		$('#reset-buzzer-button').on('click', e => this.resetBuzzerRequest(e));
		$('#kick-player').on('click', e => this.kickRequest(e));
		
		$('#copy-room-code-input').val(this.ROOM_CODE);
		$('#copy-room-code-button').on('click', e => {
			$('#copy-room-code-button').toggle('highlight', {}, 500, () => {
				$('#copy-room-code-button').removeAttr('style').show();
			});
			this.copyRoomCode();
		});
		
		this._kickConfirmModal = new bootstrap.Modal( 
			document.getElementById("modal-kick-confirm"), { 
				keyboard: false,
				focus: true,
				backdrop: 'static'
			}
		);
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
			$('#reset-buzzer-button').prop('disabled', false);
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
			$("#reset-buzzer-button").prop('disabled', false);
		}
	}
	
	resetBuzzerRequest(e){
		if(!this._isBuzzerOpen){
			this._ws.send(this._ws.Types.ResetBuzzerRequest, '{ }');
		}
	}
	
	resetBuzzerResponse(){
		$('#reset-buzzer-button').prop('disabled', true);
		$(".player-action-buttons").hide();
		$("[id=tr-player]").css("border", "2px solid transparent");
		$("[id=tr-player]").css("border-style", "double");
		$(".img-player-buzzer").attr("src", "img/buzzer_dark_small.png");
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
		$('#reset-buzzer-button').prop('disabled', true);
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
		var pointsCorrect = $('#input-score-per-correct-answer').val();
		var pointsWrong = $('#input-score-per-wrong-answer').val();
		
		this._ws.send(this._ws.Types.UpdatePointsSettingsRequest, '{ "points_correct": "' + pointsCorrect + '", "points_wrong": "' + pointsWrong + '" }');
	}
	
	
	
	// --- Kick
	
	kickPlayerModal(e){
		var playerUsername = $(e.target).closest('#tr-player').find('#td-player-username').html();
		$('#username-to-kick').html(playerUsername);
		
		var playerSessionId = $(e.target).closest('#tr-player').data("session-id");
		$('#kick-player-session-id').val(playerSessionId);
		
		this._kickConfirmModal.show();
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
			
			html += `
				<tr id="tr-player" data-session-id="`+ player.session_id +`">
					<th scope="row">`+ index +`</th>
					<td id="td-player-buzzer"><img class="img-player-buzzer" src="img/buzzer_dark_small.png"/></td>
					<td id="td-player-username">`+ player.username +`</td>
					<td id="td-player-score"><input id="input-player-score" type="number" value="`+ player.score +`"></td>
					<td id="td-player-answer"><textarea id="ta-player-answer" rows="1" cols="50" disabled>` + player.current_answer + `</textarea></td>
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
		$(".player-action-buttons").hide();
	}
};