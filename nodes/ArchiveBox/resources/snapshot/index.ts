import type { INodeProperties } from 'n8n-workflow';
import { paginationProperties } from '../shared/pagination';

const showOnlyForSnapshot = { resource: ['snapshot'] };

const tagsToArray =
	"={{ (() => { const t = String($value).split(',').map((s) => s.trim()).filter(Boolean); return t.length ? t : undefined; })() }}";

// Same as tagsToArray, but sends [] when empty so an update can clear all tags.
const tagsToArrayAllowEmpty =
	"={{ String($value).split(',').map((s) => s.trim()).filter(Boolean) }}";

const queryString = (property: string) => ({
	send: { type: 'query' as const, property, value: '={{$value || undefined}}' },
});

const bodyString = (property: string) => ({
	send: { type: 'body' as const, property, value: '={{$value || undefined}}' },
});

export const snapshotDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForSnapshot },
		options: [
			{
				name: 'Change State',
				value: 'changeState',
				action: 'Change the state of a snapshot',
				description: 'Pause, resume or cancel a snapshot',
				routing: {
					request: { method: 'PATCH', url: '=/core/snapshot/{{$parameter.snapshotId}}' },
				},
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create a snapshot',
				description: 'Archive a new URL',
				routing: { request: { method: 'POST', url: '/core/snapshots' } },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a snapshot',
				description: 'Delete a snapshot (deletion is queued)',
				routing: {
					request: { method: 'DELETE', url: '=/core/snapshot/{{$parameter.snapshotId}}' },
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a snapshot',
				description: 'Retrieve a snapshot',
				routing: {
					request: { method: 'GET', url: '=/core/snapshot/{{$parameter.snapshotId}}' },
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many snapshots',
				description: 'Retrieve many snapshots',
				routing: {
					request: { method: 'GET', url: '/core/snapshots' },
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a snapshot',
				description: 'Update the tags, status or retry time of a snapshot',
				routing: {
					request: { method: 'PATCH', url: '=/core/snapshot/{{$parameter.snapshotId}}' },
				},
			},
		],
		default: 'getAll',
	},

	// Snapshot ID (shared by single-record operations)
	{
		displayName: 'Snapshot ID',
		name: 'snapshotId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { ...showOnlyForSnapshot, operation: ['changeState', 'delete', 'get', 'update'] },
		},
		description: 'UUID, timestamp (14+ characters) or unique ID prefix of the snapshot',
	},

	// Create
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://example.com',
		displayOptions: { show: { ...showOnlyForSnapshot, operation: ['create'] } },
		description: 'The URL to archive',
		routing: { send: { type: 'body', property: 'url' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForSnapshot, operation: ['create'] } },
		options: [
			{
				displayName: 'Crawl ID',
				name: 'crawl_id',
				type: 'string',
				default: '',
				description: 'ID of the crawl to attach the snapshot to',
				routing: bodyString('crawl_id'),
			},
			{
				displayName: 'Depth',
				name: 'depth',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 4 },
				default: 0,
				description: 'Crawl depth (0 archives only the given URL)',
				routing: { send: { type: 'body', property: 'depth' } },
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				placeholder: 'news, research',
				description: 'Comma-separated list of tags',
				routing: { send: { type: 'body', property: 'tags', value: tagsToArray } },
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Title of the snapshot',
				routing: bodyString('title'),
			},
		],
	},

	// Get
	{
		displayName: 'Include Archive Results',
		name: 'withArchiveResults',
		type: 'boolean',
		default: true,
		displayOptions: { show: { ...showOnlyForSnapshot, operation: ['get'] } },
		description: 'Whether to include the archive results of the snapshot',
		routing: { send: { type: 'query', property: 'with_archiveresults' } },
	},

	// Get Many
	...paginationProperties('snapshot', 'getAll'),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { ...showOnlyForSnapshot, operation: ['getAll'] } },
		options: [
			{
				displayName: 'Bookmarked After',
				name: 'bookmarked_at__gte',
				type: 'dateTime',
				default: '',
				description: 'Only snapshots bookmarked on or after this date',
				routing: queryString('bookmarked_at__gte'),
			},
			{
				displayName: 'Bookmarked Before',
				name: 'bookmarked_at__lt',
				type: 'dateTime',
				default: '',
				description: 'Only snapshots bookmarked before this date',
				routing: queryString('bookmarked_at__lt'),
			},
			{
				displayName: 'Crawl ID',
				name: 'crawl_id',
				type: 'string',
				default: '',
				description: 'Only snapshots belonging to this crawl',
				routing: queryString('crawl_id'),
			},
			{
				displayName: 'Created After',
				name: 'created_at__gte',
				type: 'dateTime',
				default: '',
				description: 'Only snapshots created on or after this date',
				routing: queryString('created_at__gte'),
			},
			{
				displayName: 'Created Before',
				name: 'created_at__lt',
				type: 'dateTime',
				default: '',
				description: 'Only snapshots created before this date',
				routing: queryString('created_at__lt'),
			},
			{
				displayName: 'Include Archive Results',
				name: 'with_archiveresults',
				type: 'boolean',
				default: false,
				description: 'Whether to include the archive results of each snapshot',
				routing: { send: { type: 'query', property: 'with_archiveresults' } },
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
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Deleting', value: 'deleting' },
					{ name: 'Paused', value: 'paused' },
					{ name: 'Queued', value: 'queued' },
					{ name: 'Sealed', value: 'sealed' },
					{ name: 'Started', value: 'started' },
				],
				default: 'sealed',
				description: 'Only snapshots with this status',
				routing: queryString('status'),
			},
			{
				displayName: 'Tag',
				name: 'tag',
				type: 'string',
				default: '',
				description: 'Only snapshots with this exact tag name',
				routing: queryString('tag'),
			},
			{
				displayName: 'Title Contains',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Only snapshots whose title contains this text (case-insensitive)',
				routing: queryString('title'),
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'Only snapshots with exactly this URL',
				routing: queryString('url'),
			},
		],
	},

	// Update
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForSnapshot, operation: ['update'] } },
		options: [
			{
				displayName: 'Retry At',
				name: 'retry_at',
				type: 'dateTime',
				default: '',
				description: 'When to retry archiving the snapshot',
				routing: bodyString('retry_at'),
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Paused', value: 'paused' },
					{ name: 'Queued', value: 'queued' },
					{ name: 'Sealed', value: 'sealed' },
					{ name: 'Started', value: 'started' },
				],
				default: 'queued',
				description: 'New status of the snapshot (Sealed cancels queued work)',
				routing: bodyString('status'),
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				placeholder: 'news, research',
				description:
					'Comma-separated list of tags (replaces the existing tags; leave empty to remove all tags)',
				routing: { send: { type: 'body', property: 'tags', value: tagsToArrayAllowEmpty } },
			},
		],
	},

	// Change State
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		required: true,
		options: [
			{ name: 'Cancel', value: 'cancel' },
			{ name: 'Pause', value: 'pause' },
			{ name: 'Resume', value: 'resume' },
		],
		default: 'pause',
		displayOptions: { show: { ...showOnlyForSnapshot, operation: ['changeState'] } },
		description: 'State change to apply to the snapshot',
		routing: { send: { type: 'body', property: 'action' } },
	},
];
