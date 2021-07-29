import { grpc } from '@nitric/sdk';

// [START import]
import { documents } from '@nitric/sdk';
// [END import]

const proto = grpc.document.DocumentServiceClient.prototype;

test('Should set a documents content', async () => {
  jest.spyOn(proto, 'set').mockImplementation((_, cb: any) => cb(null, true));

  // [START snippet]
  interface Product {
    id: string;
    name: string;
    description: string;
  }

  const collection = documents().collection<Product>('products');

  await collection.doc('nitric').set({
    id: 'nitric',
    name: 'nitric',
    description: 'A development framework!',
  });
  // [END snippet]
});
