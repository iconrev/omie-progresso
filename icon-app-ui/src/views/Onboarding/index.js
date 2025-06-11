import { Component } from "react";
import {
	Button,
	Col,
	FormGroup,
	Input,
	Label,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Row,
	Form,
} from "reactstrap";
import { toast } from "react-toastify";
import InputMask from "react-input-mask";
import ApiBase from "../../service/api_base";
import { isCnpjValid } from "../Utils/cnpj-utils";

const Api_Base = new ApiBase();

class Onboarding extends Component {
	constructor(props) {
		super(props);
		this.toggleModal = this.toggleModal.bind(this);

		this.state = {
			modal: false,
			empresa: "",
			cnpj: "",
			usuario: "",
			active: true,
			isLoading: false,
		};
	}

	componentDidMount() {
		this.toggleModal();
	}

	toggleModal() {
		this.setState({
			modal: !this.state.modal,
		});
	}

	/**
	 * Ocorre sempre que o dado de um componente foi alterado.
	 */
	handleChange = (event) => {
		this.setState({
			[event.target.id]: event.target.value,
		});
	};

	/**
	 * Controla o fechamento do Modal
	 */
	handleCancel = (e) => {
		e.preventDefault();
		this.toggleModal();
	};

	/*
	 * Handle with company button save.
	 */
	handleSave = async (e) => {
		e.preventDefault();

		this.setState({
			isLoading: true,
		});
		// obtem o usuário logado...

		// ... incluindo uma nova empresa
		const payload = {
			nome: this.state.empresa.trim(),
			cnpj: this.state.cnpj.trim(),
			active: true,
			companyAssociate: "",
		};
		await Api_Base.post("/cadastros/empresas", payload)
			.then(async (result) => {
				const { status, message } = result.data;

				if (status !== "success") {
					toast.error(message);
				} else {
					toast.success(message);
				}

				await this.props.loadData();
				this.toggleModal();
			})
			.catch(() => {
				console.error("Não foi possível cadastrar empresa");
				toast.warn("Não foi possível cadastrar a Empresa");
			});

		this.setState({
			isLoading: false,
		});
	};

	/**
	 * Faz a validação do formulário de cadastro
	 */
	validateForm = () => {
		if (this.state.empresa) {
			return this.state.empresa.length > 0 && this.state.cnpj.length > 0;
		}
	};

	/**
	 * Faz a validação do CNPJ, e verifica se já existe uma empresa
	 * com o mesmo CNPJ
	 */
	handleBlur = (e, resouce) => {
		if (resouce.includes("CNPJ")) {
			if (e.target.value) {
				if (!isCnpjValid(e.target.value)) {
					toast.warn("Este CNPJ é inválido");
					e.target.focus();
				}
			}
		}
		if (resouce.includes("NOME")) {
			if (e.target.value === "") {
				e.target.focus();
			}
		}
	};

	render() {
		return (
			<div className="animated fadeIn">
				<div>
					{/* DIALOGO MODAL PARA EDIÇÃO DE EMPRESA - INICIO */}
					<Modal
						isOpen={this.state.modal}
						toggle={this.toggleModal}
						backdrop={"static"}
						keyboard={false}
						className={this.props.className}
					>
						<ModalHeader toggle={this.toggleModal}>
							Bem vindo! Vamos começar...
						</ModalHeader>
						<ModalBody>
							<Row>
								<Col xs="12">
									<p>
										Esse é o seu primeiro acesso e para continuarmos você
										precisa cadastrar a primeira empresa que deseja
										diagnosticar.
									</p>
									<Form>
										<FormGroup>
											<Label htmlFor="cnpj">CNPJ</Label>
											<InputMask
												className="form-control"
												id="cnpj"
												mask="99.999.999/9999-99"
												onChange={this.handleChange}
												onBlur={(e) => this.handleBlur(e, "CNPJ")}
												placeholder="00.000.000/0000-00"
												value={this.state.cnpj}
											/>
										</FormGroup>
										<FormGroup>
											<Label htmlFor="company">Nome da Empresa</Label>
											<Input
												type="text"
												id="empresa"
												value={this.state.empresa}
												placeholder="Nome fantasia, apelido ou a razão social"
												onBlur={(e) => this.handleBlur(e, "NOME")}
												onChange={this.handleChange}
											/>
										</FormGroup>
									</Form>
								</Col>
							</Row>
						</ModalBody>
						<ModalFooter>
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
										Aguarde...
									</button>
								) : (
									<Button
										type="submit"
										color="success"
										className="px-4"
										onClick={this.handleSave}
										disabled={!this.validateForm()}
									>
										Cadastrar
									</Button>
								)
							}
							<Button outline color="secondary" onClick={this.handleCancel}>
								{" "}
								Fechar{" "}
							</Button>
						</ModalFooter>
					</Modal>
				</div>
				{/* DIALOGO MODAL PARA EDIÇÃO DE EMPRESA - FINAL */}
			</div>
		);
	}
}

export default Onboarding;
