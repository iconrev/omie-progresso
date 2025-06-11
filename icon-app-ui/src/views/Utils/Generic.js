/* eslint-disable max-len */
const forge = require("node-forge");

const formatter = (value, decimals = 2) => {
	if (value) {
		try {
			return parseFloat(value)
				.toFixed(decimals)
				.replace(".", ",")
				.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
		} catch (error) {
			console.error(error);
		}
	} else {
		if (decimals === 0) {
			return "0";
		} else {
			return "0,00";
		}
	}
};

exports.formatNumber = (value, decimals = 2) => {
	return formatter(value, decimals);
};

exports.ajust = (value) => {
	if (value) {
		try {
			return value.replace(",", ".");
		} catch (error) {
			return value;
		}
	}
};

exports.getBadgelColor = (value) => {
	let label = "";
	if (value > 0 && value <= 30) {
		label = "badge-danger";
	} else if (value >= 31 && value <= 64) {
		label = "badge-warning";
	} else if (value >= 65) {
		label = "badge-success";
	}
	return label;
};

exports.formatReal = (value) => {
	let str = value;

	str = str.replace("R$ ", "");
	str = str.replace("R$", "");
	str = str.split(".").join("");
	str = str.replace(",", ".");
	str = str.replace(" ", "");

	return str;
};

exports.LOG = (type, value) => {
	return console.log(`${type} => ${value}`);
};

exports.convertStringToFloat = (string, decimals = 2) => {
	let valueEdit = string
		.replaceAll("R$ ", "")
		.replaceAll(".", "")
		.replaceAll(",", ".");
	let spliter = valueEdit.split(".");
	let inteiro = spliter[0];
	let decimal = spliter[1];
	if (decimal === undefined) {
		decimal = "00";
	} else {
		decimal = decimal.substring(0, decimals);
	}
	valueEdit = inteiro + "." + decimal;

	return valueEdit;
};

exports.ConvertStringToFloat = (value) => {
	if (typeof value === "number") return value;

	if (typeof value === "string") {
		value = value.replaceAll("R$ ", "");
		value = value.replaceAll(" %", "");
		value = value.replaceAll(".", "");
		value = value.replace(",", ".");
	}
	if (/^([-+])?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) return Number(value);
	return NaN;
};

exports.ConvertFloatToString = (value, decimals = 2) => {
	return typeof value !== "string" ? formatter(value, decimals) : value;
};

exports.isEmailValid = (email) => {
	const re =
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
};

exports.isDateValid = (date) => {
	const re = /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;
	return re.test(String(date));
};

exports.convertBase64 = (file) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});
};

exports.stringToBase64 = (text) => {
	return btoa(text);
};

exports.iconClasses = {
	// Media
	image: { icon: "file-image-o", color: "black" },
	audio: { icon: "file-audio-o", color: "black" },
	video: { icon: "film", color: "black" },
	// PDF
	"application/pdf": { icon: "file-pdf-o", color: "#F40F02" },
	// WORD
	"application/msword": { icon: "file-word-o", color: "#035395" },
	"application/vnd.ms-word": { icon: "file-word-o", color: "#035395" },
	"application/vnd.oasis.opendocument.text": {
		icon: "file-word-o",
		color: "#035395",
	},
	"application/vnd.openxmlformatsfficedocument.wordprocessingml": {
		icon: "file-word-o",
		color: "#035395",
	},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
		icon: "file-word-o",
		color: "#035395",
	},
	// EXCEL
	"application/vnd.ms-excel": { icon: "file-excel-o", color: "#1D6F42" },
	"application/vnd.openxmlformatsfficedocument.spreadsheetml": {
		icon: "file-excel-o",
		color: "#1D6F42e",
	},
	"application/vnd.oasis.opendocument.spreadsheet": {
		icon: "file-excel-o",
		color: "#1D6F42",
	},
	// POWER POINT
	"application/vnd.ms-powerpoint": {
		icon: "file-powerpoint-o",
		color: "#D04423",
	},
	"application/vnd.openxmlformatsfficedocument.presentationml": {
		icon: "file-powerpoint-o",
		color: "#D04423",
	},
	"application/vnd.oasis.opendocument.presentation": {
		icon: "file-powerpoint-o",
		color: "#D04423",
	},
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": {
		icon: "file-powerpoint-o",
		color: "#D04423",
	},
	// TXT
	"text/plain": { icon: "file-txt-o", color: "black" },
	"text/html": { icon: "file-txt-o", color: "black" },
	"application/json": { icon: "file-txt-o", color: "black" },
	// Archives
	"application/gzip": { icon: "file-archive-o", color: "black" },
	"application/zip": { icon: "file-archive-o", color: "black" },
};

exports.addDays = (date, days) => {
	let result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
};

exports.pluralize = (count, word, end = null, replace = null) => {
	if (count === 1) {
		return word;
	} else {
		if (replace && end) {
			return word.replace(end, replace);
		}
		return word + "s";
	}
};

const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAqJ1nHj21Cfz3FXpn/P0v
gs7R8j7h6bLI69Q3kX/tGrvRgeFDjouNcY479IgDznO4ChbtcBsT70wZKW9HarOF
Wc57eo0+jWRoSGWo9lxG64w8C+kH425KdOCvciCkwqsvsYB6IJi+pNw5fb7BYlsr
3vJAHF73IZZNnkZQ9NLsQFVBEoKB1TSPSYep0XH3R4LvpiSDceRFAmDkcxU/U9kF
m0KjFeY77152ER9lhoJXYtgADmZxmydfugvDL4LgYb5gLbYvyF6K6o/cvdBnkj5R
jpYQOW4eyV14PrGWb1xJo9Uy5iXkdwOG0bsLo1lp7FZVsH/XcrO9Xo3RLp0fDTe1
qZMbMwqJav197PQhwzl5QFtjq+0EUn6vkVhlZZRhuVviSzHUI271g7xzRn/T6GNF
2FSYzakJBGTI80DonhWsX9r5T7I57EA2jpCBZLroP5yWkMEVYgzcoI6CPzKR4l25
Xh7auQO8Vw4jrPXT3Y2rte0MEjRNmfAFwjk+lDF0xiJ79Qz8s25viaCYoQZnrbTG
mw0OdYDMVm0n+w/Qy5SCzKHhiwJ8B6qW2446xa9GpGDEUh7PM5ydyPCjofrPbA2f
n5JwwXXoa4E2XEzzM+UO30QtF6rZDkQ8JeKVxpyD2ZAswddNkffvIUwLK80GfC0b
dne7XzdwsyMqq3kHrenLtkcCAwEAAQ==
-----END PUBLIC KEY-----`;


exports.stringToRSABase64 = (text) => {
	const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
	const cryptedPayload = publicKey.encrypt(text, "RSA-OAEP");
	return forge.util.encode64(cryptedPayload);
};
