import moment from "moment";

moment.locale();

export const formatDate = (date = null, pattern = "DD/MM/YYYY") => {
	const dateMoment = date ? moment(date) : moment();
	return dateMoment.format(pattern);
};

export const stringToDate = (dateString) => {
	try {
		return new Date(dateString);
	} catch (error) {
		return null;
	}
};
