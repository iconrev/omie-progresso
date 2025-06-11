import { Badge } from "reactstrap";

const BadgeSituacaoEmpresa = (props) => {
	let color = parseInt(props.status) === 1 ? "success" : "danger";
	let status = parseInt(props.status) === 1 ? "ATIVA" : "INATIVA";

	return <Badge color={color}>{status}</Badge>;
};

export default BadgeSituacaoEmpresa;
