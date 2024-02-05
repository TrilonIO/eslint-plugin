import { RuleTester } from '@typescript-eslint/rule-tester';
import enforceCustomProviderTypeRule from '../../src/rules/enforce-custom-provider-type.rule';

// This test required changes to the tsconfig file to allow importing from the rule-tester package.
// See https://github.com/typescript-eslint/typescript-eslint/issues/7284

const ruleTester = new RuleTester({
  parserOptions: {
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
  defaultFilenames: {
    // We need to specify a filename that will be used by the rule parser.
    // Since the test process starts at the root of the project, we need to point to the sub folder containing it.
    ts: './tests/rules/file.ts',
    tsx: '',
  },
});

ruleTester.run('enforce-custom-provider-type', enforceCustomProviderTypeRule, {
  valid: [
    {
      code: `
      const factoryProvider: Provider = {
        provide: 'TOKEN',
        useFactory: () => 'some-value'
      }
      `,
      options: [
        {
          prefer: 'factory',
        },
      ],
    },
  ],
  invalid: [],
});
