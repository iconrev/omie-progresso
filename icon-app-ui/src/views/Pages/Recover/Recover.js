import { Component } from "react";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Col,
	Container,
	Form,
	FormText,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Row,
} from "reactstrap";
import PasswordStrengthBar from "react-password-strength-bar";
import { Auth } from "aws-amplify";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import { isEmailValid } from "../../Utils/Generic";
import { vincularUsuario, logoutUsuario } from "../../../service/services";
import { Api_Base } from "../../../service/api_base";
import { LocalStorageService } from "../../../service/localStorageService";
import { stringToRSABase64 } from "../../Utils/Generic";

class Recover extends Component {
	state = {
		username: "",
		password: "",
		confirmationCode: "",
		disableUsername: true,
		codeSent: false,
		codeSentBefore: false,
		loading: false,
	};

	/*  ['weak', 'weak', 'okay', 'good', 'strong'] */
	scoreWords = [
		"Senha Fraca",
		"Senha Fraca",
		"Está OK, mas pode ficar ainda mais segura.",
		"Está bom",
		"Senha forte!",
	];

	validateForm = () => {
		let erros = [];
		if (this.state.username.length < 5) {
			erros.push("Necessário preenchimento do e-mail.");
		} else {
			if (!isEmailValid(this.state.username)) {
				erros.push("E-mail informado não é válido.");
			}
		}

		erros.map((item) => toast.error(item));

		return erros.length === 0;
	};

	updateCodeSent = async (disableUsername) => {
		this.setState({
			codeSent: true,
			isLoading: false,
			disableUsername: disableUsername,
		});
	};

	handleSubmit = async (event) => {
		event.preventDefault();

		let status = this.validateForm();
		if (!status) return;

		this.setState({
			isLoading: true,
		});

		try {
			const url = "/cadastros/usuarios/recover";
			const payload = {
				email: this.state.username,
			};
			const responseRecover = await Api_Base.post(url, payload);
			if (responseRecover.data.status === "success") {
				const { CodeDeliveryDetails } = responseRecover.data;
				toast.success(
					// eslint-disable-next-line max-len
					`Caso o e-mail ${CodeDeliveryDetails.Destination} seja válido, será enviado um código de confirmação. :)`
				);
				await this.updateCodeSent(false);
			}
		} catch (error) {
			console.error(error);
			this.setState({
				isLoading: false,
			});
			toast.error(error.response.data.message, {
				onClose: () => this.props.history.push("/login"),
			});
		}
	};

	handleConfirmationSubmit = async (e) => {
		e.preventDefault();

		this.setState({
			isLoading: true,
		});

		try {
			const url = "/cadastros/usuarios/confirmRecover";
			const payload = {
				email: this.state.username,
				code: this.state.confirmationCode,
				password: stringToRSABase64(this.state.password),
			};
			const responseRecover = await Api_Base.post(url, payload);
			if (responseRecover.data.status === "success") {
				const url = "/cadastros/usuarios/login";
				const payload = {
					email: this.state.username,
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
		} catch (error) {
			console.error(error);
			this.setState({
				isLoading: false,
			});
			toast.error(error.response.data.message, {
				onClose: () => this.props.history.push("/login"),
			});
		}
	};

	handleChange = (event) => {
		this.setState({
			[event.target.id]: event.target.value,
		});
	};

	renderButtonAtalho = () => {
		let text =
			this.state.codeSentBefore === true
				? "Solicitar código >"
				: "Já recebi o código >";

		const handleOnClickAtalho = async (e) => {
			e.preventDefault();
			if (this.state.codeSentBefore === false) {
				await this.setState({
					codeSentBefore: true,
					codeSent: true,
					isLoading: false,
					disableUsername: true,
				});
			} else {
				await this.setState({
					username: "",
					password: "",
					confirmationCode: "",
					disableUsername: true,
					codeSentBefore: false,
					codeSent: false,
					isLoading: false,
				});
			}
		};

		return (
			<Col>
				<Link to="#" className={"float-right"} onClick={handleOnClickAtalho}>
					{text}
				</Link>
			</Col>
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
								<CardHeader>
									<h4>Recuperar Senha</h4>
								</CardHeader>
								<CardBody className="p-4">
									<h6>Entre com seus dados</h6>
									<Form>
										<br />
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
												placeholder="E-mail cadastrado"
												autoComplete="username"
												onChange={(event) =>
													this.setState({
														[event.target.id]: event.target.value.toLowerCase(),
													})
												}
												disabled={
													this.state.codeSent && !this.state.codeSentBefore
												}
											/>
										</InputGroup>
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
												placeholder="Código de verificação"
												onChange={this.handleChange}
												disabled={!this.state.codeSent}
											/>
										</InputGroup>
										{this.state.codeSent ? (
											<>
												<InputGroup className="mb-3">
													<InputGroupAddon addonType="prepend">
														<InputGroupText>
															<i className="icon-lock" />
														</InputGroupText>
													</InputGroupAddon>
													<Input
														type="password"
														id="password"
														value={this.state.password || ""}
														placeholder="Nova senha"
														autoComplete="new-password"
														onChange={this.handleChange}
														required
													/>
												</InputGroup>
												<FormText color="muted">
													<p>
														<i className="icon-info" /> A senha deve conter no
														mínimo 8 caracteres e entre eles deve conter uma
														letra maiúscula, uma letra minúscula, um número e um
														caracter especial.
													</p>
												</FormText>
												<PasswordStrengthBar
													password={this.state.password}
													scoreWords={this.scoreWords}
													shortScoreWord={["muito pequena"]}
													minLength={8}
													required
												/>
											</>
										) : null}
										{this.state.codeSent ? (
											<Button
												type="submit"
												color="success"
												className={"ui primary button"}
												role="status"
												block
												onClick={this.handleConfirmationSubmit}
											>
												{!this.state.isLoading ? (
													"Confirmar"
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
										) : (
											<Button
												type="submit"
												color="success"
												className={"ui primary button"}
												role="status"
												block
												onClick={this.handleSubmit}
											>
												{!this.state.isLoading ? (
													"Solicitar Código"
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
										)}
									</Form>
								</CardBody>
								<CardFooter className="p-4">
									<Row>
										<Col>
											<Link to="/">&lt; Voltar</Link>
										</Col>
										{this.renderButtonAtalho()}
									</Row>
								</CardFooter>
							</Card>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default Recover;
