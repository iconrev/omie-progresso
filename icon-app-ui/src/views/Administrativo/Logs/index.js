import { useEffect, useState } from "react";
// import ReactTimeAgo from "react-time-ago/commonjs/ReactTimeAgo";
import { toast } from "react-toastify";
import {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Button,
	Row,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	Table,
	Alert,
	Badge,
} from "reactstrap";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Administrativo from "../../../service/Administrativo";
import userService from "../../../service/UserService";
import { formatDate } from "../../Utils/format-date";

export default function Logs(props) {
	const [isLoading, setLoading] = useState(true);
	const [isFetching, setFetching] = useState(true);
	const [filter, setFilter] = useState({
		dateStart: formatDate(new Date(), "YYYY-MM-DD"),
		dateFinish: formatDate(new Date(), "YYYY-MM-DD"),
		user: "ALL",
		company: "ALL",
		action: "ALL",
	});
	const [rows, setRows] = useState([]);
	const [users, setUsers] = useState([]);
	const [companies, setCompanies] = useState([]);
	const [actions, setActions] = useState([]);

	const fetchData = async (filterData) => {
		if (!isFetching) setFetching(true);

		const response = await Administrativo.getLogs(filterData);

		if (response.status === "success") {
			setRows(response.items);
			setUsers(response.users);
			setCompanies(response.companies);
			setActions(response.actions);
		}
		setFetching(false);
		return response;
	};

	useEffect(() => {
		const dataUser = userService.getUser();
		if (!dataUser.isAdmin) {
			toast.error("Acesso negado!");
			return props.history.push("/");
		}
	}, []);

	useEffect(() => {
		(async () => {
			await fetchData(filter);
			setLoading(false);
		})();
	}, [filter]);

	if (isLoading) return <LoadingSpinner isLoading={isLoading} />;

	const goBack = (event) => {
		event.preventDefault();
		return props.history.push("/administrativo");
	};

	const handleChangeFilter = (event) => {
		setFilter({
			...filter,
			[event.target.id]: event.target.value,
		});
	};

	const handleChangeFilterSelect = (event) => {
		setFilter({
			...filter,
			[event.target.id]: event.target.value,
		});
	};

	const onClickRow = (e) => {
		const hiddenElement = e.currentTarget.nextSibling.firstChild.firstChild;
		hiddenElement.className.indexOf("collapse show") > -1
			? hiddenElement.classList.remove("show")
			: hiddenElement.classList.add("show");
		console.info("aqui", hiddenElement);
	};

	return (
		<Card>
			<CardHeader>
				<Row>
					<Col xs="12" md="6" lg="6">
						<strong>Painel de Logs</strong>
					</Col>
				</Row>
			</CardHeader>
			<CardBody>
				<Form>
					<Row>
						<Col xs={"auto"}>
							<FormGroup>
								<Label for={"dateStart"}>Período Início</Label>
								<Input
									id={"dateStart"}
									name={"dateStart"}
									type={"date"}
									value={filter.dateStart}
									onChange={handleChangeFilter}
								/>
							</FormGroup>
						</Col>
						<Col xs={"auto"}>
							<FormGroup>
								<Label for={"dateFinish"}>Período Término</Label>
								<Input
									id={"dateFinish"}
									name={"dateFinish"}
									type={"date"}
									value={filter.dateFinish}
									onChange={handleChangeFilter}
								/>
							</FormGroup>
						</Col>
						<Col xs={"3"}>
							<FormGroup>
								<Label for={"user"}>Usuário</Label>
								<Input
									id={"user"}
									name={"user"}
									type={"select"}
									value={filter.user}
									onChange={handleChangeFilterSelect}
								>
									<option value={"ALL"}>Todos os usuários</option>
									{users.map((user) => {
										return (
											<option value={user.userId} key={user.userId}>
												{user.user} ({user.userId})
											</option>
										);
									})}
								</Input>
							</FormGroup>
						</Col>
						<Col xs={"3"}>
							<FormGroup>
								<Label for={`company`}>Empresa</Label>
								<Input
									id={"company"}
									name={"company"}
									type={"select"}
									value={filter.company}
									onChange={handleChangeFilterSelect}
								>
									<option value={"ALL"}>Todos as empresas</option>
									{companies.map((company, index) => {
										return (
											<option
												value={company.companyId}
												key={company.companyId + "_" + index}
											>
												{company.company} ({company.companyId})
											</option>
										);
									})}
								</Input>
							</FormGroup>
						</Col>
						<Col xs>
							<FormGroup>
								<Label for={"action"}>Action</Label>
								<Input
									id={"action"}
									name={"action"}
									type={"select"}
									value={filter.action}
									onChange={handleChangeFilterSelect}
								>
									<option value={"ALL"}>Todos os actions</option>
									{actions.map((action, index) => {
										return (
											<option value={action} key={action + "_" + index}>
												{action}
											</option>
										);
									})}
								</Input>
							</FormGroup>
						</Col>
					</Row>
				</Form>
				<Row>
					<Col>
						{rows.length > 0 ? (
							<Table striped>
								<thead>
									<tr>
										<th>Horário</th>
										<th>Usuário</th>
										<th>Empresa</th>
										<th>Action</th>
										<th>Status</th>
									</tr>
								</thead>
								<tbody>
									{rows.map((row) => {
										console.info(
											formatDate(new Date(row.createdAt)),
											formatDate(new Date(row.createdAt), "hh:mm:ss")
										);

										return (
											<>
												<tr
													key={row.logId}
													style={{ cursor: "pointer" }}
													data-toggle="collapse"
													data-target={`#collapse${row.logId}`}
													className={"accordion-toggle"}
													onClick={onClickRow}
												>
													<td>
														{formatDate(new Date(row.createdAt))} às{" "}
														{formatDate(new Date(row.createdAt), "hh:mm:ss")}
													</td>
													<td>{row.user}</td>
													<td>{row.company}</td>
													<td>{row.action}</td>
													<td>
														{row.status === "success" && (
															<Badge color={"success"}>{row.status}</Badge>
														)}
														{row.status === "unauthorized" && (
															<Badge color={"warning"}>{row.status}</Badge>
														)}
														{row.status !== "success" &&
															row.status !== "unauthorized" && (
																<Badge color={"danger"}>{row.status}</Badge>
															)}
													</td>
												</tr>
												<tr>
													<td colSpan="12" style={{ padding: 0 }}>
														<div
															className="accordian-body collapse"
															id={`collapse${row.logId}`}
															style={{ padding: "8px" }}
														>
															<p className="text-justify" style={{ margin: 0 }}>
																{row.log}
															</p>
														</div>
													</td>
												</tr>
											</>
										);
									})}
								</tbody>
							</Table>
						) : (
							<Alert color={"warning"}>
								Nenhum log localizado com os filtros acima.
							</Alert>
						)}
					</Col>
				</Row>
			</CardBody>
			<CardFooter>
				<Button color={"primary"} className={"float-right"} onClick={goBack}>
					Voltar
				</Button>
			</CardFooter>
		</Card>
	);
}
