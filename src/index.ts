import type { NodePath } from '@babel/core';
import type {
  ArrowFunctionExpression,
  CallExpression,
  Expression,
  FunctionExpression,
  Identifier,
  VariableDeclarator,
} from '@babel/types';
import type { MacroHandler } from 'babel-plugin-macros';
import { createMacro, MacroError } from 'babel-plugin-macros';

const handler: MacroHandler = ({ references, state, babel }) => {
  const { types: t, template } = babel;
  for (const referencePath of references.default) {
    const { node, parentPath } = referencePath;

    if (!parentPath.isCallExpression({ callee: node })) {
      throw parentPath.buildCodeFrameError('The macro must be used as a call expression');
    }
    const callPath = parentPath as NodePath<CallExpression>;

    const argumentPath = callPath.get('arguments')[0];
    if (!(argumentPath.isFunctionExpression() || argumentPath.isArrowFunctionExpression())) {
      throw parentPath.buildCodeFrameError('Only (arrow) function expression is accepted here');
    }
    const functionPath = argumentPath as NodePath<FunctionExpression | ArrowFunctionExpression>;

    if (!functionPath.get('async')) {
      throw functionPath.buildCodeFrameError('Only async function is accepted here');
    }

    const promiseArgs: Array<{ decl: string, expression: Expression }> = [];
    functionPath.traverse({
      AwaitExpression(path) {
        const { node, parentPath } = path;
        if (parentPath.isVariableDeclarator()) {
          const declaratorPath = parentPath as NodePath<VariableDeclarator>;
          const decl = declaratorPath.get('id').node as Identifier;
          promiseArgs.push({ decl: decl.name, expression: node.argument });
          parentPath.parentPath.remove();
        }
      },
    });

    const ast = t.variableDeclaration('const', [
      t.variableDeclarator(
        t.objectPattern(
          promiseArgs.map((args, i) => t.objectProperty(t.numericLiteral(i), t.identifier(args.decl)))
        ),
        t.awaitExpression(
          t.callExpression(
            t.memberExpression(
              t.identifier('Promise'),
              t.identifier('all'),
            ),
            [t.arrayExpression(
              promiseArgs.map(args => t.clone(args.expression)),
            )],
          ),
        ),
      ),
    ]);
    // @ts-ignore
    functionPath.get('body').unshiftContainer('body', ast);
    callPath.replaceWith(functionPath);

    // throw new MacroError('WIP: Not implemented yet');
  }
};

export default createMacro(handler);
