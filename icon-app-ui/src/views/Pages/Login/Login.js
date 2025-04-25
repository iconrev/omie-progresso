import { Component } from "react";
import { Link } from "react-router-dom";
import {
	Button,
	Card,
	CardBody,
	CardGroup,
	Col,
	Container,
	Form,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Row,
	Tooltip,
} from "reactstrap";
import logoFenacon from "../../../assets/img/brand/fenacon_logo.png";
import logoInstitutoFenacon from "../../../assets/img/brand/instituto_fenacon_logo.png";
import logo from "../../../assets/img/brand/omie_logo_novo.png";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { logoutUsuario, vincularUsuario } from "../../../service/services";
import "../../../assets/Login/login.scss";
import userService from "../../../service/UserService";
import { Api_Base } from "../../../service/api_base";
import { LocalStorageService } from "../../../service/localStorageService";
import { stringToRSABase64 } from "../../Utils/Generic";
import LoginOmie from "./LoginOmie";


class Login extends Component {
	constructor(props) {
		super(props);

		userService.doLogout();

		this.state = {
			isLoading: false,
			email: "",
			password: "",
			user: "",
			hiddenPassword: true,
			tooltipPasswordHidden: false,
		};
	}

	handleChange = (event) => {
		this.setState({
			[event.target.id]: event.target.value,
		});
	};

	handleHiddenPassword = async (event) => {
		event.preventDefault();
		await this.setState({
			hiddenPassword: !this.state.hiddenPassword,
		});
	};

	handleTooltip = async (event) => {
		event.preventDefault();
		await this.setState({
			tooltipPasswordHidden: !this.state.tooltipPasswordHidden,
		});
	};

	handleSubmit = async (event) => {
		event.preventDefault();

		this.setState({
			isLoading: true,
		});

		const url = "/cadastros/usuarios/login";
		const payload = {
			email: this.state.email,
			password: this.state.password,
			timestamp: new Date().toISOString(),
		};
		const cryptedPayload = stringToRSABase64(JSON.stringify(payload));
		const auth = {
			auth: cryptedPayload,
		};

		try {
			const response = await Api_Base.post(url, auth);
			const credentials = response.data["AuthenticationResult"];
			if (!credentials) {
				toast.error("Usuário/Senha inválido... :(");
			} else {
				LocalStorageService.setToken(credentials["AccessToken"]);
				LocalStorageService.setRefreshToken(credentials["RefreshToken"]);
				console.info("INFO:", "Usuário autenticado com sucesso.");

				const response = await vincularUsuario();
				const { status, message, attributes } = response.data;
				if (status === "success") {
					LocalStorageService.setUser(attributes);
					return this.props.history.push("/dashboard");
				} else {
					toast.error(message);
					await logoutUsuario();
				}
			}
		} catch (error) {
			console.error(error);
			toast.error("Usuário/Senha inválido... :(");
			await logoutUsuario();
		}

		this.setState({
			isLoading: false,
		});
	};

	validateForm = () => {
		return this.state.email.length > 0 && this.state.password.length > 0;
	};

	_login = () => {
		const login_password = (
			<Card className="p-4">
				<CardBody>
					<Form>
						<h1>Omie.Simbiose</h1>
						<p className="text-muted">Faça login em sua conta</p>
						<InputGroup className="mb-3">
							<InputGroupAddon addonType="prepend">
								<InputGroupText>
									<i className="fa fa-user" />
								</InputGroupText>
							</InputGroupAddon>
							<Input
								type="email"
								id="email"
								onChange={(event) =>
									this.setState({
										[event.target.id]: event.target.value.toLowerCase(),
									})
								}
								value={this.state.email}
								placeholder="E-mail"
								autoComplete="off"
							/>
						</InputGroup>
						<InputGroup className="mb-4">
							<InputGroupAddon addonType="prepend">
								<InputGroupText onClick={this.handleHiddenPassword}>
									<i
										className={
											"fa fa-" + (this.state.hiddenPassword ? "lock" : "unlock")
										}
										id={"password-image"}
									/>
									<Tooltip
										placement="top"
										isOpen={this.state.tooltipPasswordHidden}
										target={"password-image"}
										toggle={this.handleTooltip}
									>
										Clique para{" "}
										{this.state.hiddenPassword ? "exibir" : "ocultar"} a senha
									</Tooltip>
								</InputGroupText>
							</InputGroupAddon>
							<Input
								type={this.state.hiddenPassword ? "password" : "text"}
								id="password"
								onChange={this.handleChange}
								placeholder="Senha"
								autoComplete="new-password"
							/>
						</InputGroup>
						<Row className="align-items-center text-center">
							<Col xs="6" sm="6" className="">
								{
									/* apenas um truque para ativar o sppiner, uso o bootstrap*/
									this.state.isLoading ? (
										<button
											className="btn btn-primary px-4"
											type="button"
											disabled
										>
											<span
												className="spinner-grow spinner-grow-sm"
												role="status"
												aria-hidden="true"
											/>
											&nbsp;Aguarde...
										</button>
									) : (
										<Button
											type="submit"
											color="primary"
											className="px-4"
											onClick={this.handleSubmit}
											disabled={!this.validateForm()}
										>
											Entrar
										</Button>
									)
								}
							</Col>
							<Col xs="6" sm="6" className="">
								<Link to="/recover">
									<Button color="link" className="px-0">
										Esqueceu sua senha?
									</Button>
								</Link>
							</Col>
						</Row>
						<Row className="align-items-center text-center mt-3">
							<Col className="">
								<LoginOmie />
							</Col>
						</Row>
					</Form>
				</CardBody>
			</Card>
		);

		const register = (
			<Card className="text-white bg-primary">
				<CardBody className="text-center">
					<Row className="h-100">
						<Col className={"my-auto"}>
							<Row className={"justify-content-center pb-2"}>
								<Col className={""}>
									<p className={"text-login-register"}>
										O software que descomplica a consultoria empresarial
										estratégica.
									</p>
								</Col>
							</Row>
							<Row className={"justify-content-center pb-3"}>
								<Col>
									<p className={"text-login-register-title"}>
										Quer impulsionar a sua empresa com facilidade e agilidade?
									</p>
								</Col>
							</Row>
							<Row className={"justify-content-center"}>
								<Col xs={"8"}>
									<Link to="/register">
										<Button
											color="primary"
											className="rounded-pill"
											active
											tabIndex={-1}
											block
										>
											Cadastre-se
										</Button>
									</Link>
								</Col>
							</Row>
						</Col>
					</Row>
				</CardBody>
			</Card>
		);

		return (
			<Row className="justify-content-center mb-4 row-login-register">
				<Col xs="12" sm="11" md="10" lg="9" xl="8">
					<CardGroup>
						{login_password}
						{register}
					</CardGroup>
				</Col>
			</Row>
		);
	};

	renderImage = (source, alt, width = 200, height) => {
		return (
			<Col xs="12" sm="12" md="6" lg="4" className="text-center">
				<img
					src={source}
					style={{ width: width, height: height, margin: "15px" }}
					alt={alt}
				/>
			</Col>
		);
	};

	_logotipos = () => {
		return (
			<Row className="justify-content-center">
				<Col xs="12" sm="11" md="10" lg="9" xl="8">
					<CardGroup>
						<Card className={"m-0 p-0"}>
							<CardBody>
								<Row className="justify-content-center">
									{this.renderImage(logoFenacon, "Logo Fenacon", 200, 55)}
									{this.renderImage(
										logoInstitutoFenacon,
										"Logo Instituto",
										200,
										55
									)}
									{this.renderImage(logo, "Logo Omie", 150)}
								</Row>
							</CardBody>
						</Card>
					</CardGroup>
				</Col>
			</Row>
		);
	};

	render() {
		return (
			<div className="app flex-row align-items-center">
				<ToastContainer
					position="top-right"
					autoClose={2000}
					style={{ zIndex: 1999 }}
				/>
				<Container className="p-3">
					{this._login()}
					{this._logotipos()}
				</Container>
			</div>
		);
	}
}

export default Login;
