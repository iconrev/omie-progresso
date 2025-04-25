import { Component } from "react";
import { AppSwitch } from "@coreui/react";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Col,
	FormGroup,
	Input,
	Label,
	Row,
	Form,
	FormText,
	CardFooter,
} from "reactstrap";
import ApiBase from "../../service/api_base";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast } from "react-toastify";
import userService from "../../service/UserService";
import ButtonLoading from "../../components/ButtonLoading";
import CompanyService from "../../service/CompanyService";

const Api_Base = new ApiBase();

class UsuarioPerfil extends Component {
	constructor(props) {
		super(props);

		this.onImageChange = this.onImageChange.bind(this);
		this.user = userService.getUser();
		CompanyService.removeCompanyLocalStorage();

		this.state = {
			isLoading: true,
			nome: "",
			email: "",
			contador: 0,
			imageBase64: null,
			updateImage: false,
			image_height: 32,
			image_with: 80,
			waiting: false,
		};
	}

	async componentDidMount() {
		await this.carregarInformacaoDoUsuario();
		this.setState({
			isLoading: false,
		});
	}

	async carregarInformacaoDoUsuario() {
		await Api_Base.get(`/cadastros/usuarios/profile`)
			.then(async (result) => {
				const { status, user } = result.data;

				if (status === "success" && user) {
					await this.setState({
						nome: user.nome,
						email: user.email,
						imageBase64: user.logo,
						contador: user.contador === 1 ? true : false,
					});
				} else {
					toast.error("Não foi possível buscar os dados do usuário :(");
					this.props.history.push("/");
				}
			})
			.catch((err) => {
				console.error(err);
				toast.error("Não foi possível buscar os dados do usuário :(");
				this.props.history.push("/");
			});
	}

	toBase64 = (file) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
		});

	validateImage(file) {
		return new Promise((resolve) => {
			const image = new Image();
			image.src = file;
			image.onload = () => {
				const height = image.height;
				const width = image.width;
				let status = true;
				let message = "";
				if (height > this.state.image_height || width > this.state.image_with) {
					console.warn("INFO", "Dimensões da Imagem: " + height + "x" + width);
					message = "As dimensões da imagem excede o permitido :(";
					status = false;
				}
				resolve({
					status: status,
					message: message,
				});
			};
			image.onerror = () => {
				resolve({
					status: false,
					message:
						"Ocorreu um problema ao analisar o arquivo. Tem certeza que é uma imagem?",
				});
			};
		});
	}

	onImageChange = async (event) => {
		if (event.target.files && event.target.files[0]) {
			const file = event.target.files[0];
			const base64 = await this.toBase64(file);
			const isValidateImage = await this.validateImage(base64);

			if (isValidateImage.status) {
				await this.setState({
					imageName: file.name,
					imageBase64: base64,
					updateImage: true,
				});
			} else {
				toast.error(isValidateImage.message);
			}
		}
	};

	handleChange = (event) => {
		this.setState({
			[event.target.id]: event.target.value,
		});
	};

	changeSwitch = (e) => {
		this.setState({
			contador: e.target.checked,
		});
	};

	handleSubmit = async (e) => {
		e.preventDefault();

		this.setState({
			waiting: true,
		});

		const data = {
			nome: this.state.nome,
			logo: this.state.imageBase64,
			contador: this.state.contador ? 1 : 0,
		};

		await Api_Base.post(`/cadastros/usuarios/profile`, data)
			.then(async (result) => {
				const { status, message } = result.data;

				if (status === "success") {
					toast.success(message);
					userService.setContador(this.state.contador);
					if (this.state.updateImage === true) {
						window.location.reload();
					} else {
						this.user = userService.getUser();
					}
				} else if (status === "warning") {
					toast.warn(message);
				} else {
					toast.error(message);
				}
			})
			.catch((err) => {
				console.error(err);
				toast.error("Ocorreu um erro ao salvar os dados");
			});

		this.setState({
			waiting: false,
		});
	};

	renderButtonUpgrade = () => {
		if (this.user.isContador && this.user.profile === "user_default") {
			return (
				<Button
					color="success"
					onClick={() => this.props.history.push(`/upgrade`)}
					className="float-right"
				>
					Solicitar Upgrade para Associado
				</Button>
			);
		}

		return null;
	};

	loaded = () => {
		let renderLogotipo = (
			<div>
				<small>Nenhum logotipo cadastrado :-(</small>
			</div>
		);
		if (this.state.imageBase64) {
			renderLogotipo = (
				<img
					id="target"
					src={this.state.imageBase64}
					alt="Logotipo"
					style={{
						width: this.state.image_with,
						height: this.state.image_height,
					}}
				/>
			);
		}

		return (
			<div className="animated fadeIn">
				<Row className={"justify-content-center"}>
					<Col xs="12" sm={"12"} md={"6"} lg={"5"} xl={"5"}>
						<Card>
							<CardHeader>
								<strong>Meus Dados</strong>
							</CardHeader>
							<CardBody>
								<Form>
									<FormGroup>
										<Label htmlFor="usuario">Usuário</Label>
										<Input
											type="text"
											id="nome"
											value={this.state.nome}
											onChange={this.handleChange}
										/>
									</FormGroup>
									<FormGroup>
										<Label htmlFor="email">E-mail</Label>
										<Input
											type="email"
											id="email"
											value={this.state.email}
											placeholder="... e com o E-mail"
											onChange={this.handleChange}
											readOnly={true}
										/>
									</FormGroup>
									<FormGroup>
										<div>
											<Label>
												Ative abaixo caso seja um Contador/Consultor
											</Label>
										</div>
										<div>
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
										</div>
									</FormGroup>
									<br />
								</Form>
							</CardBody>
							<CardFooter>
								<ButtonLoading
									color="warning"
									onClick={this.handleSubmit}
									className="float-left"
									isLoading={this.state.waiting}
								>
									Salvar
								</ButtonLoading>
								{this.renderButtonUpgrade()}
							</CardFooter>
						</Card>
					</Col>

					<Col xs="12" sm={"12"} md={"6"} lg={"5"} xl={"5"}>
						<Card>
							<CardHeader>
								<strong>Logotipo</strong>
							</CardHeader>
							<CardBody>
								<FormGroup>
									<Label>
										Esta imagem é seu logo tipo personalizado para a aplicação
										:-)
									</Label>
									<FormText color="muted">
										<p>
											<i className="icon-info" /> A imagem deve ser do tipo JPEG
											ou PNG e ter {this.state.image_height}x
											{this.state.image_with} pixels.
										</p>
									</FormText>
								</FormGroup>
								<FormGroup>{renderLogotipo}</FormGroup>
								<FormGroup>
									<Input
										type="file"
										accept="image/png, image/jpeg"
										onChange={this.onImageChange}
									/>
								</FormGroup>
							</CardBody>
							<CardFooter>
								<ButtonLoading
									color="warning"
									onClick={this.handleSubmit}
									className="float-left"
									isLoading={this.state.waiting}
								>
									Salvar
								</ButtonLoading>
							</CardFooter>
						</Card>
					</Col>
				</Row>
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

export default UsuarioPerfil;
