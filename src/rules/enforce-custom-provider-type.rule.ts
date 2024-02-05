import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://eslint.org/docs/latest/rules/${name}`
);

type ProviderType = 'class' | 'factory' | 'value';

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
    return {
      'Program:exit': (node) => {},
    };
  },
});
