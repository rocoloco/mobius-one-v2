import { testDataSetup } from '../server/services/test-data-setup';

async function runScoringTests() {
  console.log('🚀 Starting Scoring Algorithm Tests...\n');
  
  try {
    const { runTests } = testDataSetup.setupTestData();
    const results = runTests();
    
    // Additional summary
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    
    console.log(`\n🎯 Final Results: ${passedCount}/${totalCount} tests passed`);
    
    if (passedCount === totalCount) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed - review algorithm calibration');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

runScoringTests();