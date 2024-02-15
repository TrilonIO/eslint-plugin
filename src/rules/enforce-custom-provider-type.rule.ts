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
    const providerTypesImported: ProviderType[] = [];
    return {
      'ImportDeclaration[source.value="@nestjs/common"]': (
        node: TSESTree.ImportDeclaration
      ) => {
        const specifiers = node.specifiers;
        for (const specifier of specifiers) {
          if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
            switch (specifier.imported.name) {
              case 'Provider':
                providerTypesImported.push('unknown');
                break;
              case 'ClassProvider':
                providerTypesImported.push('class');
                break;
              case 'FactoryProvider':
                providerTypesImported.push('factory');
                break;
              case 'ValueProvider':
                providerTypesImported.push('value');
                break;
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
          providerTypesImported.includes(
            providerNameToType(typeName.name) as ProviderType
          )
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

function providerNameToType(providerName: string): ProviderType | undefined {
  switch (providerName) {
    case 'ClassProvider':
      return 'class';
    case 'FactoryProvider':
      return 'factory';
    case 'ValueProvider':
      return 'value';
    case 'Provider':
      return 'unknown';
  }
}
