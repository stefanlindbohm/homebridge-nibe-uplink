import { API, Logger, AccessoryPlugin, AccessoryConfig, Service } from 'homebridge';
import { MANUFACTURER_NAME, MODEL_NAME } from './settings';
import { ApiToken, Client, SystemParameter } from './nibe_uplink';
import fs from 'fs';
import path from 'path';

const refreshToken = 'CHANGEME';

export class NibeUplinkSystemPlugin implements AccessoryPlugin {
  private informationService: Service
  private outdoorsTemperatureService: Service
  private client?: Client

  constructor(
    private readonly log: Logger,
    private readonly config: AccessoryConfig,
    private readonly api: API
  ) {
    console.log(config);
    console.log();

    this.informationService = this.buildInformationService();
    this.outdoorsTemperatureService = this.buildOutdoorsTemperatureService();

    ApiToken.refreshWithToken(refreshToken).then(token => {
      this.persistToken(token);
      this.client = new Client(token);
      this.client.onTokenChange((token) => {
        console.log(`New token: ${token}`);
      });
    });
  }

  getServices(): Service[] {
    return [
      this.informationService,
      this.outdoorsTemperatureService
    ];
  }

  private persistToken(token: ApiToken) {
    const data = {
      token: token
    };

    fs.writeFile(this.persistedDataJSONPath(), JSON.stringify(data), () => {});
  }

  private persistedDataJSONPath(): string {
    return path.join(this.api.user.storagePath(), 'accessories', 'nibe_uplink.json');
  }

  private buildInformationService(): Service {
    return new this.api.hap.Service.AccessoryInformation()
      .setCharacteristic(this.api.hap.Characteristic.Manufacturer, MANUFACTURER_NAME)
      .setCharacteristic(this.api.hap.Characteristic.Model, MODEL_NAME)
  }

  private buildOutdoorsTemperatureService(): Service {
    const service = new this.api.hap.Service.TemperatureSensor()
      .setCharacteristic(this.api.hap.Characteristic.Name, 'Outdoors')
      //.setCharacteristic(this.api.hap.Characteristic.CurrentTemperature, null)

    service.getCharacteristic(this.api.hap.Characteristic.CurrentTemperature)
      .setProps({ minValue: -100 })
      .on('get', (callback) => {
        if (this.client === undefined) {
          callback(new Error('Not yet connected to Nibe Uplink'));
          return;
        }

        SystemParameter.fetchOutdoorTemperature(this.client).then((parameter) => {
          let temperature = parameter.rawValue / 10
          callback(null, temperature);
        });
      });

    return service;
  }
}
