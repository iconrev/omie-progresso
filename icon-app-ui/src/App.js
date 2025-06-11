import React, { Component } from "react";
import { HashRouter, Redirect, Route, Switch } from "react-router-dom";
import LoadingFullScreen from "./components/LoadingFullScreen";
import "./App.scss";
import userService from "./service/UserService";
import { LocalStorageService } from "./service/localStorageService";

const DefaultLayout = React.lazy(() => import(`./containers/DefaultLayout`));
const Login = React.lazy(() => import(`./views/Pages/Login`));
const LoginSSOCallback = React.lazy(() => import(`./views/Pages/Login/LoginOmieCallback`));
const Register = React.lazy(() => import("./views/Pages/Register"));
const Recover = React.lazy(() => import("./views/Pages/Recover"));
const Confirm = React.lazy(() => import("./views/Pages/Confirm"));
const ReportView = React.lazy(() => import("./views/Reports/index"));

const isAuthenticated = () => !!userService.isLogged();

const UnauthenticatedRoute = ({ component: Component, ...rest }) => {
	return (
		<Route
			{...rest}
			render={(props) =>
				!isAuthenticated() ? <Component {...props} /> : <Redirect to="/" />
			}
		/>
	);
};

const AuthenticatedRoute = ({ component: Component, ...rest }) => {
	return (
		<Route
			{...rest}
			render={(props) =>
				isAuthenticated() ? <Component {...props} /> : <Redirect to="/login" />
			}
		/>
	);
};

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoading: true,
		};
	}

	async componentDidMount() {
		await this.loadApp();
		this.setState({
			isLoading: false,
		});
	}

	loadApp = async () => {
		const token = LocalStorageService.getAccessToken();
		if (token) {
			userService.setLogged(true);
		} else {
			userService.setLogged(false);
		}
	};

	render() {
		if (this.state.isLoading) return <LoadingFullScreen />;

		return (
			<HashRouter>
				<React.Suspense fallback={<LoadingFullScreen />}>
					<Switch>
						<Route
							exact
							path="/reports"
							name="Gerar Graficos"
							render={(props) => <ReportView {...props} />}
						/>
						<UnauthenticatedRoute
							exact
							path="/login"
							name="Login Page"
							component={Login}
						/>
						<UnauthenticatedRoute
							exact
							path="/login/callback"
							name="Callback Login Page"
							component={LoginSSOCallback}
						/>
						<UnauthenticatedRoute
							exact
							path="/register"
							name="Register Page"
							component={Register}
						/>
						<UnauthenticatedRoute
							exact
							path="/recover"
							name="Register Page"
							component={Recover}
						/>
						<UnauthenticatedRoute
							exact
							path="/confirm"
							name="Confirm Page"
							component={Confirm}
						/>
						<AuthenticatedRoute
							path="/"
							name="Dashboard"
							component={DefaultLayout}
							{...this.props}
						/>
					</Switch>
				</React.Suspense>
			</HashRouter>
		);
	}
}

export default App;
