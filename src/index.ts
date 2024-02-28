import enforceCloseTestingModuleRule from './rules/enforce-close-testing-module.rule';
import checkInjectDecoratorRule from './rules/check-inject-decorator.rule';
import detectCircularReferenceRule from './rules/detect-circular-reference.rule';
import enforceCustomProviderTypeRule from './rules/enforce-custom-provider-type.rule';
// TODO: we should type this as ESLint.Plugin but there's a type incompatibilities with the utils package
const plugin = {
  configs: {
    recommended: {
      rules: {
        '@trilon/enforce-close-testing-module': 'error',
        '@trilon/check-inject-decorator': 'error',
        '@trilon/detect-circular-reference': 'warn',
      },
    },
    strict: {
      rules: {
        '@trilon/enforce-close-testing-module': 'error',
        '@trilon/check-inject-decorator': 'error',
        '@trilon/detect-circular-reference': 'error',
        '@trilon/enforce-custom-provider-type': 'error',
      },
    },
  },
  rules: {
    'enforce-close-testing-module': enforceCloseTestingModuleRule,
    'check-inject-decorator': checkInjectDecoratorRule,
    'detect-circular-reference': detectCircularReferenceRule,
    '@trilon/enforce-custom-provider-type': enforceCustomProviderTypeRule,
  },
};

// @ts-expect-error Still have to investigate why this is failing
module.exports = plugin;
