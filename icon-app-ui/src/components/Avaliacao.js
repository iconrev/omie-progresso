import { Component } from "react";
import Select from "react-select";

const Emoji = (props) => (
	<div className={"emoji-div"}>
		<span
			className="emoji-symbol"
			role="img"
			aria-label={props.label ? props.label : ""}
			aria-hidden={props.label ? "false" : "true"}
		>
			{props.symbol}
		</span>
		{"  "}
		{"  "}
		{"  "}
		<span className={"emoji-text"}>{props.text}</span>
	</div>
);

class Avaliacao extends Component {
	constructor(props) {
		super(props);

		this.onChange = this.onChange.bind(this);
		this.state = {
			readOnly: false,
		};
	}

	componentDidMount() {
		if (this.props.readOnly) {
			this.setState({
				readOnly: this.props.readOnly,
			});
		}
	}

	onChange = (event) => {
		event = {
			target: {
				value: event.value,
			},
		};

		if (!this.state.readOnly) {
			this.props.onChange(event);
		}
	};

	render() {
		const options = [
			{
				value: "Bom",
				label: <Emoji label="grinning face" symbol="😀" text={"Bom"} />,
			},
			{
				value: "Neutro",
				label: (
					<Emoji label="expressionless face" symbol="😑" text={"Neutro"} />
				),
			},
			{
				value: "Ruim",
				label: <Emoji label="frowning face" symbol="☹" text={"Ruim"} />,
			},
			{
				value: "NaoAvaliado",
				label: (
					<Emoji label="thinking face" symbol="🤔" text={"Não Avaliado"} />
				),
			},
		];

		return (
			<Select
				onChange={this.onChange}
				readOnly={this.state.readOnly || false}
				options={options}
				value={options.filter((option) => option.value === this.props.value)}
			/>
		);
	}
}

export default Avaliacao;
