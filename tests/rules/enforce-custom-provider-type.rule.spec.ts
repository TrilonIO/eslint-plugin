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
  invalid: [
    {
      code: `
      import { Provider } from '@nestjs/common';
      const customValueProvider: Provider = {
        provide: 'TOKEN',
        useValue: 'some-value' // ⚠️ provider is not of type "factory"
      }
      `,
      options: [
        {
          prefer: 'factory',
        },
      ],
      errors: [
        {
          messageId: 'providerTypeMismatch',
        },
      ],
    },
    {
      code: `
      import { Provider } from '@nestjs/common';
      import { SomeClass } from './some-class';
      const customValueProvider: Provider = {
        provide: 'TOKEN',
        useClass: SomeClass // ⚠️ provider is not of type "factory"
      }
      `,
      options: [
        {
          prefer: 'factory',
        },
      ],
      errors: [
        {
          messageId: 'providerTypeMismatch',
        },
      ],
    },
    {
      code: `
      import { Provider } from '@nestjs/common';
      import { EXISTING_TOKEN } from './token';
      const customValueProvider: Provider = {
        provide: 'TOKEN',
        useExisting: EXISTING_TOKEN // ⚠️ provider is not of type "factory"
      }
      `,
      options: [
        {
          prefer: 'factory',
        },
      ],
      errors: [
        {
          messageId: 'providerTypeMismatch',
        },
      ],
    },
    // TODO
    // Test for when the Provider type is not imported from '@nestjs/common'
    // Test for when the Provider type was renamed
    // Test for when the Provider type is different from the one defined in the configuration
  ],
});
