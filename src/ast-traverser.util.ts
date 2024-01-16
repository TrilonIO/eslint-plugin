import type { TSESTree } from '@typescript-eslint/utils';
import { ASTUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

export function getAllParentNodesOfType<TNode extends TSESTree.Node>(
  node: TSESTree.Node,
  type: AST_NODE_TYPES
): TNode[] {
  if (node.parent?.type === type) {
    return [node.parent as TNode].concat(
      getAllParentNodesOfType<TNode>(node.parent, type)
    );
  } else if (node?.parent) {
    return getAllParentNodesOfType<TNode>(node.parent, type);
  } else {
    return [];
  }
}

export function firstParentNodeOfType<TNode extends TSESTree.Node>(
  node: TSESTree.Node,
  type: AST_NODE_TYPES
): TNode | undefined {
  if (node.parent?.type === type) {
    return node.parent as TNode;
  } else if (node?.parent) {
    return firstParentNodeOfType<TNode>(node.parent, type);
  } else {
    return undefined;
  }
}

export function getAllParentCallExpressions(
  node: TSESTree.Node
): TSESTree.CallExpression[] {
  return getAllParentNodesOfType<TSESTree.CallExpression>(
    node,
    AST_NODE_TYPES.CallExpression
  );
}

export function getAllParentAssignmentExpressions(
  node: TSESTree.Node
): TSESTree.AssignmentExpression[] {
  return getAllParentNodesOfType<TSESTree.AssignmentExpression>(
    node,
    AST_NODE_TYPES.AssignmentExpression
  );
}

export function firstAssignmentExpressionInParentChain(
  node: TSESTree.Node
): TSESTree.AssignmentExpression | undefined {
  return firstParentNodeOfType<TSESTree.AssignmentExpression>(
    node,
    AST_NODE_TYPES.AssignmentExpression
  );
}

export function getInjectDecoratorFor(node: TSESTree.Node) {
  return (node as TSESTree.TSParameterProperty)?.decorators?.find(
    (decorator) =>
      decorator.expression.type === AST_NODE_TYPES.CallExpression &&
      ASTUtils.isIdentifier(decorator.expression.callee) &&
      decorator.expression.callee.name === 'Inject'
  );
}

export function getInjectedTokenFor(decoratorNode?: TSESTree.Decorator) {
  const injectedIdentifier = (
    decoratorNode?.expression as TSESTree.CallExpression
  )?.arguments[0];

  const injectedToken = (injectedIdentifier as TSESTree.Identifier)?.name;

  return injectedToken;
}
