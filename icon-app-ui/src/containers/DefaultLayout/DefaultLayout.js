import React, { Component, Suspense } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import {
	Container,
	Row,
	Col,
	Badge,
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from "reactstrap";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AppBreadcrumb, AppFooter, AppHeader } from "@coreui/react";
import routes from "../../routes";
import ModalEmpresa from "../../components/ModalEmpresa";
import ModalAtivarTrial from "../../components/ModalAtivarTrial";
import NavSideMenu from "../../components/NavSideMenu";
import LoadingFullScreen from "../../components/LoadingFullScreen";
import { logoutUsuario } from "../../service/services";
import CompanyService from "../../service/CompanyService";
import userService from "../../service/UserService";
import { LocalStorageService } from "../../service/localStorageService";

const DefaultFooter = React.lazy(() => import("./DefaultFooter"));
const DefaultHeader = React.lazy(() => import("./DefaultHeader"));

class DefaultLayout extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoading: true,
			email: "",
			user_name: "",
			user_id: "",
			user_logo: null,
			admin: false,
			modalExercicio: false,
			modalAtivarTrial: false,
			dropdownOpen: false,
			show_cog: false,
			modalEmpresaEdit: false,
		};
	}

	async componentDidMount() {
		const user = LocalStorageService.getUser();
		if (user) {
			userService.setUserFromCognito(user);
			this.setState({
				user_logo: await userService.getLogo(),
				isLoading: false,
			});
		} else {
			await logoutUsuario();
			return this.props.history.push("/");
		}
	}

	loading = () => (
		<div className="animated fadeIn pt-1 text-center">
			<div className="sk-spinner sk-spinner-pulse" />
		</div>
	);

	async setCog(status) {
		this.setState({
			show_cog: status,
		});
	}

	handleModalAtivarTrial = async (e, update = false) => {
		e.preventDefault();
		await this.setState({
			modalAtivarTrial: !this.state.modalAtivarTrial,
		});
		if (update) {
			window.location.reload();
		}
	};

	handleAssinarPremium = async (e) => {
		e.preventDefault();
		const companyId = CompanyService.getCurrentCompanyId();
		return this.props.history.push(`/hub/${companyId}/gestao/assinar`);
	};

	updateYear = async (e, year) => {
		e.preventDefault();
		const currentYear = CompanyService.getDataCompany().exercicioDefinido;
		if (parseInt(currentYear) !== parseInt(year)) {
			CompanyService.setExercicioDefinido(year);
			this.toggleModalExercicio();
			window.location.reload();
		}
		this.toggleModalExercicio();
	};

	toggleDropdown = async () => {
		this.setState({
			dropdownOpen: !this.state.dropdownOpen,
		});
	};

	toggleModalEmpresa = async () => {
		this.setState({
			modalEmpresaEdit: !this.state.modalEmpresaEdit,
		});
	};

	btnConfig = async (e, resource) => {
		e.preventDefault();

		const companyId = CompanyService.getCurrentCompanyId();

		if (resource === "year") {
			await this.toggleModalExercicio();
		}
		if (resource === "config") {
			this.props.history.push(`/hub/${companyId}/gestao/empresa`);
		}
		if (resource === "gerenciarUsuarios") {
			this.props.history.push(`/hub/${companyId}/gestao/usuarios`);
		}
		if (resource === "planoEstrategico") {
			this.props.history.push(`/hub/${companyId}/gestao/plano`);
		}
		if (resource === "accessoDiagnostico") {
			this.props.history.push(`/hub/${companyId}/gestao/categoria/diagnostico`);
		}
		if (resource === "accessoMetas") {
			this.props.history.push(`/hub/${companyId}/gestao/categoria/metas`);
		}
		if (resource === "accessoDiretrizes") {
			this.props.history.push(`/hub/${companyId}/gestao/categoria/diretrizes`);
		}
		if (resource === "integracaoOmie") {
			this.props.history.push(`/hub/${companyId}/gestao/integracao`);
		}
	};

	toggleModalExercicio = async () => {
		this.setState({
			modalExercicio: !this.state.modalExercicio,
		});
	};

	renderExercicio = () => {
		const company = CompanyService.getDataCompany();
		// const user = userService.getUser();

		const exercicios = company.exercicios;
		let dropYear = null;
		if (exercicios) {
			dropYear = exercicios.map((item, key) => {
				let icon = null;
				let disable = false;
				if (item.ano === company.exercicioDefinido) {
					disable = true;
					icon = (
						<span>
							<i className="fa a-check" style={{ color: "black" }} />
						</span>
					);
				}
				return (
					<DropdownItem
						key={key}
						disabled={disable}
						onClick={(e) => this.updateYear(e, item.ano)}
					>
						<div>
							{item.ano}
							{icon}
						</div>
					</DropdownItem>
				);
			});
		}

		const roles = company.roles;
		const isDemo = company.isDemo;
		const isPremium = company.isPremium;
		const isCreator = company.isOwner;
		const isAssociado = roles.findIndex((role) => role === "associado") > -1;
		const isAssociadoNivel2 =
			roles.findIndex((role) => role === "associado_nivel_2") > -1;
		const isCompanyAdmin =
			roles.findIndex((role) => role === "company_admin") > -1;
		const isCompanyAssociate = company.isAssociada;
		const isHelp = company.isHelp;

		// const sheetsAllow = [
		// 	decodeURIComponent(escape(window.atob("ZGlhbmdpZGFybzdAZ21haWwuY29t"))),
		// 	decodeURIComponent(
		// 		escape(window.atob("bG9saXZlaXJhQG90aW1hZWcuY29tLmJy"))
		// 	),
		// 	decodeURIComponent(
		// 		escape(window.atob("ZGlkaWZpbGlwaW5pQGdtYWlsLmNvbQ=="))
		// 	),
		// 	decodeURIComponent(escape(window.atob("d2FnbmVyQG9taWUuY29tLmJy"))),
		// ];
		const planilhas = (
			<DropdownItem onClick={(e) => this.btnConfig(e, "config")}>
				Planilhas de Integração <Badge color={"success"}>NOVO</Badge>
			</DropdownItem>
		);

		const cogUserOwner =
			(isCreator ||
				isAssociado ||
				isCompanyAdmin ||
				isHelp ||
				(isAssociadoNivel2 && !isCompanyAssociate)) &&
			!isDemo ? (
				<>
					<DropdownItem header>Empresa</DropdownItem>
					{planilhas}
					<DropdownItem onClick={(e) => this.btnConfig(e, "planoEstrategico")}>
						Plano Estratégico Executivo{" "}
						<Badge color={"primary"}>EM BREVE</Badge>
					</DropdownItem>
					<DropdownItem onClick={(e) => this.btnConfig(e, "gerenciarUsuarios")}>
						Gerenciar Usuários
					</DropdownItem>
					{/* <DropdownItem onClick={(e) => this.btnConfig(e, "integracaoOmie")}>
						Integração Omie
					</DropdownItem> */}
				</>
			) : null;

		const atalhoOkr = (isDemo || isPremium) && (
			<DropdownItem onClick={(e) => this.btnConfig(e, "accessoDiretrizes")}>
				Gestão por Diretrizes / OKR
			</DropdownItem>
		);

		return (
			<Row className={"align-items-center justify-content-end"}>
				<Col xs={"auto"} className={"float-right p-0"}>
					<em>Ano exercício: {company.exercicioDefinido}</em>
				</Col>
				<Col xs={"auto"} className={"float-right p-0"}>
					<Dropdown
						isOpen={this.state.dropdownOpen}
						toggle={this.toggleDropdown}
					>
						<DropdownToggle className="custom-toggle" nav>
							<i className="fa fa-cog fa-2x" style={{ color: "black" }} />
						</DropdownToggle>
						<DropdownMenu
							style={{
								width: "17rem",
								top: 0,
							}}
						>
							<DropdownItem header>Alterar Exercício</DropdownItem>
							{dropYear}
							{cogUserOwner}
							<DropdownItem header>Módulos</DropdownItem>
							<DropdownItem
								onClick={(e) => this.btnConfig(e, "accessoDiagnostico")}
							>
								Diagnóstico
							</DropdownItem>
							<DropdownItem onClick={(e) => this.btnConfig(e, "accessoMetas")}>
								Estratégias e Metas
							</DropdownItem>
							{atalhoOkr}
						</DropdownMenu>
					</Dropdown>
				</Col>
			</Row>
		);
	};

	modalAtivarTrial = () => {
		if (!this.state.modalAtivarTrial) return null;

		return <ModalAtivarTrial handle={this.handleModalAtivarTrial} />;
	};

	modalEmpresa = () => {
		if (!this.state.modalEmpresaEdit) return null;

		return (
			<ModalEmpresa
				toggle={this.toggleModalEmpresa}
				companyId={this.state.editingId}
				empresa={this.state.editingEmpresa}
				cnpj={this.state.editingCnpj}
				active={this.state.editingActive}
				editing={this.state.editing}
				refresh={this.refresh_dash}
			/>
		);
	};

	createBadge = (text, color, functionClick = null) => {
		const cursorPointer = functionClick !== null ? "cursor-pointer" : "";
		return (
			<Col xs={"auto"} sm={"auto"} md={"auto"} lg={"auto"}>
				<h5>
					<Badge
						color={color}
						className={`text-uppercase text-white ${cursorPointer}`}
						onClick={functionClick}
					>
						<strong>{text}</strong>
					</Badge>
				</h5>
			</Col>
		);
	};

	createBadgeTrial = () => {
		const dateNow = new Date();
		const dateToday = new Date(
			`${dateNow.getFullYear()}-${
				dateNow.getMonth() + 1
			}-${dateNow.getDate()} 00:00:00`
		);
		const dateFinalPremium = new Date(
			CompanyService.getDataCompany().premiumFinal
		);
		let dateFinalPremiumTMZ = new Date(dateFinalPremium.getTime());
		dateFinalPremiumTMZ.setHours(dateFinalPremium.getHours() + 3);
		const timeDiff = Math.abs(
			dateFinalPremiumTMZ.getTime() - dateToday.getTime()
		);
		const diffDays = Math.trunc(timeDiff / (1000 * 3600 * 24));

		let text = "";
		if (diffDays >= 2) {
			text = `Expira em ${diffDays} dias`;
		} else if (diffDays === 1) {
			text = `Expira amanhã`;
		} else {
			text = `Expira hoje`;
		}

		return this.createBadge(text, "warning");
	};

	renderHeaderEmpresa = () => {
		const company = CompanyService.getDataCompany();
		if (!company) return null;

		const exercicio = company.exercicios;
		if (exercicio === null) return null;

		const isDemo = company.isDemo;
		const isHelp = company.isHelp;
		const isPremium = company.isPremium;
		const isTrial = company.isTrial;
		const isAssociate = company.isAssociada;
		const isTrialAvailable = company.hasTrialAvailable;

		return (
			<div>
				<Row className={"align-items-center"}>
					<Col xs={"12"} sm={"8"} lg={"9"}>
						<Row className="align-items-center">
							<Col xs={"12"} lg="auto">
								<h1>{company.name}</h1>
							</Col>
							{isDemo ? this.createBadge("DEMONSTRAÇÃO", "primary") : null}
							{isHelp ? this.createBadge("AJUDA", "danger") : null}
							{isPremium && !isDemo
								? this.createBadge("premium", "primary")
								: null}
							{!isPremium && !isDemo ? this.createBadge("start", "dark") : null}
							{!isPremium && isTrialAvailable && !isDemo
								? this.createBadge(
										"ativar trial",
										"warning",
										this.handleModalAtivarTrial
								  )
								: null}
							{isAssociate && !isDemo
								? this.createBadge("associada", "primary")
								: null}
							{isTrial && !isDemo ? this.createBadgeTrial() : null}
							{(!isPremium || isTrial) && !isDemo
								? this.createBadge(
										"upgrade premium",
										"success",
										this.handleAssinarPremium
								  )
								: null}
						</Row>
					</Col>
					<Col xs={"12"} sm={"4"} lg={"3"}>
						{this.renderExercicio()}
					</Col>
				</Row>
				<br />
			</div>
		);
	};

	render() {
		if (this.state.isLoading) return <LoadingFullScreen />;

		const company = CompanyService.getDataCompany();
		const urlRedirect = company ? `/hub/${company.id}/gestao` : "/dashboard";

		const path = this.props.location.pathname;
		if (!path.includes("hub")) {
			CompanyService.removeCompanyLocalStorage();
		}

		return (
			<div className="app">
				<AppHeader fixed>
					<DefaultHeader userLogo={this.state.user_logo} {...this.props} />
				</AppHeader>
				<div className="app-body">
					<ToastContainer
						position="top-right"
						autoClose={2000}
						style={{ zIndex: 1999 }}
					/>
					<NavSideMenu />
					<main className="main">
						<AppBreadcrumb appRoutes={routes} />
						<Container fluid>
							{this.renderHeaderEmpresa()}
							<Suspense fallback={this.loading()}>
								<Switch>
									{routes.map((route, idx) => {
										return route.component ? (
											<Route
												key={idx}
												path={route.path}
												exact={route.exact}
												name={route.name}
												render={(props) => (
													<route.component
														{...props}
														{...this.state}
														setCog={(status) => this.setCog(status)}
														modalAtivarTrial={this.handleModalAtivarTrial}
													/>
												)}
											/>
										) : null;
									})}
									<Redirect to={urlRedirect} />
								</Switch>
							</Suspense>
						</Container>
					</main>
				</div>
				<AppFooter>
					<Suspense fallback={this.loading()}>
						<DefaultFooter />
					</Suspense>
					{this.modalEmpresa()}
					{this.modalAtivarTrial()}
				</AppFooter>
			</div>
		);
	}
}

export default DefaultLayout;
