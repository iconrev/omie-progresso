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
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Row,
} from "reactstrap";

import { Auth } from "aws-amplify";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

class Confirm extends Component {
	state = {
		email:
			typeof this.props.location.state !== "undefined"
				? this.props.location.state.email
				: "",
		confirmationCode: "",
		codeSent: false,
		loading: false,
	};

	// validateForm = () => {
	//   return this.state.email.length > 0;
	// };

	/**
	 * Solicitação do código de recuperação do password
	 */
	handleSubmit = async (event) => {
		event.preventDefault();
		this.setState({
			loading: true,
		});
		try {
			await Auth.resendSignUp(this.state.email)
				.then((result) => {
					const { CodeDeliveryDetails } = result;
					toast.success(
						`Código enviado, verifque seu e-mail ${CodeDeliveryDetails.Destination}`
					);
					this.setState({
						codeSent: true,
						loading: false,
					});
				})
				.catch((err) => {
					console.error(`${err.message}`);
					toast.error(
						`Não foi possível enviar código nesse momento, tente mais tarde. :(`
					);
				});
		} catch (e) {
			toast.error(e.message);
		}
	};

	/**
	 * Botão para confirmação do código de troca de password
	 */
	handleConfirmationSubmit = async (e) => {
		e.preventDefault();

		this.setState({
			loading: true,
		});

		// Collect confirmation code and new password, then
		// const self = this;
		// console.log(self.state)
		// debugger;

		e.preventDefault();

		this.setState({
			loading: true,
		});

		// Collect confirmation code and new password, then
		// const self = this;
		// console.log(self.state)
		// debugger;
		await Auth.confirmSignUp(this.state.email, this.state.confirmationCode)
			// Deu tudo certo na troca da senha, já loga o usuário na
			.then(async (result) => {
				console.debug(result);
				this.props.history.push({
					pathname: "/login",
					state: {
						email: this.state.email,
						mens: "Seu e-mail está validado e você pode já acessar :-)",
					},
				});
			})
			.catch((err) => {
				console.error(err);
				if (err.code) {
					if (err.code.includes("ExpiredCodeException")) {
						toast.warn(
							"O código que você forneceu, é um código expirado ou inválido :(... solicite outro código."
						);
					} else if (err.code.includes("UserNotFoundException")) {
						toast.error("Usuário não encontrado :(.");
					} else if (err.code.includes("NotAuthorizedException")) {
						toast.warn("Usuário não pode ser confirmado, ele já está OK :)");
						this.props.history.push({
							pathname: "/login",
							state: {
								email: this.state.email,
								mens: "Seu e-mail está validado e você pode já acessar normalmente :-)",
							},
						});
					} else {
						toast.error(
							"Não foi possível ativar o cadastro, tente mais tarde."
						);
					}
				} else {
					toast.error("Não foi possível ativar o cadastro.");
				}
			});
	};

	handleChange = (event) => {
		this.setState({
			[event.target.id]: event.target.value,
		});
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
									<h4>Validação</h4>
								</CardHeader>
								<CardBody className="p-4">
									<p>
										Para acessar o <b>Omie Simbiose</b> você precisa validar o
										seu endereço de e-mail.
									</p>
									<p>
										Confirme o e-mail cadastrado e clique no botão abaixo para
										receber um novo código.
									</p>
									<Form>
										<br />
										<InputGroup className="mb-3">
											<InputGroupAddon addonType="prepend">
												<InputGroupText>
													<i className="icon-user" />
												</InputGroupText>
											</InputGroupAddon>
											<Input
												type="e-mail"
												id="email"
												value={this.state.email}
												placeholder="E-mail"
												autoComplete="email"
												onChange={this.handleChange}
												disabled={this.state.codeSent}
											/>
										</InputGroup>
										{this.state.codeSent ? (
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
														placeholder="Código verificação (verifique seu e-mail)"
														disabled={!this.state.codeSent}
														onChange={this.handleChange}
													/>
												</InputGroup>
												<Button
													type="submit"
													color="success"
													className={
														this.state.loading
															? "ui primary loading button"
															: "ui primary button"
													}
													role="status"
													block
													onClick={this.handleConfirmationSubmit}
												>
													Confirmar
												</Button>
											</div>
										) : (
											<Button
												type="submit"
												color="success"
												className={
													this.state.loading
														? "ui primary loading button"
														: "ui primary button"
												}
												role="status"
												block
												onClick={this.handleSubmit}
											>
												{" "}
												Reenviar código de validação
											</Button>
										)}
									</Form>
								</CardBody>
								<CardFooter className="p-4" />
							</Card>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default Confirm;
