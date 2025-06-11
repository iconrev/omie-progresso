import { Component } from "react";
import Onboarding from "../Onboarding/index";
import Convites from "./Convites";
import ApiBase from "./../../service/api_base";
import { toast } from "react-toastify";
import {
	Row,
	Col,
	Card,
	CardBody,
	CardFooter,
	Button,
	Alert,
	Badge,
	CardHeader,
} from "reactstrap";
import LoadingSpinner from "../../components/LoadingSpinner";
import ModalEmpresa from "../../components/ModalEmpresa";
import "../../assets/Dashboard/dashboardstyle.scss";
import LoadingFullScreen from "../../components/LoadingFullScreen";
import CompanyService from "../../service/CompanyService";
import userService from "../../service/UserService";

const Api_Base = new ApiBase();
const color_bg = [
	"#20a8d8",
	"#4dbd74",
	"#63c2de",
	"#ffc107",
	"#f86c6b",
	"#00705d",
	"#113e02",
	"#225f28",
	"#333a21",
	"#441106",
	"#553a72",
	"#666859",
	"#777866",
	"#880164",
	"#992b7d",
	"#10292d",
	"#112221",
	"#12606f",
	"#133c54",
	"#143544",
	"#150069",
	"#162459",
	"#172652",
	"#184253",
	"#19223d",
	"#20785e",
	"#21171f",
	"#22703b",
	"#231b74",
	"#244122",
	"#251c06",
	"#26452f",
	"#277a7e",
	"#28722d",
	"#29017d",
	"#302e03",
	"#316c79",
	"#327c60",
	"#336731",
	"#342368",
	"#356b31",
	"#365451",
	"#37297e",
	"#387249",
	"#390147",
	"#400445",
	"#413727",
	"#42080a",
	"#431f3c",
	"#446e6c",
	"#456516",
	"#46322c",
	"#471250",
	"#481323",
	"#493c65",
	"#504922",
	"#517763",
	"#525c74",
	"#532027",
	"#543a6f",
	"#557e42",
	"#56355e",
	"#576a7a",
	"#58477a",
	"#59096e",
	"#605640",
	"#61475a",
	"#62294f",
	"#635a1b",
	"#641e0a",
	"#65347b",
	"#664c54",
	"#676d70",
	"#684b7d",
	"#692006",
	"#70407f",
	"#713430",
	"#72172f",
	"#732500",
	"#744b45",
	"#753a4d",
	"#761072",
	"#776846",
	"#782641",
	"#795e18",
	"#806a41",
	"#810b3c",
	"#821b60",
	"#83792a",
	"#84457a",
	"#854a19",
	"#866928",
	"#871c49",
	"#885760",
	"#895b34",
	"#907154",
	"#912e3b",
	"#922f0e",
	"#933d4d",
	"#943d4f",
	"#95044d",
	"#965f39",
	"#97704c",
	"#98210f",
	"#99446a",
];

class Dashboard extends Component {
	constructor(props) {
		super(props);

		this.user = userService.getUser();
		this.loadData = this.loadData.bind(this);
		this.loadEmpresas = this.loadEmpresas.bind(this);
		this.loadConvites = this.loadConvites.bind(this);
		this.toggleModal = this.toggleModal.bind(this);

		CompanyService.removeCompanyLocalStorage();

		this.state = {
			isLoading: true,
			username: props.username,
			email: props.email,
			empresas: [],
			onboarding: false,
			modalInvite: false,
			convites: [],
			modalEmpresaEdit: false,
			editing: false,
			editingId: null,
			editingEmpresa: null,
			editingCnpj: null,
			editingActive: null,
			tooltipPremiumOpen: false,
			isLoadingDetails: false,
		};
	}

	async componentDidMount() {
		await this.loadData();
		this.setState({
			isLoading: false,
		});
	}

	async loadData() {
		const convitesPromise = this.loadConvites();
		const loadPromise = this.loadEmpresas();

		await Promise.all([convitesPromise, loadPromise])
			.then(async (values) => {
				const [convites, empresas] = values;
				await this.setState({
					modalInvite: convites.length > 0,
					convites: convites,
					onboarding: !!(empresas.length === 0 && convites.length > 0),
					empresas: empresas,
				});
			})
			.catch((error) => {
				console.error(error);
				toast.error(
					"Ocorreu um erro ao buscar os dados das empresas e convites."
				);
			});
	}

	async loadConvites() {
		let convitesResponse = [];

		await Api_Base.get(`/cadastros/empresas/convites`)
			.then((response) => {
				const { status, convites } = response.data;

				if (status !== "success") {
					toast.error(response.data.message);
				}

				convitesResponse = convites;
			})
			.catch((error) => {
				console.error(error);
				toast.error("Ocorreu um problema ao verificar os convites :(");
			});

		return convitesResponse;
	}

	async loadEmpresas() {
		let empresasResponse = [];

		await Api_Base.get(`/cadastros/usuarios/empresas`)
			.then(async (response) => {
				const { status, companies } = response.data;

				if (status !== "success") {
					toast.error(response.data.message);
					return;
				}

				const companiesAssociates = [];

				let keyColor = 0;
				for (let i = 0; i < companies.length; i++) {
					if (keyColor >= color_bg.length) {
						keyColor = 0;
					}
					const company = companies[i];

					if (company.active === 0) continue;

					company.color = color_bg[keyColor];
					keyColor += 1;

					if (company.roles) {
						const roles = company.roles;
						// const isAssociate = roles.findIndex((role) => role === 'associado') > -1
						const isAssociateNivel2 =
							roles.findIndex((role) => role === "associado_nivel_2") > -1;
						const isHomologada = !!(company.is_associada === 1);

						if (isAssociateNivel2 && isHomologada) {
							companiesAssociates.push({
								companyId: company.id,
								companyName: company.nome,
								role: company.roles,
							});
						}
					}
				}

				empresasResponse = companies.filter((company) => !!company.active);

				userService.setCompanies(companies);
				userService.setCompaniesAssociate(companiesAssociates);
			})
			.catch((error) => {
				console.error(error);
				toast.error("Ocorreu um problema ao buscar suas empresas :(");
			});

		return empresasResponse;
	}

	async toggleModal() {
		await this.setState({
			modalEmpresaEdit: !this.state.modalEmpresaEdit,
		});
	}

	toggleTooltipPremium = async () => {
		await this.setState({
			tooltipPremiumOpen: !this.state.tooltipPremiumOpen,
		});
	};

	handleChange = (event) => {
		this.setState({
			[event.target.id]: event.target.value,
		});
	};

	getCompanyDetails = async (companyId, showError = true) => {
		let response = false;

		await this.setState({
			isLoadingDetails: true,
		});

		await Api_Base.get(`/cadastros/empresas/${companyId}/detalhes`)
			.then((result) => {
				const { status, exercicios } = result.data;

				if (status === "success") {
					if (exercicios.length === 0) {
						toast.error("A empresa não possui exercícios cadastrados...");
					} else {
						CompanyService.setCompanyLocalStorage(result.data);
						response = true;
					}
				} else {
					const { message } = result.data;

					if (showError) {
						toast.error(message);
					}
				}
			})
			.catch((err) => {
				console.error(err);
				toast.error("Erro ao carregar a empresa");
			});

		await this.setState({
			isLoadingDetails: false,
		});

		return response;
	};

	handleButtonEnter = async (event, key) => {
		event.preventDefault();

		let status = await this.getCompanyDetails(key);

		if (status) {
			return this.props.history.push(`/hub/${key}/gestao`);
		}
	};

	handleUserInvite = async (e, company) => {
		e.preventDefault();

		let status = await this.getCompanyDetails(company.id);

		if (status) {
			this.props.history.push(`/hub/${company.id}/gestao/usuarios`);
		}
	};

	handleEditarEmpresa = async (e, company) => {
		e.preventDefault();

		await this.setState({
			editing: true,
			editingId: company.id,
			editingEmpresa: company.nome,
			editingCnpj: company.cnpj,
			editingActive: company.active,
		});

		this.toggleModal();
	};

	handleNovaEmpresa = async (e) => {
		e.preventDefault();

		await this.setState({
			editing: false,
			editingId: "",
			editingEmpresa: "",
			editingCnpj: "",
			editingActive: 1,
		});

		await this.toggleModal();
	};

	handleAtualizar = async () => {
		await this.setState({
			isLoading: true,
		});
		await this.loadData();
		await this.setState({
			isLoading: false,
		});
	};

	cardEmpresas = (item, key) => {
		let btnAcessar = (
			<Col xs="12" sm="12" md="12" lg="12" xl="4" className="div-button">
				<Button
					className="company-button"
					onClick={(e) => this.handleButtonEnter(e, item.id)}
				>
					Acessar
				</Button>
			</Col>
		);

		const roles = item.roles;

		let btnEditar = null;
		let btnConvidados = null;
		const isAssociado = roles
			? roles.findIndex((role) => role === "associado") > -1
			: false;
		const isAssociadoNivel2 = roles
			? roles.findIndex((role) => role === "associado_nivel_2") > -1
			: false;
		const isCompanyAdmin = roles
			? roles.findIndex((role) => role === "company_admin") > -1
			: false;
		if (
			item.owner === 1 ||
			isAssociado ||
			isAssociadoNivel2 ||
			isCompanyAdmin
		) {
			btnEditar = (
				<Col xs="12" sm="12" md="12" lg="12" xl="4" className="div-button">
					<Button
						className="company-button"
						onClick={(e) => this.handleEditarEmpresa(e, item)}
					>
						Editar
					</Button>
				</Col>
			);
			btnConvidados = (
				<Col xs="12" sm="12" md="12" lg="12" xl="4" className="div-button">
					<Button
						className="company-button"
						onClick={(e) => this.handleUserInvite(e, item)}
					>
						Usuários
					</Button>
				</Col>
			);
		}

		const createBadge = (text) => {
			return (
				<Badge className="bg-white text-uppercase mr-2 shadow-badge">
					<strong>{text}</strong>
				</Badge>
			);
		};
		// let txtConvidado = createBadge('Convidado');
		let txtPremium = createBadge("Premium");
		let txtTrial = createBadge("Trial");
		let txtAssociada = createBadge("Associada");
		let txtStart = createBadge("Start");

		// let imageHeigth = 100;
		// let imageUrl = "https://dummyimage.com/" + imageHeigth + "x" + imageHeigth + "/000/fff";
		// let marginTop = imageHeigth - imageHeigth - 25;
		// let imageLogo = (<div alt="{item.name}" className="widget-user-image">
		//  {/* style={{'margin-top': marginTop + 'px'}} */}
		// <img className="img-circle" src={imageUrl}/>
		// </div>);

		// let heightCard = 110;

		// if (item.owner === 1) {
		//   heightCard -= 24;
		// }

		return (
			<Card
				className="border-secondary h-100"
				style={{ background: item.color }}
				key={key}
			>
				<CardHeader style={{ background: item.color }}>
					<div className="mark" />
					{/* style={{ background: item.color }} */}
				</CardHeader>
				<CardBody className="pb-0">
					<div className="chart-wrapper">
						{/* style={{ height: heightCard + 'px' }} */}
						<div className="card-badges">
							{item.is_premium ? txtPremium : txtStart}
							{item.is_trial ? txtTrial : null}
							{item.is_associada && item.owner === 1 ? txtAssociada : null}
							{/* {item.owner === 1 ? null : txtConvidado} */}
						</div>
						<div className="widget-user-header">
							<Row>
								<Col md="12">
									<h2 className="widget-user-username">{item.nome}</h2>
									<h6 className="widget-user-cnpj">{item.cnpj}</h6>
								</Col>
								{/* <Col md="3">
                  {imageLogo}
                </Col> */}
							</Row>
						</div>
					</div>
				</CardBody>
				<CardFooter style={{ background: item.color }}>
					<Row>
						{btnAcessar}
						{btnEditar}
						{btnConvidados}
					</Row>
				</CardFooter>
			</Card>
		);
	};

	startOnboarding = () => {
		if (this.user.profile === "user_default") {
			const myCompanies = this.user.companies;
			if (myCompanies && myCompanies.length > 0) {
				const text =
					myCompanies.length > 1
						? "mais empresas cadastradas"
						: "uma empresa cadastrada";

				const handleRedirect = () => {
					return this.props.history.push("/empresas");
				};

				return (
					<Alert color="warning">
						<b>Você já possui {text} :(</b>
						<p>
							Seu perfil de usuário não permite o cadastro de mais empresas.
						</p>
						<Button color="warning" onClick={handleRedirect}>
							Visualizar todas as empresas
						</Button>
					</Alert>
				);
			}
		}

		return (
			<Alert color="info">
				<b>Vamos começar?</b>
				<p>
					Você ainda não tem nenhuma empresa cadastrada, mas você pode resolver
					isso cadastrando uma nova empresa:
				</p>
				<Button color="primary" onClick={this.handleNovaEmpresa}>
					Cadastrar uma empresa
				</Button>
			</Alert>
		);
	};

	renderCreateCompanyButton = () => {
		if (this.user.profile === "user_default") {
			const myCompanies = this.state.empresas.filter(
				(company) => !!company.owner
			);
			if (myCompanies.length > 0) {
				if (this.user.companiesAssociate.length === 0) return null;
			}
		}

		return (
			<Col sm={6} className="text-right">
				<Button className="add-company" onClick={this.handleNovaEmpresa}>
					<span className="fa fa-plus" />
					nova empresa
				</Button>
				<Button className="refresh-company" onClick={this.handleAtualizar}>
					<span className="fa fa-refresh" />
					atualizar
				</Button>
			</Col>
		);
	};

	dashboard = () => {
		if (this.state.empresas.length === 0) {
			return this.startOnboarding();
		}

		return (
			<div className="dashboard">
				<Row className="actions">
					<Col sm={6}>
						<h1>Minhas Empresas</h1>
					</Col>
					{this.renderCreateCompanyButton()}
				</Row>
				<br />
				<Row>
					{this.state.empresas.map((item, key) => {
						return (
							<Col
								xs={12}
								sm={6}
								md={6}
								lg={4}
								xl={3}
								key={key}
								className={"p-2"}
							>
								{this.cardEmpresas(item, key)}
							</Col>
						);
					})}
				</Row>
			</div>
		);
	};

	modalEmpresa = () => {
		if (!this.state.modalEmpresaEdit) return null;

		return (
			<ModalEmpresa
				toggle={this.toggleModal}
				companyId={this.state.editingId}
				empresa={this.state.editingEmpresa}
				cnpj={this.state.editingCnpj}
				active={this.state.editingActive === 1 ? true : false}
				editing={this.state.editing}
				refresh={this.loadData}
				myCompanies={this.state.empresas.filter((company) => !!company.owner)}
			/>
		);
	};

	loaded = () => {
		return (
			<div className="animated fadeIn">
				{this.dashboard()}
				{this.state.onboarding ? <Onboarding loadData={this.loadData} /> : null}
				{this.state.modalInvite ? (
					<Convites loadData={this.loadData} convites={this.state.convites} />
				) : null}
				{this.state.modalEmpresaEdit ? this.modalEmpresa() : null}
				{this.state.isLoadingDetails ? <LoadingFullScreen /> : null}
			</div>
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

export default Dashboard;
