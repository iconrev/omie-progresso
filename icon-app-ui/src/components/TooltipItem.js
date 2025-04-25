import React from "react";
import { Tooltip, Button } from "reactstrap";
class TooltipItem extends React.Component {
	constructor(props) {
		super(props);

		this.toggle = this.toggle.bind(this);
		this.state = {
			tooltipOpen: false,
		};
	}

	toggle() {
		this.setState({
			tooltipOpen: !this.state.tooltipOpen,
		});
	}

	render() {
		return (
			<span>
				<Button
					className="btn btn-sm btn-info mr-1 float-right"
					color="secondary"
					id={"Tooltip-" + this.props.id}
					onClick={this.props.onClick}
				>
					<i className={this.props.item.icon} /> {this.props.item.text}
				</Button>
				<Tooltip
					placement={this.props.item.placement}
					isOpen={this.state.tooltipOpen}
					target={"Tooltip-" + this.props.id}
					toggle={this.toggle}
				>
					{this.props.item.content}
				</Tooltip>
			</span>
		);
	}
}

export default TooltipItem;
