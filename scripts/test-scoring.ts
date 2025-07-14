import { testDataSetup } from '../server/services/test-data-setup.ts';

const { runTests } = testDataSetup.setupTestData();
runTests();