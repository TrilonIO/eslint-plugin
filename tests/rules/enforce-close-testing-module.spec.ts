import { RuleTester } from '@typescript-eslint/rule-tester';
import enforceCloseTestingModuleRule from '../../src/rules/enforce-close-testing-module.rule';

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

ruleTester.run('enforce-close-testing-module', enforceCloseTestingModuleRule, {
  valid: [
    {
      code: `
        describe('Closes the testingModule in the afterEach() hook', () => {
          let testingModule: TestingModule;
          beforeEach(async () => {
            testingModule = await Test.createTestingModule({
              imports: [AppModule],
            }).compile();
          });
          it('should be defined', () => {
            expect(testingModule).toBeDefined();
          });
        });
        afterEach(async () => {
          await testingModule.close();
        });
      `,
    },
    {
      code: `
        describe('Closes the appModule created from the testingModule', () => {
          let app: INestApplication;
          beforeEach(async () => {
            const testingModule = await Test.createTestingModule({
              imports: [AppModule],
            }).compile();
            app = testingModule.createNestApplication();
          });
          it('should be defined', () => {
            expect(testingModule).toBeDefined();
          });
        });
        afterEach(async () => {
          await app.close();
        });
      `,
    },
    {
      code: `
        describe('creates a testing module inside the test case and close in the afterEach hook', () => {
          let testingModule: TestingModule;

          afterEach(async () => {
            await testingModule.close();
          });

          test('should be valid', async () => {
            testingModule = await Test.createTestingModule({
              imports: [AppModule],
            }).compile();
            expect(testingModule).toBeDefined();
          });
        });
      `,
    },
    {
      code: `
        describe('creates and closes a testing module inside the test case', () => {
          test('should be valid', async () => {
            const testingModule = await Test.createTestingModule({
              imports: [AppModule],
            }).compile();
            expect(testingModule).toBeDefined();
            await testingModule.close();
          });
        });
      `,
    },
    {
      code: `
        describe('Closes the testingModule using a custom function', () => {
          let testingModule: TestingModule;
          beforeEach(async () => {
            testingModule = await Test.createTestingModule({
              imports: [AppModule],
            }).compile();
          });
          it('should be defined', () => {
            expect(testingModule).toBeDefined();
          });
        });
        afterEach(async () => {
          await customClose();
        });
      `,
      options: [
        {
          closeAliases: [
            {
              kind: 'function',
              name: 'customClose',
            },
          ],
        },
      ],
    },
    {
      code: `
        import { customCreateTestingModule } from './test-utils';
        describe('Creates the testingModule using the function alias', () => {
          let testingModule: TestingModule;
          beforeEach(async () => {
            testingModule = await customCreateTestingModule();
          });
          it('should be defined', () => {
            expect(testingModule).toBeDefined();
          });
        });
        afterEach(async () => {
          await testingModule.close();
        });
      `,
      options: [
        {
          createAliases: [
            {
              kind: 'function',
              name: 'customCreateTestingModule',
            },
          ],
        },
      ],
    },
  ],
  invalid: [
    {
      code: `
        describe('Creates a testingModule in the beforeEach hook but does not close it', () => {
          let testingModule: TestingModule;
          beforeEach(async () => {
            testingModule = await Test.createTestingModule({
              imports: [AppModule],
            }).compile();
          });
          it('should be defined', () => {
            expect(testingModule).toBeDefined();
          });
        });
      `,
      errors: [
        {
          messageId: 'testModuleNotClosed',
        },
      ],
    },
    {
      code: `
        describe('AppModule', () => {
          let testingModule: TestingModule;
          beforeEach(async () => {
            testingModule = await Test.createTestingModule({
              imports: [AppModule],
            }).compile();
          });
          it('should be defined', () => {
            expect(testingModule).toBeDefined();
          });

          afterAll(async () => {
            await testingModule.close();
          });
        });
      `,
      errors: [
        {
          messageId: 'testModuleClosedInWrongHook',
          data: {
            created: 'beforeEach',
            closed: 'afterAll',
          },
        },
      ],
    },
    {
      code: `
        describe('AppModule', () => {
          let testingModule: TestingModule;
          beforeAll(async () => {
            testingModule = await Test.createTestingModule({
              imports: [AppModule],
            }).compile();
          });
          it('should be defined', () => {
            expect(testingModule).toBeDefined();
          });

          afterEach(async () => {
            await testingModule.close();
          });
        });
      `,
      errors: [
        {
          messageId: 'testModuleClosedInWrongHook',
          data: {
            created: 'beforeAll',
            closed: 'afterEach',
          },
        },
      ],
    },
    {
      code: `
        import { customCreateTestingModule } from './test-utils';
        describe('Creates the testingModule using the function alias but does not close it', () => {
          let testingModule: TestingModule;
          beforeEach(async () => {
            testingModule = await customCreateTestingModule();
          });
          it('should be defined', () => {
            expect(testingModule).toBeDefined();
          });
        });
      `,
      options: [
        {
          createAliases: [
            {
              kind: 'function',
              name: 'createTestingModule',
            },
          ],
        },
      ],
      errors: [
        {
          messageId: 'testModuleNotClosed',
        },
      ],
    },
    {
      code: `
        import { customCreateTestingModule } from './test-utils';
        describe('Creates the testingModule using the function alias in the beforeEach scope', () => {
          beforeEach(async () => {
            const testingModule = await customCreateTestingModule();
          });
          it('should be defined', () => {
            expect(testingModule).toBeDefined();
          });
        });
      `,
      options: [
        {
          createAliases: [
            {
              kind: 'function',
              name: 'customCreateTestingModule',
            },
          ],
        },
      ],
      errors: [
        {
          messageId: 'testModuleNotClosed',
        },
      ],
    },
    {
      code: `
        import { customCreateTestingModule } from './test-utils';
        describe('Creates the testingModule using the function alias in the beforeEach scope', () => {
          let testingModule: TestingModule;
          beforeAll(async () => {
            testingModule = await customCreateTestingModule();
          });
          it('should be defined', () => {
            expect(testingModule).toBeDefined();
          });
          afterEach(async () => {
            await testingModule.close();
          })
        });
      `,
      options: [
        {
          createAliases: [
            {
              kind: 'function',
              name: 'customCreateTestingModule',
            },
          ],
        },
      ],
      errors: [
        {
          messageId: 'testModuleClosedInWrongHook',
        },
      ],
    },
  ],
  // TODO: Add tests for the following scenarios:
  // - Test module created (with custom function alias) in the beforeEach hook and closed in the afterAll hook
  // - Test module created (with custom method alias) in the beforeAll hook and closed in the afterEach hook
  // - Test module created (with custom method alias) in the beforeEach hook and closed in the afterAll hook
});
