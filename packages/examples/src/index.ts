/* eslint-disable no-console */
import wrapException from '@ts-to-go/wrap-exception';

const validateConnectionName = (connectionName: string) => {
  if (!connectionName) throw new Error('connectionName is required');
  if (connectionName === 'invalid')
    throw new Error('connectionName is invalid');
};

type DBConnection = {
  name: string;
  status: 'connected' | 'disconnected';
};

const connectToDB = async (connectionName: string): Promise<DBConnection> => {
  validateConnectionName(connectionName);

  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });

  return {
    name: connectionName,
    status: 'connected',
  };
};

const fetchUsers = wrapException(async (connection: DBConnection) => {
  await new Promise((resolve) => {
    console.log('using connection!', connection);

    setTimeout(resolve, 1000);
  });

  return {
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
  };
});

const sum = wrapException((a: number, b: number) => {
  if (typeof a !== 'number') throw new Error('a is not a number');
  if (typeof b !== 'number') throw new Error('b is not a number');

  return a + b;
});

const isInternalError = (error: unknown): error is Error => {
  return error instanceof Error;
};

// This is a helper function to check if an error is present. If so, then the result is undefined
const hasError = <Result>(
  error: unknown | undefined,
  result: Result | undefined,
): result is undefined => {
  return !!error;
};

// Mixed example usage of wrapException
const handler = async () => {
  const dbConnection = wrapException(connectToDB);

  const [connectionError, connectionInfo] = await dbConnection('23');

  if (
    hasError(connectionError, connectionInfo) ||
    isInternalError(connectionError)
  ) {
    console.log('connectionError', connectionError);
    return;
  }

  console.log('connectionInfo', connectionInfo);

  const [usersError, users] = await fetchUsers(connectionInfo);

  if (hasError(usersError, users)) {
    console.log('usersError', usersError);
    return;
  }

  console.log('users', users);
  const [sumError, sumResult] = sum(users.results[0].age, users.results[1].age);

  if (sumError) {
    console.log('sumError', sumError);
    return;
  }

  console.log('sumResult', sumResult);
};

export default handler;
