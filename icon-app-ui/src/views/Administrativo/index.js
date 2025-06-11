import { Component } from "react";
import {
	Card,
	CardBody,
	Col,
	Row,
	Button,
	CardFooter,
	Container,
	Alert,
} from "reactstrap";
import ApiBase from "../../service/api_base";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast } from "react-toastify";
import { Redirect } from "react-router-dom";
import CardNovosCadastros from "./CardNovosCadastros";
import CardEmpresas from "./CardEmpresas";
import CardUsuarios from "./CardUsuarios";
import { pluralize } from "../Utils/Generic";
import CompanyService from "../../service/CompanyService";

const Api_Base = new ApiBase();

class Administrativo extends Component {
	constructor(props) {
		super(props);

		CompanyService.removeCompanyLocalStorage();

		this.state = {
			isLoading: true,
			admin: false,
			isOpenModalApprover: false,
			userApprover: null,
		};
	}

	async componentDidMount() {
		await this.loadData();
		await this.setState({
			isLoading: false,
		});
	}

	loadData = async () => {
		await Api_Base.get(`/administrativo/dashboard`)
			.then(async (result) => {
				let { status, dashboard } = result.data;

				if (status === "success") {
					await this.setState({
						users: dashboard.users || 0,
						companies: dashboard.companies || 0,
						access_today: dashboard.access_by_day[0].acessos || 0,
						access_by_day: dashboard.access_by_day || [],
						associados: dashboard.associados || 0,
						usersActives: dashboard.usersActives || null,
						companiesActives: dashboard.companiesActives || null,
						requestsAssociate: dashboard.requestsAssociate || [],
						newUsersByMonth: dashboard.newUsersByMonth || null,
						newCompaniesByMonth: dashboard.newCompaniesByMonth || null,
						newUsersByDate: dashboard.newUsersByDate || null,
						newCompaniesByDate: dashboard.newCompaniesByDate || null,
						companiesStatus: dashboard.companiesStatus || [],
						admin: true,
					});
				} else {
					toast.error("Ocorreu um problema ao buscar os dados.");
				}
			})
			.catch(async (err) => {
				if (err.response.status !== 401) {
					console.error("ERRO", err);
					toast.error("Erro ao buscar os dados :(");
				} else {
					return this.props.history.push("/");
				}
			});
	};

	redirectAssociados = (e) => {
		e.preventDefault();
		this.props.history.push("/administrativo/associados");
	};

	redirectUsers = (e) => {
		e.preventDefault();
		this.props.history.push("/administrativo/usuarios");
	};

	redirectCompanies = (e) => {
		e.preventDefault();
		this.props.history.push("/administrativo/empresas");
	};

	redirectLogs = (e) => {
		e.preventDefault();
		this.props.history.push("/administrativo/logs");
	};

	renderModalLogs = () => {
		toast.info("Em desenvolvimento");
	};

	renderModalUser = () => {
		toast.info("Em desenvolvimento");
	};

	renderModalCompany = () => {
		toast.info("Em desenvolvimento");
	};

	renderSolicitacaoAssociados = () => {
		const associadosCount = this.state.requestsAssociate.length;

		if (associadosCount === 0) return null;

		const handleAssociados = () => {
			this.props.history.push({
				pathname: "/administrativo/associados/pendentes",
				state: { data: this.state.requestsAssociate },
			});
		};

		return (
			<Alert color="warning">
				<h4 className="alert-heading">Solicitações de associados</h4>
				<hr />
				<p>
					Você possui {associadosCount}{" "}
					{pluralize(associadosCount, "solicitação", "ão", "ões")} de{" "}
					{pluralize(associadosCount, "associado")}.
				</p>
				<hr />
				<p>
					<button
						className={"btn btn-link alert-link p-0 m-0"}
						onClick={handleAssociados}
					>
						Clique aqui
					</button>{" "}
					para efetuar as avaliações.
				</p>
			</Alert>
		);
	};

	renderCard = (text, value, modalFunction, icon, color = "info") => {
		return (
			<Col sm={6} lg={3}>
				<Card className={""}>
					<CardBody className={"align-items-center p-0"}>
						<Container className={"p-0"}>
							<Row>
								<Col xs={"4"} className={"pr-1"}>
									<div className={`text-white bg-${color} text-center h-100`}>
										<Row className={`align-items-center h-100`}>
											<Col>
												<i
													className={`fa fa-${icon} fa-2x align-self-center`}
												/>
											</Col>
										</Row>
									</div>
								</Col>
								<Col xs={"8"} className={"pl-0"}>
									<div className={"p-3"}>
										<div className={`text-value text-${color}`}>{value}</div>
										<div className="text-muted text-uppercase font-weight-bold small">
											{text}
										</div>
									</div>
								</Col>
							</Row>
						</Container>
					</CardBody>
					<CardFooter className={"m-0 p-0"}>
						<Button
							color="link"
							className="font-weight-bold font-xs btn-block text-muted text-left"
							onClick={(e) => modalFunction(e)}
						>
							Ver mais
							<i className={`fa fa-arrow-right float-right ci-primary`} />
						</Button>
					</CardFooter>
				</Card>
			</Col>
		);
	};

	loaded = () => {
		if (!this.state.admin) {
			return <Redirect to="/dashboard" />;
		}

		return (
			<>
				<Row>
					<Col>{this.renderSolicitacaoAssociados()}</Col>
				</Row>
				<Row className={"justify-content-center"}>
					{this.renderCard(
						"Associados ativos",
						this.state.associados,
						this.redirectAssociados,
						"group"
					)}
					{this.renderCard(
						"Usuários cadastrados",
						this.state.users,
						this.redirectUsers,
						"user"
					)}
					{this.renderCard(
						"Empresas cadastradas",
						this.state.companies,
						this.redirectCompanies,
						"building"
					)}
					{this.renderCard(
						"Acessos efetuados hoje",
						this.state.access_today,
						this.redirectLogs,
						"calendar-check-o"
					)}
				</Row>
				<Row>
					<Col>
						<CardUsuarios
							data={{ ...this.state, history: this.props.history }}
						/>
						<CardEmpresas
							data={{ ...this.state, history: this.props.history }}
						/>
					</Col>
				</Row>
				<CardNovosCadastros
					newUsersByMonth={this.state.newUsersByMonth}
					newCompaniesByMonth={this.state.newCompaniesByMonth}
					newUsersByDate={this.state.newUsersByDate}
					newCompaniesByDate={this.state.newCompaniesByDate}
				/>
			</>
		);
	};

	render() {
		return this.state.isLoading ? (
			<LoadingSpinner isLoading={this.state.isLoading} />
		) : (
			this.loaded()
		);
	}
}

export default Administrativo;
