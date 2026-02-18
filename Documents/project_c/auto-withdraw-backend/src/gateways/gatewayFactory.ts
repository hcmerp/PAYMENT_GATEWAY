import { PaymentGateway } from './PaymentGateway';
import { MaxpayAdapter } from './maxpay.adapter';
import { CorepayAdapter } from './corepay.adapter';
import { GatewayType } from '../types';

/**
 * Gateway Factory
 * Returns appropriate gateway adapter based on gateway type
 */
export class GatewayFactory {
    private static instances: Map<GatewayType, PaymentGateway> = new Map();

    static getGateway(gatewayType: GatewayType): PaymentGateway {
        if (this.instances.has(gatewayType)) {
            return this.instances.get(gatewayType)!;
        }

        let gateway: PaymentGateway;

        switch (gatewayType) {
            case 'maxpay':
                gateway = new MaxpayAdapter();
                break;
            case 'corepay':
                gateway = new CorepayAdapter();
                break;
            default:
                throw new Error(`Unsupported gateway type: ${gatewayType}`);
        }

        this.instances.set(gatewayType, gateway);
        return gateway;
    }
}