import { Component } from "react";
import {
	Card,
	Row,
	Col,
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from "reactstrap";

class CustomCard extends Component {
	constructor(props) {
		super(props);

		this.state = {
			dropdownOpen: false,
		};
	}

	toggleDropdown = async () => {
		await this.setState({
			dropdownOpen: !this.state.dropdownOpen,
		});
	};

	renderDropDown = () => {
		let dropdown = null;
		if (this.props.dropdown) {
			dropdown = (
				<Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggleDropdown}>
					<DropdownToggle className="custom-toggle" nav>
						<i className="fa fa-cog fa-2x" style={{ color: "gray" }} />
					</DropdownToggle>
					<DropdownMenu>
						{this.props.dropdown.map((item, index) => {
							return (
								<DropdownItem key={index} onClick={item.onClick}>
									{item.title}
								</DropdownItem>
							);
						})}
					</DropdownMenu>
				</Dropdown>
			);
		}

		return dropdown;
	};

	renderChart = () => {
		let chart = null;

		if (this.props.chart) {
			chart = (
				<Row>
					<Col>{this.props.chart}</Col>
				</Row>
			);
		}

		return chart;
	};

	render() {
		let color = "bg-" + this.props.color;
		let perc = 100;
		if (this.props.perc) {
			perc = this.props.perc;
		}
		let subtitle = this.props.subtitle ? (
			this.props.subtitle
		) : (
			<div>&nbsp;</div>
		);

		return (
			<Card body key={this.props.keyValue}>
				<div className="card-block">
					<Row>
						<Col sm={this.props.dropdown ? 9 : 12}>
							<div>{this.props.title}</div>
							<div className="h3 m-0">{this.props.value}</div>
						</Col>
						<Col sm={3} className={"text-right p-0 m-0"}>
							{this.renderDropDown()}
						</Col>
					</Row>
					<Row>
						<Col>
							<div className="progress progress-xs my-1">
								<div
									className={"progress-bar " + color}
									style={{ width: perc + "%" }}
									aria-valuemin="0"
									aria-valuemax="100"
								/>
							</div>
							<small className="text-muted">{subtitle}</small>
						</Col>
					</Row>
					{this.renderChart()}
				</div>
			</Card>
		);
	}
}

export default CustomCard;
