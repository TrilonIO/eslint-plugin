import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://eslint.org/docs/latest/rules/${name}`
);

export type MessageIds =
  | 'tokenDuplicatesType'
  | 'typeIsInterface'
  | 'propertyMissingInject';

const defaultOptions: unknown[] = [];

export default createRule({
  name: 'check-inject-decorator',
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure proper use of the @Inject decorator',
      recommended: 'recommended',
    },
    fixable: undefined,
    schema: [], // no options
    messages: {
      tokenDuplicatesType: '⚠️ Token duplicates type',
      typeIsInterface: '⚠️ Type is an interface and cannot be injected',
      propertyMissingInject: '⚠️ Did you want to `@Inject({{type}})`?',
    },
  },
  defaultOptions,
  create(context) {
    return {
      // Matches code that defines a variable of type TestingModule
      // e.g. `let testingModule: TestingModule;`
      'Program:exit': (node) => {
        context.report({
          node,
          messageId: 'tokenDuplicatesType',
          loc: node.loc,
        });
      },
    };
  },
});
