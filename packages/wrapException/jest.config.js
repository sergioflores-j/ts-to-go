module.exports = {
  testMatch: ['**/?(*.)+(test).+(ts)'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
};
