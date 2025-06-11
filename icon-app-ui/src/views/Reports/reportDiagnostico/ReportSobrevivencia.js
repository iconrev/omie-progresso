import React, { useEffect } from "react";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Col,
	Row,
	Label,
} from "reactstrap";
import GaugeChart from "react-gauge-chart";

const gauge_color = {
	colors: ["#EA4228", "#F5CD19", "#5BE12C"],
};

const cellEditProp = {
	mode: "click",
	blurToSave: true,
};

export default function ReportSobrevivencia(props) {
	const { params } = props;

	const selectData = ["Sim", "+/-", "Não"];

	const questionario = params.survival ? params.survival : [];

	if (questionario.length == 0) {
		return <div>Sobrevivencia invalido</div>;
	}

	const renderChart = (title, data, texto) => {
		return (
			<Col xs="12" className={"p-2"}>
				<div>
					<Card className={"h-100"} style={{ margin: '20px auto', width: '615px' }}>
						<CardHeader>
							<Row className={"align-items-center"}>
								<Col>{title}</Col>
							</Row>
						</CardHeader>
						<CardBody className={""}>
							<GaugeChart
								className="chart-wrapper"
								id={"gauge-chart"}
								textColor="#212121"
								needleColor="#CDC9C9"
								needleBaseColor="#CDC9C9"
								percent={data}
								colors={gauge_color.colors}
							/>
							<blockquote className={"p-0 m-0"}>
								<Label
									style={{
										fontSize: 14,
										fontFamily: "Arial",
										fontStyle: "italic",
									}}
								>
									{texto}
								</Label>
							</blockquote>
						</CardBody>
					</Card>
				</div>
			</Col>
		);
	};

	return (
		<>
			<div>Sobrevivênvia</div>
			<BootstrapTable
				data={questionario.questions}
				version="4"
				striped
				hover
				// options={this.options}
				cellEdit={cellEditProp}
			>
				<TableHeaderColumn isKey dataField="id" hidden>
					Id
				</TableHeaderColumn>
				<TableHeaderColumn dataField="descricao" width="550px" editable={false}>
					Perguntas
				</TableHeaderColumn>
				<TableHeaderColumn
					dataField="resposta"
					width="100px"
					editable={{
						type: "select",
						options: { values: selectData },
					}}
				>
					Respostas
				</TableHeaderColumn>
			</BootstrapTable>
			{
				renderChart('Sobrevivência', questionario.gauge.percentual, questionario.gauge.texto)
			}
		</>
	);
}
