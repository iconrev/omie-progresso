import { Component } from "react";
import {
	Popover,
	PopoverHeader,
	PopoverBody,
	Row,
	Col,
	Container,
	Button,
} from "reactstrap";

class ConfirmPopUp extends Component {
	constructor(props) {
		super(props);
		this.togglePopover = this.togglePopover.bind(this);
		this.onClickSim = this.onClickSim.bind(this);
		this.state = {
			popoverOpen: false,
		};
	}

	togglePopover() {
		this.setState({ popoverOpen: !this.state.popoverOpen });
	}

	onClickSim(e) {
		e.preventDefault();
		let empresa,
			email,
			status = this.props.data;
		this.props.confirm(e, empresa, email, status);
		this.togglePopover();
	}

	render() {
		return (
			<Popover
				placement={this.props.placement}
				isOpen={this.state.popoverOpen}
				target={this.props.target}
				toggle={this.togglePopover}
			>
				<PopoverHeader>Confirmação</PopoverHeader>
				<PopoverBody>
					<Container>
						<Row>
							<Col md={"12"}>
								<p>{this.props.text}</p>
							</Col>
						</Row>
						<Row className="text-center">
							<Col md={"12"} className="align-content-right">
								<Button color="success" onClick={(e) => this.onClickSim(e)}>
									Sim
								</Button>
								{"   "}
								<Button color="danger" onClick={this.togglePopover}>
									Não
								</Button>
							</Col>
						</Row>
					</Container>
				</PopoverBody>
			</Popover>
		);
	}
}

export default ConfirmPopUp;
