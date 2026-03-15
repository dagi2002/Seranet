export function getApiOrigin(apiBaseUrl: string) {
  return new URL(apiBaseUrl).origin;
}

export function resolveAssetUrl(url: string | undefined, apiBaseUrl: string) {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url) || url.startsWith('data:')) return url;

  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${getApiOrigin(apiBaseUrl)}${normalized}`;
}
