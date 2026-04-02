function createHeaders(initHeaders?: ResponseInit["headers"]) {
  const headers = new Headers();

  if (!initHeaders) {
    return headers;
  }

  if (initHeaders instanceof Headers) {
    initHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
    return headers;
  }

  if (Array.isArray(initHeaders)) {
    for (const [key, value] of initHeaders) {
      headers.set(key, value);
    }
    return headers;
  }

  for (const [key, value] of Object.entries(initHeaders)) {
    if (value === undefined) {
      continue;
    }

    headers.set(key, value);
  }

  return headers;
}

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = createHeaders(init.headers);

  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json; charset=utf-8");
  }

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}
