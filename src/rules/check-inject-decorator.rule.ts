import { ASTUtils, ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import * as traverser from '../ast-traverser.util';

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

          const injectDecorator = traverser.injectDecoratorFor(node.parent);
          const injectedToken = traverser.injectedTokenFor(injectDecorator);

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
