import {
  ASTUtils,
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESTree,
} from '@typescript-eslint/utils';
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
      // Matches: constructor(@Inject(FOO_SERVICE) private readonly >>fooService<<: FooService)
      'TSParameterProperty > Identifier[typeAnnotation.typeAnnotation.type="TSTypeReference"]':
        (node: TSESTree.Identifier) => {
          const typeName = (
            node.typeAnnotation?.typeAnnotation as TSESTree.TSTypeReference
          ).typeName;

          const injectDecorator = (
            node.parent as TSESTree.TSParameterProperty
          ).decorators.find(
            (decorator) =>
              decorator.expression.type === AST_NODE_TYPES.CallExpression &&
              ASTUtils.isIdentifier(decorator.expression.callee) &&
              decorator.expression.callee.name === 'Inject'
          );

          const injectedIdentifier = (
            injectDecorator?.expression as TSESTree.CallExpression
          )?.arguments[0];

          const injectedToken = (injectedIdentifier as TSESTree.Identifier)
            ?.name;

          if (
            ASTUtils.isIdentifier(typeName) &&
            typeName.name === injectedToken
          ) {
            context.report({
              node,
              messageId: 'tokenDuplicatesType',
              loc: node.loc,
            });
          }

          const services = ESLintUtils.getParserServices(context);
          const type = services.getTypeAtLocation(node);

          if (!type.isClass() && type.isClassOrInterface() && !injectedToken) {
            context.report({
              node,
              messageId: 'typeIsInterface',
              loc: node.loc,
            });
          }
        },
    };
  },
});
