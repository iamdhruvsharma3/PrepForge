import type { ZodType } from "zod";

type RequestOptions<TValue> = {
  body?: TValue;
  method: "GET" | "POST";
  path: string;
};

type HttpClientOptions = {
  baseUrl: string;
  credentials?: RequestCredentials;
};

export class PrepforgeHttpClient {
  constructor(private readonly options: HttpClientOptions) {}

  async get<TResponse>(
    path: string,
    schema: ZodType<TResponse>,
  ): Promise<TResponse> {
    return this.request({ method: "GET", path }, schema);
  }

  async post<TBody, TResponse>(
    path: string,
    body: TBody,
    schema: ZodType<TResponse>,
  ): Promise<TResponse> {
    return this.request({ body, method: "POST", path }, schema);
  }

  private async request<TBody, TResponse>(
    { body, method, path }: RequestOptions<TBody>,
    schema: ZodType<TResponse>,
  ): Promise<TResponse> {
    const requestInit: RequestInit = {
      credentials: this.options.credentials ?? "include",
      headers: {
        "Content-Type": "application/json",
      },
      method,
    };

    if (body !== undefined) {
      requestInit.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.options.baseUrl}${path}`, requestInit);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    return schema.parse(payload);
  }
}
