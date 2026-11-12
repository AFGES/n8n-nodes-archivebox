import type { INodeProperties } from 'n8n-workflow';
import { paginationProperties } from '../shared/pagination';

const showOnlyForTag = { resource: ['tag'] };

const tagIdField = (operations: string[]): INodeProperties => ({
	displayName: 'Tag ID',
	name: 'tagId',
	// String, not number: a number field defaults to 0 and would skip the required check.
	type: 'string',
	displayOptions: { show: { ...showOnlyForTag, operation: operations } },
	default: '',
	required: true,
	placeholder: '42',
	description: 'Numeric ID of the tag',
});

const snapshotIdField = (operations: string[]): INodeProperties => ({
	displayName: 'Snapshot ID',
	name: 'snapshotId',
	type: 'string',
	displayOptions: { show: { ...showOnlyForTag, operation: operations } },
	default: '',
	required: true,
	description: 'Snapshot UUID, timestamp or ID prefix',
	routing: { send: { type: 'body', property: 'snapshot_id' } },
});

const tagNameField = (operations: string[], description: string): INodeProperties => ({
	displayName: 'Tag Name',
	name: 'tagName',
	type: 'string',
	displayOptions: { show: { ...showOnlyForTag, operation: operations } },
	default: '',
	required: true,
	description,
});

export const tagDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForTag },
		options: [
			{
				name: 'Add to Snapshot',
				value: 'addToSnapshot',
				action: 'Add a tag to a snapshot',
				description: 'Add a tag to a snapshot, creating the tag if missing',
				routing: { request: { method: 'POST', url: '/core/tags/add-to-snapshot/' } },
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create a tag',
				description: 'Create a new tag',
				routing: { request: { method: 'POST', url: '/core/tags/create/' } },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a tag',
				description: 'Delete a tag',
				routing: { request: { method: 'DELETE', url: '=/core/tag/{{$parameter.tagId}}' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a tag',
				description: 'Retrieve a tag',
				routing: { request: { method: 'GET', url: '=/core/tag/{{$parameter.tagId}}' } },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many tags',
				description: 'Retrieve many tags',
				routing: {
					request: { method: 'GET', url: '/core/tags' },
				},
			},
			{
				name: 'Remove From Snapshot',
				value: 'removeFromSnapshot',
				action: 'Remove a tag from a snapshot',
				description: 'Remove a tag from a snapshot',
				routing: { request: { method: 'POST', url: '/core/tags/remove-from-snapshot/' } },
			},
			{
				name: 'Rename',
				value: 'rename',
				action: 'Rename a tag',
				description: 'Rename a tag',
				routing: { request: { method: 'POST', url: '=/core/tag/{{$parameter.tagId}}/rename' } },
			},
			{
				name: 'Search',
				value: 'search',
				action: 'Search tags',
				description: 'Search tags with filters',
				routing: {
					request: { method: 'GET', url: '/core/tags/search/' },
					output: { postReceive: [{ type: 'rootProperty', properties: { property: 'tags' } }] },
				},
			},
		],
		default: 'getAll',
	},

	// Create
	{
		...tagNameField(['create'], 'Name of the tag to create'),
		routing: { send: { type: 'body', property: 'name' } },
	},

	// Get / Delete / Rename
	tagIdField(['get', 'delete', 'rename']),
	{
		displayName: 'New Name',
		name: 'newName',
		type: 'string',
		displayOptions: { show: { ...showOnlyForTag, operation: ['rename'] } },
		default: '',
		required: true,
		description: 'New name for the tag',
		routing: { send: { type: 'body', property: 'name' } },
	},
	{
		displayName: 'Include Snapshots',
		name: 'withSnapshots',
		type: 'boolean',
		displayOptions: { show: { ...showOnlyForTag, operation: ['get'] } },
		default: true,
		description: "Whether to include the tag's snapshots in the response",
		routing: { send: { type: 'query', property: 'with_snapshots' } },
	},

	// Get Many
	...paginationProperties('tag', 'getAll'),

	// Search
	{
		displayName: 'Search Term',
		name: 'q',
		type: 'string',
		displayOptions: { show: { ...showOnlyForTag, operation: ['search'] } },
		default: '',
		description: 'Text to search in tag names',
		routing: { send: { type: 'query', property: 'q', value: '={{$value || undefined}}' } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: { show: { ...showOnlyForTag, operation: ['search'] } },
		default: {},
		options: [
			{
				displayName: 'Created By',
				name: 'created_by',
				type: 'string',
				default: '',
				description: 'Numeric user ID of the tag creator (other values are ignored)',
				routing: {
					send: { type: 'query', property: 'created_by', value: '={{$value || undefined}}' },
				},
			},
			{
				displayName: 'Has Snapshots',
				name: 'has_snapshots',
				type: 'options',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'With Snapshots', value: 'yes' },
					{ name: 'Without Snapshots', value: 'no' },
				],
				default: 'all',
				description: 'Whether to only return tags with or without snapshots',
				routing: {
					send: { type: 'query', property: 'has_snapshots', value: '={{$value || undefined}}' },
				},
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'options',
				options: [
					{ name: 'Created (Newest First)', value: 'created_desc' },
					{ name: 'Created (Oldest First)', value: 'created_asc' },
					{ name: 'Name (A-Z)', value: 'name_asc' },
					{ name: 'Name (Z-A)', value: 'name_desc' },
					{ name: 'Snapshots (Fewest First)', value: 'snapshots_asc' },
					{ name: 'Snapshots (Most First)', value: 'snapshots_desc' },
				],
				default: 'created_desc',
				description: 'Sort order of the results',
				routing: { send: { type: 'query', property: 'sort', value: '={{$value || undefined}}' } },
			},
			{
				displayName: 'Year',
				name: 'year',
				type: 'string',
				default: '',
				description: 'Four-digit creation year, e.g. 2026 (other values are ignored)',
				routing: { send: { type: 'query', property: 'year', value: '={{$value || undefined}}' } },
			},
		],
	},

	// Add to / Remove from Snapshot
	snapshotIdField(['addToSnapshot', 'removeFromSnapshot']),
	{
		...tagNameField(
			['addToSnapshot', 'removeFromSnapshot'],
			'Name of the tag (created if it does not exist when adding)',
		),
		routing: { send: { type: 'body', property: 'tag_name' } },
	},
];
