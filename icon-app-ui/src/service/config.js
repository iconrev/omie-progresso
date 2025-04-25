// Default to dev if not set
const stage =
	typeof process.env.REACT_APP_STAGE === "undefined"
		? "qa"
		: process.env.REACT_APP_STAGE;

const config = {
	"prod-local": {
		cognito: {
			REGION: "us-east-1",
			USER_POOL_ID: "us-east-1_FkCeE7Wft",
			APP_CLIENT_ID: "58rsg5g8k0904sksi804dfor2e",
			IDENTITY_POOL_ID: "us-east-1:f9082a0b-738e-41c5-b5d1-1fdfbc6168cf",
		},
		storage: {
			BUCKET: "icon-images",
			REGION: "us-east-1",
			IDENTITY_POOL_ID: "us-east-1:e9c7ed41-4c37-4da0-97de-669e8a579b98",
		},
		apiGateway: {
			"api-base": {
				URL: "http://localhost:4444/prod-local/api/",
				REGION: "sa-east-1",
			},
			"api-externo": {
				URL: "http://localhost:4459/prod-local/api/",
				REGION: "sa-east-1",
			},
			"api-interno": {
				URL: "http://localhost:4446/prod-local/api/",
				REGION: "sa-east-1",
			},
			"api-metas": {
				URL: "http://localhost:4449/prod-local/api/",
				REGION: "sa-east-1",
			},
		},
	},
	"qa-local": {
		cognito: {
			REGION: "us-east-1",
			USER_POOL_ID: "us-east-1_1jlnEhdXW",
			APP_CLIENT_ID: "3dd01cl8761uq0khc8hnf4cll1",
			IDENTITY_POOL_ID: "us-east-1:716f7ca9-78d6-428e-9ec4-b1ef4901a549",
		},
		storage: {
			BUCKET: "icon-images",
			REGION: "us-east-1",
			IDENTITY_POOL_ID: "us-east-1:e9c7ed41-4c37-4da0-97de-669e8a579b98",
		},
		apiGateway: {
			"api-base": {
				URL: "http://localhost:4444/qa-local/api/",
				REGION: "sa-east-1",
			},
			"api-externo": {
				URL: "http://localhost:4459/qa-local/api/",
				REGION: "sa-east-1",
			},
			"api-interno": {
				URL: "http://localhost:4446/qa-local/api/",
				REGION: "sa-east-1",
			},
			"api-metas": {
				URL: "http://localhost:4449/qa-local/api/",
				REGION: "sa-east-1",
			},
		},
	},
	qa: {
		cognito: {
			REGION: "us-east-1",
			USER_POOL_ID: "us-east-1_1jlnEhdXW",
			APP_CLIENT_ID: "3dd01cl8761uq0khc8hnf4cll1",
			IDENTITY_POOL_ID: "us-east-1:716f7ca9-78d6-428e-9ec4-b1ef4901a549",
		},
		storage: {
			BUCKET: "icon-images",
			REGION: "us-east-1",
			IDENTITY_POOL_ID: "us-east-1:e9c7ed41-4c37-4da0-97de-669e8a579b98",
		},
		apiGateway: {
			"api-base": {
				URL: "https://api.simbiose-preview.omie.com.br/service-base/api/",
				REGION: "sa-east-1",
			},
			"api-externo": {
				URL: "https://api.simbiose-preview.omie.com.br/externo/api/",
				REGION: "sa-east-1",
			},
			"api-interno": {
				URL: "https://api.simbiose-preview.omie.com.br/interno/api/",
				REGION: "sa-east-1",
			},
			"api-metas": {
				URL: "https://api.simbiose-preview.omie.com.br/metas/api/",
				REGION: "sa-east-1",
			},
		},
	},
	prod: {
		cognito: {
			REGION: "us-east-1",
			USER_POOL_ID: "us-east-1_FkCeE7Wft",
			APP_CLIENT_ID: "58rsg5g8k0904sksi804dfor2e",
			IDENTITY_POOL_ID: "us-east-1:f9082a0b-738e-41c5-b5d1-1fdfbc6168cf",
		},
		storage: {
			BUCKET: "icon-images",
			REGION: "us-east-1",
			IDENTITY_POOL_ID: "us-east-1:e9c7ed41-4c37-4da0-97de-669e8a579b98",
		},
		apiGateway: {
			"api-base": {
				URL: "https://api.simbiose.omie.com.br/service-base/api/",
				REGION: "sa-east-1",
			},
			"api-externo": {
				URL: "https://api.simbiose.omie.com.br/externo/api/",
				REGION: "sa-east-1",
			},
			"api-interno": {
				URL: "https://api.simbiose.omie.com.br/interno/api/",
				REGION: "sa-east-1",
			},
			"api-metas": {
				URL: "https://api.simbiose.omie.com.br/metas/api/",
				REGION: "sa-east-1",
			},
		},
	},
};

export { stage };
export default config[stage];
