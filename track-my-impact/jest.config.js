export default {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "jest-environment-jsdom",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { useESM: true, tsconfig: "./tsconfig.json" }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/public/(.*)$": "<rootDir>/public/$1"
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
};
