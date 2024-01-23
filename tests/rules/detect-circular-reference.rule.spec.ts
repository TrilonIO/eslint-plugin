import { RuleTester } from '@typescript-eslint/rule-tester';
import detectCircularReferenceRule from '../../src/rules/detect-circular-reference.rule';

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

ruleTester.run('detect-circular-reference', detectCircularReferenceRule, {
  valid: [
    {
      code: `  
      import { forwardRef } from '@nestjs/common';
      import { CommonService } from './common.service';
      @Injectable()
      export class CatsService {
        constructor(
          private commonService: CommonService,
        ) {}
      }
      `,
    },
    {
      code: `
      @Module({
        imports: [CatsModule],
      })
      export class CommonModule {}
    `,
    },
  ],
  invalid: [
    {
      code: `
      import { forwardRef } from '@nestjs/common';

      @Injectable()
      export class CatsService {
        constructor(
          @Inject(forwardRef(() => CommonService)) // ⚠️ Circular-dependency detected
          private commonService: CommonService,
        ) {}
      }
      `,
      errors: [
        {
          messageId: 'serviceCircularDependency',
        },
      ],
    },
    {
      code: `
      import { forwardRef as renamedForwardRef } from '@nestjs/common';

      @Injectable()
      export class CatsService {
        constructor(
          @Inject(renamedForwardRef(() => CommonService)) // ⚠️ Circular-dependency detected
          private commonService: CommonService,
        ) {}
      }
      `,
      errors: [
        {
          messageId: 'serviceCircularDependency',
        },
      ],
    },
    {
      code: `
      import { forwardRef } from '@nestjs/common'
      @Module({
        imports: [forwardRef(() => CatsModule)], // ⚠️ Circular-dependency detected
      })
      export class CommonModule {}
      `,
      errors: [
        {
          messageId: 'moduleCircularDependency',
        },
      ],
    },
  ],
});
