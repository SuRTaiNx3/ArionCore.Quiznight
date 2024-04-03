export default class Alerts {
	
	static _CONTROL_ALERT_ERROR = "#alert-error";
	static _CONTROL_ALERT_ERROR_MESSAGE = "#alert-error-message";
	static _CONTROL_ALERT_ERROR_SUBMIT_DISMISS = "#alert-error-submit-dismiss";
	
	static{
		$(Alerts._CONTROL_ALERT_ERROR_SUBMIT_DISMISS).on( "click", e => Alerts.hideErrorAlert());
	}
	
	static showErrorAlert(message){
		
		if(!message){
			message = "Sorry, something went wrong :/"
		}
		
		$(Alerts._CONTROL_ALERT_ERROR_MESSAGE).html(message);
		$(Alerts._CONTROL_ALERT_ERROR).show();
	}
	
	static hideErrorAlert(){
		$(Alerts._CONTROL_ALERT_ERROR).hide();
	}
};