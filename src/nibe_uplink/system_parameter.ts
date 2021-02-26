import fetch from 'node-fetch';
import { Client } from './client';

export class SystemParameter {
  constructor(
    readonly parameterId: number,
    readonly name: string,
    readonly title: string,
    readonly designation: string,
    readonly unit: string,
    readonly displayValue: string,
    readonly rawValue: number
  ) { }

  static async fetchOutdoorTemperature(client: Client): Promise<SystemParameter> {
    const response = await client.get('systems/CHANGEME/parameters', { parameterIds: 'outdoor_temperature' });

    console.log(response);
    const parameter = response[0];

    return new SystemParameter(
      parameter.parameterId,
      parameter.name,
      parameter.title,
      parameter.designation,
      parameter.unit,
      parameter.displayValue,
      parameter.rawValue
    )

    //this.outdoorsTemperatureService.updateCharacteristic(api.hap.Characteristic.CurrentTemperature, temp);
  }
}
