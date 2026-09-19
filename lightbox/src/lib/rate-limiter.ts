const MIN_INTERVAL_MS = 1000;
let lastRequestTime = 0;
let pending: Promise<void> = Promise.resolve();

export async function rateLimitedFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const execute = async () => {
    const now = Date.now();
    const wait = Math.max(0, MIN_INTERVAL_MS - (now - lastRequestTime));
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
    lastRequestTime = Date.now();
    return fetch(url, {
      ...init,
      headers: {
        "User-Agent": "LightBox/1.0",
        ...init?.headers,
      },
    });
  };

  const result = pending.then(execute, execute);
  pending = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}
