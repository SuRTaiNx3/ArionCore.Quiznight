export default class Theme {
	
	constructor(){
		this._theme = localStorage.getItem("theme");
	}
	
	applyTheme(){
			
		if(this._theme === null) {
			this._theme = this.getBrowserPreference();
		}
		
		document.body.setAttribute("data-bs-theme", this._theme);
		localStorage.setItem("theme", this._theme);
		
		console.log("Theme set to " + this._theme);
	}
	
	getBrowserPreference(){		
		const prefersDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
		if (prefersDarkTheme.matches) {
			return "dark";
		} else {
			return "light";
		}
	}
	
	toggleTheme(){
		const body = document.body;
		if (body.getAttribute("data-bs-theme") == "dark") {
			this._theme = "light";
			this.applyTheme();
		} else {
			this._theme = "dark";
			this.applyTheme();
		}
	}
};