// TODO: fix lint
// eslint-disable-next-line import/no-extraneous-dependencies
import wrapException from '@ts-to-go/wrap-exception';

class ValidationError extends Error {}
class ConnectionError extends Error {}
class DBQueryError extends Error {}

type DBConnection = {
  id: string;
  databaseUrl: string;
  status: 'active' | 'inactive';
};

type DBResult<T = unknown> = {
  limit: number;
  results: Array<T>;
};

type User = {
  name: string;
  age: number;
};

type HandlerReturnType = {
  statusCode: number;
  body: string;
};

const validateDBUrl = (databaseUrl: string) => {
  if (!databaseUrl) throw new ValidationError('databaseUrl is required');
  if (databaseUrl.startsWith('mysql://'))
    throw new ValidationError('databaseUrl is invalid');
};

const connectToDB = async (databaseUrl: string): Promise<DBConnection> => {
  validateDBUrl(databaseUrl);

  // Some request
  const connection: DBConnection = await Promise.resolve({
    databaseUrl,
    id: 'connection-id',
    status: 'active',
  });

  if (connection.status === 'inactive')
    throw new ConnectionError('connection inactive');

  return connection;
};

const dbQuery = <T>(connection: DBConnection): Promise<DBResult<T>> => {
  if (connection.status !== 'active')
    throw new ConnectionError('connection is not active');

  // @ts-expect-error: mocked values for simplicity sake
  return Promise.resolve({
    limit: 50,
    results: [
      {
        name: 'Joost',
        age: 21,
      },
      {
        name: 'Kapsalon',
        age: 23,
      },
    ],
  });
};

const internalFetchUsers = async (
  connection: DBConnection,
): Promise<DBResult<User>> => {
  const result: DBResult<User> = await dbQuery(connection);

  if (!result.results)
    throw new DBQueryError('query did not return the expected values');

  return result;
};

const fetchUsers = wrapException<typeof internalFetchUsers, DBQueryError>(
  internalFetchUsers,
);

// TODO: write a better example with fetch instead
// Mixed example usage of wrapException
const handler = async (): Promise<HandlerReturnType> => {
  const connectToDBWrapped = wrapException<typeof connectToDB, ConnectionError>(
    connectToDB,
  );

  const dbConnectionResult = await connectToDBWrapped('some-db-name');

  if (dbConnectionResult.isError) {
    console.error('fetch users error', dbConnectionResult.error);

    return {
      statusCode: 503,
      body: JSON.stringify({ message: 'Connection is inactive' }),
    };
  }

  const usersResult = await fetchUsers(dbConnectionResult.data);

  if (usersResult.isError) {
    console.error('fetch users error', usersResult.error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }

  const responseBody: User[] = usersResult.data.results;

  return {
    statusCode: 200,
    body: JSON.stringify(responseBody),
  };
};

export default handler;
