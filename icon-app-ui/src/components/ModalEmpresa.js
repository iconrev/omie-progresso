import { Component } from "react";
import {
	Button,
	Alert,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Form,
	FormGroup,
	Input,
	Label,
	Modal,
	ModalBody,
} from "reactstrap";
import InputMask from "react-input-mask";
import { AppSwitch } from "@coreui/react";
import { toast } from "react-toastify";
import ButtonLoading from "./ButtonLoading";
import userService from "../service/UserService";
import { createNewCompany, updateCompany } from "../service/services";
import { isCnpjValid } from "../views/Utils/cnpj-utils";

class ModalEmpresa extends Component {
	constructor(props) {
		super(props);
		this.user = userService.getUser();

		let selectCompany = "";

		if (this.user.profile === "user_default") {
			const myCompanies = this.props.myCompanies;
			if (myCompanies && myCompanies.length > 0) {
				if (this.user.companiesAssociate.length > 0) {
					selectCompany = this.user.companiesAssociate[0].companyId;
				}
			}
		}

		this.state = {
			isLoadingEdit: false,
			empresa: this.props.empresa,
			cnpj: this.props.cnpj,
			active: this.props.active,
			selectCompany: selectCompany,
			editing: this.props.editing,
			myCompanies: this.props.myCompanies,
			companiesAssociates: this.user.companiesAssociate,
			companyRole: "",
		};
	}

	handleChange = async (event) => {
		this.setState({
			[event.target.id]: event.target.value,
		});
	};

	handleChangeCompany = async (event) => {
		let profileDefined = this.state.companiesAssociates.filter(
			(company) => company.companyId === event.target.value
		);
		profileDefined = profileDefined.length > 0 ? profileDefined[0] : null;

		if (profileDefined) {
			this.setState({
				[event.target.id]: event.target.value,
				companyRole: profileDefined.role[0],
			});
		} else {
			this.setState({
				[event.target.id]: event.target.value,
				companyRole: "",
			});
		}
	};

	changeSwitch = (e) => {
		this.setState({
			active: e.target.checked,
		});
	};

	validateForm = () => {
		if (this.state.empresa) {
			return this.state.empresa.length > 0 && this.state.cnpj.length > 0;
		}
	};

	handleEmpresaSaveButton = async (e) => {
		e.preventDefault();

		if (!isCnpjValid(this.state.cnpj)) {
			toast.error("O CNPJ informado é inválido");
			return;
		}

		this.setState({
			isLoadingEdit: true,
		});

		let result;

		if (this.state.editing) {
			const payload = {
				nome: this.state.empresa.trim(),
				active: this.state.active,
			};
			result = await updateCompany(this.props.companyId, payload);
		} else {
			const payload = {
				nome: this.state.empresa.trim(),
				cnpj: this.state.cnpj.trim(),
				active: this.state.active,
				companyAssociate: this.state.selectCompany,
			};
			result = await createNewCompany(payload);
		}

		const { status, message } = result;

		if (status === "success") {
			toast.success(message);
			if (this.props.refresh) {
				await this.props.refresh();
				await this.props.toggle();
			}
		} else {
			toast.error(message);
			this.setState({
				isLoadingEdit: false,
			});
		}
	};

	renderSelectAssociado = () => {
		if (this.state.companiesAssociates.length === 0) return null;

		const alertPessoal = (
			<Alert color={"success"} className={"mt-3"}>
				<p>
					<strong>Minha Empresa</strong>
				</p>
				<p>Apenas você e seus convidados terão acesso a empresa.</p>
			</Alert>
		);

		let profileDefined = this.state.companiesAssociates.filter(
			(company) => company.companyId === this.state.selectCompany
		);
		if (profileDefined.length > 0) profileDefined = profileDefined[0];

		const alertAssociado = (
			<Alert color={"info"} className={"mt-3"}>
				<p>
					<strong>ASSOCIADO NÍVEL 2</strong>
				</p>
				<p>
					E empresa será cadastrada em nome de{" "}
					<strong>{profileDefined.companyName}</strong> e você terá acesso
					enquanto o associado responsável o manter.
				</p>
			</Alert>
		);

		return (
			<FormGroup>
				<Label for="selectCompany">Essa empresa será cadastrada para:</Label>
				<Input
					type="select"
					id="selectCompany"
					value={this.state.selectCompany}
					onChange={this.handleChangeCompany}
				>
					{this.state.myCompanies.length === 0 ||
					this.user.profile !== "user_default" ? (
						<option value={""}>Meu usuário</option>
					) : null}

					{this.state.companiesAssociates.map((company, index) => {
						return (
							<option value={company.companyId} key={index}>
								{company.companyName}
							</option>
						);
					})}
				</Input>
				{this.state.selectCompany === "" ? alertPessoal : alertAssociado}
			</FormGroup>
		);
	};

	render() {
		const isOpen = this.props.isOpen !== undefined ? this.props.isOpen : true;

		return (
			<div>
				<Modal
					isOpen={isOpen}
					toggle={this.props.toggle}
					backdrop={"static"}
					keyboard={false}
				>
					<ModalBody className={"m-0 p-0"}>
						<Card className={"m-0 p-0"}>
							<CardHeader>
								<strong>Dados da Empresa</strong>
							</CardHeader>
							<CardBody>
								<Form>
									<FormGroup>
										<Label htmlFor="company">Empresa</Label>
										<Input
											type="text"
											id="empresa"
											value={this.state.empresa}
											placeholder="Entre com o nome da Empresa"
											onChange={this.handleChange}
										/>
									</FormGroup>
									<FormGroup>
										<Label htmlFor="cnpj">CNPJ</Label>
										<InputMask
											className="form-control"
											id="cnpj"
											mask="99.999.999/9999-99"
											onChange={this.handleChange}
											placeholder="Entre com o CNPJ da Empresa"
											value={this.state.cnpj}
											disabled={this.state.editing}
										/>
									</FormGroup>
									{this.user.profile !== "user_default" && (
										<FormGroup>
											<div>
												<Label>Ativa</Label>
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
										</FormGroup>
									)}
									{this.renderSelectAssociado()}
								</Form>
							</CardBody>
							<CardFooter>
								<Button
									color="secondary"
									onClick={this.props.toggle}
									className={"float-right"}
								>
									Fechar
								</Button>
								<ButtonLoading
									color="primary"
									className="px-4 float-right mr-2"
									onClick={this.handleEmpresaSaveButton}
									disabled={!this.validateForm()}
									isLoading={this.state.isLoadingEdit}
								>
									Salvar
								</ButtonLoading>
							</CardFooter>
						</Card>
					</ModalBody>
				</Modal>
			</div>
		);
	}
}

export default ModalEmpresa;
