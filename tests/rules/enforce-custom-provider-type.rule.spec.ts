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
    // Test for when the provider is of the preferred type
    {
      code: `
      import { Provider } from '@nestjs/common';

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
    // Test for when the Provider type is not imported from '@nestjs/common'
    {
      code: `
      import { Provider } from 'some-other-package';
      const customValueProvider: Provider = {
        useValue: 'some-value',
        provide: 'TOKEN'
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
    // Test for when the provider is not of the preferred type
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
    // Test for when the provider is not of the preferred type and was renamed
    {
      code: `
      import { Provider as NestProvider } from '@nestjs/common';
      import { EXISTING_TOKEN } from './token';
      const customValueProvider: NestProvider = {
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

    // Test for when the provider (value) is not of the preferred type (factory) in the "providers" array
    {
      code: `
      import { Module } from '@nestjs/common';
      @Module({
        providers: [
          {
            provide: 'TOKEN',
            useValue: 'value-in-providers-array',
          }
        ]
      })
      export class SomeModule {}
      `,
      errors: [
        {
          messageId: 'providerTypeMismatch',
        },
      ],
      options: [
        {
          prefer: 'factory',
        },
      ],
    },
    // Test for when the provider (class) is not of the preferred type (factory) in the "providers" array
    {
      code: `
          import { Module } from '@nestjs/common';
          import { SomeClass } from './some-class';

          @Module({
            providers: [
              {
                provide: 'TOKEN',
                useClass: SomeClass,
              }
            ]
          })
          export class SomeModule {}
          `,
      errors: [
        {
          messageId: 'providerTypeMismatch',
        },
      ],
      options: [
        {
          prefer: 'factory',
        },
      ],
    },
    // Test for when the provider (existing) is not of the preferred type (factory) in the "providers" array
    {
      code: `
              import { Module } from '@nestjs/common';
              import { SomeClass } from './some-class';
    
              @Module({
                providers: [
                  {
                    provide: 'TOKEN',
                    useExisting: SomeClass,
                  }
                ]
              })
              export class SomeModule {}
              `,
      errors: [
        {
          messageId: 'providerTypeMismatch',
        },
      ],
      options: [
        {
          prefer: 'factory',
        },
      ],
    },
    // Test for when many provider types are not of the preferred type (factory) in the "providers" array
    {
      code: `
                  import { Module } from '@nestjs/common';
                  import { SomeClass } from './some-class';
        
                  @Module({
                    providers: [
                      {
                        provide: 'TOKEN',
                        useExisting: SomeClass,
                      },
                      {
                        provide: 'TOKEN',
                        useClass: SomeClass,
                      },
                      {
                        provide: 'TOKEN',
                        useValue: 'value-in-providers-array',
                      },
                      {
                        provide: 'TOKEN',
                        useFactory: () => 'value-in-providers-array',
                      }
                    ]
                  })
                  export class SomeModule {}
                  `,
      errors: [
        {
          messageId: 'providerTypeMismatch',
        },
        {
          messageId: 'providerTypeMismatch',
        },
        {
          messageId: 'providerTypeMismatch',
        },
      ],
      options: [
        {
          prefer: 'factory',
        },
      ],
    },
  ],
});
