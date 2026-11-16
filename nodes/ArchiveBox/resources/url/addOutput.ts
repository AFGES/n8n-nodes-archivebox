import {
	NodeApiError,
	type IDataObject,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
	type IN8nHttpFullResponse,
	type INodeExecutionData,
	type JsonObject,
} from 'n8n-workflow';
import { NOT_JSON_DESCRIPTION, NOT_JSON_MESSAGE } from '../shared/jsonGuard';

interface AddResult {
	crawl_id?: string;
	snapshot_ids?: string[];
	queued_urls?: string[];
}

/**
 * `postReceive` of URL > Add: replaces the add command's output with one item per snapshot,
 * each with `archive_url`, the snapshot's page in the ArchiveBox UI.
 *
 * `/api/v1/cli/add` only queues the crawl (archiving runs in the background) and returns
 * `{ crawl_id, snapshot_ids, queued_urls }`: no link. The snapshots are fetched by id, and a
 * submitted URL with no new snapshot (Only New skipped it: already archived) is looked up by
 * URL, newest first. The viewer path is the snapshot's `archive_path`
 * (`<user>/<YYYYMMDD>/<domain>/<id>` in ArchiveBox 0.9), served at the root of the instance.
 *
 * A failed command (`success: false`) or one with no snapshot keeps the full add response.
 */
export async function addOutputSnapshots(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	const body = response.body as IDataObject | null;
	if (!body || body.success !== true || typeof body.result !== 'object' || body.result === null) {
		return items;
	}
	const result = body.result as AddResult;

	const credentials = await this.getCredentials<{ baseUrl: string; ignoreSslIssues?: boolean }>(
		'archiveBoxApi',
	);
	const baseUrl = credentials.baseUrl.replace(/\/+$/, '');

	const get = async (url: string, qs: IDataObject = {}): Promise<IDataObject> => {
		const options: IHttpRequestOptions = {
			method: 'GET',
			url: `${baseUrl}/api/v1${url}`,
			qs,
			headers: { Accept: 'application/json' },
			json: true,
			skipSslCertificateValidation: credentials.ignoreSslIssues === true,
		};
		const data: unknown = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'archiveBoxApi',
			options,
		);
		if (typeof data !== 'object' || data === null) {
			throw new NodeApiError(this.getNode(), {} as JsonObject, {
				message: NOT_JSON_MESSAGE,
				description: NOT_JSON_DESCRIPTION,
			});
		}
		return data as IDataObject;
	};

	const snapshots: IDataObject[] = [];
	for (const id of result.snapshot_ids ?? []) {
		snapshots.push(
			await get(`/core/snapshot/${encodeURIComponent(id)}`, { with_archiveresults: false }),
		);
	}

	const found = new Set(snapshots.map((s) => s.url as string));
	for (const url of result.queued_urls ?? []) {
		if (found.has(url)) continue;
		const page = await get('/core/snapshots', { url, limit: 500 });
		const matches = (page.items as IDataObject[] | undefined) ?? [];
		// The list endpoint has no default order: newest by creation date
		const latest = matches.sort((a, b) =>
			((b.created_at as string | undefined) ?? '').localeCompare(
				(a.created_at as string | undefined) ?? '',
			),
		)[0];
		if (latest) {
			snapshots.push(latest);
			found.add(url);
		}
	}

	if (snapshots.length === 0) return items;

	return snapshots.map((snapshot) => ({
		json: {
			...snapshot,
			crawl_id: snapshot.crawl_id ?? result.crawl_id,
			archive_url: `${baseUrl}/${((snapshot.archive_path as string | undefined) ?? '').replace(/^\/+/, '')}`,
		},
		pairedItem: items[0]?.pairedItem,
	}));
}
