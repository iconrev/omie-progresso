import React from "react";
import { AppNavbarBrand, AppSidebarToggler } from "@coreui/react";
import logo from "../../assets/img/brand/omie_logo_novo.png";
import smallLogo from "../../assets/img/brand/omie_logo_novo_small.png";
import DropdownAvatar from "./DropdownAvatar";

const DefaultHeader = ({ userLogo, ...props }) => {
	return (
		<React.Fragment>
			<AppSidebarToggler className="d-lg-none" display="md" mobile />
			<AppNavbarBrand
				href="/#/dashboard"
				full={{ src: userLogo || logo, width: 80, alt: "Logotipo" }}
				minimized={{
					src: userLogo || smallLogo,
					width: 30,
					height: 30,
					alt: "Logotipo",
				}}
			/>
			<AppSidebarToggler className="d-md-down-none" display="lg" />
			<div className={"d-flex flex-row-reverse ml-auto"}>
				<DropdownAvatar {...props} />
			</div>
		</React.Fragment>
	);
};

export default DefaultHeader;
