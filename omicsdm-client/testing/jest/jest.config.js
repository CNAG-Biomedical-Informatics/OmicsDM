const {defaults} = require('jest-config');

module.exports = {
  rootDir: "../../",
  testEnvironment: "jsdom",
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  // setupFilesAfterEnv: [
  //   "./src/code/tests/setup.js"
  // ],
  verbose: true,
  testMatch:[
    "**/__jest_tests__/**/*.js?(x)"
  ],
  testPathIgnorePatterns: [
    "cypress",
    "/node_modules/"
  ],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/src/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/src/__mocks__/styleMock.js"
  },
  globals: {
    "window": {}
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { "rootMode": "upward" }],
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!@cypress)"
  ],
  collectCoverage: true,
  coverageDirectory: 'testing/jest/coverage',
  coverageReporters: ["json-summary"],
  testResultsProcessor: "jest-sonar-reporter"
}