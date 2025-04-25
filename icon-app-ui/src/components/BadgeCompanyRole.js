import { Badge } from "reactstrap";

const BadgeCompanyRole = (props) => {
	const { role } = props;
	let colors = {
		associado: "dark",
		associado_nivel_2: "light",
		company_admin: "success",
		company_default: "info",
		company_responsible: "secondary",
	};
	return (
		<Badge color={colors[props.role] ? colors[props.role] : "danger"}>
			{role || "undefined"}
		</Badge>
	);
};

export default BadgeCompanyRole;
