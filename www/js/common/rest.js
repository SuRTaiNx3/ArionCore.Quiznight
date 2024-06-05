export default class Rest{
	
	static async callApi(uri, method, data = null){
		if(data == null){
			const response = await fetch(uri, {
				method: method,
				mode: 'cors',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			return response.json();
		}else{
			const response = await fetch(uri, {
				method: method,
				mode: 'cors',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});
			return response.status;
		}
	
	}
}