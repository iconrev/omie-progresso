import { useState } from "react";

import {
	Row,
	Col,
	Card,
	CardHeader,
	CardBody,
	Button,
	Spinner,
} from "reactstrap";
import CompanyService from "../../../service/CompanyService";
import PlanoService from "../../../service/Plano";
import { toast } from "react-toastify";

const ReportButton = (props) => {
	return (
		<>
			<Button
				color={"success"}
				className={"float-left"}
				onClick={props.onClick}
			>
				{props.isLoading ? (
					<Spinner
						as="span"
						variant="light"
						size="sm"
						role="status"
						aria-hidden="true"
						animation="border"
					/>
				) : (
					<>
						Baixar <i className="fa fa-file-pdf-o" />
					</>
				)}
			</Button>
		</>
	);
};

const RowReport = (props) => {
	const { title, slug } = props;
	const [isLoading, setIsLoading] = useState(false);

	const onClick = async (reportType) => {
		const company = CompanyService.getDataCompany();
		const companyId = company.id;
		const selectedYear = company.exercicioDefinido;

		setIsLoading(true);

		const response = await PlanoService.getPDF(
			companyId,
			reportType,
			selectedYear
		);

		if (response.status === "success") {
			toast.info(
				"Seu relatório será gerado e encaminhado por e-mail assim que for finalizado :)"
			);
		} else {
			toast.error("Ocorreu um erro ao gerar seu relatório :(");
		}

		setIsLoading(false);
	};

	return (
		<Row xs="12" style={{ marginBottom: "8px" }}>
			<Col>{title}</Col>
			<Col>
				<ReportButton isLoading={isLoading} onClick={() => onClick(slug)} />
			</Col>
		</Row>
	);
};

const Plano = (props) => {
	const goBack = () => {
		props.history.goBack();
	};

	return (
		<>
			<div className="animated fadeIn">
				<Card className="card-accent-info">
					<CardHeader>
						<strong>Plano Estratégico Executivo -</strong> Relatórios
						<Button
							onClick={goBack}
							data-placement="top"
							title="Voltar"
							className="btn btn-sm btn-primary mr-1 float-right"
						>
							<i className="fa fa-arrow-left" /> Voltar
						</Button>
					</CardHeader>
					<CardHeader>
						<Row xs="4">
							<Col>
								<strong>Diagnósticos</strong>
							</Col>
							<Col xs="6">
								<strong>Download</strong>
							</Col>
						</Row>
					</CardHeader>
					<CardBody>
						<RowReport title={"Diagnóstico"} slug="diagnostico" />
						<RowReport title={"Estratégia e Metas"} slug="estrategias" />
						<RowReport title={"Gestão por Diretriz / OKR"} slug="diretrizes" />
					</CardBody>
				</Card>
			</div>
		</>
	);
};

export default Plano;
