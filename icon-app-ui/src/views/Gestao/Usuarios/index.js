import React, { useState, useEffect, useCallback } from "react";
import {
	Alert,
	Row,
	Col,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Button,
	Table,
	Badge,
} from "reactstrap";
import LoadingSpinner from "../../../components/LoadingSpinner";
import LoadingFullScreen from "../../../components/LoadingFullScreen";
import {
	getUsersCompany,
	getRolesCompany,
	cancelInvited,
	resendInvited,
	updateUserInCompany,
	removeUserInCompany,
} from "../../../service/services";
import ModalUser from "./ModalUser";
import ReactTimeAgo from "react-time-ago";
import { toast } from "react-toastify";
import BadgeCompanyRole from "../../../components/BadgeCompanyRole";
import CompanyService from "../../../service/CompanyService";
import userService from "../../../service/UserService";
import { Redirect } from "react-router-dom";

const nullUser = {
	name: "",
	email: "",
	job: "",
	role: "0",
};

const AlertInfo = React.memo(function AlertInfo() {
	return (
		<Row>
			<Col>
				<Alert color={"info"}>
					<h4>
						<i className="fa fa-info-circle mr-2" />
						Que tal convidar sua equipe para participar?
					</h4>
					<p className={"m-0 p-0"}>
						Preencha o e-mail da pessoa que você deseja convidar abaixo, escolha
						o perfil e clique em <i>Cadastrar</i>.<br />
						Essa pessoa receberá um e-mail com as instruções necessárias para se
						cadastrar e começar a utilizar o Simbiose :-)
					</p>
				</Alert>
			</Col>
		</Row>
	);
});

const AlertAssociado = React.memo(function AlertAssociado() {
	const company = CompanyService.getDataCompany();
	const roles = company.roles;
	if (roles.indexOf("associado") === -1) return null;

	if (company.isAssociada && company.isOwner) return null;

	return (
		<Row>
			<Col>
				<Alert color={"success"}>
					<p className={"m-0 p-0"}>
						Você é o <strong>Associado</strong> responsável pela empresa{" "}
						<strong>{company.name}</strong>
					</p>
				</Alert>
			</Col>
		</Row>
	);
});

const AlertCompanyAdmin = React.memo(function AlertCompanyAdmin() {
	const company = CompanyService.getDataCompany();
	const roles = company.roles;
	if (roles.indexOf("associado") === -1) return null;

	if (!company.isAssociada || !company.isOwner) return null;

	return (
		<Row>
			<Col>
				<Alert color={"success"}>
					<p className={"m-0 p-0"}>
						Você é o usuário <strong>Responsável</strong> pela empresa{" "}
						<strong>{company.name}</strong>
					</p>
				</Alert>
			</Col>
		</Row>
	);
});

const BadgeStatusUser = (props) => {
	const { status } = props;

	let color, text;
	if (status === 1) {
		color = "success";
		text = "ativo";
	} else if (status === 0) {
		color = "secondary";
		text = "inativo";
	} else {
		color = "warning";
		text = "convite pendente";
	}

	return (
		<Badge color={color} className={"text-uppercase"}>
			{text}
		</Badge>
	);
};

const RowTableUser = (props) => {
	const [isLoading, setLoading] = useState(false);
	const company = CompanyService.getDataCompany();

	const { user, user_type, setUserEdit, updateTable } = props;
	const itsMe = userService.email === user.email;

	let activity = null;
	let btnEdit = null;
	let btnDelete = null;
	let btnReenviar = null;

	const handleRemoveUser = async () => {
		setLoading(true);
		const payload = {
			email: user.email,
		};
		const response = await removeUserInCompany(company.id, payload);
		const { message, status } = response;
		if (status === "success") {
			toast.success(message);
			updateTable();
		} else {
			toast.error(message);
		}
		setLoading(false);
	};

	if (user_type === "user") {
		btnEdit = (
			<Button
				color="primary"
				size="sm"
				title={`Editar ${user.nome}`}
				onClick={() => setUserEdit(user, user_type)}
			>
				<i className="fa fa-edit" />
			</Button>
		);
		btnDelete = itsMe ? null : (
			<Button
				color="danger"
				size="sm"
				title={`Revogar acesso de ${user.nome}`}
				onClick={handleRemoveUser}
			>
				<i className="fa fa-ban" />
			</Button>
		);
		activity =
			user.lastAccess === null || !user.lastAccess ? (
				<>
					<div className={"small text-muted"}>Último acesso</div>
					<strong>-</strong>
				</>
			) : (
				<>
					<div className={"small text-muted"}>Último acesso</div>
					<strong>
						<ReactTimeAgo
							date={Date.parse(
								user.lastAccess.substring(0, user.lastAccess.length - 1)
							)}
						/>
					</strong>
				</>
			);
	} else if (user_type === "responsible") {
		btnEdit = (
			<Button
				color="primary"
				size="sm"
				title={`Editar ${user.nome}`}
				onClick={() => setUserEdit(user, user_type)}
			>
				<i className="fa fa-edit" />
			</Button>
		);
		btnDelete = itsMe ? null : (
			<Button
				color="danger"
				size="sm"
				title={`Remover ${user.nome}`}
				onClick={handleRemoveUser}
			>
				<i className="fa fa-ban" />
			</Button>
		);
	} else if (user_type === "invited") {
		const handleCancelarConvite = async (event) => {
			setLoading(true);
			event.preventDefault();
			const payload = {
				empresa: company.id,
				email: user.email,
			};
			await cancelInvited(payload)
				.then((response) => {
					const { message, status } = response.data;
					if (status === "success") {
						toast.success(message);
						updateTable();
					} else {
						toast.error(message);
					}
				})
				.catch((error) => {
					console.error(error);
					toast.error("Não foi possível cancelar o convite");
				});
			setLoading(false);
		};

		const handleResendInvited = async (event) => {
			setLoading(true);
			event.preventDefault();
			const payload = {
				empresa: company.id,
				email: user.email,
			};
			await resendInvited(payload)
				.then((response) => {
					const { message, status } = response.data;
					if (status === "success") {
						toast.success(message);
					} else {
						toast.error(message);
					}
				})
				.catch((error) => {
					console.error(error);
					toast.error("Não foi possível cancelar o convite");
				});
			setLoading(false);
		};

		btnDelete = (
			<Button
				color="danger"
				size="sm"
				title={`Revogar convite de ${user.nome}`}
				onClick={handleCancelarConvite}
			>
				<i className="fa fa-ban" />
			</Button>
		);
		btnReenviar = (
			<Button
				color="success"
				size="sm"
				title={`Reenviar convite para ${user.email}`}
				onClick={handleResendInvited}
			>
				<i className="fa fa-paper-plane" />
			</Button>
		);

		activity = (
			<>
				<div className={"small text-muted"}>Convite enviado</div>
				<strong>
					<ReactTimeAgo date={Date.parse(user.createdAt)} />
				</strong>
			</>
		);
	}

	if (btnEdit) {
		btnEdit = (
			<Col xs={"auto"} className={"m-0 p-1"}>
				{btnEdit}
			</Col>
		);
	}

	const handleUpdateStatus = async (event) => {
		event.preventDefault();
		setLoading(true);
		const payload = {
			email: user.email,
			status: user.active === 1 ? 0 : 1,
		};

		const response = await updateUserInCompany(company.id, payload);
		const { message, status } = response;
		if (status === "success") {
			toast.success(message);
			await updateTable();
		} else {
			toast.error(message);
		}
		setLoading(false);
	};

	return (
		<tr>
			<td>
				<div>{user.nome}</div>
				<div className={"small text-muted"}>{user.email}</div>
			</td>
			<td className={"text-center"}>
				<BadgeCompanyRole role={user.role_company} />
			</td>
			<td className={"text-center"}>
				<div className={"small text-muted"}>{user.cargo}</div>
			</td>
			<td className={"text-center"}>
				<BadgeStatusUser status={user.active} />
			</td>
			<td className={"text-center"}>{activity}</td>
			<td>
				<Row className={"justify-content-center"}>
					{btnEdit}
					{user.active === 1 && !itsMe ? (
						<Col xs={"auto"} className={"m-0 p-1"}>
							<Button
								color="secondary"
								size="sm"
								title={`Desativar ${user.nome}`}
								onClick={handleUpdateStatus}
							>
								<i className="fa fa-lock" />
							</Button>
						</Col>
					) : null}
					{user.active === 0 ? (
						<Col xs={"auto"} className={"m-0 p-1"}>
							<Button
								color="success"
								size="sm"
								title={`Ativar ${user.nome}`}
								onClick={handleUpdateStatus}
							>
								<i className="fa fa-unlock" />
							</Button>
						</Col>
					) : null}
					{user_type === "invited" ? (
						<Col xs={"auto"} className={"m-0 p-1"}>
							{btnReenviar}
						</Col>
					) : null}
					<Col xs={"auto"} className={"m-0 p-1"}>
						{btnDelete}
					</Col>
					{isLoading ? <LoadingFullScreen /> : null}
				</Row>
			</td>
		</tr>
	);
};

const TableUsers = React.memo(function TableUsers(props) {
	return (
		<Table hover className={"table-outline mb-0 d-none d-sm-table"}>
			<thead className={"thead-light"}>
				<tr>
					<th width={"30%"}>Usuário</th>
					<th width={"14%"} className={"text-center"}>
						Perfil
					</th>
					<th width={"14%"} className={"text-center"}>
						Cargo
					</th>
					<th width={"14%"} className={"text-center"}>
						Situação
					</th>
					<th width={"14%"} className={"text-center"}>
						Atividade
					</th>
					<th width={"14%"} className={"text-center"}>
						Funções
					</th>
				</tr>
			</thead>
			<tbody>
				{props.users.map((user, index) => (
					<RowTableUser
						user={user}
						user_type={"user"}
						key={index}
						setUserEdit={props.setUserEdit}
						updateTable={props.updateTable}
					/>
				))}
				{props.responsibles.map((user, index) => (
					<RowTableUser
						user={user}
						user_type={"responsible"}
						key={index}
						setUserEdit={props.setUserEdit}
						updateTable={props.updateTable}
					/>
				))}
				{props.inviteds.map((user, index) => (
					<RowTableUser
						user={user}
						user_type={"invited"}
						key={index}
						setUserEdit={props.setUserEdit}
						updateTable={props.updateTable}
					/>
				))}
			</tbody>
		</Table>
	);
});

const ScreenUsersCompany = (props) => {
	const [isLoading, setLoading] = useState(true);
	const [modalUser, setModalUser] = useState(false);
	const [userEdit, setUserEdit] = useState(nullUser);
	const [users, setUsers] = useState([]);
	const [inviteds, setInviteds] = useState([]);
	const [responsibles, setResponsibles] = useState([]);
	const [roles, setRoles] = useState([]);
	const company = CompanyService.getDataCompany();

	const find_users = useCallback(async (removeLoading = true) => {
		if (!isLoading) setLoading(true);
		const response = await getUsersCompany(company.id);

		const { status, accepted, invited, responsible } = response.data;

		if (status !== "success") {
			console.error(response.data);
			toast.error("Acesso negado");
			return props.history.goBack();
		}

		setUsers(accepted);
		setInviteds(invited);
		setResponsibles(responsible);

		if (removeLoading) setLoading(false);
	});

	const toggle = useCallback(() => setModalUser(!modalUser));

	const handleEditUser = useCallback((user) => {
		setUserEdit({
			name: user.nome,
			email: user.email,
			job: user.cargo || "",
			role: user.role_company || "0",
		});
		toggle();
	}, []);

	const handleNewUser = useCallback(() => {
		setUserEdit(nullUser);
		toggle();
	});

	useEffect(() => {
		(async () => {
			const promiseUsers = find_users(false);
			const rolesCompany = await getRolesCompany(company.id);
			const { status, roles } = rolesCompany.data;
			if (status === "success") {
				setRoles(roles);
			} else {
				toast.error("Não foi possível carregar as descrições de perfil");
			}
			await promiseUsers;
			setLoading(false);
		})();

		// eslint-disable-next-line no-empty-function
		return () => {};
	}, []);

	if (!company) return <Redirect to="/" />;

	if (isLoading) return <LoadingSpinner isLoading={isLoading} />;

	const goBack = () => {
		props.history.goBack();
	};

	return (
		<>
			<AlertInfo />
			<Card>
				<CardHeader>
					<Row>
						<Col xs="12" md="6" lg="6">
							<strong>Gestão de Acessos</strong>
						</Col>
						<Col>
							<Button
								color={"primary"}
								className={"float-right"}
								onClick={handleNewUser}
							>
								Adicionar Novo Usuário
							</Button>
						</Col>
					</Row>
				</CardHeader>
				<CardBody>
					<AlertAssociado />
					<AlertCompanyAdmin />
					<TableUsers
						users={users}
						inviteds={inviteds}
						responsibles={responsibles}
						setUserEdit={handleEditUser}
						updateTable={find_users}
					/>
				</CardBody>
				<CardFooter>
					<Button color={"primary"} className={"float-right"} onClick={goBack}>
						Voltar
					</Button>
				</CardFooter>
			</Card>

			{!modalUser ? null : (
				<ModalUser
					isOpen={modalUser}
					toggle={toggle}
					className={""}
					user={userEdit}
					roles={roles}
					updateTable={find_users}
				/>
			)}
		</>
	);
};

export default ScreenUsersCompany;
