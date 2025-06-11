/* eslint-disable jsx-a11y/anchor-is-valid */
import { Component } from "react";
import SwotForm from "../Swot/SwotTable";

class Macro extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return <SwotForm swot={"macro"} {...this.props} />;
	}
}

export default Macro;
