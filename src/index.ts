import type { NodePath } from '@babel/core';
import type { ArrowFunctionExpression, CallExpression, FunctionExpression } from '@babel/types';
import type { MacroHandler } from 'babel-plugin-macros';
import { createMacro, MacroError } from 'babel-plugin-macros';

const handler: MacroHandler = ({ references, state, babel }) => {
  for (const referencePath of references.default) {
    const { node, parentPath } = referencePath;

    if (!parentPath.isCallExpression({ callee: node })) {
      throw parentPath.buildCodeFrameError('The macro must be used as a call expression');
    }
    const callPath = parentPath as NodePath<CallExpression>;

    const argumentPath = callPath.get("arguments")[0];
    if (!(argumentPath.isFunctionExpression() || argumentPath.isArrowFunctionExpression())) {
      throw parentPath.buildCodeFrameError('Only (arrow) function expression is accepted here');
    }
    const functionPath = argumentPath as NodePath<FunctionExpression | ArrowFunctionExpression>;
    functionPath.traverse({
      // AwaitExpression:
    });
    callPath.replaceWith(functionPath);

    // throw new MacroError('WIP: Not implemented yet');
  }
};

export default createMacro(handler);
