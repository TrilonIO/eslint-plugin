import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://eslint.org/docs/latest/rules/${name}`
);

export type MessageIds =
  | 'serviceCircularDependency'
  | 'moduleCircularDependency';

const defaultOptions: unknown[] = [];

export default createRule<unknown[], MessageIds>({
  name: 'detect-circular-reference',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Warns about circular dependencies with forwardRef() function',
      recommended: 'recommended',
    },
    fixable: undefined,
    schema: [], // no options
    messages: {
      serviceCircularDependency: '⚠️ Circular-dependency detected',
      moduleCircularDependency: '⚠️ Circular-dependency detected',
    },
  },
  defaultOptions,
  create(context) {
    return {
      'CallExpression > Identifier[name="forwardRef"]': (
        node: TSESTree.Identifier
      ) => {
        if (node?.name === 'forwardRef') {
          context.report({
            messageId: 'serviceCircularDependency',
            node,
            loc: node.loc,
          });
        }
      },
    };
  },
});
