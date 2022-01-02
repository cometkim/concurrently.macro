import type { NodePath } from '@babel/core';
import type {
  ArrowFunctionExpression,
  CallExpression,
  FunctionExpression,
} from '@babel/types';
import { interpret } from '@xstate/fsm';
import type { MacroHandler } from 'babel-plugin-macros';
import { createMacro } from 'babel-plugin-macros';

import { machine } from './machine';
import { isFloat, arrayOf } from './utils';

const handler: MacroHandler = ({ references }) => {
  for (const referencePath of references.default) {
    const { node, parentPath } = referencePath;

    if (!parentPath.isCallExpression({ callee: node })) {
      throw parentPath.buildCodeFrameError('The macro must be used as a call expression');
    }

    const callPath = parentPath as NodePath<CallExpression>;
    const [argumentPath, concurrencyPath] = callPath.get('arguments');

    let concurrency = Infinity;
    if (concurrencyPath) {
      if (concurrencyPath.isNumericLiteral()) {
        concurrency = concurrencyPath.node.value;
      } else {
        throw concurrencyPath.buildCodeFrameError('Only numeric literal is accepted here');
      }
    }
    if (isFloat(concurrency)) {
      throw concurrencyPath.buildCodeFrameError('Only value is accepted here');
    }

    function validateFunctionPath(nodePath: NodePath<any>): nodePath is NodePath<FunctionExpression | ArrowFunctionExpression> {
      return nodePath.isFunctionExpression() || nodePath.isArrowFunctionExpression();
    }

    let functionPath = argumentPath;
    let sideEffectFn: string | null = null;

    if (functionPath.isArrowFunctionExpression() && !functionPath.node.async) {
      const [param] = arrayOf(functionPath.get('params'));
      if (!param.isIdentifier()) {
        throw param.buildCodeFrameError('Only idenfifier is accepted here');
      }
      sideEffectFn = param.node.name;
      functionPath = functionPath.get('body') as NodePath<any>;
    }

    if (!validateFunctionPath(functionPath)) {
      throw functionPath.buildCodeFrameError('Only (arrow) function expression is accepted here');
    }

    const service = interpret(machine).start();

    functionPath.traverse({
      AwaitExpression: {
        enter(path) {
          service.send({ type: 'ENTER_AWAIT_EXPRESSION', path });
        },
        exit() {
          service.send({ type: 'EXIT_AWAIT_EXPRESSION' });
        },
      },
      BlockStatement: {
        enter() {
          service.send({ type: 'ENTER_BLOCK_STATEMENT' });
        },
        exit() {
          service.send({ type: 'EXIT_BLOCK_STATEMENT' });
        },
      },
      CallExpression(path) {
        const node = path.node.callee;
        if (node.type === 'Identifier' && node.name === sideEffectFn) {
          service.send({ type: 'CALL_SIDE_EFFECT', path });
        }
      },
    });

    service.stop();

    callPath.replaceWith(functionPath);
  }
};

export default createMacro(handler);
