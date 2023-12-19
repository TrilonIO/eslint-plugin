import { ASTUtils, ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

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
    let tokenName: string | undefined;
    return {
      // Matches: @Inject(FOO_SERVICE)
      'Decorator[expression.callee.name="Inject"]': (
        node: TSESTree.Decorator
      ) => {
        const injectedToken = (node.expression as TSESTree.CallExpression)
          .arguments[0];

        if (ASTUtils.isIdentifier(injectedToken)) {
          tokenName = injectedToken.name;
        }
      },

      // Matches: constructor(@Inject(FOO_SERVICE) private readonly >>fooService<<: FooService)
      'TSParameterProperty > Identifier[typeAnnotation.typeAnnotation.type="TSTypeReference"]':
        (node: TSESTree.Identifier) => {
          const typeName = (
            node.typeAnnotation?.typeAnnotation as TSESTree.TSTypeReference
          ).typeName;

          if (ASTUtils.isIdentifier(typeName) && typeName.name === tokenName) {
            context.report({
              node,
              messageId: 'tokenDuplicatesType',
              loc: node.loc,
            });
          }
        },
    };
  },
});
