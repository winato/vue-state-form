import { computed, reactive, toRaw } from "vue";

type AnyRecord = Record<string, any>;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<U>
    : T[K] extends AnyRecord
      ? DeepPartial<T[K]>
      : T[K];
};

type DeepClearValues<T> = {
  [K in keyof T]?: T[K] extends Array<any>
    ? T[K] | null | undefined
    : T[K] extends AnyRecord
      ? DeepClearValues<T[K]>
      : T[K] | null | undefined;
};

type ModelOptions<T extends AnyRecord> = {
  clearValues?: DeepClearValues<T>;
};

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function clearByType<T>(value: T): T {
  if (typeof value === "string") return "" as T;
  if (typeof value === "number") return 0 as T;
  if (typeof value === "boolean") return false as T;
  if (Array.isArray(value)) return [] as T;

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};

    for (const key in value) {
      result[key] = clearByType(value[key]);
    }

    return result as T;
  }

  if (value === null) return null as T;
  if (typeof value === "undefined") return undefined as T;

  return undefined as T;
}

function buildClearedModel<T>(
  source: T,
  clearValues?: DeepClearValues<T>
): T {
  if (clearValues !== undefined && !isPlainObject(source)) {
    return clearValues as T;
  }

  if (Array.isArray(source)) {
    return (clearValues ?? []) as T;
  }

  if (!isPlainObject(source)) {
    return clearValues !== undefined ? (clearValues as T) : clearByType(source);
  }

  const result: Record<string, unknown> = {};
  const sourceRecord = source as Record<string, unknown>;
  const clearRecord = isPlainObject(clearValues) ? clearValues as Record<string, unknown> : undefined;

  for (const key in sourceRecord) {
    const sourceValue = sourceRecord[key];
    const clearValue = clearRecord?.[key];

    if (clearValue !== undefined) {
      if (isPlainObject(sourceValue) && isPlainObject(clearValue)) {
        result[key] = buildClearedModel(sourceValue, clearValue);
      } else {
        result[key] = clearValue;
      }
    } else {
      result[key] = clearByType(sourceValue);
    }
  }

  return result as T;
}

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!isObjectLike(acc)) return undefined;
    return acc[key];
  }, obj);
}

function setByPath<T extends AnyRecord>(obj: T, path: string, value: unknown): void {
  const keys = path.split(".");
  const lastKey = keys.pop();

  if (!lastKey) return;

  let current: Record<string, unknown> = obj;

  for (const key of keys) {
    const next = current[key];

    if (!isObjectLike(next) || Array.isArray(next)) {
      current[key] = {};
    }

    current = current[key] as Record<string, unknown>;
  }

  current[lastKey] = value;
}

function deleteByPath<T extends AnyRecord>(obj: T, path: string): void {
  const keys = path.split(".");
  const lastKey = keys.pop();

  if (!lastKey) return;

  let current: Record<string, unknown> = obj;

  for (const key of keys) {
    const next = current[key];

    if (!isObjectLike(next) || Array.isArray(next)) {
      return;
    }

    current = next as Record<string, unknown>;
  }

  delete current[lastKey];
}

function deepMerge<T extends AnyRecord>(target: T, source: DeepPartial<T>): T {
  const result = deepClone(target);

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (sourceValue === undefined) continue;

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      result[key] = deepMerge(targetValue as T[Extract<keyof T, string>], sourceValue as DeepPartial<T[Extract<keyof T, string>]>);
    } else {
      result[key] = sourceValue as T[typeof key];
    }
  }

  return result;
}

function replaceReactive<T extends AnyRecord>(target: T, next: T): void {
  for (const key in target) {
    delete target[key];
  }

  Object.assign(target, deepClone(next));
}

export function useModel<T extends AnyRecord>(
  initialValues: T,
  options: ModelOptions<T> = {}
) {
  const initial = deepClone(initialValues);
  const model = reactive(deepClone(initialValues)) as T;

  const setField = (path: string, value: unknown) => {
    setByPath(model, path, value);
  };

  const getField = (path: string) => {
    return getByPath(model, path);
  };

  const patch = (values: DeepPartial<T>) => {
    replaceReactive(model, deepMerge(toRaw(model) as T, values));
  };

  const replace = (values: T) => {
    replaceReactive(model, values);
  };

  const reset = () => {
    replace(initial);
  };

  const clear = () => {
    replace(buildClearedModel(initial, options.clearValues));
  };

  const resetField = (path: string) => {
    const initialValue = getByPath(initial, path);
    setByPath(model, path, deepClone(initialValue));
  };

const clearField = (path: string) => {
    const initialValue = getByPath(initial, path);
    const clearValue = getByPath(options.clearValues, path);

    if (clearValue !== undefined) {
      setByPath(model, path, deepClone(clearValue));
      return;
    }

    setByPath(model, path, clearByType(initialValue));
  };

  const removeField = (path: string) => {
    deleteByPath(model, path);
  };

  const isDirty = computed(() => {
    return JSON.stringify(model) !== JSON.stringify(initial);
  });

  const test = () => {
    console.log("Hello world");
  };

  return {
    model,
    setField,
    getField,
    patch,
    replace,
    reset,
    clear,
    resetField,
    clearField,
    removeField,
    isDirty,
    test,
  };
}