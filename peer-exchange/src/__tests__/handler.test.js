const {createMessageHandler} = require('../handler.js');

describe('Handler', () => {
    describe('#messageHandler', () => {
        let channelsMock;
        let clientMock;

        let handleMessage;

        beforeEach(() => {
            clientMock = Symbol();

            channelsMock = {
                get: jest.fn(),
            };

            handleMessage = createMessageHandler(channelsMock, clientMock);
        });

        it('calls channels.get for channelId in payload', () => {
            handleMessage(JSON.stringify({channelId: 'lkqcuj9qoj'}));
            expect(channelsMock.get).toBeCalledWith('lkqcuj9qoj', clientMock);
        });
    });
})
