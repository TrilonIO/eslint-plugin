import { RuleTester } from '@typescript-eslint/rule-tester';
import checkInjectDecorator from '../../src/rules/check-inject-decorator.rule';

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

ruleTester.run('check-inject-decorator', checkInjectDecorator, {
  valid: [
    {
      code: `
      const FOO_SERVICE = Symbol('FOO_SERVICE');
      class FooBarController {      
        constructor(
          @Inject(FOO_SERVICE)
          private readonly fooService: FooService,
        ) {}
      }
      `,
    },
    {
      code: `
      class FooClass {
        foo: string;
      }
      class FooBarController {      
        constructor(
          private readonly fooService: FooClass,
        ) {}
      }
      `,
    },
    // TODO: add following tests:
    // 🆗 Token duplicates type, but class properties are not injected automatically
  ],
  invalid: [
    {
      code: `
      class FooBarController {      
        constructor(
          @Inject(BazService) // ⚠️ Token duplicates type
          private readonly bazService: BazService,
        ) {}
      }
      `,
      errors: [
        {
          messageId: 'tokenDuplicatesType',
        },
      ],
    },
    {
      code: `
      interface FooInterface {
        foo: string;
      }
      class FooBarController {      
        constructor(
          private readonly fooService: FooInterface,
        ) {}
      }
      `,
      errors: [
        {
          messageId: 'typeIsInterface',
        },
      ],
    },
    // TODO: add following tests:
    // 2 - private readonly fooService: FooService; // ⚠️ Did you want to `@Inject(FooService)`?
  ],
});
