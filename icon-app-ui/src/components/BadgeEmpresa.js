import { Badge } from "reactstrap";
import ColorCompany from "./ColorCompany";

const BadgeEmpresa = (props) => {
	let color = ColorCompany["start"];
	let status = "start";
	if (props.status === 0) {
		status = "premium";
		color = ColorCompany["premium"];
	} else if (props.status === 1) {
		status = "associada";
		color = ColorCompany["associada"];
	}
	if (props.status === 2) {
		status = "trial";
		color = ColorCompany["trial"];
	}

	return <Badge color={color}>{status}</Badge>;
};

export default BadgeEmpresa;
