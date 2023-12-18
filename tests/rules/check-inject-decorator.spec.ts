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
    // TODO: add following tests:
    // 1 - 🆗 Type is a class and was injected in the constructor
    // 2 - 🆗 Token differs from type
    // 3 - 🆗 Token duplicates type, but class properties are not injected automatically
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
    // TODO: add following tests:
    // 1 - 🚫 Type is an interface and cannot be injected
    // 2 - private readonly fooService: FooService; // ⚠️ Did you want to `@Inject(FooService)`?
  ],
});
