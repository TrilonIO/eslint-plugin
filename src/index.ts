import enforceCloseTestingModuleRule from './rules/enforce-close-testing-module.rule';

// TODO: we should type this as ESLint.Plugin but there's a type incompatibilities with the utils package
const plugin = {
  configs: {
    recommended: {
      rules: { '@trilon/enforce-close-testing-module': 'error' },
    },
  },
  rules: {
    'enforce-close-testing-module': enforceCloseTestingModuleRule,
  },
};

module.exports = plugin;
