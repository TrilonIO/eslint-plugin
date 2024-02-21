import {
  ASTUtils,
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESTree,
} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://eslint.org/docs/latest/rules/${name}`
);

type ProviderType = 'class' | 'factory' | 'value' | 'existing' | 'unknown';

export type Options = [
  {
    prefer: ProviderType;
  },
];

const defaultOptions: Options = [
  {
    prefer: 'factory',
  },
];

export type MessageIds = 'providerTypeMismatch';

export default createRule<Options, MessageIds>({
  name: 'enforce-custom-provider-type',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure that custom providers are of the preferred type',
    },
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          prefer: {
            type: 'string',
            enum: ['class', 'factory', 'value'],
          },
        },
      },
    ],
    messages: {
      providerTypeMismatch: 'Provider is not of type {{ preferred }}',
    },
  },
  defaultOptions,
  create(context) {
    const options = context.options[0] || defaultOptions[0];
    const preferredType = options.prefer;
    const providerTypesImported: string[] = [];
    return {
      'ImportDeclaration[source.value="@nestjs/common"]': (
        node: TSESTree.ImportDeclaration
      ) => {
        const specifiers = node.specifiers;

        const isImportSpecifier = (
          node: TSESTree.ImportClause
        ): node is TSESTree.ImportSpecifier =>
          node.type === AST_NODE_TYPES.ImportSpecifier;

        const isProviderImport = (spec: TSESTree.ImportSpecifier) =>
          [
            'Provider',
            'ClassProvider',
            'FactoryProvider',
            'ValueProvider',
          ].includes(spec.imported.name);

        specifiers
          .filter(isImportSpecifier)
          .filter(isProviderImport)
          .forEach((spec) =>
            providerTypesImported.push(spec.local.name ?? spec.imported.name)
          );
      },

      'Property[key.name="providers"] > ArrayExpression > ObjectExpression': (
        node: TSESTree.ObjectExpression
      ) => {
        for (const property of node.properties) {
          if (property.type === AST_NODE_TYPES.Property) {
            const propertyKey = (property.key as TSESTree.Identifier)?.name;
            const providerType: ProviderType | undefined =
              propertyKey === 'useClass'
                ? 'class'
                : propertyKey === 'useFactory'
                  ? 'factory'
                  : propertyKey === 'useValue'
                    ? 'value'
                    : propertyKey === 'useExisting'
                      ? 'existing'
                      : undefined;

            if (providerType && providerType !== preferredType) {
              context.report({
                node: property,
                messageId: 'providerTypeMismatch',
                data: {
                  preferred: preferredType,
                },
              });
            }
          }
        }
      },

      'Identifier[typeAnnotation.typeAnnotation.type="TSTypeReference"]': (
        node: TSESTree.Identifier
      ) => {
        const typeName = (
          node.typeAnnotation?.typeAnnotation as TSESTree.TSTypeReference
        ).typeName;

        if (
          ASTUtils.isIdentifier(typeName) &&
          providerTypesImported.includes(typeName.name)
        ) {
          const providerType = getProviderType(node);
          if (providerType && providerType !== preferredType) {
            context.report({
              node,
              messageId: 'providerTypeMismatch',
              data: {
                preferred: preferredType,
              },
            });
          }
        }
      },
    };
  },
});

function getProviderType(node: TSESTree.Identifier): ProviderType | undefined {
  const parent = node.parent;

  if (ASTUtils.isVariableDeclarator(parent)) {
    const init = parent.init;
    let type: ProviderType | undefined;
    if (init?.type === AST_NODE_TYPES.ObjectExpression) {
      const properties = init.properties;
      for (const property of properties) {
        if (
          property.type === AST_NODE_TYPES.Property &&
          ASTUtils.isIdentifier(property.key) &&
          property.key.name === 'useFactory'
        ) {
          type = 'factory';
          break;
        }

        if (
          property.type === AST_NODE_TYPES.Property &&
          ASTUtils.isIdentifier(property.key) &&
          property.key.name === 'useClass'
        ) {
          type = 'class';
          break;
        }

        if (
          property.type === AST_NODE_TYPES.Property &&
          ASTUtils.isIdentifier(property.key) &&
          property.key.name === 'useValue'
        ) {
          type = 'value';
          break;
        }

        if (
          property.type === AST_NODE_TYPES.Property &&
          ASTUtils.isIdentifier(property.key) &&
          property.key.name === 'useExisting'
        ) {
          type = 'existing';
          break;
        }
      }
    }

    return type;
  }
}

