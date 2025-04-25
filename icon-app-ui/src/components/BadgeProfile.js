import { Badge } from "reactstrap";

const BadgeProfile = (props) => {
	let color = "secondary";
	if (props.profile === "superadmin") {
		color = "dark";
	} else if (props.profile === "associado") {
		color = "success";
	} else if (props.profile === "admin") {
		color = "danger";
	}
	if (props.profile === "omie") {
		color = "primary";
	}

	return <Badge color={color}>{props.profile}</Badge>;
};

export default BadgeProfile;
