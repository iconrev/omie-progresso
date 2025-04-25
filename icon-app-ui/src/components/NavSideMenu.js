import React, { Suspense } from "react";
import {
	AppSidebarNav,
	AppSidebar,
	AppSidebarForm,
	AppSidebarHeader,
	AppSidebarMinimizer,
} from "@coreui/react";
import userService from "../service/UserService";
import { stringToDate } from "../views/Utils/format-date";

const NavSideMenu = React.memo(function NavSideMenu() {
	const nav = {
		items: [
			{
				name: "Dashboard",
				url: "/dashboard",
				icon: "icon-grid",
			},
			{
				name: "Gerenciar Empresas",
				url: "/empresas",
				icon: "icon-settings",
			},
			{
				name: "Playlist Simbiose",
				url: "/playlist",
				icon: "fa fa-play-circle",
				badge: {
					expire: "2022-07-31",
					variant: "success",
					text: "NOVO",
				},
			},
		],
	};

	const user = userService.getUser();

	if (user.profile === "associado" || user.profile === "omie" || user.isAdmin) {
		nav.items.push({
			name: "Área do Associado",
			url: "/associado",
			icon: "fa fa-feed",
		});
	}

	if ((user.profile === "user_default" && user.isContador) || user.isAdmin) {
		nav.items.push({
			name: "Torne-se Associado",
			url: "/upgrade",
			icon: "fa fa-rocket",
			badge: {
				variant: "success",
				text: "UPGRADE",
			},
		});
	}

	if (user.isAdmin) {
		nav.items.push({
			name: "Painel Administrativo",
			url: "/administrativo",
			icon: "fa fa-cubes",
		});
	}

	const navParsed = {
		items: [],
	};

	nav.items.map((item) => {
		if (item.badge && item.badge.text === "NOVO") {
			const dateParsed = stringToDate(item.badge.expire);
			if (dateParsed < new Date()) {
				return navParsed.items.push({
					name: item.name,
					url: item.url,
					icon: item.icon,
				});
			}
		}

		return navParsed.items.push(item);
	});

	return (
		<AppSidebar fixed display="">
			<AppSidebarHeader />
			<AppSidebarForm />
			<Suspense>
				<AppSidebarNav navConfig={navParsed} />
			</Suspense>
			<AppSidebarMinimizer />
		</AppSidebar>
	);
});

export default NavSideMenu;
