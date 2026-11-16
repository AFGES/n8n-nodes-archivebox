import {
	NodeConnectionTypes,
	type ICredentialsDecrypted,
	type ICredentialTestFunctions,
	type IDataObject,
	type INodeCredentialTestResult,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';
import { archiveResultDescription } from './resources/archiveResult';
import {
	isHtmlResponse,
	NOT_JSON_DESCRIPTION,
	NOT_JSON_MESSAGE,
	withJsonGuard,
} from './resources/shared/jsonGuard';
import { snapshotDescription } from './resources/snapshot';
import { tagDescription } from './resources/tag';
import { urlDescription } from './resources/url';

export class ArchiveBox implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ArchiveBox',
		name: 'archiveBox',
		icon: { light: 'file:archivebox.svg', dark: 'file:archivebox.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the ArchiveBox API',
		defaults: {
			name: 'ArchiveBox',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'archiveBoxApi', required: true, testedBy: 'archiveBoxApiTest' }],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl.replace(/\\/$/, "")}}/api/v1',
			skipSslCertificateValidation: '={{$credentials.ignoreSslIssues}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Archive Result',
						value: 'archiveResult',
					},
					{
						name: 'Snapshot',
						value: 'snapshot',
					},
					{
						name: 'Tag',
						value: 'tag',
					},
					{
						name: 'URL',
						value: 'url',
					},
				],
				default: 'snapshot',
			},
			// Every operation fails on an HTML answer (SSO login page) instead of outputting it
			...withJsonGuard([
				...archiveResultDescription,
				...snapshotDescription,
				...tagDescription,
				...urlDescription,
			]),
		],
	};

	methods = {
		credentialTest: {
			// Programmatic, not the credential's declarative `test`: that one counts any 2xx as a
			// success, including the login page an SSO reverse proxy serves in place of the API
			async archiveBoxApiTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				const data = (credential.data ?? {}) as {
					baseUrl?: string;
					apiKey?: string;
					ignoreSslIssues?: boolean;
				};
				const baseUrl = (data.baseUrl ?? '').replace(/\/$/, '');
				try {
					// ICredentialTestFunctions exposes no other HTTP helper than `request` (n8n-workflow 2.x)
					// eslint-disable-next-line @n8n/community-nodes/no-deprecated-workflow-functions
					const response = await this.helpers.request({
						method: 'GET',
						uri: `${baseUrl}/api/v1/core/tags`,
						qs: { limit: 1 },
						headers: {
							Accept: 'application/json',
							'X-ArchiveBox-API-Key': data.apiKey ?? '',
						},
						rejectUnauthorized: data.ignoreSslIssues !== true,
						resolveWithFullResponse: true,
						simple: false,
					});
					const statusCode = Number(response.statusCode);
					if (isHtmlResponse(response.headers as IDataObject, response.body)) {
						return { status: 'Error', message: `${NOT_JSON_MESSAGE}. ${NOT_JSON_DESCRIPTION}` };
					}
					if (statusCode === 401 || statusCode === 403) {
						return {
							status: 'Error',
							message: 'ArchiveBox refused the API key: it must be the token of a superuser',
						};
					}
					if (statusCode < 200 || statusCode >= 300) {
						return { status: 'Error', message: `ArchiveBox answered HTTP ${statusCode}` };
					}
				} catch (error) {
					return { status: 'Error', message: (error as Error).message };
				}
				return { status: 'OK', message: 'Connection successful' };
			},
		},
	};
}
