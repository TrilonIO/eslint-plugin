import type { TSESTree } from '@typescript-eslint/utils';
import {
  AST_NODE_TYPES,
  ESLintUtils,
  ASTUtils,
} from '@typescript-eslint/utils';
import * as traverser from '../ast-traverser.util';

type TestBeforeHooks = 'beforeAll' | 'beforeEach';
type TestAfterHooks = 'afterAll' | 'afterEach';
type HookType = 'all' | 'each';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://eslint.org/docs/latest/rules/${name}`
);

function typeOfHook(hookName: TestBeforeHooks | TestAfterHooks): HookType {
  return hookName.includes('All') ? 'all' : 'each';
}

export type Options = [
  {
    closeAliases?: {
      kind: string;
      name: string;
    }[];
  }
]

const defaultOptions: Options = [
  {
    closeAliases: [

    ]
  }
]

export type MessageIds = 'testModuleNotClosed' | 'testModuleClosedInWrongHook';

export default createRule<Options, MessageIds>({
  name: 'enforce-close-testing-module',
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure NestJS testing modules are closed properly',
      recommended: 'recommended',
    },
    fixable: undefined,
    schema: [
      {
        type: 'object',
        properties: {
          closeAliases: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                kind: {
                  type: 'string',
                },
                name: {
                  type: 'string',
                }
              }
            }
          }
        }
      }
    ], // no options
    messages: {
      testModuleNotClosed:
        'A Testing Module was created but not closed, which can cause memory leaks',
      testModuleClosedInWrongHook:
        'A Testing Module was created in {{ created }} but was closed in the wrong hook {{ closed }}',
    },
  },
  defaultOptions,
  create(context) {
    let testModuleCreated = false;
    let testModuleClosed = false;
    let testingModuleVariableName: string | undefined;
    let createdInHook: TestBeforeHooks | undefined;
    const testingModuleCreatedPosition: TSESTree.SourceLocation = {
      start: { line: 0, column: 0 },
      end: { line: 0, column: 0 },
    };
    let closedInHook: TestAfterHooks | undefined;

    let appModuleCreated = false;
    let appModuleClosed = false;
    let appModuleVariableName: string | undefined;

    return {
      // Matches code that defines a variable of type TestingModule
      // e.g. `let testingModule: TestingModule;`
      'VariableDeclarator[id.typeAnnotation.typeAnnotation.typeName.name="TestingModule"]':
        (node: TSESTree.VariableDeclarator) => {
          testModuleCreated = true;
          if (ASTUtils.isIdentifier(node.id)) {
            testingModuleVariableName = node.id.name;
          }
        },

      // Matches code that creates a testing module and assigns it to a variable
      // e.g. `const testingModule = await Test.createTestingModule({ ... }).compile();`
      'VariableDeclarator[init.type="AwaitExpression"][init.argument.callee.type="MemberExpression"][init.argument.callee.object.callee.object.name="Test"][init.argument.callee.object.callee.property.name="createTestingModule"]':
        (node: TSESTree.VariableDeclarator) => {
          testModuleCreated = true;
          if (ASTUtils.isIdentifier(node.id)) {
            testingModuleVariableName = node.id.name;
          }
        },

      'MemberExpression[object.name="Test"][property.name="createTestingModule"]':
        (node: TSESTree.MemberExpression) => {
          // Check under which hook the module was created
          const callExpressions = traverser.getAllParentCallExpressions(node);
          const callExpressionWithHook = callExpressions.find(
            (expression) =>
              ASTUtils.isIdentifier(expression.callee) &&
              ['beforeAll', 'beforeEach'].includes(expression.callee.name)
          );
          if (
            callExpressionWithHook &&
            ASTUtils.isIdentifier(callExpressionWithHook.callee)
          ) {
            createdInHook = callExpressionWithHook.callee
              .name as TestBeforeHooks;
          }
        },
      'MemberExpression[property.name="createNestApplication"]': (node) => {
        // Checks if app.createNestApplication() is called
        appModuleCreated = true;
        const assignmentExpression =
          traverser.firstAssignmentExpressionInParentChain(node);
        if (ASTUtils.isIdentifier(assignmentExpression?.left)) {
          appModuleVariableName = assignmentExpression?.left.name;
        }
      },
      'MemberExpression[property.name="close"]': (
        node: TSESTree.MemberExpression
      ) => {
        // Logic to check if module.close() is called
        if (
          node.object.type === AST_NODE_TYPES.Identifier &&
          node.object.name === testingModuleVariableName &&
          testModuleCreated
        ) {
          testModuleClosed = true;
        }

        // Logic to check if app.close() is called
        if (
          node.object.type === AST_NODE_TYPES.Identifier &&
          node.object.name === appModuleVariableName &&
          appModuleCreated
        ) {
          appModuleClosed = true;
        }

        // Logic to check if module.close() is called in the wrong hook
        const callExpressions = traverser.getAllParentCallExpressions(node);
        const callExpressionWithHook = callExpressions.find(
          (expression) =>
            ASTUtils.isIdentifier(expression.callee) &&
            ['afterAll', 'afterEach'].includes(expression.callee.name)
        );
        if (
          callExpressionWithHook &&
          ASTUtils.isIdentifier(callExpressionWithHook.callee)
        ) {
          closedInHook = callExpressionWithHook.callee.name as TestAfterHooks;
        }

        if (
          closedInHook &&
          createdInHook &&
          typeOfHook(closedInHook) !== typeOfHook(createdInHook) &&
          testModuleCreated
        ) {
          context.report({
            node,
            messageId: 'testModuleClosedInWrongHook',
            data: {
              created: createdInHook,
              closed: closedInHook,
            },
          });
        }
      },
      'CallExpression[callee.type="Identifier"]': (node: TSESTree.CallExpression) => {
        const calleeName = (node.callee as TSESTree.Identifier).name;
        const functionAliases = context.options[0]?.closeAliases?.filter(alias => alias.kind === 'function')

        if (functionAliases?.some(alias => alias.name === calleeName)) {
          testModuleClosed = true;

        // Logic to check if module.close() is called in the wrong hook
        const callExpressions = traverser.getAllParentCallExpressions(node);
        const callExpressionWithHook = callExpressions.find(
          (expression) =>
            ASTUtils.isIdentifier(expression.callee) &&
            ['afterAll', 'afterEach'].includes(expression.callee.name)
        );
        if (
          callExpressionWithHook &&
          ASTUtils.isIdentifier(callExpressionWithHook.callee)
        ) {
          closedInHook = callExpressionWithHook.callee.name as TestAfterHooks;
        }
        }
      },
      'Program:exit': (node) => {
        if (testModuleCreated && !testModuleClosed && !appModuleClosed) {
          context.report({
            node,
            messageId: 'testModuleNotClosed',
            loc: testingModuleCreatedPosition,
          });
        }
      },
    };
  },
});
