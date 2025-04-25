/* eslint-disable jsx-a11y/alt-text */
import { PureComponent } from "react";
import PropTypes from "prop-types";
import logo from "../../assets/img/brand/omie_logo_novo.png";

const propTypes = {
	children: PropTypes.node,
};

class DefaultFooter extends PureComponent {
	render() {
		const currentYear = new Date().getFullYear();
		const year = currentYear < 2022 ? 2022 : currentYear;

		return (
			<>
				<span>
					&copy; {year} -{" "}
					<a
						href="https://www.omie.com.br/"
						target="_blank"
						rel="noopener noreferrer"
					>
						Omiexperience S/A
					</a>{" "}
					- Todos os direitos reservado
				</span>
				<div className="ml-auto">
					<img src={logo} style={{ width: 80, alt: "Omie", marginRight: 80 }} />
				</div>
			</>
		);
	}
}

DefaultFooter.propTypes = propTypes;

export default DefaultFooter;
