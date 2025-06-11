/* eslint-disable max-len */
import { Component } from "react";
import LoadingSpinner from "../../../../../components/LoadingSpinner";
import { toast } from "react-toastify";
import {
	Badge,
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Col,
	Row,
	Modal,
	ModalBody,
	CardTitle,
	Input,
	FormGroup,
	Label,
	UncontrolledTooltip,
	CardSubtitle,
} from "reactstrap";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import ReactTimeAgo from "react-time-ago";
import Select from "react-select";
import DatePicker, { registerLocale } from "react-datepicker";

import Diretrizes from "../../../../../service/Diretrizes";
import CompanyService from "../../../../../service/CompanyService";
import "../../../../../assets/Gestao/Diretrizes/Execucao/Estrategias/planoacaostyle.scss";
import "../../../../../assets/Gestao/Diretrizes/Execucao/Eficiencia/eficienciastyle.scss";
import "../../../../../assets/Gestao/Diretrizes/Execucao/estrategiasanosstyle.scss";

import "react-datepicker/dist/react-datepicker.css";
import pt from "date-fns/locale/pt";

import VerticalCarousel from "./VerticalCarousel";
import { isDateValid } from "../../../../Utils/Generic";

registerLocale("pt-BR", pt);

class PlanoAcao extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();
		if (!this.company) return this.props.history.push("/");

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			estrategiaId: "",
			estrategiaName: "",
			estrategiaPerspectiva: "",
			estrategiaCategoria: "",
			lists: {
				aguardando: {
					title: "A fazer",
					actions: [],
				},
				executando: {
					title: "Em execução",
					actions: [],
				},
				realizado: {
					title: "Realizado",
					actions: [],
				},
			},
			responsible: [],
			listOfResponsible: [],
			expiration_date: null,
			showModalTask: false,
			modalTaskId: null,
			modalTaskTitle: "",
			modalTaskDescription: "",
			modalTaskList: "aguardando",
			modalTaskComments: [],
			modalTaskCommentText: "",
			modalTaskResponsible: [],
			modalTaskExpirationDate: null,
			slides: [],
		};
	}

	async componentDidMount() {
		if (this.company.isPremium || this.company.isDemo) {
			await this.loadData();
			this.setState({
				isLoading: false,
			});
		} else {
			console.warn("Acesso negado");
			return this.redirect("diretrizes/estrategias");
		}
	}

	loadData = async () => {
		const estrategiaId = this.props.match.params.estrategiaId;
		const perspectiva = this.props.match.params.perspectiva;
		if (!estrategiaId) {
			return this.props.history.push(
				`/hub/${this.state.companyId}/gestao/categoria/diretrizes/estrategias`
			);
		}

		const tasksPromise = Diretrizes.getTasksFromStrategyId(
			estrategiaId,
			perspectiva
		);
		const responsaveisTasks = Diretrizes.getResponsaveis();

		await tasksPromise
			.then(async (resultTarefas) => {
				const { status, tarefas, estrategia } = resultTarefas;

				if (status === "success" && estrategia !== null) {
					const lists = this.state.lists;
					for (const tarefa of tarefas) {
						lists[tarefa.stage]["actions"].push(tarefa);
					}

					await this.setState({
						estrategiaId: estrategiaId,
						estrategiaName: estrategia.descricao,
						estrategiaPerspectiva: estrategia.perspectiva,
						estrategiaCategoria: estrategia.categoria,
						estrategiaDiretriz: estrategia.diretriz,
						lists: lists,
					});

					if (estrategia.diretriz) {
						await Diretrizes.getOrganizacaoDasEstrategias(estrategia.diretriz)
							.then(async (resultEstrategias) => {
								const { analise } = resultEstrategias;

								const estrategias = [];

								const categorias = analise[this.state.exercicio_definido];
								Object.entries(categorias).forEach(([, value]) => {
									const { items } = value;

									if (items && items.length > 0) {
										items.forEach((item) => {
											if (parseInt(estrategiaId) !== item.id) {
												estrategias.push(item);
											}
										});
									}
								});

								await this.setState({
									slides: estrategias,
								});
							})
							.catch(async (error) => {
								if (error.response.status !== 401) {
									console.error(error);
								}
								this.redirect("diretrizes/estrategias");
							});
					}
				} else {
					toast.error(
						"Ocorreu um erro ao acessar o Plano de Ação desta estratégia :("
					);
					console.error(resultTarefas);
					this.redirect("diretrizes/estrategias");
				}
			})
			.catch(async (error) => {
				if (error.data.response.status !== 401) {
					console.error(error);
				}
				this.redirect("diretrizes/estrategias");
			});

		await responsaveisTasks
			.then(async (resultResponsaveis) => {
				const { responsaveis } = resultResponsaveis;

				const listOfResponsible = this.state.listOfResponsible;
				for (const responsavel of responsaveis) {
					listOfResponsible.push(responsavel);
				}

				await this.setState({
					listOfResponsible: listOfResponsible,
				});
			})
			.catch(async (error) => {
				if (error.response.status !== 401) {
					console.error(error);
				}
				this.redirect("diretrizes/estrategias");
			});
	};

	redirect = (url) => {
		url = `/hub/${this.state.companyId}/gestao/categoria/${url}`;
		this.props.history.push(url);
	};

	goBack = (e) => {
		e.preventDefault();
		let id = this.state.companyId;
		this.props.history.push(
			`/hub/${id}/gestao/categoria/diretrizes/estrategias`
		);
	};

	goTo = async (event, item) => {
		event.preventDefault();

		if (this.state.estrategiaId === item.id) return;

		const id = this.state.companyId;
		await this.setState({
			isLoading: true,
			lists: {
				aguardando: {
					title: "A fazer",
					actions: [],
				},
				executando: {
					title: "Em execução",
					actions: [],
				},
				realizado: {
					title: "Realizado",
					actions: [],
				},
			},
		});
		this.props.history.push({
			pathname: `/hub/${id}/gestao/categoria/diretrizes/estrategias/${item["Estrategia.perspectiva"]}/${item.id}`,
			state: item,
		});
		await this.loadData();
		await this.setState({
			isLoading: false,
		});
	};

	handleChange = async (event) => {
		event.preventDefault();
		await this.setState({
			[event.target.id]: event.target.value,
		});
	};

	handleResponsaveis = (responsaveis) => {
		if (responsaveis) {
			this.setState({
				...this.state,
				responsible: responsaveis.map((responsavel) => ({
					id: responsavel.value,
				})),
				modalTaskResponsible: responsaveis.map((responsavel) => ({
					nome: responsavel.label,
					email: responsavel.email,
					cargo: responsavel.cargo,
					responsavel_id: responsavel.value,
				})),
			});
		} else {
			this.setState({
				...this.stage,
				responsible: [],
				modalTaskResponsible: [],
			});
		}
	};

	handleDeadline = (date) => {
		this.setState({
			...this.state,
			modalTaskExpirationDate: date,
		});
	};

	submitCreateTask = async (task) => {
		const { status, message, id, errors } = await Diretrizes.postNewTask(task);

		if (status === "success") {
			await this.setState({
				modalTaskId: id,
			});
			toast.success(message);
			return true;
		}

		if (errors && errors.length > 0) {
			errors.forEach((error) => {
				toast.error(error);
			});
		} else {
			toast.error(message);
		}

		return false;
	};

	submitUpdateTask = async (task, showAlert = true) => {
		const { status, message, activities } = await Diretrizes.updateTask(task);

		if (status === "success") {
			if (showAlert) toast.success(message);
			await this.setState({
				modalTaskComments: activities,
			});
			return true;
		}

		toast.error(message);

		return false;
	};

	addTask = async (event, stage) => {
		this.setState({
			modalTaskList: stage,
		});

		await this.toggleModalTask(event);
	};

	onClickCard = async (event, item) => {
		let expirationDate = new Date(item.expiration_date + "T00:00:00");
		let states = {
			showModalTask: true,
			modalTaskId: item.id,
			modalTaskTitle: item.title,
			modalTaskDescription: item.description,
			modalTaskList: item.stage,
			modalTaskCommentText: "",
			modalTaskComments: item.activities,
			modalTaskResponsible: item.responsible,
			modalTaskExpirationDate: expirationDate,
		};

		await this.setState({ ...states });
	};

	toggleModalTask = async (event) => {
		event.preventDefault();

		let state = {
			showModalTask: !this.state.showModalTask,
		};

		if (this.state.showModalTask === false) {
			state = {
				...state,
				modalTaskId: null,
				modalTaskTitle: "",
				modalTaskDescription: "",
				modalTaskCommentText: "",
				modalTaskComments: [
					{
						id: 0,
						ts_local: Date.now(),
						usuario_nome: this.props.user_name,
						usuario_id: this.props.user_id,
						comentario: `Tarefa iniciada por ${this.props.user_name}`,
						visivel: 0,
					},
				],
				modalTaskResponsible: [],
			};
		}

		await this.setState({
			...state,
		});
	};

	onDragEnd = async (result) => {
		const { source, destination } = result;

		if (!destination) return;

		const destinationName = destination.droppableId;

		const reorder = (list, startIndex, endIndex) => {
			const result = Array.from(list);
			const [removed] = result.splice(startIndex, 1);
			result.splice(endIndex, 0, removed);
			return result;
		};

		const move = async (
			source,
			destination,
			droppableSource,
			droppableDestination
		) => {
			const sourceClone = Array.from(source);
			const destClone = Array.from(destination);

			let activities = sourceClone[droppableSource.index]["activities"];
			activities.push({
				id: 0,
				ts_local: Date.now(),
				usuario_nome: this.props.user_name,
				usuario_id: this.props.user_id,
				comentario: `Tarefa movida para [${destinationName}] por ${this.props.user_name}`,
				visivel: 0,
			});

			const task = {
				...sourceClone[droppableSource.index],
				stage: destinationName,
				activities: activities,
			};

			this.submitUpdateTask(task, false).then(() =>
				console.info("Atualizado com sucesso")
			);

			const [removed] = sourceClone.splice(droppableSource.index, 1);
			destClone.splice(droppableDestination.index, 0, removed);

			const result = {};
			result[droppableSource.droppableId] = sourceClone;
			result[droppableDestination.droppableId] = destClone;

			return result;
		};

		let lists = JSON.parse(JSON.stringify(this.state.lists));

		if (source.droppableId === destination.droppableId) {
			lists[source.droppableId]["actions"] = reorder(
				lists[source.droppableId]["actions"],
				source.index,
				destination.index
			);
		} else {
			const result = await move(
				lists[source.droppableId]["actions"],
				lists[destination.droppableId]["actions"],
				source,
				destination
			);
			lists[source.droppableId]["actions"] = result[source.droppableId];
			lists[destination.droppableId]["actions"] =
				result[destination.droppableId];
		}

		await this.setState({
			lists: lists,
		});
	};

	saveCommentTask = async (event) => {
		event.preventDefault();
		if (this.state.modalTaskCommentText.length < 1) return;

		let comments = [
			...this.state.modalTaskComments,
			{
				id: 0,
				ts_local: Date.now(),
				usuario_nome: this.props.user_name,
				usuario_id: this.props.user_id,
				comentario: this.state.modalTaskCommentText,
				visivel: 1,
			},
		];

		await this.setState({
			modalTaskComments: comments,
			modalTaskCommentText: "",
		});
	};

	taskIsValid = () => {
		let errors = [];

		if (this.state.modalTaskTitle.length < 3) {
			errors.push("Deve-se preencher um título válido.");
		}

		if (this.state.modalTaskResponsible.length === 0) {
			errors.push("Deve-se preencher ao menos um responsável.");
		}

		if (!this.state.modalTaskExpirationDate) {
			errors.push("Deve-se preencher o vencimento da tarefa.");
		} else {
			try {
				const expiration_date = this.state.modalTaskExpirationDate
					.toISOString()
					.slice(0, 10);
				if (!isDateValid(expiration_date)) {
					errors.push(
						"Deve-se preencher o vencimento da tarefa com uma data válida."
					);
				}
			} catch (e) {
				errors.push(
					"Deve-se preencher o vencimento da tarefa com uma data válida."
				);
			}
		}

		errors.map((error) => toast.error(error));

		return errors.length === 0;
	};

	saveTask = async (event) => {
		event.preventDefault();

		if (!this.taskIsValid()) return;

		const editing = !!this.state.modalTaskId;

		let list_stage = JSON.parse(JSON.stringify(this.state.lists));
		let task = {
			title: this.state.modalTaskTitle,
			description: this.state.modalTaskDescription,
			responsible: this.state.modalTaskResponsible,
			expiration_date: this.state.modalTaskExpirationDate
				.toISOString()
				.slice(0, 10),
			activities: this.state.modalTaskComments,
			stage: this.state.modalTaskList,
			ano_exercicio: this.state.exercicio_definido,
			estrategia_id: this.state.estrategiaId,
			estrategia_perspectiva: this.state.estrategiaPerspectiva,
			estrategia_categoria: this.state.estrategiaCategoria,
		};

		let status;
		if (editing) {
			task["id"] = this.state.modalTaskId;
			status = await this.submitUpdateTask(task);
		} else {
			status = await this.submitCreateTask(task);
		}

		if (status) {
			if (editing) {
				task["activities"] = this.state.modalTaskComments;

				let listIndex = list_stage[this.state.modalTaskList].actions.findIndex(
					(item) => item.id === task.id
				);
				list_stage[this.state.modalTaskList].actions[listIndex] = task;
			} else {
				task["id"] = this.state.modalTaskId;
				list_stage[this.state.modalTaskList].actions.push(task);
			}

			await this.setState({
				lists: list_stage,
				showModalTask: false,
				modalTaskComments: [],
			});
		}
	};

	classNames = (classes) => {
		return Object.entries(classes)
			.filter(([, value]) => value)
			.map(([key]) => key)
			.join(" ");
	};

	renderIconClock = (expirationDate, stage, id) => {
		const i_id = `i-clock${id}`;
		const today = new Date();
		const expirationDateFinal = new Date(expirationDate + "T00:00:00");

		const classes = {
			"fa fa-clock-o i-clock": true,
			"mr-1": true,
			"color-green": true,
			"color-red": today > expirationDateFinal && stage !== "realizado",
		};

		const msg =
			"Esta tarefa está " +
			(today > expirationDateFinal && stage !== "realizado"
				? "atrasada"
				: "dentro do prazo");

		return (
			<div>
				<i id={i_id} className={this.classNames(classes)} />
				<UncontrolledTooltip target={i_id}>{msg}</UncontrolledTooltip>
			</div>
		);
	};

	renderIconDescription = (description, id) => {
		const show = description !== "";
		const i_id = `i-description${id}`;

		return show ? (
			<div>
				<i id={i_id} className="fa fa-align-left i-description" />
				<UncontrolledTooltip target={i_id}>
					Esta tarefa contém descrição
				</UncontrolledTooltip>
			</div>
		) : (
			<span />
		);
	};

	renderIconComments = (comments, id) => {
		const show = comments > 0;
		const i_id = `i-comments${id}`;
		const title = `Esta tarefa contém ${comments} comentário${
			comments === 1 ? "" : "s"
		}`;

		return show ? (
			<div className="comments">
				<i id={i_id} className="fa fa-comment-o i-comment" title={title} />
				<UncontrolledTooltip target={i_id}>{title}</UncontrolledTooltip>
				<span>{comments}</span>
			</div>
		) : (
			<span />
		);
	};

	renderSponsor = (responsaveis, id) => {
		const img_id = `i-user_image${id}`;

		let toolTipText = "Responsáve" + (responsaveis.length > 1 ? "is: " : "l: ");

		return (
			<div id={img_id} className="sponsor">
				{responsaveis.map((responsavel, index) => {
					const classes = {
						"fa fa-user-circle-o": true,
						"mr--10":
							index < responsaveis.length - 1 && responsaveis.length > 1,
					};

					toolTipText +=
						responsavel.nome +
						(index < responsaveis.length - 1
							? index === responsaveis.length - 2
								? " e "
								: ", "
							: "");

					return responsavel.user_image ? (
						<div key={index.toString()} className="user-image" />
					) : (
						<i key={index.toString()} className={this.classNames(classes)} />
					);
				})}
				<UncontrolledTooltip target={img_id}>{toolTipText}</UncontrolledTooltip>
			</div>
		);
	};

	renderDraggable = (item, key, listName) => {
		item["stage"] = listName;

		return (
			<Draggable key={item.id} draggableId={item.id.toString()} index={key}>
				{(provided, snapshot) => {
					const comments = item.activities.filter(
						(element) => element.visivel === 1
					);

					const classes = {
						draggable: true,
						"draggable-col": true,
						"draggable-dragging-over": snapshot.isDragging,
					};

					const showInfos = item.description !== "" || comments.length > 0;

					return (
						<div
							ref={provided.innerRef}
							{...provided.draggableProps}
							{...provided.dragHandleProps}
							className={this.classNames(classes)}
							onClick={(e) => this.onClickCard(e, item)}
						>
							<div className="header">
								{this.renderIconClock(
									item.expiration_date,
									item.stage,
									item.id
								)}
								<div className="title">{item.title}</div>
							</div>
							{showInfos ? (
								<div className="infos">
									<div className="task">
										{this.renderIconDescription(item.description, item.id)}
										{this.renderIconComments(comments.length, item.id)}
									</div>
									{this.renderSponsor(item.responsible, item.id)}
								</div>
							) : (
								<span />
							)}
						</div>
					);
				}}
			</Draggable>
		);
	};

	renderDroppable = (item, key) => {
		const [id, items] = item;
		const actions = items.actions;

		return (
			<Col key={key} className="tasks">
				<div className="drop">
					<Droppable key={key} droppableId={id}>
						{(provided, snapshot) => {
							const classes = {
								droppable: true,
								"droppable-col": true,
								"droppable-dragging-over": snapshot.isDraggingOver,
							};

							return (
								<div
									ref={provided.innerRef}
									className={this.classNames(classes)}
								>
									{actions.map((item, key) =>
										this.renderDraggable(item, key, id)
									)}
									{provided.placeholder}
								</div>
							);
						}}
					</Droppable>
					<div className="header">
						<div className="infos">
							<div className="badge">{items.actions.length}</div>
							<div className="title">{items.title}</div>
						</div>
						{this.company.isPremium && (
							<div className="features">
								<Button
									id="btnAddTask"
									className="btn-add-task"
									onClick={(e) => {
										this.addTask(e, id);
									}}
								>
									<i className="fa fa-plus" />
								</Button>
								<UncontrolledTooltip target="btnAddTask">
									Adicionar tarefa
								</UncontrolledTooltip>
							</div>
						)}
					</div>
				</div>
			</Col>
		);
	};

	renderBody = () => {
		return (
			<CardBody>
				<Row className={"align-items-center"}>
					<Col className="estrategia-name">
						<Badge
							className={`background background-${this.state.estrategiaPerspectiva} text-white align-middle`}
						>
							{this.state.estrategiaPerspectiva}
						</Badge>
					</Col>
				</Row>
				<Row>
					<Col className={"estrategia-name-title"}>
						<span className={"align-middle"}>{this.state.estrategiaName}</span>{" "}
					</Col>
				</Row>
				<Row>
					<Col>
						<DragDropContext onDragEnd={this.onDragEnd}>
							<Row>
								{Object.entries(this.state.lists).map(this.renderDroppable)}
								<Col className="vertical-carousel">
									<VerticalCarousel data={this.state.slides} goTo={this.goTo} />
								</Col>
							</Row>
						</DragDropContext>
					</Col>
				</Row>
			</CardBody>
		);
	};

	renderHeader = () => {
		return (
			<CardHeader>
				<strong>Plano de Ações</strong>
				<Button
					className="btn btn-sm btn-info mr-1 float-right"
					onClick={this.goBack}
				>
					<i className="fa fa-arrow-left" /> Voltar
				</Button>
			</CardHeader>
		);
	};

	renderFooter = () => {
		return (
			<CardFooter>
				<Button
					className="btn btn-sm btn-info mr-1 float-right"
					onClick={this.goBack}
				>
					<i className="fa fa-arrow-left" /> Voltar
				</Button>
				<Button
					className="btn btn-sm btn-info mr-1 float-left"
					onClick={() => this.redirect("diretrizes/eficiencia")}
				>
					<i className="fa fa-list" /> Acessar Resumo das Tarefas
				</Button>
			</CardFooter>
		);
	};

	renderTasksComment = () => {
		if (this.state.modalTaskComments.length === 0) return null;

		const compare = (a, b) => {
			if (a.ts_local > b.ts_local) {
				return -1;
			}
			if (a.ts_local < b.ts_local) {
				return 1;
			}
			return 0;
		};

		this.state.modalTaskComments.sort(compare);

		return (
			<ul className={"p-0 mt-3"}>
				{this.state.modalTaskComments.map((item, key) => {
					let response = null;
					let date = new Date(Number(item.ts_local));

					if (item["visivel"] === 1) {
						response = (
							<li key={key}>
								<div className={""}>
									<Row>
										<Col>
											<div className="username">
												<span>{item.usuario_nome}</span>
												<ReactTimeAgo date={date} className={"timeago"} />
											</div>
										</Col>
									</Row>
									<div className="comment">{item.comentario}</div>
								</div>
							</li>
						);
					}

					return response;
				})}
			</ul>
		);
	};

	renderModalTask = () => {
		if (!this.state.showModalTask) return null;

		const iconClasses = {
			"icon-form": true,
			"mr-3": true,
		};

		const icontTitleClasses = {
			"fa fa-list-alt": true,
			"mt-2": true,
			...iconClasses,
		};

		const iconTextClasses = {
			"mt-1": true,
		};

		const iconDescriptionClasses = {
			"fa fa-align-left": true,
			...iconClasses,
			...iconTextClasses,
		};

		const iconSponsorsClasses = {
			"fa fa-user-circle-o": true,
			...iconClasses,
			...iconTextClasses,
		};

		const iconDeadlineClasses = {
			"fa fa-calendar": true,
			"mt-2": true,
			...iconClasses,
		};

		const iconActivitiesClasses = {
			"fa fa-list-ul": true,
			...iconClasses,
			...iconTextClasses,
		};

		let responsaveis = this.state.listOfResponsible || [],
			message;
		if (responsaveis.length > 0) {
			responsaveis = responsaveis.map((responsavel) => ({
				label: responsavel.nome,
				email: responsavel.email,
				cargo: responsavel.cargo,
				innerValue: responsavel.id,
				value: responsavel.id,
			}));
		} else {
			message = "Não foi localizado nenhum responsável.";
		}

		let responsaveisEscolhidos = this.state.modalTaskResponsible || [];
		if (responsaveisEscolhidos.length > 0) {
			responsaveisEscolhidos = responsaveisEscolhidos.map((responsavel) => ({
				label: responsavel.nome,
				email: responsavel.email,
				cargo: responsavel.cargo,
				innerValue: responsavel.responsavel_id,
				value: responsavel.responsavel_id,
			}));
		}

		return (
			<Modal isOpen={this.state.showModalTask} size={"lg"}>
				<ModalBody className={"p-0 m-0"}>
					<Card className="card-accent-dark mb-0">
						<CardHeader>
							<Row className={"align-items-center"}>
								<Col>
									<CardTitle tag="h5">Plano de Ações</CardTitle>
									<CardSubtitle className="text-muted">
										{this.state.modalTaskId ? "Editar " : "Nova "}
										Tarefa
									</CardSubtitle>
								</Col>
								<Col>
									<Badge
										className={`background background-${this.state.estrategiaPerspectiva} text-white align-middle float-right`}
									>
										{this.state.estrategiaPerspectiva}
									</Badge>
								</Col>
							</Row>
						</CardHeader>
						<CardBody>
							<Row className="row-fields">
								<Col className="col-fields">
									<i className={this.classNames(icontTitleClasses)} />
									<FormGroup className="field-info">
										<Input
											type="text"
											name="modalTaskTitle"
											id="modalTaskTitle"
											placeholder="Título da Tarefa"
											value={this.state.modalTaskTitle}
											onChange={this.handleChange}
											maxLength="150"
										/>
										<span>na lista</span>
										<Badge className={"badge-success"}>
											<strong style={{ fontSize: 15 }}>
												{this.state.lists[this.state.modalTaskList].title}
											</strong>
										</Badge>
									</FormGroup>
								</Col>
							</Row>
							<Row className="row-fields">
								<Col className="col-fields">
									<i className={this.classNames(iconDescriptionClasses)} />
									<FormGroup className="field-info">
										<Label for="modalTaskDescription">Descrição</Label>
										<Input
											type="textarea"
											name="modalTaskDescription"
											id="modalTaskDescription"
											placeholder="Adicione uma descrição mais detalhada..."
											value={this.state.modalTaskDescription}
											onChange={this.handleChange}
											maxLength="400"
										/>
									</FormGroup>
								</Col>
							</Row>
							<Row className="row-fields">
								<Col className="col-fields">
									<i className={this.classNames(iconSponsorsClasses)} />
									<FormGroup className="field-info">
										<Label for="modalTaskSponsor">Responsáveis</Label>
										<Select
											name="modalTaskSponsor"
											isMulti
											value={responsaveisEscolhidos}
											options={responsaveis}
											className="basic-multi-select"
											classNamePrefix="select"
											placeholder="Selecione os responsáveis por esta tarefa"
											noOptionsMessage={() => message}
											onChange={this.handleResponsaveis}
										/>
									</FormGroup>
								</Col>
							</Row>
							<Row className="row-fields">
								<Col className="col-fields">
									<i className={this.classNames(iconDeadlineClasses)} />
									<div className="field-info">
										<DatePicker
											name="modalTaskDeadline"
											selected={this.state.modalTaskExpirationDate}
											locale="pt-BR"
											dateFormat="dd/MM/yyyy"
											placeholderText="Vencimento da Tarefa"
											onChange={this.handleDeadline}
											className="form-control"
										/>
									</div>
								</Col>
							</Row>
							<Row className="row-fields">
								<Col className="col-fields">
									<i className={this.classNames(iconActivitiesClasses)} />
									<FormGroup className="field-info">
										<Label for="commentTask">Atividade / Registros</Label>
										<div className="input-group">
											<Input
												type="text"
												name="modalTaskCommentText"
												id="modalTaskCommentText"
												placeholder="Escreva um comentário..."
												value={this.state.modalTaskCommentText}
												onChange={this.handleChange}
												className="mb-0"
											/>
											<Button
												outline
												color="success"
												onClick={this.saveCommentTask}
												className={"text-uppercase"}
												disabled={this.state.modalTaskCommentText.length < 1}
											>
												<small>Salvar Registro</small>
											</Button>
										</div>
										<Row className="row-comments">
											<Col className="col-comments">
												{this.renderTasksComment()}
											</Col>
										</Row>
									</FormGroup>
								</Col>
							</Row>
						</CardBody>
						<CardFooter>
							<Button
								color="secondary"
								onClick={this.toggleModalTask}
								className={"float-right"}
								// outline
							>
								{this.state.modalTaskId ? "Cancelar" : "Fechar"}
							</Button>
							{this.company.isPremium && (
								<Button
									color="primary"
									onClick={this.saveTask}
									className={"float-right mr-2"}
								>
									Salvar
								</Button>
							)}
						</CardFooter>
					</Card>
				</ModalBody>
			</Modal>
		);
	};

	loaded = () => {
		return (
			<div className="animated fadeIn">
				<Card className="card-accent-secondary">
					{this.renderHeader()}
					{this.renderBody()}
					{this.renderFooter()}
				</Card>
				{this.renderModalTask()}
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

export default PlanoAcao;
