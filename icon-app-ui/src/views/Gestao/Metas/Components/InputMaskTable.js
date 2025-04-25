import { Component } from "react";
import PropTypes from "prop-types";
import { InputAdapter, TextMask } from "react-text-mask-hoc";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import { Row, Col } from "reactstrap";

class InputMaskTable extends Component {
	static propTypes = {
		// value: PropTypes.string,
		onUpdate: PropTypes.func.isRequired,
	};

	getValue() {
		if (typeof this.value === "string") {
			this.value = this.value.replace("R$ ", "");
			this.value = this.value.replace(/\./g, "");
			this.value = this.value.replace(",", ".");
		}

		if (/^([-+])?([0-9]+(\.[0-9]+)?|Infinity)$/.test(this.value)) {
			this.value = Number(this.value);
		} else {
			this.value = NaN;
		}

		return this.value;
	}

	handleChange = async (event) => {
		event.preventDefault();

		this.value = event.target.value;
	};

	render() {
		let { value, onUpdate, keyId } = this.props;
		this.value = value;

		const mask = createNumberMask({
			prefix: "R$ ",
			thousandsSeparatorSymbol: ".",
			integerLimit: 10,
			allowDecimal: true,
			decimalSymbol: ",",
			decimalLimit: 2,
		});

		return (
			<div>
				<Row>
					<Col>
						<TextMask
							Component={InputAdapter}
							value={value}
							mask={mask}
							guide
							onChange={this.handleChange}
							className="form-control"
							key={keyId}
						/>
					</Col>
				</Row>
				<Row>
					<Col>
						<button
							key="submit"
							className="btn btn-secondary"
							onClick={() => onUpdate(this.getValue())}
						>
							Alterar
						</button>
					</Col>
				</Row>
			</div>
		);
	}
}

export default InputMaskTable;
