/* eslint-disable max-len */
import { Component } from "react";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { toast } from "react-toastify";
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Col,
	Row,
	UncontrolledTooltip,
} from "reactstrap";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "../../../../assets/Gestao/Diretrizes/Execucao/estrategiasanosstyle.scss";
import CompanyService from "../../../../service/CompanyService";
import Diretrizes from "../../../../service/Diretrizes";

class EstrategiasAnos extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();
		if (!this.company) return this.props.history.push("/");

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			cards: [
				{
					t1: {
						title: "1° Trimestre: Janeiro a Março",
						cards: [],
					},
					t2: {
						title: "2° Trimestre: Abril a Junho",
						cards: [],
					},
					t3: {
						title: "3° Trimestre: Julho a Setembro",
						cards: [],
					},
					t4: {
						title: "4° Trimestre: Outubro a Dezembro",
						cards: [],
					},
				},
				{
					estrategias: {
						title: "Estratégias",
						cards: [],
					},
				},
			],
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
			return this.redirect("diretrizes");
		}
	}

	loadData = async () => {
		const resultEstrategias = await Diretrizes.getOrganizacaoDasEstrategias();
		let analiseEstrategias = resultEstrategias.analise;
		analiseEstrategias = analiseEstrategias[this.state.exercicio_definido];

		let cards = { ...this.state.cards };

		const perpectivas = Object.entries(analiseEstrategias);

		for (const [, perspectiva] of perpectivas) {
			let dataPerspectiva = perspectiva["items"];
			for (const item of dataPerspectiva) {
				if (item.diretriz && item.definida === 1) {
					if (item.diretriz === "estrategias") {
						cards[1][item.diretriz].cards.push(item);
					} else {
						cards[0][item.diretriz].cards.push(item);
					}
				} else {
					if (item.definida !== 0) {
						cards[1]["estrategias"].cards.push(item);
					}
				}
			}
		}

		await this.setState({
			cards: cards,
		});
	};

	redirect = (url) => {
		url = `/hub/${this.state.companyId}/gestao/categoria/${url}`;
		this.props.history.push(url);
	};

	goBack = (e) => {
		e.preventDefault();
		let id = this.state.companyId;
		this.props.history.push(`/hub/${id}/gestao/categoria/diretrizes`);
	};

	submitUpdate = async (data, message_response = false) => {
		if (this.company.isDemo) return false;

		let response = false;

		await Diretrizes.updateEstrategias(data).then((result) => {
			const { status, message, data } = result;

			if (status === "success") {
				if (message_response) toast.success(data.message);
				response = true;
			} else {
				toast.error(message);
			}
		});

		return response;
	};

	handleSaveButton = async (e) => {
		e.preventDefault();

		const data = {
			ano_exercicio: this.state.exercicio_definido,
			cards: { ...this.state.cards[0], ...this.state.cards[1] },
		};

		await this.submitUpdate(data, true);
	};

	onClick = (event, item) => {
		let id = this.state.companyId;

		if (item.diretriz === "estrategias" || item.diretriz === null) {
			toast.info(
				"Antes de acessar o Plano de Ação da estratégia, é necessário " +
					"definir o trimestre para a mesma."
			);
		} else {
			this.props.history.push({
				pathname: `/hub/${id}/gestao/categoria/diretrizes/estrategias/${item["Estrategia.perspectiva"]}/${item.id}`,
				state: item,
			});
		}
	};

	onDragEnd = async (result) => {
		const { source, destination } = result;
		let updateServer = false;

		if (!destination) return;

		const reorder = (list, startIndex, endIndex) => {
			const result = Array.from(list);
			const [removed] = result.splice(startIndex, 1);

			result.splice(endIndex, 0, removed);

			return result;
		};

		const move = (
			source,
			destination,
			droppableSource,
			droppableDestination
		) => {
			const sourceClone = Array.from(source);
			const destClone = Array.from(destination);
			const [removed] = sourceClone.splice(droppableSource.index, 1);

			removed.diretriz = droppableDestination.droppableId;

			destClone.splice(droppableDestination.index, 0, removed);

			const result = {};
			result[droppableSource.droppableId] = sourceClone;
			result[droppableDestination.droppableId] = destClone;

			return result;
		};

		let cards = this.state.cards;
		let cardSIndex = source.droppableId === "estrategias" ? 1 : 0;
		let cardDIndex = destination.droppableId === "estrategias" ? 1 : 0;

		if (source.droppableId === destination.droppableId) {
			cards[cardSIndex][source.droppableId].cards = reorder(
				cards[cardSIndex][source.droppableId].cards,
				source.index,
				destination.index
			);
		} else {
			const moved = move(
				cards[cardSIndex][source.droppableId].cards,
				cards[cardDIndex][destination.droppableId].cards,
				source,
				destination
			);

			cards[cardSIndex][source.droppableId].cards = moved[source.droppableId];
			cards[cardDIndex][destination.droppableId].cards =
				moved[destination.droppableId];

			updateServer = true;
		}

		if (updateServer) {
			const data = {
				ano_exercicio: this.state.exercicio_definido,
				cards: { ...cards[0], ...cards[1] },
			};

			const isSaved = await this.submitUpdate(data);
			if (isSaved) {
				await this.setState({
					cards: cards,
				});
			}
		}
	};

	classNames = (classes) => {
		return Object.entries(classes)
			.filter(([, value]) => value)
			.map(([key]) => key)
			.join(" ");
	};

	renderBadgeTasks = (item) => {
		const badge_tasks_id = `badge-tasks-${item.id}`;
		const show = item.info.tasks > 0;

		return show ? (
			<div>
				<div id={badge_tasks_id} className="badge badge-tasks">
					{item.info.tasks}
				</div>
				<UncontrolledTooltip target={badge_tasks_id}>
					Esta estratégia contém {item.info.tasks} tarefa
					{item.info.tasks > 1 ? "s" : ""}
				</UncontrolledTooltip>
			</div>
		) : (
			<span />
		);
	};

	renderBadgeWarning = (item) => {
		const tasks = item.info.tasks;
		const expireds = item.info.expired;

		const show = tasks === 0 || expireds > 0;
		const i_id = `i-warning${item.id}`;

		let msg;

		if (tasks === 0) {
			msg = "Esta estratégia não contém tarefas";
		}

		if (expireds > 0) {
			const plural = expireds > 1 ? "s" : "";

			msg =
				"Esta estratégia contém " +
				expireds +
				" tarefa" +
				plural +
				" atrasada" +
				plural;
		}

		return show ? (
			<div>
				<i id={i_id} className="fa fa-exclamation-triangle i-warning" />
				<UncontrolledTooltip target={i_id}>{msg}</UncontrolledTooltip>
			</div>
		) : (
			<span />
		);
	};

	renderDraggable = (item, key) => {
		return (
			<Draggable key={item.id} draggableId={item.id.toString()} index={key}>
				{(provided, snapshot) => {
					const classes = {
						draggable: true,
						"draggable-row": item.diretriz === "estrategias",
						"draggable-col": item.diretriz !== "estrategias",
						"draggable-dragging-over": snapshot.isDragging,
						"draggable-financeiro":
							item["Estrategia.perspectiva"] === "financeiro",
						"draggable-comercial":
							item["Estrategia.perspectiva"] === "comercial",
						"draggable-processos":
							item["Estrategia.perspectiva"] === "processos",
						"draggable-pessoas": item["Estrategia.perspectiva"] === "pessoas",
					};

					return (
						<div
							ref={provided.innerRef}
							{...provided.draggableProps}
							{...provided.dragHandleProps}
							className={this.classNames(classes)}
							onClick={(e) => this.onClick(e, item)}
						>
							<div className="header">
								{this.renderBadgeTasks(item)}
								{this.renderBadgeWarning(item)}
							</div>
							<div className="description">{item.descricao}</div>
						</div>
					);
				}}
			</Draggable>
		);
	};

	renderDroppable = (item, key) => {
		const [name, items] = item;

		return (
			<Col
				key={key}
				sm={name === "estrategias" ? "12" : "6"}
				md={name === "estrategias" ? "12" : "3"}
				lg={name === "estrategias" ? "12" : "3"}
			>
				<div className="drop">
					<Droppable droppableId={name} key={key}>
						{(provided, snapshot) => {
							const classes = {
								droppable: true,
								"droppable-row": name === "estrategias",
								"droppable-col": name !== "estrategias",
								"droppable-dragging-over": snapshot.isDraggingOver,
							};

							return (
								<div
									ref={provided.innerRef}
									className={this.classNames(classes)}
								>
									{items.cards.map(this.renderDraggable)}
									{provided.placeholder}
								</div>
							);
						}}
					</Droppable>
					<div className="header">
						<div className="title">{items.title}</div>
						<div className="badge">{items.cards.length}</div>
					</div>
				</div>
			</Col>
		);
	};

	renderHeader = () => {
		return (
			<CardHeader>
				<strong>Planejamento Trimestral</strong>
				<Button
					className="btn btn-sm btn-info mr-1 float-right"
					onClick={this.goBack}
				>
					<i className="fa fa-arrow-left" /> Voltar
				</Button>
			</CardHeader>
		);
	};

	renderQuarter = () => {
		return (
			<CardBody>
				<DragDropContext onDragEnd={this.onDragEnd}>
					<Row>
						{Object.entries(this.state.cards[0]).map(this.renderDroppable)}
					</Row>
					<Row>
						{Object.entries(this.state.cards[1]).map(this.renderDroppable)}
					</Row>
				</DragDropContext>
			</CardBody>
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
			</CardFooter>
		);
	};

	loaded = () => {
		return (
			<div className="animated fadeIn">
				<Card className="card-accent-secondary">
					{this.renderHeader()}
					{this.renderQuarter()}
					{this.renderFooter()}
				</Card>
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

export default EstrategiasAnos;
