import enforceCloseTestingModuleRule from './rules/enforce-close-testing-module.rule';
import checkInjectDecoratorRule from './rules/check-inject-decorator.rule';
// TODO: we should type this as ESLint.Plugin but there's a type incompatibilities with the utils package
const plugin = {
  configs: {
    recommended: {
      rules: {
        '@trilon/enforce-close-testing-module': 'error',
        '@trilon/check-inject-decorator': 'error',
      },
    },
  },
  rules: {
    'enforce-close-testing-module': enforceCloseTestingModuleRule,
    'check-inject-decorator': checkInjectDecoratorRule,
  },
};

// @ts-expect-error Still have to investigate why this is failing
module.exports = plugin;
