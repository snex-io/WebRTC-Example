import { createPeerExchange } from './peer-exchange.js';
import { createHost, createGuest} from './connection.js';

const defaultConfig = {
    peerServerURL: 'ws://' + window.location.hostname + ':9000',
}

export async function createPeer(id, config = defaultConfig) {
    const server = await createPeerExchange(config.peerServerURL);

    const {onConnection} = createHost(server, id);
    const {conn, connect} = createGuest(server, id);

    return {
        onConnection,
        connect,
        conn,
    };
}
