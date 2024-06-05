import mustache from "https://cdnjs.cloudflare.com/ajax/libs/mustache.js/4.2.0/mustache.min.js";
import Cookie from './common/cookie.js';
import Theme from './common/theme.js';
import WS from './common/ws.js';
import Rest from './common/rest.js';
import Moderator from './moderator.js';
import Player from './player.js';

export default class Index {
		
	constructor(){

		this.BASE_URL = 'http://localhost';
		this.WS_BASE_URL = "ws://localhost:9100/api";
		this.REST_BASE_URL = "http://localhost:3258";

	    this._theme = new Theme();
		this._theme.applyTheme();
		
		this.parseUrlParams();
		this.initView();
	}
	
	initView(){
		
		if(!this.HAS_ROOM_CODE){
			$.get('templates/no_code.mst', template => {
				$('#body-content').append(mustache.render(template, {}));
				$('#create-room-button').on( "click", e => this.createRoom());
				$('#join-room-button').on( "click", e => this.joinRoom());
				$('#join-room-code-input').bind('input propertychange', e => { 
					$('#join-room-button').prop('disabled', $('#join-room-code-input').val().length != 4); 
				});
			});
			return;
		}
		
		if(this.IS_MODERATOR){
			$.get('templates/moderator.mst', template => {
				$('#body-content').append(mustache.render(template, {}));
				this.MODERATOR = new Moderator(this.ROOM_CODE, this.BASE_URL, this.WS_BASE_URL);
			});
		}else{
			$.get('templates/player.mst?v=2', template => {
				$('#body-content').append(mustache.render(template, {}));
				this.PLAYER = new Player(this.ROOM_CODE, this.BASE_URL, this.WS_BASE_URL);
			});
		}
	}
	
	parseUrlParams(){
		var urlParams = new URLSearchParams(window.location.search);
		if(urlParams.has('rc')){
			this.ROOM_CODE = urlParams.get('rc');
			this.HAS_ROOM_CODE = true;
		}
		
		if(urlParams.has('is_m')){
			this.IS_MODERATOR = urlParams.get('is_m') == '1';
		}
	}
	
	createRoom(){
		Rest.callApi(this.REST_BASE_URL + '/create', "GET").then((data) => {
			window.location.href = this.BASE_URL + '?rc=' + data.code + '&is_m=1';
		});
	}
	
	joinRoom(){
		var roomCode = $('#join-room-code-input').val();
		window.location.href = this.BASE_URL + '?rc=' + roomCode;
	}
	
};

$(document).ready(function() {
	
	Date.prototype.addDays = function(days) {
		var date = new Date(this.valueOf());
		date.setDate(date.getDate() + days);
		return date;
	}
	
	var index = new Index();
});