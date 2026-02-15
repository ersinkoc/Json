import type {
  JsonKernel,
  JsonPlugin,
  JsonPatchOperation,
  JsonValue,
} from "../../types";
import { isObject, isArray } from "../../utils";

function getValueByPointer(data: unknown, pointer: string): unknown {
  if (pointer === "" || pointer === "/") return data;

  const segments = pointer
    .split("/")
    .slice(1)
    .map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));
  let current = data;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (isArray(current)) {
      const index = parseInt(segment, 10);
      if (isNaN(index) || index < 0 || index >= current.length) {
        return undefined;
      }
      current = current[index];
    } else if (isObject(current)) {
      current = current[segment];
    } else {
      return undefined;
    }
  }

  return current;
}

function setValueByPointer(
  data: unknown,
  pointer: string,
  value: unknown,
): unknown {
  if (pointer === "" || pointer === "/") {
    return value;
  }

  const segments = pointer
    .split("/")
    .slice(1)
    .map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));
  const cloned = JSON.parse(JSON.stringify(data));
  let current: unknown = cloned;

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    if (segment === undefined) break;

    if (isArray(current)) {
      const index = parseInt(segment, 10);
      current = current[index];
    } else if (isObject(current)) {
      current = current[segment];
    }
  }

  const lastSegment = segments[segments.length - 1];
  if (lastSegment === undefined) return cloned;

  if (isArray(current)) {
    const index = parseInt(lastSegment, 10);
    current[index] = value;
  } else if (isObject(current)) {
    current[lastSegment] = value;
  }

  return cloned;
}

function removeValueByPointer(data: unknown, pointer: string): unknown {
  if (pointer === "" || pointer === "/") {
    return undefined;
  }

  const segments = pointer
    .split("/")
    .slice(1)
    .map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));
  const cloned = JSON.parse(JSON.stringify(data));
  let current: unknown = cloned;

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    if (segment === undefined) break;

    if (isArray(current)) {
      const index = parseInt(segment, 10);
      current = current[index];
    } else if (isObject(current)) {
      current = current[segment];
    }
  }

  const lastSegment = segments[segments.length - 1];
  if (lastSegment === undefined) return cloned;

  if (isArray(current)) {
    const index = parseInt(lastSegment, 10);
    current.splice(index, 1);
  } else if (isObject(current)) {
    delete current[lastSegment];
  }

  return cloned;
}

function generateDiff(
  before: unknown,
  after: unknown,
  path: string = "",
): JsonPatchOperation[] {
  const operations: JsonPatchOperation[] = [];

  if (before === after) {
    return operations;
  }

  if (before === undefined) {
    operations.push({
      op: "add",
      path: path || "/",
      value: after as JsonValue,
    });
    return operations;
  }

  if (after === undefined) {
    operations.push({ op: "remove", path: path || "/" });
    return operations;
  }

  if (typeof before !== typeof after) {
    operations.push({
      op: "replace",
      path: path || "/",
      value: after as JsonValue,
    });
    return operations;
  }

  if (!isObject(before) && !isArray(before)) {
    if (before !== after) {
      operations.push({
        op: "replace",
        path: path || "/",
        value: after as JsonValue,
      });
    }
    return operations;
  }

  if (isArray(before) && isArray(after)) {
    if (before.length !== after.length) {
      operations.push({
        op: "replace",
        path: path || "/",
        value: after as JsonValue,
      });
      return operations;
    }

    for (let i = 0; i < before.length; i++) {
      const itemPath = `${path}/${i}`;
      operations.push(...generateDiff(before[i], after[i], itemPath));
    }
    return operations;
  }

  if (isObject(before) && isObject(after)) {
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

    for (const key of allKeys) {
      const keyEscaped = key.replace(/~/g, "~0").replace(/\//g, "~1");
      const keyPath = `${path}/${keyEscaped}`;

      if (!(key in before)) {
        operations.push({
          op: "add",
          path: keyPath,
          value: after[key] as JsonValue,
        });
      } else if (!(key in after)) {
        operations.push({ op: "remove", path: keyPath });
      } else {
        operations.push(...generateDiff(before[key], after[key], keyPath));
      }
    }
    return operations;
  }

  operations.push({
    op: "replace",
    path: path || "/",
    value: after as JsonValue,
  });
  return operations;
}

export function createDiffPlugin(): JsonPlugin {
  return {
    name: "diff",
    version: "1.0.0",

    install(kernel: JsonKernel) {
      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(diffPlugin);
       *
       * // Simple diff
       * json.diff({ name: 'John' }, { name: 'Jane' });
       * // => [{ op: 'replace', path: '/name', value: 'Jane' }]
       *
       * // Add operation
       * json.diff({ a: 1 }, { a: 1, b: 2 });
       * // => [{ op: 'add', path: '/b', value: 2 }]
       *
       * // Remove operation
       * json.diff({ a: 1, b: 2 }, { a: 1 });
       * // => [{ op: 'remove', path: '/b' }]
       * ```
       */
      kernel.register(
        "diff",
        (before: unknown, after: unknown): JsonPatchOperation[] => {
          return generateDiff(before, after);
        },
      );
    },
  };
}

export const diffPlugin = createDiffPlugin();

export function createPatchPlugin(): JsonPlugin {
  return {
    name: "patch",
    version: "1.0.0",
    dependencies: ["diff"],

    install(kernel: JsonKernel) {
      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(diffPlugin, patchPlugin);
       *
       * // Apply patches
       * json.patch({ name: 'John' }, [
       *   { op: 'replace', path: '/name', value: 'Jane' }
       * ]);
       * // => { name: 'Jane' }
       *
       * // Add property
       * json.patch({ a: 1 }, [
       *   { op: 'add', path: '/b', value: 2 }
       * ]);
       * // => { a: 1, b: 2 }
       *
       * // Remove property
       * json.patch({ a: 1, b: 2 }, [
       *   { op: 'remove', path: '/b' }
       * ]);
       * // => { a: 1 }
       * ```
       */
      kernel.register(
        "patch",
        (obj: unknown, operations: JsonPatchOperation[]): unknown => {
          let result = obj;

          for (const op of operations) {
            switch (op.op) {
              case "add": {
                const pathParts = op.path.split("/");
                const parentPath = pathParts.slice(0, -1).join("/") || "/";
                const lastPart = pathParts[pathParts.length - 1];

                let parent = getValueByPointer(result, parentPath);

                if (isArray(parent)) {
                  const index =
                    lastPart === "-"
                      ? parent.length
                      : parseInt(
                          lastPart!.replace(/~1/g, "/").replace(/~0/g, "~"),
                          10,
                        );
                  parent = [
                    ...parent.slice(0, index),
                    op.value,
                    ...parent.slice(index),
                  ];
                  result =
                    parentPath === "/"
                      ? parent
                      : setValueByPointer(result, parentPath, parent);
                } else if (isObject(parent)) {
                  parent = {
                    ...parent,
                    [lastPart!.replace(/~1/g, "/").replace(/~0/g, "~")]:
                      op.value,
                  };
                  result =
                    parentPath === "/"
                      ? parent
                      : setValueByPointer(result, parentPath, parent);
                } else {
                  result = op.value;
                }
                break;
              }
              case "remove":
                result = removeValueByPointer(result, op.path);
                break;
              case "replace":
                result = setValueByPointer(result, op.path, op.value);
                break;
              case "move": {
                const value = getValueByPointer(result, op.from);
                result = removeValueByPointer(result, op.from);
                result = setValueByPointer(result, op.path, value);
                break;
              }
              case "copy": {
                const value = getValueByPointer(result, op.from);
                result = setValueByPointer(result, op.path, value);
                break;
              }
              case "test": {
                const value = getValueByPointer(result, op.path);
                if (value !== op.value) {
                  throw new Error(`Test failed at path ${op.path}`);
                }
                break;
              }
            }
          }

          return result;
        },
      );

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(diffPlugin, patchPlugin);
       *
       * // Valid patch
       * json.validatePatch([{ op: 'add', path: '/b', value: 2 }]);
       * // => { valid: true }
       *
       * // Invalid patch (missing 'value')
       * json.validatePatch([{ op: 'add', path: '/b' }]);
       * // => { valid: false, errors: ['Operation 0: missing "value" field for add operation'] }
       * ```
       */
      kernel.register(
        "validatePatch",
        (
          operations: JsonPatchOperation[],
        ): { valid: boolean; errors?: string[] } => {
          const errors: string[] = [];
          const validOps = ["add", "remove", "replace", "move", "copy", "test"];

          for (let i = 0; i < operations.length; i++) {
            const operation = operations[i];
            const op = operation?.op;

            if (!op) {
              errors.push(`Operation ${i}: missing "op" field`);
              continue;
            }

            if (!validOps.includes(op)) {
              errors.push(`Operation ${i}: invalid op "${op}"`);
            }

            if (!("path" in operation) || typeof operation.path !== "string") {
              errors.push(`Operation ${i}: missing or invalid "path" field`);
            }

            if (
              (op === "add" || op === "replace" || op === "test") &&
              !("value" in operation)
            ) {
              errors.push(
                `Operation ${i}: missing "value" field for ${op} operation`,
              );
            }

            if ((op === "move" || op === "copy") && !("from" in operation)) {
              errors.push(
                `Operation ${i}: missing "from" field for ${op} operation`,
              );
            }
          }

          return errors.length === 0
            ? { valid: true }
            : { valid: false, errors };
        },
      );

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(diffPlugin, patchPlugin);
       *
       * const original = { name: 'John', age: 30 };
       * const operations = [
       *   { op: 'replace', path: '/name', value: 'Jane' },
       *   { op: 'remove', path: '/age' }
       * ];
       *
       * // Get reverse patch
       * const reverse = json.reversePatch(operations, original);
       * // => [
       * // =>   { op: 'add', path: '/age', value: 30 },
       * // =>   { op: 'replace', path: '/name', value: 'John' }
       * // => ]
       * ```
       */
      kernel.register(
        "reversePatch",
        (
          operations: JsonPatchOperation[],
          original: unknown,
        ): JsonPatchOperation[] => {
          const reversed: JsonPatchOperation[] = [];

          for (let i = operations.length - 1; i >= 0; i--) {
            const operation = operations[i];
            if (!operation) continue;

            const opType = operation.op;

            if (opType === "add") {
              reversed.push({ op: "remove", path: operation.path });
            } else if (opType === "remove") {
              const originalValue = getValueByPointer(original, operation.path);
              reversed.push({
                op: "add",
                path: operation.path,
                value: originalValue as JsonValue,
              });
            } else if (opType === "replace") {
              const originalValue = getValueByPointer(original, operation.path);
              reversed.push({
                op: "replace",
                path: operation.path,
                value: originalValue as JsonValue,
              });
            } else if (opType === "move" && "from" in operation) {
              reversed.push({
                op: "move",
                from: operation.path,
                path: operation.from,
              });
            } else if (opType === "copy") {
              reversed.push({ op: "remove", path: operation.path });
            } else if (opType === "test" && "value" in operation) {
              reversed.push({
                op: "test",
                path: operation.path,
                value: operation.value,
              });
            }
          }

          return reversed;
        },
      );
    },
  };
}

export const patchPlugin = createPatchPlugin();
