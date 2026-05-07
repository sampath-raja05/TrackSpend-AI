export async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    const body = await response.text();
    const preview = body.replace(/\s+/g, ' ').trim().slice(0, 160).toLowerCase();

    if (preview.startsWith('<!doctype') || preview.startsWith('<html')) {
      throw new Error(`Expected JSON but received an HTML error page (HTTP ${response.status}).`);
    }

    throw new Error(
      `Expected JSON but received ${contentType || 'an unknown content type'} (HTTP ${response.status}).`
    );
  }

  return response.json() as Promise<T>;
}
