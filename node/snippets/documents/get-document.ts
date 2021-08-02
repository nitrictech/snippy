import { grpc } from '@nitric/sdk';

// [START import]
import { documents } from '@nitric/sdk';
// [END import]

const proto = grpc.document.DocumentServiceClient.prototype;

const MOCKED_GET_RESPONSE = {
  hasDocument: () => true,
  getDocument: () => ({
    getContent: () => ({
      toJavaScript: () => true,
    }),
  }),
};

test('Should get a documents content', async () => {
  jest
    .spyOn(proto, 'get')
    .mockImplementation((_, cb: any) => cb(null, MOCKED_GET_RESPONSE));

  // [START snippet]
  const document = documents().collection('products').doc('nitric');

  const product = await document.get();
  // [END snippet]
});
