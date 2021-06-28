import { VesyncFan } from './vesyncFan';
import { createAuthBody, createBaseBody, createReqHeaders, VesyncClient } from '../api/client';
import { FanDetails, FanMode, FanSpeed } from './fanDetails';

function createDetailsBody() {
    return {
        'appVersion': '2.5.1',
        'phoneBrand': 'SM N9005',
        'phoneOS': 'Android',
        'traceId': Date.now()
    };
}

export class FanController {
    private details: FanDetails | any = {};

    constructor(
        private readonly fan: VesyncFan,
        private readonly client: VesyncClient
    ) {
        this.initialize();
    }

    private async initialize() {
        this.details = await this.getDetails();
    }

    setPower(toggle: boolean) {

        const body = {
            ...createBaseBody(),
            ...createAuthBody(this.client),
            ...createDetailsBody(),
            'method': 'bypassV2', 
            'debugMode': false, 
            'deviceRegion': this.fan.deviceRegion, 
            'cid' : this.fan.cid,
            'configModule' : this.fan.configModule,
            'payload' : {
                'data': {
                    'enabled': toggle,
                    'id': 0
                },
                'method': 'setSwitch',
                'source': 'APP'
            }
        }

        this.client.post('/cloud/v2/deviceManaged/bypassV2',{
            headers: {'Content-Type': 'application/json; charset=UTF-8', 'User-Agent': 'VeSync/VeSync 3.0.51(F5321;Android 8.0.0)'},
            json: body
        }).json();
    }

    isOn(): boolean {
        return this.details.enabled;
    }

    getDetails(): Promise<FanDetails> {
        const body = {
            ...createBaseBody(),
            ...createAuthBody(this.client),
            ...createDetailsBody(),
            'method': 'bypassV2', 
            'debugMode': false, 
            'deviceRegion': this.fan.deviceRegion, 
            'cid' : this.fan.cid,
            'configModule' : this.fan.configModule,
            'payload' : {
                'data': {},
                'method': 'getPurifierStatus',
                'source': 'APP'
            }
        }

        const req = this.client.post('/cloud/v2/deviceManaged/bypassV2', {
            headers: {'Content-Type': 'application/json; charset=UTF-8', 'User-Agent': 'VeSync/VeSync 3.0.51(F5321;Android 8.0.0)'},
            json: body
        });
        const response= req.json();
        const innerresult = response.result.result;
        return innerresult;
    }

    setFanSpeed(speed: FanSpeed):boolean {

        if (this.getFanMode() !== "manual")
        {
            this.setFanMode("manual");
        }
        if (speed == this.details.level)
        {
            return true;
        }
        const head= {'Content-Type': 'application/json; charset=UTF-8', 'User-Agent': 'VeSync/VeSync 3.0.51(F5321;Android 8.0.0)'},
        if (speed+1 > 4){
            speed=1
        }

        const body = {
            ...createBaseBody(),
            ...createAuthBody(this.client),
            ...createDetailsBody(),
            'method': 'bypassV2', 
            'debugMode': false, 
            'deviceRegion': this.fan.deviceRegion, 
            'cid' : this.fan.cid,
            'configModule' : this.fan.configModule,
            'payload' : {
                'data' : {
                    'id': 0,
                    'level': speed,
                    'type': 'wind'
                },
                'method': 'setLevel',
                'source': 'APP'
            }
        }

        const res= this.client.post('/cloud/v2/deviceManaged/bypassV2',{
            headers: head,
            json: body
        }).json();

        if (res.result.code === 0) {
            this.details.level=speed
            return true;
        }
        else {
            return false;
        }
    }

    getFanSpeed(): FanSpeed {
        return this.details.level;
    }

    getFanMode(): FanMode {
        return this.details.mode;
    }

    getAirQuality(): number {
        return this.details.air_quality_value;
    }

    setFanMode(targetMode: FanMode) : boolean {

        const head= {'Content-Type': 'application/json; charset=UTF-8', 'User-Agent': 'VeSync/VeSync 3.0.51(F5321;Android 8.0.0)'},
        const body = {
            ...createBaseBody(),
            ...createAuthBody(this.client),
            ...createDetailsBody(),
            'method': 'bypassV2', 
            'debugMode': false, 
            'deviceRegion': this.fan.deviceRegion, 
            'cid' : this.fan.cid,
            'configModule' : this.fan.configModule,
            'payload' : {
                'data' : {
                'mode': targetMode
                },
                'method': 'setPurifierMode',
                'source': 'APP'
            }
        }

        const res= this.client.post('/cloud/v2/deviceManaged/bypassV2',{
            headers: head,
            json: body
        }).json();

        if (res.result.code === 0) {
            return true;
        }
        else {
            return false;
        }
    }

}