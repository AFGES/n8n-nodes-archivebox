import {
	NodeApiError,
	type IDataObject,
	type IExecuteSingleFunctions,
	type IN8nHttpFullResponse,
	type INodeExecutionData,
	type INodeProperties,
	type JsonObject,
} from 'n8n-workflow';

export const NOT_JSON_MESSAGE = 'ArchiveBox returned an HTML page instead of JSON';
export const NOT_JSON_DESCRIPTION =
	'A reverse proxy login page (SSO) is probably in front of ArchiveBox: let /api/* through without SSO ' +
	'(the API key authenticates the API), or check the Base URL.';

/**
 * Whether a response is a page (HTML) rather than an ArchiveBox API answer.
 *
 * An SSO reverse proxy (Pangolin, Authelia, oauth2-proxy...) answers API calls with a
 * redirect to its login page, which the HTTP client follows: a 200 with an HTML body.
 * Without this check the node would output that page as if it were the result.
 */
export function isHtmlResponse(headers: IDataObject | undefined, body: unknown): boolean {
	const contentType = (headers?.['content-type'] as string | undefined)?.toLowerCase() ?? '';
	if (contentType.includes('text/html')) return true;
	if (Buffer.isBuffer(body)) body = body.toString('utf8', 0, 64);
	return typeof body === 'string' && body.trimStart().startsWith('<');
}

/** `postReceive` step: fails the item on an HTML response instead of returning the page. */
export async function assertJsonResponse(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
	response: IN8nHttpFullResponse,
): Promise<INodeExecutionData[]> {
	if (isHtmlResponse(response.headers, response.body)) {
		throw new NodeApiError(this.getNode(), { statusCode: response.statusCode } as JsonObject, {
			message: NOT_JSON_MESSAGE,
			description: NOT_JSON_DESCRIPTION,
			httpCode: String(response.statusCode),
		});
	}
	return items;
}

/**
 * Prepends `assertJsonResponse` to the `postReceive` of every operation option, so that
 * each request of the node (whatever its resource) is checked before its output is used.
 */
export function withJsonGuard(properties: INodeProperties[]): INodeProperties[] {
	return properties.map((property) => {
		if (property.name !== 'operation' || property.type !== 'options' || !property.options) {
			return property;
		}
		return {
			...property,
			options: property.options.map((option) => {
				if (!('routing' in option) || !option.routing) return option;
				const output = option.routing.output ?? {};
				return {
					...option,
					routing: {
						...option.routing,
						output: {
							...output,
							postReceive: [assertJsonResponse, ...(output.postReceive ?? [])],
						},
					},
				};
			}),
		};
	});
}
