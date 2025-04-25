import PropTypes from "prop-types";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Col,
	Container,
	Row,
} from "reactstrap";
import { getCompanyDetails } from "../../../service/services";
import { toast } from "react-toastify";
import CompanyService from "../../../service/CompanyService";
import { useHistory } from "react-router-dom";

const DemoCompany = ({ demos }) => {
	let history = useHistory();

	if (!demos) return null;
	if (demos.length === 0) return null;

	const handleAccess = async (demo) => {
		const response = await getCompanyDetails(demo.id, true);
		const { status, exercicios } = response;
		if (status === "success") {
			if (exercicios.length === 0) {
				toast.error("A empresa não possui exercícios cadastrados...");
				CompanyService.removeCompanyLocalStorage();
				return;
			}
			return history.push(`/hub/${demo.id}/gestao`);
		} else {
			const { message } = response;
			if (message) toast.error(message);
		}
	};

	return (
		<>
			{demos.map((demo, index) => {
				return (
					<Card key={index}>
						<CardHeader>Empresa para demonstração</CardHeader>
						<CardBody>
							<Container fluid>
								<Row className="align-items-center">
									<Col xs={12} sm={6} md={7} lg={8}>
										<h1 className="display-1">{demo.nome}</h1>
										<p>Conheça todo o potencial da ferramenta :)</p>
										<p className={"m-0 p-0"}>
											<small>
												<em>
													Este demo disponibiliza dados fictícios para
													apresentações.
												</em>
											</small>
										</p>
										<p className={"m-0 p-0"}>
											<small>
												<em>
													Os dados alterados só ficam disponíveis durante a
													atual sessão.
												</em>
											</small>
										</p>
									</Col>
									<Col xs={12} sm={6} md={5} lg={4}>
										<Button
											color={"secondary"}
											size={"lg"}
											onClick={() => handleAccess(demo)}
										>
											Acessar
											<i className="fa fa-rocket ml-2" />
										</Button>
									</Col>
								</Row>
							</Container>
						</CardBody>
					</Card>
				);
			})}
		</>
	);
};

DemoCompany.propTypes = {
	demos: PropTypes.array.isRequired,
};

export default DemoCompany;
