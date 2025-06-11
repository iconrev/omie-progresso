import { Component } from "react";
import cn from "classnames";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { toast } from "react-toastify";
import {
	Col,
	Nav,
	NavItem,
	NavLink,
	Row,
	TabContent,
	TabPane,
	Container,
	Button,
	Table,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
} from "reactstrap";
import { Bar } from "react-chartjs-2";
import Generic from "../../../Utils/Generic";
import CarouselChart from "./Carousel";
import ModalEditMeta from "./ModalEditMeta";
import "../../../../assets/Gestao/Diretrizes/Eficacia/Dashboard/dashboardstyle.scss";
import CompanyService from "../../../../service/CompanyService";
import Diretrizes from "../../../../service/Diretrizes";

const mesesAvaliacao = {
	1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
	2: [1, 3, 5, 7, 9, 11],
	3: [2, 5, 8, 11],
	4: [3, 7, 11],
	6: [6, 11],
	12: [11],
};

class Dashboard_Eficacia extends Component {
	constructor(props) {
		super(props);

		this.company = CompanyService.getDataCompany();
		if (!this.company) return this.props.history.push("/");

		this.state = {
			isLoading: true,
			companyId: this.company.id,
			exercicio_definido: this.company.exercicioDefinido,
			activeTab: "financeiro",
			dashboard: [],
			chartLargeIndex: 0,
			colorsChart: {
				financeiro: "rgb(81, 211, 145)",
				comercial: "rgb(97, 183, 219)",
				processos: "rgb(158, 130, 241)",
				pessoas: "rgb(210, 68, 113)",
			},
			loaded: false,
			modalEdit: false,
			dataModalEdit: null,
			dataModalEditResource: null,
			dataModalEditPerspectiva: null,
			activeButton: {
				financeiro: "graficos",
				comercial: "graficos",
				processos: "graficos",
				pessoas: "graficos",
			},
		};
	}

	async componentDidMount() {
		await this.loadData();
		this.setState({
			isLoading: false,
		});
	}

	async loadData() {
		const result = await Diretrizes.getDadosDashboard();
		const { meses, dashboard, status, message } = result;

		if (status === "success") {
			this.setState({
				dashboard: dashboard[this.state.exercicio_definido],
				meses: meses,
				loaded: true,
			});
		} else {
			console.error(result.data);
			toast.error(message);
			toast.error("Ocorreu um problema ao buscar os dados do Dashboard :(");
			this.redirect("diretrizes");
		}
	}

	redirect = (url) => {
		url = `/hub/${this.state.companyId}/gestao/categoria/${url}`;
		this.props.history.push(url);
	};

	toggleTab = async (e, page) => {
		e.preventDefault();

		if (this.state.activeTab !== page) {
			await this.setState({
				activeTab: page,
				chartLargeIndex: 0,
			});
		}
	};

	toggleModal = async (e, data = null, resource = null, perspectiva = null) => {
		if (e) {
			e.preventDefault();
		}

		await this.setState({
			modalEdit: data ? !this.state.modalEdit : null,
			dataModalEdit: data,
			dataModalEditResource: resource,
			dataModalEditPerspectiva: perspectiva,
		});
	};

	toggleView = async (e, page, btn) => {
		let data = {
			activeButton: { ...this.state.activeButton },
		};

		data.activeButton[page] = btn;

		this.setState(data);
	};

	saveModalEdited = async (data, resource, perspectiva) => {
		let dashboard = [...this.state.dashboard];

		dashboard[perspectiva]["data"][resource] = data;

		await this.setState({
			dashboard: dashboard,
		});

		await this.toggleModal(null);
	};

	goToChart = async (e, index) => {
		e.preventDefault();

		if (index !== undefined && index !== null) {
			await this.setState({
				chartLargeIndex: index,
			});
		}
	};

	formatDataChart = (tooltipItem, data, typeChart, decimal) => {
		let value =
			data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] || 0.0;

		value = Generic.formatNumber(value, decimal);

		if (typeChart !== undefined) {
			if (typeChart === "percentage") value += "%";
			if (typeChart === "currency") value = "R$ " + value;
		}

		return " " + value;
	};

	defineDataChart = (metaData, dreData) => {
		let meses = this.state.meses;

		return {
			labels: mesesAvaliacao[12 / metaData.data.length].map(
				(item) => meses[item].id
			),
			datasets: [
				{
					type: "line",
					label: metaData.label,
					data: metaData.data,
					fill: false,
					pointRadius: 0,
					borderColor: "rgba(255, 99, 132, 0.7)",
					borderWidth: 4,
				},
				{
					type: "bar",
					label: dreData.label,
					data: dreData.data,
					fill: false,
					backgroundColor: this.state.colorsChart[this.state.activeTab],
				},
			],
		};
	};

	defineOptionChart = (title, typeChart, decimal = 2) => {
		return {
			title: {
				display: false,
			},
			tooltips: {
				callbacks: {
					label: (tooltipItem, data) =>
						this.formatDataChart(tooltipItem, data, typeChart, decimal),
				},
			},
			legend: {
				position: "bottom",
			},
			scales: {
				yAxes: [
					{
						ticks: {
							display: true,
							callback: function (value) {
								value = Generic.formatNumber(value, decimal);

								if (typeChart !== undefined) {
									if (typeChart === "percentage") value += "%";
									if (typeChart === "currency") value = "R$ " + value;
								}

								return value;
							},
						},
					},
				],
			},
		};
	};

	renderCarousselChart = (chartId, chartsItem, perspectivaKey) => {
		return (
			<div
				className={cn("caroussel-chart", {
					"d-none": this.state.activeButton[chartId] !== "graficos",
				})}
			>
				<Row>
					<Col className={"d-none d-lg-block"}>
						<Container>
							<CarouselChart
								indexChart={this.state.chartLargeIndex}
								chartsItem={chartsItem}
								perspectivaKey={perspectivaKey}
								chart={this.renderChart}
							/>
						</Container>
					</Col>
				</Row>
				<Row className="little-charts">
					{Object.entries(chartsItem).map((chartItem, index) => {
						return (
							<Col xs={12} sm={12} md={6} lg={4} xl={3} key={index}>
								{this.renderChart(chartItem, index, perspectivaKey)}
							</Col>
						);
					})}
				</Row>
			</div>
		);
	};

	renderChartBar = (
		title,
		data,
		options,
		indexChart,
		perspectiva,
		resource
	) => {
		const datasetKeyProvider = () => Math.random();

		return (
			<div onClick={(e) => this.goToChart(e, indexChart)}>
				<Card>
					<CardHeader>
						<strong>{title}</strong>
						{this.company.isPremium && !this.company.isDemo && (
							<div className="card-header-actions">
								<Button
									block
									color="secondary"
									className="btn btn-sm mr-1 float-right"
									onClick={async (e) =>
										await this.toggleModal(
											e,
											this.state.dashboard[perspectiva]["data"][resource[0]],
											resource[0],
											perspectiva
										)
									}
								>
									Editar Meta
								</Button>
							</div>
						)}
					</CardHeader>
					<CardBody>
						<Bar
							data={data}
							options={options}
							datasetKeyProvider={datasetKeyProvider}
						/>
					</CardBody>
				</Card>
			</div>
		);
	};

	renderChart = (categoria, indexChart, indexPerspectiva) => {
		const dashboard = this.state.dashboard[indexPerspectiva].data;
		const metaData = dashboard[categoria[0]][0];
		const dreData = dashboard[categoria[0]][1];
		const title = dreData.label;
		const typeChart = dashboard[categoria[0]][2].type;
		const decimal = typeChart === "integer" ? 0 : 2;

		const data = this.defineDataChart(metaData, dreData);
		const options = this.defineOptionChart(title, typeChart, decimal);

		return this.renderChartBar(
			title,
			data,
			options,
			indexChart,
			indexPerspectiva,
			categoria
		);
	};

	renderValues = (index, item) => {
		let regExp = new RegExp(`^${index}_[a-z]{3}`);
		let prefix = "";
		let suffix = "";

		if (item.type === "currency") {
			prefix = "R$";
		}
		if (item.type === "percentage") {
			suffix = "%";
		}

		return Object.entries(item)
			.filter((pairOfPropertyAndValue) =>
				pairOfPropertyAndValue[0].match(regExp)
			)
			.map((pairOfPropertyAndValue, index) => {
				let meta = pairOfPropertyAndValue[0].indexOf("meta") > -1;
				let value = item[pairOfPropertyAndValue[0]];

				if (value !== "-") {
					value =
						prefix +
						" " +
						Generic.formatNumber(value, item.type === "integer" ? 0 : 2) +
						suffix;
				}

				return (
					<tr
						key={`row-${item.id}-${index}`}
						className={cn({
							"color-dark": !meta,
							"color-light": meta,
						})}
					>
						<td
							className={cn("border-left-0 border-right-0", {
								"border-top-0": !meta,
								"border-bottom-0": meta,
							})}
						>
							{value}
						</td>
					</tr>
				);
			});
	};

	renderColumnsOfValues = (item, key) => {
		let html = [];

		for (let i = 0; i < 12; i++) {
			html.push(
				<td key={`col-${i}-${key}`} className="meta-efetivo">
					<Table>
						<tbody>{this.renderValues(i, item, key)}</tbody>
					</Table>
				</td>
			);
		}

		return html;
	};

	renderTabelaIndicadores = (category, index) => {
		const [{ data }] = this.state.dashboard.filter(
			(item) => item.id === category
		);
		const table = [];

		for (const [key, value] of Object.entries(data)) {
			const meta = value[0];
			const field = value[1];
			const type = value[2];

			let dataset = {
				id: key,
				title: field.label,
				type: type.type,
			};

			const mesAvalia = mesesAvaliacao[12 / meta.data.length].map(
				(item) => this.state.meses[item].id
			);

			for (const mes of this.state.meses) {
				let valueField = "-";
				let valueMeta = "-";

				const aMes = mesAvalia.filter((mesFilter) => mesFilter === mes.id);

				if (aMes.length > 0) {
					const index = mesAvalia.findIndex((element) => element === aMes[0]);
					valueMeta = field.data[index];
					valueField = meta.data[index];
				}
				dataset[`${mes.pos}_${mes.id}_field`] = valueField;
				dataset[`${mes.pos}_${mes.id}_meta`] = valueMeta;
			}

			table.push(dataset);
		}

		return (
			<Row
				key={category + "-" + index}
				className={cn("row-dashboard-eficacia", {
					"d-none": this.state.activeButton[category] !== "tabela_indicadores",
				})}
			>
				<Col className="col-description">
					<Table bordered>
						<thead>
							<tr>
								<th colSpan="2">Objetivos</th>
							</tr>
						</thead>
						<tbody>
							{table.map((item, key) => {
								return (
									<tr key={key}>
										<td>{item.title}</td>
										<td className="meta-efetivo">
											<Table>
												<tbody>
													<tr className="color-dark">
														<td className="border-top-0 border-right-0 border-left-0">
															Meta
														</td>
													</tr>
													<tr className="color-light">
														<td className="border-right-0 border-bottom-0 border-left-0">
															Efetivo
														</td>
													</tr>
												</tbody>
											</Table>
										</td>
									</tr>
								);
							})}
						</tbody>
					</Table>
				</Col>
				<Col className="col-months" id="col-months">
					<Table bordered>
						<thead className="text-center">
							<tr>
								{this.state.meses.map((item, key) => {
									let mes = item.id.toString().toLowerCase();

									return (
										<th key={key} id={mes} className="month title">
											{item.title}
										</th>
									);
								})}
							</tr>
						</thead>
						<tbody className="text-right">
							{table.map((item, key) => {
								return (
									<tr key={key}>{this.renderColumnsOfValues(item, key)}</tr>
								);
							})}
						</tbody>
					</Table>
				</Col>
			</Row>
		);
	};

	renderTabTitle = (pageData, index) => {
		return (
			<NavItem key={index}>
				<NavLink
					className={cn({ active: this.state.activeTab === pageData.id })}
					onClick={async (e) => await this.toggleTab(e, pageData.id)}
				>
					{pageData.title}
				</NavLink>
			</NavItem>
		);
	};

	renderTabBody = (pageData, index) => {
		let btnClass = `btn-${pageData.id}`;

		return (
			<TabPane
				tabId={pageData.id}
				className={"tab-pane-margin mt-2"}
				key={index}
			>
				<Row>
					<Col className="buttons mb-3">
						<Button
							size="md"
							type="button"
							className={cn(`mr-2 ${btnClass}`, {
								deactive:
									this.state.activeButton[pageData.id] === "tabela_indicadores",
							})}
							onClick={async (e) =>
								await this.toggleView(e, pageData.id, "graficos")
							}
						>
							<i className="fa fa-bar-chart-o" /> Gráficos
						</Button>
						<Button
							size="md"
							type="button"
							className={cn(`m-0 ${btnClass}`, {
								deactive: this.state.activeButton[pageData.id] === "graficos",
							})}
							onClick={async (e) =>
								await this.toggleView(e, pageData.id, "tabela_indicadores")
							}
						>
							<i className="fa fa-table" /> Tabela de Indicadores
						</Button>
					</Col>
				</Row>
				{this.renderCarousselChart(pageData.id, pageData.data, index)}
				{this.renderTabelaIndicadores(pageData.id, index)}
			</TabPane>
		);
	};

	renderDash = () => {
		return (
			<div className={"container-tabs-render"}>
				<Nav tabs>{this.state.dashboard.map(this.renderTabTitle)}</Nav>
				<TabContent activeTab={this.state.activeTab}>
					{this.state.dashboard.map(this.renderTabBody)}
				</TabContent>
			</div>
		);
	};

	renderModalEdit = () => {
		if (this.state.modalEdit) {
			return (
				<ModalEditMeta
					open={this.state.modalEdit}
					data={this.state.dataModalEdit}
					resource={this.state.dataModalEditResource}
					perspectiva={this.state.dataModalEditPerspectiva}
					meses={this.state.meses}
					saveModal={this.saveModalEdited}
					toggle={this.toggleModal}
					reset={this.reset}
					mesesAvaliacao={mesesAvaliacao}
					redirect={this.redirect}
				/>
			);
		}

		return null;
	};

	loaded = () => {
		const btnVoltar = (
			<Button
				onClick={() => this.redirect("diretrizes")}
				data-placement="top"
				title="Voltar para Diretrizes"
				className="btn btn-sm btn-info mr-1 float-right"
			>
				<i className="fa fa-arrow-left" /> Voltar
			</Button>
		);

		return (
			<div className="animated fadeIn">
				<Row>
					<Col>
						<Card className="card-accent-secondary">
							<CardHeader>
								<strong>Dashboard da Eficácia</strong> -{" "}
								{this.state.exercicio_definido}
								{btnVoltar}
							</CardHeader>
							<CardBody>{this.renderDash()}</CardBody>
							<CardFooter>{btnVoltar}</CardFooter>
						</Card>
					</Col>
				</Row>
				<br />
				{this.renderModalEdit()}
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

export default Dashboard_Eficacia;
