import type { INodeProperties } from 'n8n-workflow';

/**
 * Builds the standard `Limit` / `Return All` property pair for a list operation.
 *
 * ArchiveBox list endpoints (django-ninja) page with `limit`/`offset` (max 500
 * per page) and respond with:
 *   { count, total_items, total_pages, page, limit, offset, num_items, items }
 *
 * Return All uses n8n's built-in `offset` pagination. It only sets the `limit`
 * and `offset` query keys, so filters set by other properties are kept. The
 * `generic` pagination type is not used on purpose: n8n merges its `request`
 * shallowly, so its `qs` would replace the whole query string (filters included).
 *
 * The records are unwrapped from `items` here, not on the operation: by the
 * offset paginator's `rootProperty` when returning all, and by a `postReceive`
 * on the Limit field otherwise.
 */
export function paginationProperties(resource: string, operation: string): INodeProperties[] {
	const show = { resource: [resource], operation: [operation] };

	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			displayOptions: { show },
			default: false,
			description: 'Whether to return all results or only up to a given limit',
			routing: {
				send: { paginate: '={{ $value }}' },
				operations: {
					pagination: {
						type: 'offset',
						properties: {
							limitParameter: 'limit',
							offsetParameter: 'offset',
							pageSize: 500,
							rootProperty: 'items',
							type: 'query',
						},
					},
				},
			},
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			displayOptions: { show: { ...show, returnAll: [false] } },
			typeOptions: { minValue: 1, maxValue: 500 },
			default: 50,
			routing: {
				send: { type: 'query', property: 'limit' },
				output: {
					maxResults: '={{ $value }}',
					postReceive: [{ type: 'rootProperty', properties: { property: 'items' } }],
				},
			},
			description: 'Max number of results to return',
		},
	];
}
