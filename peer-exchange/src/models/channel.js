class Channel
{
    constructor() {
        this.clients = new Set();
    }

    broadcast(originClient, data) {
        [...this.clients]
            .filter(candidateClient => candidateClient !== originClient)
            .forEach(targetClient => targetClient.send(data));
    }

    join(client) {
        this.clients.add(client);

        client.channels.add(this);
    }

    leave(client) {
        this.clients.delete(client);

        client.channels.delete(this);
    }
}

module.exports = {
    Channel,
};
