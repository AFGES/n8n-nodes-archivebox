import type { IAuthenticateGeneric, ICredentialType, INodeProperties, Icon } from 'n8n-workflow';

export class ArchiveBoxApi implements ICredentialType {
	name = 'archiveBoxApi';
	displayName = 'ArchiveBox API';
	icon: Icon = {
		light: 'file:../nodes/ArchiveBox/archivebox.svg',
		dark: 'file:../nodes/ArchiveBox/archivebox.dark.svg',
	};
	documentationUrl = 'https://github.com/AFGES/n8n-nodes-archivebox?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'http://archivebox:8000',
			required: true,
			description: 'Base URL of your ArchiveBox instance, without a trailing /api',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description:
				'API token of a superuser. Create it in the admin at /admin/api/apitoken/ or with POST /api/v1/auth/get_api_token.',
		},
		{
			displayName: 'Ignore SSL Issues (Insecure)',
			name: 'ignoreSslIssues',
			type: 'boolean',
			default: false,
			description:
				'Whether to connect even if SSL certificate validation is not possible (self-hosted instances)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-ArchiveBox-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	// No declarative `test`: n8n would prefer it over the node's `testedBy` and count an SSO login
	// page (HTML, 200) as a success. Tested by ArchiveBox.node.ts methods.credentialTest instead
}
