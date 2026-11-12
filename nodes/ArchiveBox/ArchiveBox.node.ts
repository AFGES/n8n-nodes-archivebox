import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { archiveResultDescription } from './resources/archiveResult';
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
		credentials: [{ name: 'archiveBoxApi', required: true }],
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
			...archiveResultDescription,
			...snapshotDescription,
			...tagDescription,
			...urlDescription,
		],
	};
}
