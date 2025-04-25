import { Component } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
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
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	CardFooter,
	Row,
	Badge,
} from "reactstrap";
import { toast } from "react-toastify";
import ApiBase from "../../service/api_base";
import ConfirmPopUp from "../../components/ConfirmPopUp";
import LoadingSpinner from "../../components/LoadingSpinner";
import Generic from "../Utils/Generic";
import CompanyService from "../../service/CompanyService";

const Api_Base = new ApiBase();

class Convidados extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();
		this.toggleModal = this.toggleModal.bind(this);
		this.onRowSelect = this.onRowSelect.bind(this);
		this.loadData = this.loadData.bind(this);

		CompanyService.removeCompanyLocalStorage();

		this.state = {
			isLoading: true,
			id: this.company.id,
			company: this.company.name,
			cnpj: this.company.cnpj,

			modal: false,
			isLoadingButtonConvidar: false,
			isLoadingButtonReenviar: false,

			usuario: null,
			nome: "",
			email: "",
			usuarios: [],
			usuariosPendentes: [],

			active: false,
			invited: false,
			accept: false,
			owner: false,
			selectedRow: [],
			editing: false,
		};
	}

	async componentDidMount() {
		await this.loadData();
		this.setState({
			isLoading: false,
		});
	}

	loadData = async () => {
		await Api_Base.get(`/cadastros/empresas/${this.state.id}/convidados`)
			.then(async (response) => {
				const { invited, accepted, status, message } = response.data;

				if (status !== "success") {
					toast.error(message);
				} else {
					await this.setState({
						usuariosPendentes: invited,
						usuarios: accepted,
					});
				}
			})
			.catch((err) => {
				if (err.response.status !== 401) {
					console.error(err);
					toast.error("Não foi possível buscar os responsáveis :(");
				}
				if (err.response.data.status === "unauthorized") {
					this.redirect("");
				}
			});
	};

	redirect = (url) => {
		url = `/hub/${this.state.companyId}/gestao/${url}`;
		this.props.history.push(url);
	};

	toggleModal() {
		this.setState({
			modal: !this.state.modal,
		});
	}

	onRowSelect(row) {
		this.setState({
			selectedRow: row,
		});
	}

	handleChange = (event) => {
		this.setState({
			[event.target.id]: event.target.value,
		});
	};

	handleCancelModalButton = (e) => {
		e.preventDefault();
		this.toggleModal();
	};

	handlerConvidarUsuario = (e) => {
		e.preventDefault();
		// resete dos dados e sinalização para o envio de convite...
		this.setState({
			usuario: "",
			email: "",
			invited: false,
			accept: false,
			editing: false,
			owner: false,
		});
		// abrir o dialogo de usuário...
		this.toggleModal();
	};

	handlerBotaoEnviarConvite = async (e, reenviar) => {
		e.preventDefault();

		if (reenviar) {
			const usuarioEditing = this.state.usuario;
			const emailEditing = this.state.email;
			const empresaEditing = this.state.id;

			await this.setState({
				isLoadingButtonConvidar: true,
			});

			if (this.validateForm(usuarioEditing, emailEditing, empresaEditing)) {
				const payload = {
					empresa: empresaEditing,
					email: emailEditing.trim(),
					nome: usuarioEditing.trim(),
				};
				await Api_Base.post(`/cadastros/empresas/usuarios/convite`, payload)
					.then(async (response) => {
						const { status, message } = response.data;

						if (status === "success") {
							await this.loadData();
							toast.success(message);
							this.toggleModal();
						} else {
							toast.error(message);
						}
					})
					.catch((err) => {
						console.error(err);
						toast.error(err.response.data.message);
					});
			}

			await this.setState({
				isLoadingButtonConvidar: false,
			});
		}
	};

	validateForm = (usuario, email, empresa) => {
		let erros = [];

		if (usuario.length < 3) {
			erros.push("O nome deve conter pelo menos 3 caracteres.");
		}

		if (email.length < 1) {
			erros.push("Deve-se preencher um e-mail válido.");
		} else {
			if (!Generic.isEmailValid(email)) {
				erros.push("E-mail preenchido não é válido.");
			}
		}

		if (empresa === "0") {
			erros.push("Empresa não selecionada.");
		}

		if (erros.length === 0) {
			return true;
		} else {
			erros.forEach((msg) => toast.error(msg));
			return false;
		}
	};

	changeSwitch = (e) => {
		this.setState({
			[e.target.id]: e.target.checked,
		});
	};

	userUpdateStatus = async (e, email, status) => {
		e.preventDefault();
		const api = status ? "ativar" : "desativar";
		const payload = {
			empresa: this.state.id,
			email: email,
		};
		await Api_Base.post(`/cadastros/empresas/usuarios/convite/${api}`, payload)
			.then(async (response) => {
				const { status, message } = response.data;

				await this.loadData();
				if (status !== "success") {
					toast.error(message);
				} else {
					toast.success(message);
				}
			})
			.catch((err) => {
				console.error("err", err);
				console.error("response", err.response);
				toast.error(err.response.data.message);
			});
	};

	btnDesativeUser = (cell, row) => {
		const target = "popover" + row.user_id.toString();
		const status = row.active;

		let text, btnClass, btnText;
		if (status) {
			text = "Deseja mesmo DESATIVAR o usuário " + row.nome + "?";
			btnClass = "btn btn-danger btn-sm";
			btnText = "DESATIVAR";
		} else {
			text = "Deseja mesmo ATIVAR o usuário " + row.nome + "?";
			btnClass = "btn btn-success btn-sm";
			btnText = "ATIVAR";
		}

		return (
			<Row className="text-center">
				<Col md={"12"} className="align-content-center">
					<Button className={btnClass} id={target}>
						{btnText}
					</Button>
				</Col>
				<ConfirmPopUp
					placement="top"
					target={target}
					text={text}
					confirm={async (e) =>
						await this.userUpdateStatus(e, row.email, !status)
					}
					data={[row.EmpresaId, row.email, !status]}
				/>
			</Row>
		);
	};

	doubleDigite = (value) => {
		return ("" + value).length > 1 ? value : "0" + value;
	};

	getFormattedDate = (date) => {
		let year = date.getFullYear();
		let month = this.doubleDigite((1 + date.getMonth()).toString());
		let day = this.doubleDigite(date.getDate().toString());

		return day + "/" + month + "/" + year;
	};

	getFormattedTime = (date) => {
		let hour = this.doubleDigite(date.getHours());
		let minutes = this.doubleDigite(date.getMinutes());
		let seconds = this.doubleDigite(date.getSeconds());
		return hour + ":" + minutes + ":" + seconds;
	};

	datetimeToDate = (cell, row) => {
		let dateCreate = new Date(row.createdAt);
		let dateFull = this.getFormattedDate(dateCreate);
		let timeFull = this.getFormattedTime(dateCreate);
		return `${dateFull} às ${timeFull}`;
	};

	invitePendingCancel = async (e, email) => {
		e.preventDefault();

		const payload = {
			empresa: this.state.id,
			email: email,
		};
		await Api_Base.post(
			`/cadastros/empresas/usuarios/convite/cancelar`,
			payload
		)
			.then(async (response) => {
				const { status, message } = response.data;

				await this.loadData();
				if (status !== "success") {
					toast.error(message);
				} else {
					toast.success(message);
				}
			})
			.catch((err) => {
				console.error(err);
				toast.error("Ocorreu um erro ao cancelar o convite :(");
			});
	};

	invitePendingResend = async (e, email) => {
		e.preventDefault();

		await this.setState({
			isLoadingButtonReenviar: true,
		});

		const payload = {
			empresa: this.state.id,
			email: email,
		};
		await Api_Base.post(
			`/cadastros/empresas/usuarios/convite/reenviar`,
			payload
		)
			.then(async (response) => {
				const { status, message } = response.data;

				await this.loadData();
				if (status !== "success") {
					toast.error(message);
				} else {
					toast.success(message);
				}
			})
			.catch((err) => {
				console.error(err);
				toast.error("Ocorreu um erro ao reenviar o convite :(");
			});

		await this.setState({
			isLoadingButtonReenviar: false,
		});
	};

	btnInviteCancel = (cell, row) => {
		const targetCancel = "popoverCancel" + row.id.toString();
		const targetResend = "popoverResend" + row.id.toString();

		let buttonReenviar = null;
		if (this.state.isLoadingButtonReenviar) {
			buttonReenviar = (
				<Button className="btn ml-2 btn-success btn-sm" id={targetResend}>
					<span
						className="spinner-grow spinner-grow-sm mr-2"
						role="status"
						aria-hidden="true"
					/>
					REENVIAR
				</Button>
			);
		} else {
			buttonReenviar = (
				<Button className="btn ml-2 btn-success btn-sm" id={targetResend}>
					REENVIAR
				</Button>
			);
		}

		return (
			<Row className="text-center">
				<Col md={"12"} className="align-content-center">
					<Button className="btn btn-danger btn-sm" id={targetCancel}>
						CANCELAR
					</Button>
					{buttonReenviar}
				</Col>
				<ConfirmPopUp
					placement="top"
					target={targetCancel}
					text={"Deseja mesmo CANCELAR o convite de " + row.nome + "?"}
					confirm={async (e) => await this.invitePendingCancel(e, row.email)}
				/>
				<ConfirmPopUp
					placement="top"
					target={targetResend}
					text={"Deseja mesmo REENVIAR o convite de " + row.nome + "?"}
					confirm={async (e) => await this.invitePendingResend(e, row.email)}
				/>
			</Row>
		);
	};

	modalConvite = () => {
		let btnConvidar;
		if (this.state.isLoadingButtonConvidar) {
			btnConvidar = (
				<Button
					color="warning"
					disabled={this.state.editing}
					className={"p-l-5"}
				>
					<span
						className="spinner-grow spinner-grow-sm"
						role="status"
						aria-hidden="true"
					/>
					&nbsp;&nbsp;&nbsp;Aguarde...
				</Button>
			);
		} else {
			btnConvidar = (
				<Button
					color="warning"
					onClick={async (e) => await this.handlerBotaoEnviarConvite(e, true)}
					disabled={this.state.editing}
				>
					Convidar
				</Button>
			);
		}

		return (
			<div>
				<Modal
					isOpen={this.state.modal}
					toggle={this.toggleModal}
					backdrop={"static"}
					keyboard={false}
					className={this.props.className}
				>
					<ModalHeader toggle={this.toggleModal}>Convidar</ModalHeader>
					<ModalBody>
						<Row>
							<Col xs="12">
								<Card>
									<CardHeader>
										<strong>Dados do Convidado</strong>
									</CardHeader>
									<CardBody>
										<FormGroup>
											<Label htmlFor="usuario">Nome</Label>
											<Input
												type="text"
												id="usuario"
												value={this.state.usuario}
												placeholder="Nome do convidado"
												onChange={this.handleChange}
												disabled={this.state.editing}
											/>
										</FormGroup>
										<FormGroup>
											<Label htmlFor="email">E-mail</Label>
											<Input
												type="email"
												id="email"
												value={this.state.email}
												placeholder="E-mail que receberá o convite"
												onChange={this.handleChange}
												disabled={this.state.editing}
											/>
										</FormGroup>
										<FormGroup>
											<Label htmlFor="empresaSelect">
												Empresa que convidado terá acesso:
											</Label>
											<Input type="select" id="empresaSelect" disabled>
												<option key={this.state.id} value={this.state.id}>
													{this.state.company} ({this.state.cnpj})
												</option>
											</Input>
										</FormGroup>
										{this.state.selectedRow.owner ? (
											<FormGroup>
												<Row>
													<Col xs="2">
														<div>
															<Label>Ativo</Label>
														</div>
														<div>
															<AppSwitch
																id="active"
																className={"mx-1"}
																color={"primary"}
																checked={this.state.active}
																onChange={this.changeSwitch}
																label
																dataOn={"\u2713"}
																dataOff={"\u2715"}
															/>
														</div>
													</Col>
													{/* apresentar somente se o usuário for administrador  */}
													<Col xs="2">
														<div>
															<Label>Convidado</Label>
														</div>
														<div>
															<AppSwitch
																id="invited"
																className={"mx-1"}
																color={"primary"}
																checked={this.state.invited}
																onChange={this.changeSwitch}
																label
																dataOn={"\u2713"}
																dataOff={"\u2715"}
															/>
														</div>
													</Col>
													{/* apresentar somente se o usuário aceitou o convite */}
													<Col xs="2">
														<div>
															<Label>Aceito</Label>
														</div>
														<div>
															<AppSwitch
																id="accept"
																className={"mx-1"}
																color={"primary"}
																checked={this.state.accept}
																onChange={this.changeSwitch}
																label
																dataOn={"\u2713"}
																dataOff={"\u2715"}
															/>
														</div>
													</Col>
												</Row>
											</FormGroup>
										) : null}
									</CardBody>
								</Card>
							</Col>
						</Row>
					</ModalBody>
					<ModalFooter>
						{btnConvidar}
						<Button color="secondary" onClick={this.handleCancelModalButton}>
							Fechar
						</Button>
					</ModalFooter>
				</Modal>
			</div>
		);
	};

	renderTablePendentes = () => {
		if (this.state.usuariosPendentes.length === 0) return null;

		const selectRowProp = {
			mode: "checkbox",
			hideSelectColumn: true, // enable hide selection column.
			clickToSelect: true, // you should enable clickToSelect, otherwise, you can't select column.
			onSelect: this.onRowSelect,
		};
		const options = {
			sortName: "nome",
			sortOrder: "desc",
		};

		return (
			<Row>
				<Col>
					<Card className="card-accent-warning">
						<CardHeader>
							Convites pendentes para <strong>{this.state.company}</strong>
						</CardHeader>
						<CardBody>
							<BootstrapTable
								id="tableCompanyPending"
								version="4"
								data={this.state.usuariosPendentes}
								striped
								hover
								selectRow={selectRowProp}
								options={options}
							>
								<TableHeaderColumn
									id="id_column"
									dataField="id"
									isKey={true}
									hidden
									columnHeader="ID"
								/>
								<TableHeaderColumn
									dataField="nome"
									editable={false}
									width="25%"
								>
									Nome do Convidado
								</TableHeaderColumn>
								<TableHeaderColumn dataField="email" width="40%">
									E-mail
								</TableHeaderColumn>
								<TableHeaderColumn
									dataField="createdAt"
									dataFormat={this.datetimeToDate}
									width="20%"
								>
									Data do Convite
								</TableHeaderColumn>
								<TableHeaderColumn
									dataFormat={this.btnInviteCancel}
									width="15%"
								/>
							</BootstrapTable>
						</CardBody>
					</Card>
				</Col>
			</Row>
		);
	};

	renderTableConvidados = () => {
		let tableUser;

		const btnConvidar = (
			<Button
				onClick={this.handlerConvidarUsuario}
				className="btn btn-sm btn-success mr-1 float-right"
			>
				<i className="fa fa-at" /> Convidar
			</Button>
		);
		let btnVoltar = null;

		if (this.state.usuarios !== undefined) {
			if (this.state.usuarios.length > 0) {
				const selectRowProp = {
					mode: "checkbox",
					hideSelectColumn: true, // enable hide selection column.
					clickToSelect: true, // you should enable clickToSelect, otherwise, you can't select column.
					onSelect: this.onRowSelect,
				};
				const options = {
					sortName: "nome",
					sortOrder: "desc",
				};
				const activeFormatter = (cell, row) => {
					const status = row.active;

					let text;
					let color;
					if (status) {
						text = "ATIVO";
						color = "success";
					} else {
						text = "DESATIVADO";
						color = "danger";
					}
					return (
						<div className="text-center">
							<Badge color={color} pill>
								{text}
							</Badge>
						</div>
					);
				};
				const inviteFormatter = (cell, row) => {
					const status = row.owner;
					let text;
					let color;
					if (status) {
						text = "PROPRIETÁRIO";
						color = "dark";
					} else {
						text = "CONVIDADO";
						color = "secondary";
					}
					return (
						<div className="text-center">
							<Badge color={color} pill>
								{text}
							</Badge>
						</div>
					);
				};
				const acceptFormatter = (cell, row) => {
					const status = row.accept;
					let text;
					let color;
					if (status) {
						text = "CONVITE ACEITO";
						color = "primary";
					} else {
						text = "CONVITE PENDENTE";
						color = "warning";
					}
					return (
						<div className="text-center">
							<Badge color={color} pill>
								{text}
							</Badge>
						</div>
					);
				};

				tableUser = (
					<BootstrapTable
						id="tableCompany"
						version="4"
						data={this.state.usuarios}
						striped
						hover
						selectRow={selectRowProp}
						options={options}
					>
						<TableHeaderColumn
							id="owner"
							dataField="owner"
							hidden
							columnHeader="Owner"
						/>
						<TableHeaderColumn
							id="id_column"
							dataField="user_id"
							isKey={true}
							hidden
							columnHeader="ID"
						/>
						<TableHeaderColumn dataField="nome" editable={false} width="24%">
							Nome do Convidado
						</TableHeaderColumn>
						<TableHeaderColumn dataField="email" width="28%">
							E-mail
						</TableHeaderColumn>
						<TableHeaderColumn
							dataField="active"
							dataFormat={activeFormatter}
							width="12%"
						>
							Situação
						</TableHeaderColumn>
						<TableHeaderColumn
							dataField="invited"
							dataFormat={inviteFormatter}
							width="12%"
						>
							Convidado
						</TableHeaderColumn>
						<TableHeaderColumn
							dataField="accept"
							dataFormat={acceptFormatter}
							width="12%"
						>
							Status
						</TableHeaderColumn>
						<TableHeaderColumn dataFormat={this.btnDesativeUser} width="12%" />
					</BootstrapTable>
				);
			} else {
				tableUser = (
					<p>
						Você não possui nenhum convidado ativo para esta empresa. Vamos
						convidar alguém agora? Basta clicar no botão Convidar :)
					</p>
				);
				btnVoltar = (
					<CardFooter>
						<Button
							onClick={this.goBack}
							className="btn btn-sm btn-info mr-1 float-right"
						>
							<i className="fa fa-arrow-left" /> Voltar
						</Button>
					</CardFooter>
				);
			}
		} else {
			tableUser = (
				<p>
					Você não possui nenhum convidado ativo para esta empresa. Vamos
					convidar alguém agora? Basta clicar no botão Convidar :)
				</p>
			);
			btnVoltar = (
				<CardFooter>
					<Button
						onClick={this.goBack}
						className="btn btn-sm btn-info mr-1 float-right"
					>
						<i className="fa fa-arrow-left" /> Voltar
					</Button>
				</CardFooter>
			);
		}

		return (
			<Row>
				<Col>
					<Card className="card-accent-warning">
						<CardHeader>
							Convidados que possuem acesso para{" "}
							<strong>{this.state.company}</strong>
							{btnConvidar}
						</CardHeader>
						<CardBody>{tableUser}</CardBody>
						{btnVoltar}
					</Card>
				</Col>
			</Row>
		);
	};

	loaded = () => {
		return (
			<div className="animated fadeIn">
				<div>
					{this.renderTableConvidados()}
					{this.renderTablePendentes()}
				</div>
				{this.modalConvite()}
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

export default Convidados;
