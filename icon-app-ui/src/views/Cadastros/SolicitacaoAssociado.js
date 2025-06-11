/* eslint-disable jsx-a11y/anchor-is-valid */
import { Component } from "react";
import {
	Card,
	CardBody,
	CardHeader,
	Col,
	Alert,
	Row,
	Form,
	FormGroup,
	Label,
	Input,
	CardTitle,
	CardText,
	Badge,
} from "reactstrap";
import ApiBase from "../../service/api_base";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast } from "react-toastify";
import TooltipDefault from "../../components/TooltipDefault";
import { isEmailValid } from "../Utils/Generic";
import ButtonLoading from "../../components/ButtonLoading";
import userService from "../../service/UserService";
import CompanyService from "../../service/CompanyService";

const Api_Base = new ApiBase();

export default class SolicitacaoAssociado extends Component {
	constructor(props) {
		super(props);

		CompanyService.removeCompanyLocalStorage();

		this.state = {
			isLoading: true,
			isLoadingSolicitacao: false,

			name: "",
			email: "",
			phone: "",
			crc: "",
			acceptTerms: true,
			company_id: "",
			empresas: [],
			status: "success",
			comment: "",
		};
	}

	async componentDidMount() {
		await this.loadData();
		const user = userService.getUser();
		this.setState({
			isLoading: false,
			name: user.name,
			email: user.email,
		});
	}

	loadData = async () => {
		await Api_Base.get(`/cadastros/usuarios/associados/solicitacao`)
			.then(async (response) => {
				const { status, comment } = response.data;

				if (status === "success") {
					await Api_Base.get(`/cadastros/usuarios/empresas?ativas=true`)
						.then(async (response) => {
							const { companies } = response.data;

							this.setState({
								empresas: companies,
							});
						})
						.catch((err) => {
							console.error(err);
						});
				} else {
					if (status === "accept_request") {
						userService.setContador("true");
						userService.setProfile("associado");
						this.redirect();
					}

					this.setState({
						status: status,
						comment: comment,
					});
				}
			})
			.catch((err) => {
				if (err.response.status !== 401) {
					console.error("Não foi possível encontrar os gráficos:", err);
				} else {
					this.redirect();
				}
			});
	};

	redirect = () => {
		this.props.history.push(`/dashboard`);
	};

	handleField = (event) => {
		this.setState({
			[event.target.id]: event.target.value,
		});
	};

	handleCheckClick = () => {
		this.setState({
			acceptTerms: !this.state.acceptTerms,
		});
	};

	isResquestValid = () => {
		let error = 0;

		if (this.state.name.length < 5) {
			toast.error("Nome do solicitante deve ter ao menos 5 caracteres");
			error += 1;
		}

		if (!isEmailValid(this.state.email)) {
			toast.error("E-mail do solicitante é inválido");
			error += 1;
		}

		if (this.state.phone.length < 7) {
			toast.error("Telefone inválido");
			error += 1;
		}

		if (this.state.crc.length < 5) {
			toast.error("Número do CRC ou CPF inválido");
			error += 1;
		}

		if (this.state.company_id.length < 5) {
			toast.error("Deve-se selecionar a Empresa Associada Premium");
			error += 1;
		}

		return error === 0;
	};

	handleSubmit = async (event) => {
		event.preventDefault();

		if (!this.isResquestValid()) {
			return;
		}

		await this.setState({
			isLoadingSolicitacao: true,
		});

		const data = {
			name: this.state.name,
			email: this.state.email,
			phone: this.state.phone,
			crc: this.state.crc,
			company_id: this.state.company_id,
		};
		await Api_Base.post("/cadastros/usuarios/associados/solicitacao", data)
			.then(async (result) => {
				const { status, message } = result.data;

				if (status !== "success") {
					toast.error(message);
					await this.setState({
						isLoadingSolicitacao: false,
					});
				} else {
					toast.success(message);
					await this.setState({
						status: "pending_request",
						isLoadingSolicitacao: false,
					});
				}
			})
			.catch((err) => {
				console.error(err);
				toast.error(err.response.data.message);
			});
	};

	handleTermosModal = (event) => {
		event.preventDefault();
		toast.info("Em desenvolvimento");
	};

	renderTermos = () => {
		return (
			<>
				<FormGroup check>
					<Label check>
						<Input
							type="checkbox"
							id={"acceptTerms"}
							checked={this.state.acceptTerms}
							onChange={this.handleCheckClick}
						/>{" "}
						Concordo com os
					</Label>{" "}
					<a href={"#"} className="alert-link" onClick={this.handleTermosModal}>
						Termos e Condições.
					</a>
				</FormGroup>
			</>
		);
	};

	renderVantagem = (title, hint, icon, dev = false) => {
		const target = `hint-${icon}`;

		let badgeDev = dev ? <Badge color="success">EM BREVE</Badge> : null;

		return (
			<Col xs="12" sm="6" md="6" lg="6" xl="3">
				<Card body className="text-center h-100 p-0 hover-zoom" id={target}>
					<CardBody className={"p-3"}>
						<Row className={"h-100 align-items-center"}>
							<Col>
								<CardTitle tag="h5">
									<i className={`fa fa-${icon} fa-2x`} />
								</CardTitle>
								<CardText>
									<strong>{title}</strong>
								</CardText>
								<CardText>{badgeDev}</CardText>
							</Col>
						</Row>
					</CardBody>
				</Card>
				<TooltipDefault target={target} hintText={hint} />
			</Col>
		);
	};

	renderTextoExplicativo = () => {
		return (
			<Row className={"justify-content-center"}>
				{this.renderVantagem(
					"CADASTROS DE EMPRESAS",
					"Apenas associados poderão criar empresas.",
					"building"
				)}
				{this.renderVantagem(
					"EMPRESA ASSOCIADA PREMIUM",
					"Você terá direito a uma empresa associada que terá acesso PREMIUM gratuitamente.",
					"institution"
				)}
				{this.renderVantagem(
					"MATERIAIS EXCLUSIVOS",
					"Materiais exlusivos que te ajudarão a crescer como um Consultor.",
					"rss"
				)}
				{this.renderVantagem(
					"TRILHA DE APRENDIZADO",
					"Será disponibilizado toda a trilha de aprendizado necessária para se tornar um Consultor.",
					"mortar-board",
					true
				)}
			</Row>
		);
	};

	renderSolicitacao = () => {
		return (
			<Row className={"justify-content-center"}>
				<Col>
					<Form>
						<Row>
							<Col md="6">
								<FormGroup>
									<Label for="name">Nome Solicitante</Label>
									<Input
										type="text"
										id="name"
										placeholder="Preencha com seu nome completo"
										value={this.state.name}
										onChange={this.handleField}
									/>
								</FormGroup>
							</Col>
							<Col md="6">
								<FormGroup>
									<Label for="email">E-mail</Label>
									<Input
										type="text"
										id="email"
										placeholder="Preencha com seu e-mail"
										value={this.state.email}
										disabled
									/>
								</FormGroup>
							</Col>
						</Row>
						<Row>
							<Col md="6">
								<FormGroup>
									<Label for="phone">Telefone</Label>
									<Input
										type="text"
										id="phone"
										placeholder="Telefone para contato"
										value={this.state.phone}
										onChange={this.handleField}
									/>
								</FormGroup>
							</Col>
							<Col md="6">
								<FormGroup>
									<Label for="crc">CRC ou CPF</Label>
									<Input
										type="text"
										id="crc"
										placeholder="Preencha com seu CRC"
										value={this.state.crc}
										onChange={this.handleField}
									/>
								</FormGroup>
							</Col>
						</Row>
						<Row>
							<Col md="6">
								<FormGroup>
									<Label for="company">Empresa Associada Premium</Label>
									<Input
										type="select"
										id="company_id"
										value={this.state.company_id}
										onChange={this.handleField}
									>
										<option value="">Selecione a Empresa</option>
										{/* <option>Criar uma nova empresa</option> */}
										{this.state.empresas.map((empresa, index) => {
											return (
												<option key={index} value={empresa.id}>
													{empresa.nome} ({empresa.cnpj})
												</option>
											);
										})}
									</Input>
								</FormGroup>
							</Col>
						</Row>
						<Row>
							<Col>{/* {this.renderTermos()} */}</Col>
						</Row>
						<Row>
							<Col>
								<ButtonLoading
									isLoading={this.state.isLoadingSolicitacao}
									color="success"
									className={"float-right"}
									disabled={!this.state.acceptTerms}
									onClick={this.handleSubmit}
								>
									<i className="fa fa-rocket fa-2x" />
									<br />
									Associe-se
								</ButtonLoading>
							</Col>
						</Row>
					</Form>
				</Col>
			</Row>
		);
	};

	renderMessageRequestPending = () => {
		return (
			<>
				<Row className={"align-items-center"}>
					<Col>{this.renderTextoExplicativo()}</Col>
				</Row>
				<Row className={"mt-3"}>
					<Col>
						<Alert color={"info"}>
							<h4 className={"alert-heading"}>Em análise</h4>
							<hr />
							<p>
								Sua solicitação de upgrade está em análise com a nossa equipe.
							</p>
							<p>Em breve você receberá uma resposta por e-mail :)</p>
						</Alert>
					</Col>
				</Row>
			</>
		);
	};

	renderMessageRequestRejected = () => {
		return (
			<>
				{/* <Row className={"align-items-center"}>
          <Col>{this.renderTextoExplicativo()}</Col>
        </Row> */}
				<Row>
					<Col>
						<Alert color={"danger"}>
							<h4 className={"alert-heading"}>Solicitação Recusada :(</h4>
							<hr />
							<p>Sua solicitação de upgrade foi analisada por nossa equipe.</p>
							<Card body inverse color="danger">
								{this.state.comment}
							</Card>
							<p>Caso discorde dessa decisão nos chame no chat :)</p>
						</Alert>
					</Col>
				</Row>
			</>
		);
	};

	renderNewResquest = () => {
		return (
			<Row className={"align-items-center"}>
				<Col md="12" lg="6" xl="6" className={"mt-2"}>
					{this.renderTextoExplicativo()}
				</Col>
				<Col md="12" lg="6" xl="6" className={"mt-2"}>
					{this.renderSolicitacao()}
				</Col>
			</Row>
		);
	};

	loaded = () => {
		return (
			<Card className="card-accent-dark">
				<CardHeader>
					<strong>Solicitação para Associado</strong>
				</CardHeader>
				<CardBody>
					{this.state.status === "success" ? this.renderNewResquest() : null}
					{this.state.status === "pending_request"
						? this.renderMessageRequestPending()
						: null}
					{this.state.status === "rejected_request"
						? this.renderMessageRequestRejected()
						: null}
				</CardBody>
			</Card>
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
