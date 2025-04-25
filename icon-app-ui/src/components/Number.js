import { Component } from "react";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import { InputAdapter, TextMask } from "react-text-mask-hoc";

import NumberFormat from "react-number-format";

const noRealMask = createNumberMask({
	prefix: "",
	thousandsSeparatorSymbol: ".",
	integerLimit: 10,
	allowDecimal: true,
	decimalSymbol: ",",
	decimalLimit: 2,
});

// const realMask = createNumberMask({
//   prefix: "R$ ",
//   thousandsSeparatorSymbol: ".",
//   integerLimit: 10,
//   allowDecimal: true,
//   decimalSymbol: ",",
//   decimalLimit: 2,
// });

class Number extends Component {
	constructor(props) {
		super(props);

		this.onChange = this.onChange.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onKeyUp = this.onKeyUp.bind(this);

		this.state = {
			readOnly: false,
			disable: false,
			valor: "",
		};
	}

	componentDidMount() {
		if (this.props.readOnly) {
			this.setState({
				readOnly: this.props.readOnly,
			});
		}
	}

	/**
	 * Ocorre quando qualquer tecla é acionada no componente corrente
	 */
	onChange = (event) => {
		const onChange = this.props["onChange"];
		if (onChange) {
			this.props.onChange(event);
		}
	};

	/**
	 * Ocorre quando o foco é deixado do componente corrente
	 */
	onBlur = (event) => {
		const onBlur = this.props["onBlur"];
		if (onBlur) {
			this.props.onBlur(event);
		}
	};

	onKeyUp = (event) => {
		const onKeyUp = this.props["onKeyUp"];
		if (onKeyUp) {
			this.props.onKeyUp(event);
		}
	};
	render() {
		return (
			<>
				{this.props.real ? (
					// <TextMask
					//   Component={InputAdapter}
					//   id={this.props.id}
					//   value={this.props.value || 0.0}
					//   mask={realMask}
					//   guide
					//   onChange={this.onChange}
					//   onBlur={this.onBlur}
					//   onKeyUp={this.onKeyUp}
					//   className="form-control"
					//   disable={this.props.disable}
					//   readOnly={this.props.readOnly}
					// />
					<NumberFormat
						name={this.props.id}
						id={this.props.id}
						key={this.props.id}
						value={this.props.value}
						thousandSeparator={true}
						prefix={"R$ "}
						onBlur={this.onBlur}
						onChange={this.onChange}
						readOnly={this.props.readOnly}
						disable={this.props.disable}
						allowedDecimalSeparators={","}
						isNumericString={true}
						className="form-control"
					/>
				) : (
					<TextMask
						Component={InputAdapter}
						name={this.props.id}
						id={this.props.id}
						value={this.props.value}
						mask={noRealMask}
						guide
						onChange={this.onChange}
						onBlur={this.onBlur}
						onKeyUp={this.onKeyUp}
						className="form-control"
						readOnly={this.props.readOnly}
					/>
				)}
			</>
		);
	}
}

export default Number;
