import { Component } from "react";
import { Badge, Button, Col, Label, Row } from "reactstrap";

class CardMetaSugestao extends Component {
	copiarValor = async (campo, valor) => {
		let event = {
			target: {
				id: campo,
				value: valor,
			},
		};

		await this.props.handleChange(event);
	};

	render() {
		let buttonAccept = (field, value) => {
			return (
				<Button
					outline
					color="primary"
					onClick={() => this.copiarValor(field, value)}
				>
					Aceitar
				</Button>
			);
		};

		let states = this.props.states;

		return (
			<Row>
				<Col
					xs="12"
					sm="5"
					md={"6"}
					lg="6"
					xl={"4"}
					className={"align-self-center"}
				>
					<Label>{this.props.label}</Label>
				</Col>
				<Col
					xs="12"
					sm="3"
					md={"2"}
					lg="2"
					className={"align-self-center text-center"}
				>
					<h3>
						<Badge color="success">{this.props.label_value}</Badge>
					</h3>
				</Col>
				<Col xs="12" sm="4" md={"2"} lg="2" className={"align-self-center"}>
					{buttonAccept(this.props.fieldMeta, states[this.props.fieldSugestao])}
				</Col>
			</Row>
		);
	}
}

export default CardMetaSugestao;
