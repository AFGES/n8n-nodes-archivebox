import type { INodeProperties } from 'n8n-workflow';
import { paginationProperties } from '../shared/pagination';

const showOnlyForArchiveResult = { resource: ['archiveResult'] };

const queryString = (property: string) => ({
	send: { type: 'query' as const, property, value: '={{$value || undefined}}' },
});

export const archiveResultDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForArchiveResult },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get an archive result',
				description: 'Retrieve an archive result',
				routing: {
					request: { method: 'GET', url: '=/core/archiveresult/{{$parameter.archiveResultId}}' },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many archive results',
				description: 'Retrieve many archive results',
				routing: {
					request: { method: 'GET', url: '/core/archiveresults' },
				},
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Archive Result ID',
		name: 'archiveResultId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { ...showOnlyForArchiveResult, operation: ['get'] } },
		description: 'ID of the archive result',
	},
	...paginationProperties('archiveResult', 'getAll'),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { ...showOnlyForArchiveResult, operation: ['getAll'] } },
		options: [
			{
				displayName: 'Created After',
				name: 'created_at__gte',
				type: 'dateTime',
				default: '',
				description: 'Only results created on or after this date',
				routing: queryString('created_at__gte'),
			},
			{
				displayName: 'Created Before',
				name: 'created_at__lt',
				type: 'dateTime',
				default: '',
				description: 'Only results created before this date',
				routing: queryString('created_at__lt'),
			},
			{
				displayName: 'Hook Name',
				name: 'hook_name',
				type: 'string',
				default: '',
				description: 'Only results produced by this hook',
				routing: queryString('hook_name'),
			},
			{
				displayName: 'Output',
				name: 'output_str',
				type: 'string',
				default: '',
				description: 'Filter by output string',
				routing: queryString('output_str'),
			},
			{
				displayName: 'Plugin',
				name: 'plugin',
				type: 'string',
				default: '',
				description: 'Only results of this plugin (e.g. wget, singlefile)',
				routing: queryString('plugin'),
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search term',
				routing: queryString('search'),
			},
			{
				displayName: 'Snapshot ID',
				name: 'snapshot_id',
				type: 'string',
				default: '',
				description: 'Only results of this snapshot',
				routing: queryString('snapshot_id'),
			},
			{
				displayName: 'Snapshot Tag',
				name: 'snapshot_tag',
				type: 'string',
				default: '',
				description: 'Only results of snapshots with this tag',
				routing: queryString('snapshot_tag'),
			},
			{
				displayName: 'Snapshot URL',
				name: 'snapshot_url',
				type: 'string',
				default: '',
				description: 'Only results of snapshots with this URL',
				routing: queryString('snapshot_url'),
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Backoff', value: 'backoff' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'No Results', value: 'noresults' },
					{ name: 'Paused', value: 'paused' },
					{ name: 'Queued', value: 'queued' },
					{ name: 'Skipped', value: 'skipped' },
					{ name: 'Started', value: 'started' },
					{ name: 'Succeeded', value: 'succeeded' },
				],
				default: 'succeeded',
				description: 'Only archive results with this status',
				routing: queryString('status'),
			},
		],
	},
];
