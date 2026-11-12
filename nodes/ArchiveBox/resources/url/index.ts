import type { INodeProperties } from 'n8n-workflow';

const showOnlyForUrl = { resource: ['url'] };
const showForAdd = { ...showOnlyForUrl, operation: ['add'] };

export const urlDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForUrl },
		options: [
			{
				name: 'Add',
				value: 'add',
				action: 'Add urls',
				description: 'Add URLs to ArchiveBox for archiving',
				routing: {
					// Full response is kept: on failure `result` is empty and the reasons are in
					// `success`, `errors` and `stderr`.
					request: { method: 'POST', url: '/cli/add' },
				},
			},
		],
		default: 'add',
	},
	{
		displayName: 'URLs',
		name: 'urls',
		type: 'string',
		typeOptions: { rows: 4 },
		displayOptions: { show: showForAdd },
		default: '',
		required: true,
		placeholder: 'https://example.com',
		description: 'URLs to archive, separated by new lines or commas',
		routing: {
			send: {
				type: 'body',
				property: 'urls',
				value: '={{ String($value).split(/[\\n,]/).map((u) => u.trim()).filter((u) => u !== "") }}',
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: { show: showForAdd },
		default: {},
		options: [
			{
				displayName: 'Depth',
				name: 'depth',
				type: 'number',
				typeOptions: { minValue: 0 },
				default: 0,
				description: 'Crawl depth (0 archives only the given URLs)',
				routing: { send: { type: 'body', property: 'depth' } },
			},
			{
				displayName: 'Index Only',
				name: 'index_only',
				type: 'boolean',
				default: false,
				description: 'Whether to index the URLs without archiving them',
				routing: { send: { type: 'body', property: 'index_only' } },
			},
			{
				displayName: 'Max URLs',
				name: 'max_urls',
				type: 'number',
				typeOptions: { minValue: 0 },
				default: 0,
				description: 'Maximum number of URLs to add (0 for no limit)',
				routing: { send: { type: 'body', property: 'max_urls' } },
			},
			{
				displayName: 'Only New',
				name: 'only_new',
				type: 'boolean',
				default: true,
				description: 'Whether to skip URLs that were already archived',
				routing: { send: { type: 'body', property: 'only_new' } },
			},
			{
				displayName: 'Overwrite',
				name: 'overwrite',
				type: 'boolean',
				default: false,
				description: 'Whether to overwrite existing archived output',
				routing: { send: { type: 'body', property: 'overwrite' } },
			},
			{
				displayName: 'Parser',
				name: 'parser',
				type: 'string',
				default: 'auto',
				description: 'Parser used to extract URLs from the input',
				routing: { send: { type: 'body', property: 'parser' } },
			},
			{
				displayName: 'Persona',
				name: 'persona',
				type: 'string',
				default: 'Default',
				description: 'Browser persona to use for archiving',
				routing: { send: { type: 'body', property: 'persona' } },
			},
			{
				displayName: 'Plugins',
				name: 'plugins',
				type: 'string',
				default: '',
				description: 'Comma-separated list of plugins to run',
				routing: { send: { type: 'body', property: 'plugins' } },
			},
			{
				displayName: 'Tags',
				name: 'tag',
				type: 'string',
				default: '',
				description: 'Comma-separated tags to apply to the snapshots',
				routing: { send: { type: 'body', property: 'tag' } },
			},
			{
				displayName: 'Update',
				name: 'update',
				type: 'boolean',
				default: false,
				description: 'Whether to re-archive URLs that already exist',
				routing: { send: { type: 'body', property: 'update' } },
			},
		],
	},
];
