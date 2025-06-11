/* eslint-disable max-len */
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Row, Col, Container } from "reactstrap";
import { toast } from "react-toastify";
import "../../../../assets/mapstyle.css";

const limiteTotalEstrategias = 16;
const limitePerspectivaEstrategias = 6;

async function handleOnDragEnd(
	result,
	columns,
	setColumns,
	handleUpdate,
	quantidadeDefinida
) {
	if (!result.destination) return;
	const { source, destination } = result;

	let sourceColumn = columns[source.droppableId];
	let destColumn = columns[destination.droppableId];
	let sourceItems = [...sourceColumn.items];
	let destItems = [...destColumn.items];

	if (
		quantidadeDefinida >= limiteTotalEstrategias &&
		destination.droppableId !== "estrategias" &&
		source.droppableId === "estrategias" &&
		destination.droppableId !== source.droppableId
	) {
		toast.error(
			`Você já atingiu o limite de ${limiteTotalEstrategias} estratégias.`
		);
		return;
	}

	let itemData = sourceItems.filter(function (obj) {
		return (
			obj.id === parseInt(result.draggableId) &&
			(destination.droppableId === obj["Estrategia.perspectiva"] ||
				destination.droppableId === "estrategias")
		);
	});

	if (itemData.length === 0) {
		itemData = sourceItems.filter(function (obj) {
			return obj.id === parseInt(result.draggableId);
		})[0];

		destination.droppableId = itemData["Estrategia.perspectiva"];
		sourceColumn = columns[source.droppableId];
		destColumn = columns[destination.droppableId];
		sourceItems = [...sourceColumn.items];
		destItems = [...destColumn.items];
	}

	if (
		destItems.length >= limitePerspectivaEstrategias &&
		destination.droppableId !== "estrategias" &&
		destination.droppableId !== source.droppableId
	) {
		toast.error(
			`Não é possível inserir novas estratégias para perspectiva ${destColumn.name}`
		);
		return;
	}

	let newColumns = {};
	if (source.droppableId !== destination.droppableId) {
		const [removed] = sourceItems.splice(source.index, 1);
		destItems.splice(destination.index, 0, removed);
		newColumns = {
			...columns,
			[source.droppableId]: {
				...sourceColumn,
				items: sourceItems,
			},
			[destination.droppableId]: {
				...destColumn,
				items: destItems,
			},
		};
	} else {
		const copiedItems = [...sourceColumn.items];
		const [removed] = copiedItems.splice(source.index, 1);
		copiedItems.splice(destination.index, 0, removed);
		newColumns = {
			...columns,
			[source.droppableId]: {
				...sourceColumn,
				items: copiedItems,
			},
		};
	}
	setColumns(newColumns);
	await handleUpdate(newColumns);
}

const renderCard = (provided, item, classRender = "") => {
	const perspectiva = item["Estrategia.perspectiva"];
	let text = item.descricao;
	if (text === "" || text === undefined || text === null)
		text = item["Estrategia.descricao"];

	return (
		<div
			className={`map-postit map-postit-${perspectiva} ${classRender} map-postit-container`}
			ref={provided.innerRef}
			{...provided.draggableProps}
			{...provided.dragHandleProps}
		>
			<p className={"map-postit-estrategia-text"}>{text}</p>
		</div>
	);
};

const renderCardAvailable = (item, index) => {
	return (
		<Draggable
			key={`${item.id}_${index}`}
			draggableId={`${item.id}`}
			index={index}
		>
			{(provided) => {
				return (
					<Col sm={6} md={4} lg={3} xl={2}>
						{renderCard(provided, item, "map-postit-estrategia-available")}
					</Col>
				);
			}}
		</Draggable>
	);
};

const renderCardStrategies = (item, index) => {
	return (
		<Draggable key={item.id} draggableId={`${item.id}`} index={index}>
			{(provided) => {
				return renderCard(provided, item, "map-postit-estrategia-defined");
			}}
		</Draggable>
	);
};

const renderColumns = (item) => {
	const [columnId, column] = item;
	const perspectiva = column.name.toLowerCase();
	let cardBackground = "map-column-background map-postit-row-" + perspectiva;

	const getListStyle = () => ({
		display: "flex",
		overflow: "auto",
	});

	return (
		<Col key={columnId} className={"align-self-center"}>
			<Droppable droppableId={columnId} key={columnId} direction="horizontal">
				{(provided, snapshot) => {
					return (
						<div
							{...provided.droppableProps}
							ref={provided.innerRef}
							style={getListStyle(snapshot.isDraggingOver)}
							className={cardBackground}
						>
							{column.items.map((item, index) =>
								renderCardStrategies(item, index)
							)}
							{provided.placeholder}
						</div>
					);
				}}
			</Droppable>
		</Col>
	);
};

const renderColumnStrategies = (item) => {
	const [columnId, column] = item;

	return (
		<Col key={columnId} className={"map-column align-self-center"}>
			<h2 className={"titles"}>Estratégias Disponíveis</h2>
			<div className={"map-column-postit"}>
				<Droppable droppableId={columnId} key={columnId}>
					{(provided) => {
						return (
							<div
								{...provided.droppableProps}
								ref={provided.innerRef}
								className={"map-column-background"}
							>
								<Row>{column.items.map(renderCardAvailable)}</Row>
								{provided.placeholder}
							</div>
						);
					}}
				</Droppable>
			</div>
		</Col>
	);
};

const calculaQuantidadeDefinida = (mapa) => {
	let qtd = 0;

	for (const perspectiva in mapa) {
		if (perspectiva === "estrategias") continue;
		qtd += mapa[perspectiva].items.length;
	}

	return qtd;
};

function DragAndDropEstrategias(props) {
	const [columns, setColumns] = useState(props.listStrategies);
	const handleUpdate = props.handleUpdate;
	const quantidadeDefinida = calculaQuantidadeDefinida(columns);

	return (
		<DragDropContext
			onDragEnd={async (result) =>
				await handleOnDragEnd(
					result,
					columns,
					setColumns,
					handleUpdate,
					quantidadeDefinida
				)
			}
		>
			<Container fluid={true} className={"container-defined"}>
				<Row className={"align-center justify-content-md-center"}>
					<Col>
						<Row className={"align-center justify-content-md-center"}>
							<Col>
								<h2 className={"titles"}>Mapa Estratégico</h2>
								{/*<i className="fa fa-question float-right"/>*/}
							</Col>
						</Row>
						<br />
						<Row className={"row-perspectiva"}>
							<Col>
								{Object.entries(columns).map((item, index) => {
									let perspectiva = item[0];
									if (perspectiva !== "estrategias") {
										const [, column] = item;
										const perspectiva = column.name.toLowerCase();
										return (
											<Container
												fluid={true}
												className={"container-available map-perspectiva"}
												key={index}
											>
												<Row>
													<Col
														xs={12}
														sm={4}
														md={4}
														lg={2}
														className={
															"align-self-center titles map-perspectiva-title map-postit-" +
															perspectiva
														}
													>
														<h2 className={"map-perspectiva-title-text"}>
															{column.name}
														</h2>
													</Col>
													{renderColumns(item, index)}
												</Row>
											</Container>
										);
									}
									return null;
								})}
							</Col>
						</Row>
					</Col>
				</Row>
			</Container>
			<br />
			<Container fluid={true} className={"container-available"}>
				<Row className={"align-center justify-content-md-center"}>
					{Object.entries(columns).map((item, index) => {
						let perspectiva = item[0];
						if (perspectiva === "estrategias") {
							return renderColumnStrategies(item, index);
						}
						return null;
					})}
				</Row>
			</Container>
		</DragDropContext>
	);
}

export default DragAndDropEstrategias;
