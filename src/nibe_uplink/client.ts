import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { ApiToken } from './api_token';

export class Client {
  private tokenChangeCallbacks: Array<(ApiToken) => void> = [];

  constructor(
    public token: ApiToken
  ) { }

  async get(path: string, params: object): Promise<object> {
    if (!this.token.isValid()) {
      await this.refreshToken();
    }

    const response = await fetch(
      `https://api.nibeuplink.com/api/v1/${path}?${this.buildQueryParams(params)}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token.accessToken}`
        }
      }
    )
    console.log(`Nibe Uplink: ${response.url} -> ${response.status} ${response.statusText}`)

    return await response.json();
  }

  onTokenChange(callback: (ApiToken) => void) {
    this.tokenChangeCallbacks.push(callback);
  }

  private async refreshToken() {
    this.token = await this.token.refresh();

    this.tokenChangeCallbacks.forEach((callback) => {
      callback(this.token);
    });
  }

  private buildQueryParams(params): string {
    return new URLSearchParams(params).toString();
  }
}
