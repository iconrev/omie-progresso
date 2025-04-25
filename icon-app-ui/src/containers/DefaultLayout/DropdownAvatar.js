import { useState } from "react";
import {
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from "reactstrap";
import { logoutUsuario } from "../../service/services";

const DropdownAvatar = (props) => {
	const [dropdownOpen, setDropdownOpen] = useState(false);

	const toggle = () => setDropdownOpen((prevState) => !prevState);

	const handleLogout = async () => {
		await logoutUsuario();
		return props.history.push("/");
	};

	return (
		<Dropdown isOpen={dropdownOpen} toggle={toggle}>
			<DropdownToggle nav>
				<i className="fa fa-user-circle-o fa-3x" />
			</DropdownToggle>
			<DropdownMenu>
				<DropdownItem header tag="div" className="text-center">
					<strong>Conta</strong>
				</DropdownItem>
				<DropdownItem href="#/profile">
					<i className="fa fa-user" />
					Perfil
				</DropdownItem>
				<DropdownItem onClick={handleLogout}>
					<i className="fa fa-lock" />
					Sair
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
};

export default DropdownAvatar;
