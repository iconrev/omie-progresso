import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Col,
	Container,
	Row,
	Table,
} from "reactstrap";
import ColorCompany from "../../components/ColorCompany";
import BadgeEmpresa from "../../components/BadgeEmpresa";
import styles from "./styles.module.css";
import { Doughnut } from "react-chartjs-2";
import { toast } from "react-toastify";
import ButtonDownloadReport from "./Empresas/Premium/ButtonReportDownload";

const ChartStatusCompanies = (props) => {
	const { data } = props;

	const dataChart = {
		labels: data.map((status) => status.label),
		datasets: [
			{
				label: "Empresas",
				data: data.map((status) => status.count),
				backgroundColor: data.map(
					(status) => styles[`color-${ColorCompany[status.label]}`]
				),
				borderWidth: 1,
			},
		],
	};

	const options = {
		layout: {
			padding: {
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
			},
		},
		legend: {
			position: "left",
			labels: {
				padding: 20,
			},
		},
	};

	return <Doughnut data={dataChart} options={options} />;
};

const AssiduousCompanies = ({ data }) => {
	const handleClickCompany = () => {
		toast.info("Em desenvolvimento");
	};

	return (
		<Row>
			<Col>
				<Row>
					<Col className={"text-right"}>
						<small>Empresas com mais acessos nos últimos 30 dias.</small>
					</Col>
				</Row>
				<Table striped responsive hover size="md">
					<thead>
						<tr>
							<th>#</th>
							<th>Empresa</th>
							{/* <th className={"text-center"}>CNPJ</th> */}
							<th className={"text-center"}>Acessos</th>
							<th className={"text-center"}>Usuários</th>
						</tr>
					</thead>
					<tbody>
						{data.map((company, index) => {
							return (
								<tr
									key={index}
									style={{ cursor: "pointer" }}
									title={"Ver mais"}
									onClick={() => handleClickCompany(company)}
								>
									<th className={"col-1"} scope="row">
										{index + 1}º
									</th>
									<td className={"col-7"}>
										<Row className={"align-items-center"}>
											<Col xs={"auto pr-1"}>{company.nome}</Col>
											<Col xs={"auto"}>
												<BadgeEmpresa status={company.empresa_homologada} />
											</Col>
										</Row>
									</td>
									{/* <td className={'col-md-4 text-center'}>{company.cnpj}</td> */}
									<td className={"col-md-2 text-center"}>{company.acessos}</td>
									<td className={"col-md-2 text-center"}>
										{company.usuariosAtivos}
									</td>
								</tr>
							);
						})}
					</tbody>
				</Table>
			</Col>
		</Row>
	);
};

const ActionsPremium = ({ data }) => {
	const handlePremium = () => {
		data.history.push("/administrativo/empresas/premium");
	};

	return (
		<Row className={"mt-4 mb-4"}>
			<Col xs={"auto"} sm={12} lg={"auto"}>
				<Button
					color={"primary"}
					onClick={handlePremium}
					className={"mr-1 mt-4"}
				>
					<i className="fa fa-list mr-2" />
					Listar Premium
				</Button>
			</Col>
			<Col xs={"auto"} sm={12} lg={"auto"} className={"mt-4"}>
				<ButtonDownloadReport />
			</Col>
		</Row>
	);
};

const CardEmpresas = ({ data }) => {
	return (
		<Card className="card-accent-dark">
			<CardHeader>
				<strong>Empresas</strong>
			</CardHeader>
			<CardBody>
				<Container fluid className={"m-0 p-0"}>
					<Row className={"align-items-center"}>
						<Col xs={12} sm={12} md={12} lg={6} xl={5}>
							<Row className={"align-items-center"}>
								<Col xs={12} sm={8} lg={12}>
									<ChartStatusCompanies data={data.companiesStatus} />
								</Col>
								<Col xs={12} sm={4} lg={12}>
									<ActionsPremium data={data} />
								</Col>
							</Row>
						</Col>
						<Col>
							<AssiduousCompanies data={data.companiesActives} />
						</Col>
					</Row>
				</Container>
			</CardBody>
		</Card>
	);
};

export default CardEmpresas;
