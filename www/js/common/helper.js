export default class Helper {
	
	static getBase64(file, success, error) {
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function () {
			success(reader.result);
		};
		reader.onerror = function (err) {
			error(err);
		};
	}
}