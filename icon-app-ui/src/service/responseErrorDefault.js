const responseErrorDefault = (error) => {
	console.info("----------- responseErrorDefault ----------------");
	console.error(error);
	console.error(error.response);

	let response = {};

	if (error.response) {
		response["statusCode"] = error.response.status;
		if (error.response.data) {
			response = {
				...response,
				...error.response.data,
			};
		}
	}

	if (response["status"] === undefined) {
		response["status"] = "fatal_error";
	}

	console.info("----------- responseErrorDefault ----------------");
	return response;
};

export default responseErrorDefault;
