'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class smart_remote_1b_2 extends ZigBeeDevice {

    async onNodeInit({zclNode}) {

        //var debounce = 0;
        this.printNode();

        const node = await this.homey.zigbee.getNode(this);
        node.handleFrame = (endpointId, clusterId, frame, meta) => {
          if (clusterId === 6) {
            this.log("endpointId:", endpointId,", clusterId:", clusterId,", frame:", frame, ", meta:", meta);
            this.log("Frame JSON data:", frame.toJSON());
            frame = frame.toJSON();
            // debounce = debounce+1;                     // When adding the device this "debounce" doesn't always bring the right result
            if (frame.data[2]===253){                     // In the frame the number 253 always precedes the button-action code
              this.buttonCommandParser(frame);
            } 
          }
          
          else if(clusterId === 8)                        // Probably a touchLink effect?
          {
            this.log("endpointId:", endpointId, ", clusterId:", clusterId, ", frame:", frame, ", meta:", meta);
            this.log("Frame JSON data:", frame.toJSON());
            frame = frame.toJSON();
            this.buttonCommandParserCL8(frame);
          }
        };
  
        this._buttonPressedTriggerDevice = this.homey.flow.getDeviceTriggerCard("smart_remote_1_button_2")
        .registerRunListener(async (args, state) => {
          return (null, args.action === state.action);
        });
            
    }
  
    buttonCommandParser(frame) {
      var action = frame.data[3] === 0 ? 'oneClick' : frame.data[3] === 1 ? 'twoClicks' : 'longPress';
      return this._buttonPressedTriggerDevice.trigger(this, {}, { action: `${action}` })
      .then(() => this.log(`Triggered 1 Gang Wall Remote, action=${action}`))
      .catch(err => this.error('Error triggering 1 Gang Wall Remote', err));
    }

    buttonCommandParserCL8(frame) {
      var action = frame.data[2] === 0 ? "oneClick" : "twoClicks";
      return this._buttonPressedTriggerDevice
        .trigger(this, {}, { action: `${action}` })
        .then(() => this.log(`Triggered 1 button Smart Remote, action=${action}`))
        .catch((err) => this.error("Error triggering 1 button Smart Remote", err));
    }


    onDeleted(){
		this.log("1 button Smart Remote Controller has been removed")
	}

}

module.exports = smart_remote_1b_2;