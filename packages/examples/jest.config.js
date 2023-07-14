module.exports = {
  testMatch: ['**/?(*.)+(test).+(ts)'],
  transform: {
    '^.+\\.tsx?$': [
      'esbuild-jest',
      {
        sourcemap: true,
      },
    ],
  },
};
