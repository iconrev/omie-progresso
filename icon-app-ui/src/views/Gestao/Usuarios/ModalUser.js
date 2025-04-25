import { useState } from "react";
import { toast } from "react-toastify";
import {
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Form,
	FormGroup,
	Col,
	Input,
	ListGroup,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	ListGroupItem,
	Row,
} from "reactstrap";
import ButtonLoading from "../../../components/ButtonLoading";
import {
	createNewUserInCompany,
	updateUserInCompany,
} from "../../../service/services";
import { isEmailValid } from "../../Utils/Generic";
import CompanyService from "../../../service/CompanyService";

const ModalUser = (props) => {
	const [states, setStates] = useState(props.user);
	const [isLoading, setIsLoading] = useState(false);
	const userIsNew = !!(props.user.name === "");

	const hasError = () => {
		let errors = [];

		if (states.name.length < 5) {
			errors.push("Nome do usuário está inválido");
		}

		if (!isEmailValid(states.email)) {
			errors.push("E-mail do usuário está inválido");
		}

		if (states.job.length < 5) {
			errors.push("Nome do Cargo / Função está inválido");
		}

		if (states.role === "0") {
			errors.push("Deve-se definir o perfil do usuário");
		}

		errors.map((error) => toast.error(error));

		return errors.length > 0;
	};

	const handleClose = () => {
		if (userIsNew) return props.toggle();
		// if (hasError()) return;
		props.toggle();
	};

	const submit = async () => {
		if (hasError()) return;

		setIsLoading(true);
		const companyId = CompanyService.getCurrentCompanyId();

		const response = userIsNew
			? await createNewUserInCompany(companyId, states)
			: await updateUserInCompany(companyId, states);
		const { status, message } = response;

		if (status === "success") {
			toast.success(message);
			props.updateTable();
			props.toggle();
		} else {
			toast.warn(message);
		}
		setIsLoading(false);
	};

	const handleChange = (event) => {
		setStates({
			...states,
			[event.target.id]: event.target.value,
		});
	};

	const roles = props.roles;
	const titleModal = userIsNew ? "Cadastrar Usuário" : "Editar Usuário";
	const titleButton = userIsNew ? "Cadastrar" : "Atualizar";

	let permissions = [];
	if (roles.length > 0) {
		for (let i = 0; i < roles.length; i++) {
			const role = roles[i];
			if (role.role === states.role) {
				role.permissions.map((permission) => permissions.push(permission));
			}
		}
	}

	return (
		<Modal
			isOpen={props.isOpen}
			toggle={props.toggle}
			className={props.className}
			backdrop={"static"}
			keyboard={false}
		>
			<ModalHeader toggle={props.toggle}>{titleModal}</ModalHeader>
			<ModalBody>
				<Form>
					<FormGroup>
						<InputGroup>
							<InputGroupAddon addonType="prepend" style={{ minWidth: "45px" }}>
								<InputGroupText className={"w-100"}>
									<i className={"fa fa-user"} />
								</InputGroupText>
							</InputGroupAddon>
							<Input
								placeholder="Nome do Usuário"
								id={"name"}
								value={states.name}
								onChange={handleChange}
								disabled={!userIsNew}
							/>
						</InputGroup>
					</FormGroup>
					<FormGroup>
						<InputGroup>
							<InputGroupAddon addonType="prepend" style={{ minWidth: "45px" }}>
								<InputGroupText className={"w-100"}>
									<i className={"fa fa-envelope-o"} />
								</InputGroupText>
							</InputGroupAddon>
							<Input
								placeholder="E-mail"
								id={"email"}
								value={states.email}
								onChange={handleChange}
								disabled={!userIsNew}
							/>
						</InputGroup>
					</FormGroup>
					<FormGroup>
						<InputGroup>
							<InputGroupAddon addonType="prepend" style={{ minWidth: "45px" }}>
								<InputGroupText className={"w-100"}>
									<i className={"fa fa-id-card-o"} />
								</InputGroupText>
							</InputGroupAddon>
							<Input
								placeholder="Cargo / Função"
								id={"job"}
								value={states.job}
								onChange={handleChange}
							/>
						</InputGroup>
					</FormGroup>
					<FormGroup>
						<InputGroup>
							<InputGroupAddon addonType="prepend" style={{ minWidth: "45px" }}>
								<InputGroupText className={"w-100"}>
									<i className={"fa fa-list"} />
								</InputGroupText>
							</InputGroupAddon>
							<Input
								type="select"
								id={"role"}
								value={states.role}
								onChange={handleChange}
							>
								<option value={"0"}>Selecione o perfil do usuário</option>
								{roles.map((item, index) => {
									return (
										<option value={item.role} key={index}>
											{item.label}
										</option>
									);
								})}
							</Input>
						</InputGroup>
					</FormGroup>
					<ListGroup>
						{permissions.map((permission, index) => {
							return (
								<ListGroupItem key={index}>
									<Row className={"align-items-center"}>
										<Col xs={"auto"} className={"m-0 p-0 pl-3"}>
											<i className={`fa ${permission.class}`} />
										</Col>
										<Col>{permission.description}</Col>
									</Row>
								</ListGroupItem>
							);
						})}
					</ListGroup>
				</Form>
			</ModalBody>
			<ModalFooter>
				<ButtonLoading
					color="success"
					onClick={submit}
					isLoading={isLoading}
					textLoading={"Salvando..."}
				>
					{titleButton}
				</ButtonLoading>
				<Button color="dark" onClick={handleClose} outline>
					Cancelar
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default ModalUser;
