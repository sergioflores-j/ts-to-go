// TODO: fix lint
// eslint-disable-next-line import/no-extraneous-dependencies
import wrapException from '@ts-to-go/wrap-exception';

const sqrt = wrapException((number: number): number => {
  const result = Math.sqrt(number);
  if (Number.isNaN(result)) throw new Error('number is invalid');

  return result;
});

const handler = (number: number): number => {
  const result = sqrt(number);

  if (result.isError) {
    if (result.error instanceof Error) {
      console.warn('invalid input', result.error.message);
    }

    return 0;
  }

  return result.data;
};

export default handler;
