import fetch from 'node-fetch';
import FormData from 'form-data';

function buildFormData(fields: object): FormData {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    data.append(key, value);
  });
  return data;
}

export class ApiToken {
  constructor(
    readonly accessToken: string,
    readonly expires: Date,
    readonly refreshToken: string
  ) { }

  static async refreshWithToken(refreshToken: string): Promise<ApiToken> {
    const response = await fetch(
      `https://api.nibeuplink.com/oauth/token`,
      {
        method: 'POST',
        body: buildFormData({
          grant_type: 'refresh_token',
          client_id: 'CHANGEME',
          client_secret: 'CHANGEME',
          refresh_token: refreshToken
        })
      }
    )
    console.log(`Nibe Uplink: ${response.url} -> ${response.status} ${response.statusText}`)
    const responseBody = await response.json();

    let expires = new Date();
    expires.setUTCSeconds(expires.getUTCSeconds() + responseBody.expires_in);

    console.log(`Nibe Uplink: Access token valid until ${expires} with refresh token: ${responseBody.refresh_token}`);

    return new ApiToken(
      responseBody.access_token,
      expires,
      responseBody.refresh_token
    )
  }

  async refresh(): Promise<ApiToken> {
    return await ApiToken.refreshWithToken(this.refreshToken);
  }

  isValid(): boolean {
    return this.expires > new Date();
  }
}
