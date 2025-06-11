import { Component } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { toast } from "react-toastify";
import ApiBase from "../../service/api_base";
import BadgeCompanyRole from "../../components/BadgeCompanyRole";

const Api_Base = new ApiBase();

class Convites extends Component {
	constructor(props) {
		super(props);
		this.toggleModal = this.toggleModal.bind(this);
		this.accept = this.accept.bind(this);

		this.state = {
			modal: false,
			active: true,
			isLoading: false,
		};
	}

	componentDidMount() {
		this.toggleModal();
	}

	toggleModal() {
		this.setState({
			modal: !this.state.modal,
		});
	}

	handleCancel = (e) => {
		e.preventDefault();
		this.toggleModal();
	};

	async accept(e, convite, status) {
		e.preventDefault();

		await this.setState({
			isLoading: true,
		});

		const payload = {
			empresa: convite.companyId,
			aceito: status,
		};
		await Api_Base.post(`/cadastros/empresas/convites/aceite`, payload)
			.then(async (response) => {
				const { status, message } = response.data;

				if (status === "success") {
					await this.props.loadData();
					toast.success(message);
				} else {
					toast.error(message);
				}
			})
			.catch(async (err) => {
				console.error(err);

				const { status, message } = err.response.data;
				toast.error(message);

				if (status === "duplicated_cnpj") {
					await this.props.loadData();
				}
			});

		await this.setState({
			isLoading: false,
		});
	}

	table = () => {
		return (
			<table className={"table table-hover table-outline mb-0"}>
				<thead className="thead-light">
					<tr>
						<th className="text-center" width={"25%"}>
							Convidado por
						</th>
						<th className="text-center" width={"25%"}>
							Empresa
						</th>
						<th className="text-center" width={"25%"}>
							Perfil
						</th>
						<th className="text-center" width={"25%"} />
					</tr>
				</thead>
				<tbody>
					{this.props.convites.map((convite, index) => {
						return (
							<tr key={index}>
								<td className="text-center">
									<div>{convite.hostName}</div>
									<div className={"small text-muted"}>{convite.hostEmail}</div>
								</td>
								<td className="text-center">
									<div>{convite.companyName}</div>
									<div className={"small text-muted"}>
										{convite.companyCnpj}
									</div>
								</td>
								<td className="text-center">
									<BadgeCompanyRole role={convite.role} />
								</td>
								<td className="text-center">
									<Button
										color="success"
										style={{ marginRight: "10px" }}
										disabled={this.state.isLoading}
										loading={this.state.isLoading.toString()}
										onClick={async (e) => await this.accept(e, convite, true)}
										title={"Aceitar"}
									>
										<span className="cui-thumb-up" />
									</Button>
									<Button
										color="danger"
										disabled={this.state.isLoading}
										loading={this.state.isLoading.toString()}
										onClick={async (e) => await this.accept(e, convite, false)}
										title={"Recusar"}
									>
										<span className="cui-thumb-down" />
									</Button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		);
	};

	render() {
		const plural = this.props.convites.length > 1 ? "s" : "";

		return (
			<div className="animated fadeIn">
				<div>
					<Modal
						isOpen={this.state.modal}
						toggle={this.toggleModal}
						backdrop={"static"}
						keyboard={false}
						size="lg"
						loading={this.state.isLoading.toString()}
						disabled={this.state.isLoading}
						className={this.props.className}
					>
						<ModalHeader toggle={this.toggleModal}>
							Novo{plural} convite{plural}
						</ModalHeader>
						<ModalBody>{this.table()}</ModalBody>
						<ModalFooter>
							<Button outline color="dark" onClick={this.handleCancel}>
								Avaliar mais tarde
							</Button>
						</ModalFooter>
					</Modal>
				</div>
			</div>
		);
	}
}

export default Convites;
