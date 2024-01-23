import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESTree,
} from '@typescript-eslint/utils';

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
        node: TSESTree.Identifier & {
          parent: TSESTree.CallExpression;
        }
      ) => {
        if (node?.name !== 'forwardRef') {
          return;
        }

        if (isNodeWithinImportsArray(node.parent)) {
          return context.report({
            messageId: 'moduleCircularDependency',
            node,
            loc: node.loc,
          });
        }

        return context.report({
          messageId: 'serviceCircularDependency',
          node,
          loc: node.loc,
        });
      },
    };
  },
});

function isNodeWithinImportsArray(node: TSESTree.CallExpression): boolean {
  return !!(
    node.parent?.type === AST_NODE_TYPES.ArrayExpression &&
    node.parent?.elements.find(isForwardRefExpression)
  );
}

function isForwardRefExpression(
  node: TSESTree.Expression | null | TSESTree.SpreadElement
): node is TSESTree.CallExpression & {
  callee: TSESTree.Identifier & {
    name: 'forwardRef';
  };
} {
  return (
    node?.type === AST_NODE_TYPES.CallExpression &&
    node?.callee.type === AST_NODE_TYPES.Identifier &&
    node?.callee.name === 'forwardRef'
  );
}
