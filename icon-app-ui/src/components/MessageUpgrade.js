import { Row, Col, Container, Badge, Button } from "reactstrap";
import { useHistory } from "react-router-dom";
import CompanyService from "../service/CompanyService";

const MessageUpgrade = (props) => {
	const history = useHistory();
	const company = CompanyService.getDataCompany();

	let btnTrial = null;
	if (company.hasTrialAvailable) {
		btnTrial = (
			<Col xs={"12"} sm={"6"} className={"p-1"}>
				<Button
					color={"warning"}
					className={"text-white font-weight-bold h-100"}
					onClick={(e) => props.modalAtivarTrial(e, false)}
				>
					ATIVAR TRIAL
				</Button>
			</Col>
		);
	}

	const handlePremium = (e) => {
		e.preventDefault();
		return history.push(`${history.location.pathname}/assinar`);
	};

	const btnPremium = (
		<Col xs={"12"} sm={"6"} className={"p-1"}>
			<Button
				color={"success"}
				onClick={handlePremium}
				className={"text-white font-weight-bold h-100"}
			>
				UPGRADE PREMIUM
			</Button>
		</Col>
	);

	return (
		<Container>
			<Row className={"align-items-center"}>
				<Col xs={"12"} sm={"12"} md={"auto"} className={"text-center"}>
					<i className="fa fa-diamond fa-5x text-info" />
				</Col>
				<Col xs={"12"} sm={"12"} md={""} className={"text-justify"}>
					<div className="lead mt-2">
						<h3>
							<span className="align-middle">ACESSO</span>
							<Badge color="primary" className="text-uppercase ml-1">
								Premium
							</Badge>
						</h3>
						<p>Tenha acesso completo para ajudar a sua empresa a crescer.</p>
					</div>
				</Col>
			</Row>
			<Row className={"text-center mt-3 justify-content-center"}>
				{btnTrial}
				{btnPremium}
			</Row>
		</Container>
	);
};

export default MessageUpgrade;
