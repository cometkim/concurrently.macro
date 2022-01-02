import type { NodePath } from '@babel/core';
import type {
  AwaitExpression,
  CallExpression,
  Expression,
  LVal,
  ObjectProperty,
  Statement,
} from '@babel/types';
import * as t from '@babel/types';
import template from '@babel/template';
import { createMachine, assign } from '@xstate/fsm';

import { intersect, arrayOf } from './utils';

type Argument = {
  val: LVal | null,
  path: NodePath,
  expression: Expression,
  dependencies: string[],
};

type Context = {
  counter: number,
  maxCount: number,
  placeholder: NodePath | null,
  currentArgument: Argument | null,
  currentBindings: string[],
  bindings: string[],
  arguments: Argument[],
};

type Event = (
  | { type: 'ENTER_AWAIT_EXPRESSION', path: NodePath<AwaitExpression> }
  | { type: 'EXIT_AWAIT_EXPRESSION' }
  | { type: 'ENTER_BLOCK_STATEMENT' }
  | { type: 'EXIT_BLOCK_STATEMENT' }
  | { type: 'CALL_SIDE_EFFECT', path: NodePath<CallExpression> }
);

export const machine = createMachine<Context, Event>({
  context: {
    counter: 0,
    maxCount: Infinity,
    placeholder: null,
    currentArgument: null,
    currentBindings: [],
    bindings: [],
    arguments: [],
  },
  initial: 'idle',
  states: {
    idle: {
      on: {
        ENTER_AWAIT_EXPRESSION: {
          actions: assign((context, event) => {
            const currentArgument: Argument = {
              val: null,
              path: event.path.parentPath,
              expression: event.path.node.argument,
              dependencies: [],
            };

            if (event.path.parentPath.isVariableDeclarator()) {
              currentArgument.path = event.path.parentPath.parentPath;
            }

            if (currentArgument.path.state?.replaced) {
              return context;
            }

            // collect new declaratios
            const currentBindings: string[] = [];
            if (event.path.parentPath.isVariableDeclarator()) {
              const node = event.path.parentPath.node;
              if (node.id.type === 'Identifier') {
                const val = node.id;
                currentArgument.val = val;
                currentBindings.push(val.name);
              } else {
                const val = node.id;
                currentArgument.val = val;
                currentArgument.path.traverse({
                  Identifier(path) {
                    if (path.findParent(path => path === event.path)) {
                      return;
                    }
                    const { node, parentPath } = path;
                    if (parentPath.isObjectProperty()) {
                      if (node === parentPath.node.value) {
                        currentBindings.push(node.name);
                      }
                    } else if (parentPath.isArrayPattern()) {
                      currentBindings.push(node.name);
                    }
                  },
                });
              }
            }

            // collect dependencies
            event.path.traverse({
              Identifier({ node, parentPath }) {
                if (
                  parentPath === event.path ||
                  parentPath.isCallExpression() ||
                  parentPath.isArrayExpression() ||
                  parentPath.isMemberExpression({ object: node })
                ) {
                  currentArgument.dependencies.push(node.name);
                }
              },
            });

            return {
              ...context,
              counter: context.counter + 1,
              placeholder: context.placeholder ?? currentArgument.path,
              currentArgument,
              currentBindings,
            };
          }),
        },
        EXIT_AWAIT_EXPRESSION: [
          {
            cond: context => intersect(context.bindings, context.currentArgument?.dependencies ?? []),
            actions: 'commit',
          },
          {
            cond: context => context.counter === context.maxCount,
            actions: 'commit',
          },
          {
            actions: assign<Context>({
              currentBindings: [],
              currentArgument: null,
              bindings: context => [...new Set(context.bindings.concat(context.currentBindings))],
              arguments: context => context.arguments.concat(context.currentArgument ?? []),
            }),
          },
        ],
        ENTER_BLOCK_STATEMENT: {
          actions: 'commit',
        },
        EXIT_BLOCK_STATEMENT: {
          actions: 'commit',
        },
        CALL_SIDE_EFFECT: {
          actions: [
            (_context, event) => {
              if (event.type === 'CALL_SIDE_EFFECT') {
                event.path.parentPath.remove();
              }
            },
            'commit',
          ],
        },
      },
    },
  },
}, {
  actions: {
    commit: assign(context => {
      if (!context.placeholder) {
        return context;
      }

      if (context.arguments.length === 0) {
        return context;
      }

      let ast: Statement | Statement[];
      if (context.arguments.length > 1) {
        const builder = template(`
          let ARGS_OUT = await Promise.all(ARGS_IN);
        `);
        ast = builder({
          ARGS_OUT: t.objectPattern(
            context.arguments.reduce((output, { val }, i) => {
              if (val) {
                output.push(
                  t.objectProperty(
                    t.stringLiteral(i.toString()),
                    t.clone(val as any),
                  ),
                );
              }
              return output;
            }, [] as ObjectProperty[]),
          ),
          ARGS_IN: t.arrayExpression(
            context.arguments.map(arg => t.clone(arg.expression)),
          ),
        });
      } else if (context.arguments[0].val) {
        const builder = template(`
          let ARGS_OUT = await ARGS_IN;
        `);
        ast = builder({
          ARGS_OUT: t.clone(context.arguments[0].val),
          ARGS_IN: t.clone(context.arguments[0].expression),
        });
      } else {
        const builder = template(`
          await ARGS_IN;
        `);
        ast = builder({
          ARGS_IN: t.clone(context.arguments[0].expression),
        });
      }

      context.arguments
        .filter(arg => arg.path !== context.placeholder)
        .forEach(arg => arg.path.remove());

      context.placeholder.replaceInline(ast);
      context.placeholder.state = { replaced: true };

      return {
        ...context,
        counter: 0,
        placeholder: context.currentArgument?.path ?? null,
        currentBindings: [],
        currentArgument: null,
        bindings: context.currentBindings,
        arguments: arrayOf(context.currentArgument ?? []),
      };
    }),
  },
});
