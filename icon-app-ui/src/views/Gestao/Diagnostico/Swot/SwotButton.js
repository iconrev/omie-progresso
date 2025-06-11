import { Component } from "react";
import "../../../../assets/buttonswotstyle.scss";

class SwotButton extends Component {
	render() {
		return (
			<div
				id={"button-swot-click"}
				className="button-container button-flip3d-vertical2"
				onClick={this.props.onClick}
			>
				<div className="flipper flipper-flip3d-vertical2">
					<div className="button front">
						<i className="fa fa-plus-square-o" aria-hidden="true" />
					</div>
					<div className="button button-3d back">ANÁLISE SWOT</div>
				</div>
			</div>
		);
	}
}

export default SwotButton;
