import { useState, useEffect, useCallback } from "react";
import {
	Row,
	Col,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Button,
	Input,
} from "reactstrap";
import { toast } from "react-toastify";
import CompanyService from "../../../service/CompanyService";
import Integracao from "../../../service/Integracao";

const IntegracaoOmie = (props) => {
	const company = CompanyService.getDataCompany();
	const companyId = company.id;

	const [key, setKeys] = useState({
		app_key: "",
		app_secret: "",
	});

	const addIntegration = useCallback(() => {
		const appKey = document.getElementById("app_key").value;
		const appSecret = document.getElementById("app_secret").value;
		const data = Integracao.postKeys(companyId, appKey, appSecret);
		data.then((value) => {
			const status = value.status;
			if (status === "success") {
				toast.success(
					"Integração realizada com sucesso! Em poucos minutos estará pronto para utilização."
				);
			} else {
				toast.error(status);
			}
		});
	});

	useEffect(() => {
		const response = Integracao.getKeys(companyId);
		response.then((value) => {
			const status = value.status;
			if (status === "success") {
				setKeys(value.message);
			}
		});
	}, []);

	const goBack = () => {
		props.history.goBack();
	};

	return (
		<>
			<Card>
				<CardHeader>
					<Row xs="4">
						<Col>
							<strong>Integrações</strong>
						</Col>
						<Col>
							<strong>Key</strong>
						</Col>
						<Col xs="6">
							<strong>Secret</strong>
						</Col>
					</Row>
				</CardHeader>
				<CardBody>
					<Row xs="4">
						<Col>
							<strong>Omie</strong>
						</Col>
						<Col>
							<Input
								id="app_key"
								name="app_key"
								placeholder="APP_KEY"
								type="text"
								defaultValue={key.app_key}
							/>
						</Col>
						<Col>
							<Input
								id="app_secret"
								name="app_secret"
								placeholder="APP_SECRET"
								type="password"
								defaultValue={key.app_secret}
							/>
						</Col>
						<Col>
							<Button
								color={"primary"}
								className={"float-right"}
								onClick={addIntegration}
							>
								Adicionar Integração
							</Button>
						</Col>
					</Row>
				</CardBody>
				<CardFooter>
					<Button color={"primary"} className={"float-right"} onClick={goBack}>
						Voltar
					</Button>
				</CardFooter>
			</Card>
		</>
	);
};

export default IntegracaoOmie;
