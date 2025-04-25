/* eslint-disable max-len */
import { Component } from "react";
import { AppSwitch } from "@coreui/react";
import {
	Alert,
	Button,
	Card,
	CardBody,
	CardFooter,
	Col,
	Container,
	Form,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Row,
	FormText,
	Label,
} from "reactstrap";
import PasswordStrengthBar from "react-password-strength-bar";
import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { vincularUsuario, logoutUsuario } from "../../../service/services";
import { Api_Base } from "../../../service/api_base";
import { LocalStorageService } from "../../../service/localStorageService";
import { stringToRSABase64 } from "../../Utils/Generic";

class Register extends Component {
	constructor(props) {
		super(props);

		this.scoreWords = [
			"Senha Fraca",
			"Senha Fraca",
			"Está OK, mas pode ficar ainda mais segura.",
			"Está bom",
			"Senha forte!",
		];

		this.state = {
			disabledCode: true,
			isLoading: false,
			username: "",
			name: "",
			family_name: "",
			email: "",
			password: "",
			contador: false,
			confirmationCode: "",
			newUser: null,
			alert: false,
			alert_color: "danger",
			alert_message: "",
			cognito_id: null,
		};
	}

	validateForm = () => {
		return (
			this.state.username.length > 0 &&
			this.state.name.length > 0 &&
			this.state.family_name.length > 0 &&
			this.state.password.length > 0
		);
	};

	validateFormCode = () => {
		return this.state.confirmationCode.length > 0;
	};

	handleSubmit = async (event) => {
		event.preventDefault();

		// iguala os dois dados... para o cognito
		await this.setState({
			email: this.state.username.trim(),
			isLoading: true,
		});

		// faz o registro do usuário
		try {
			const url = "/cadastros/usuarios/register";
			const payload = {
				username: this.state.email.toLowerCase(),
				password: stringToRSABase64(this.state.password),
				email: this.state.email.toLowerCase(),
				name: this.state.name.trim(),
				family_name: this.state.family_name.trim(),
			};
			const response = await Api_Base.post(url, payload);

			if (response.data.status === "success") {
				await this.setState({
					email: this.state.email,
					name: this.state.name.trim(),
					family_name: this.state.family_name.trim(),
					password: this.state.password,
					newUser: this.state.email,
					isLoading: false,
					disabledCode: false,
					cognito_id: response.data.UserSub,
					alert: true,
					alert_color: "success",
					alert_message:
						"Usuário criado com sucesso, agora verifque seu e-mail para preencher o código de verificação abaixo :-)",
				});
			}
		} catch (err) {
			console.error(err);

			if (err.response.data.message) {
				await this.setState({
					isLoading: false,
					alert: true,
					alert_color: "warning",
					alert_message: err.response.data.message,
				});
			} else {
				await this.setState({
					isLoading: false,
					alert: true,
					alert_color: "danger",
					alert_message: `Não foi possível criar o usuário :( tente mais tarde!`,
				});
			}
		}
	};

	handleConfirmationSubmit = async (event) => {
		event.preventDefault();
		this.setState({ isLoading: true });

		try {
			// confirmacao do sigup
			const url = "/cadastros/usuarios/confirmRegister";
			const payload = {
				email: this.state.email,
				code: this.state.confirmationCode,
			};
			const responseConfirm = await Api_Base.post(url, payload);
			if (responseConfirm.data.status === "success") {
				// login
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
				const responseLogin = await Api_Base.post(url, auth);
				const credentials = responseLogin.data["AuthenticationResult"];
				if (credentials) {
					LocalStorageService.setToken(credentials["AccessToken"]);
					LocalStorageService.setRefreshToken(credentials["RefreshToken"]);
					console.info("INFO:", "Usuário autenticado com sucesso.");

					const payload = {
						contador: this.state.contador ? 1 : 0,
					};
					await vincularUsuario(payload)
						.then(async (response) => {
							const { status, message, attributes } = response.data;
							if (status === "success") {
								LocalStorageService.setUser(attributes);
								return this.props.history.push("/dashboard");
							} else {
								toast.error(message);
								await logoutUsuario();
								this.setState({
									isLoading: false,
								});
							}
						})
						.catch(async (err) => {
							console.error(err);
							toast.error("Não foi possivel conectar-se ao servidor :(");
							await logoutUsuario();
							this.setState({
								isLoading: false,
							});
						});
				}
			}
		} catch (err) {
			console.error(`${err.message}`);
			this.setState({
				alert: true,
				alert_color: "danger",
				alert_message: `Ops! Não foi possível criar o usuário. Verifique se o endereço de e-mail e o código está correto. `,
				isLoading: false,
			});
		}
	};

	handleChange = async (event) => {
		await this.setState({
			[event.target.id]: event.target.value,
		});
	};

	changeSwitch = async (e) => {
		await this.setState({
			contador: e.target.checked,
		});
	};

	renderCriarConta = () => {
		return (
			<div>
				<InputGroup className="mb-3">
					<InputGroupAddon addonType="prepend">
						<InputGroupText>
							<i className="icon-note" />
						</InputGroupText>
					</InputGroupAddon>
					<Input
						type="text"
						id="name"
						value={this.state.name}
						placeholder="Nome"
						onChange={this.handleChange}
						required
					/>
				</InputGroup>
				<InputGroup className="mb-3">
					<InputGroupAddon addonType="prepend">
						<InputGroupText>
							<i className="icon-note" />
						</InputGroupText>
					</InputGroupAddon>
					<Input
						type="text"
						id="family_name"
						value={this.state.family_name}
						placeholder="Sobrenome"
						onChange={this.handleChange}
						required
					/>
				</InputGroup>

				<Row className={"justify-content-center mb-2"}>
					<Col>
						<Label className={"text-muted"}>Sou um Contador/Consultor</Label>
					</Col>
					<Col>
						<AppSwitch
							id="contador"
							className={"mx-1"}
							color={"primary"}
							checked={this.state.contador}
							onChange={this.changeSwitch}
							label
							dataOn={"\u2713"}
							dataOff={"\u2715"}
						/>
					</Col>
				</Row>

				<InputGroup className="mb-3">
					<InputGroupAddon addonType="prepend">
						<InputGroupText>
							<i className="icon-lock" />
						</InputGroupText>
					</InputGroupAddon>
					<Input
						type="password"
						id="password"
						value={this.state.password}
						placeholder="Senha"
						autoComplete="new-password"
						onChange={this.handleChange}
						required
					/>
					<FormText color="muted">
						<p>
							<i className="icon-info" /> A senha deve conter no mínimo 8
							caracteres e entre eles deve conter uma letra maiúscula, uma letra
							minúscula, um número e um caracter especial.
						</p>
					</FormText>
				</InputGroup>
				<PasswordStrengthBar
					password={this.state.password}
					scoreWords={this.scoreWords}
					shortScoreWord={["muito pequena"]}
					minLength={8}
					required
				/>
				<Button
					type="submit"
					color="success"
					className="btn btn-primary"
					style={{ marginTop: 9 }}
					block
					onClick={this.handleSubmit}
					disabled={!this.validateForm()}
				>
					{!this.state.isLoading ? (
						"Criar conta"
					) : (
						<>
							<span
								className="spinner-grow spinner-grow-sm mr-1"
								role="status"
								aria-hidden="true"
							/>
							&nbsp;Aguarde...
						</>
					)}
				</Button>
			</div>
		);
	};

	renderValidarEmail = () => {
		return (
			<div>
				<InputGroup className="mb-4">
					<InputGroupAddon addonType="prepend">
						<InputGroupText>
							<i className="icon-check" />
						</InputGroupText>
					</InputGroupAddon>
					<Input
						type="text"
						id="confirmationCode"
						value={this.state.confirmationCode}
						placeholder="Código Verificação"
						disabled={this.state.disabledCode}
						onChange={this.handleChange}
						required
					/>
				</InputGroup>
				<Button
					type="submit"
					color="success"
					className="btn btn-primary"
					block
					onClick={this.handleConfirmationSubmit}
					disabled={!this.validateFormCode()}
				>
					{!this.state.isLoading ? (
						"Verificar cadastro"
					) : (
						<>
							<span
								className="spinner-grow spinner-grow-sm mr-1"
								role="status"
								aria-hidden="true"
							/>
							&nbsp;Aguarde...
						</>
					)}
				</Button>
			</div>
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
				<Container>
					<Row className="justify-content-center">
						<Col md="9" lg="7" xl="6">
							<Card className="mx-4">
								<CardBody className="p-4">
									<h3>Registrar</h3>
									<Form>
										{this.state.alert ? (
											<Alert
												color={this.state.alert_color}
												isOpen={this.state.alert}
												toggle={this.onDismiss}
											>
												{this.state.alert_message}
											</Alert>
										) : null}
										<p className="text-muted">Crie sua conta</p>
										<InputGroup className="mb-3">
											<InputGroupAddon addonType="prepend">
												<InputGroupText>
													<i className="icon-user" />
												</InputGroupText>
											</InputGroupAddon>
											<Input
												type="email"
												id="username"
												value={this.state.username}
												placeholder="E-mail"
												autoComplete="e-mail"
												onChange={(event) =>
													this.setState({
														[event.target.id]: event.target.value.toLowerCase(),
													})
												}
												disabled={this.state.newUser !== null}
												required
											/>
										</InputGroup>
										{this.state.newUser === null
											? this.renderCriarConta()
											: this.renderValidarEmail()}
									</Form>
								</CardBody>
								<CardFooter className="p-4">
									<Link to="/">&lt; Voltar</Link>
								</CardFooter>
							</Card>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default Register;
