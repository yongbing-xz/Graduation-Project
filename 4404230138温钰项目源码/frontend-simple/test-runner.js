// Simple test runner for component-selection.test.js
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Read and execute the test file
fs.readFile('./tests/test-cases/core/component-selection.test.js', 'utf8', async (err, data) => {
  if (err) {
    console.error('Error reading test file:', err);
    return;
  }

  // Create a DOM environment
  const dom = new JSDOM('<!DOCTYPE html><div id="app"></div>');
  global.document = dom.window.document;
  global.window = dom.window;
  global.navigator = window.navigator;
  global.location = window.location;

  // Add Vue to the window object
  const vueContent = fs.readFileSync('./vue-frontend/node_modules/vue/dist/vue.global.js', 'utf8');
  const vm = require('vm');
  vm.createContext(window);
  vm.runInContext(vueContent, window);

  // Execute the test file
  try {
    const testModule = await import('./tests/test-cases/core/component-selection.test.js');
    const test = new testModule.default();
    await test.setup();
    await test.run();
    await test.teardown();
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
});
