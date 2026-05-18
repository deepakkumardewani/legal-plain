class MockNextRequest extends Request {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init);
  }
}

class MockNextResponse extends Response {
  static json(body: unknown, init?: ResponseInit) {
    return new Response(JSON.stringify(body), {
      ...init,
      headers: {
        ...init?.headers,
        "content-type": "application/json",
      },
    });
  }

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body, init);
  }
}

export { MockNextRequest as NextRequest, MockNextResponse as NextResponse };
