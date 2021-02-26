import { API } from 'homebridge';

import { ACCESSORY_NAME } from './settings';
import { NibeUplinkSystemPlugin } from './nibe_uplink_system_plugin'; 

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  api.registerAccessory(ACCESSORY_NAME, NibeUplinkSystemPlugin);
};
