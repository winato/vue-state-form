# vue-state-form

⚡ Lightweight Vue composable for managing form models with ease.

Stop writing repetitive boilerplate for forms.  
`vue-state-form` gives you a clean, type-friendly API to manage state, update fields, reset, clear, and work with nested structures.

---

## ✨ Features

- 🧠 Reactive model for Vue 3
- 🎯 Simple and predictable API
- 🔄 Reset to initial state
- 🧹 Clear model with smart defaults or custom values
- 🧩 Nested field support using dot notation like `address.city`
- 🛠 Partial updates with deep merge support
- 🔍 Access fields by path
- ♻️ Field-level operations
- 🪶 Zero dependencies

---

## 📦 Installation

```bash
npm install vue-state-kit
```

---

## 🚀 Quick Start

```ts
import { useModel } from "vue-state-kit";

const form = useModel({
  name: "Vlad",
  age: 28,
  address: {
    city: "Rotterdam",
    zip: "3011",
  },
});

form.setField("address.city", "London");
console.log(form.getField("address.city")); // London

form.reset();
form.clear();
```

---

## Why vue-state-kit?

When working with Vue forms, it is common to repeat the same logic again and again:

- update one field
- update several fields
- reset the form
- clear the form
- manage nested data structures

This package helps reduce that boilerplate and gives you a consistent API for model manipulation.

---

## API

### `useModel(initialValues, options?)`

Creates a reactive model and returns a set of helper methods.

```ts
const form = useModel(initialValues, {
  clearValues?: DeepPartial<T>
});
```

### Parameters

#### `initialValues`

The initial state of your model.

```ts
const initialValues = {
  name: "Vlad",
  age: 28,
  address: {
    city: "Rotterdam",
  },
};
```

#### `options`

Optional configuration object.

##### `clearValues`

An optional nested object that defines custom values used by `clear()` and `clearField()`.

If a value is provided in `clearValues`, that value will be used.  
If not, the package falls back to type-based clearing.

Example:

```ts
const form = useModel(
  {
    name: "Vlad",
    age: 28,
    address: {
      city: "Rotterdam",
      zip: "3011",
    },
  },
  {
    clearValues: {
      name: "",
      age: null,
      address: {
        city: "London",
      },
    },
  }
);
```

---

## Returned API

### `model`

A reactive Vue model.

```ts
form.model.name = "Alex";
form.model.address.city = "Berlin";
```

Use it directly in templates:

```vue
<template>
  <input v-model="form.model.name" />
  <input v-model="form.model.address.city" />
</template>
```

---

### `setField(path, value)`

Updates a field using dot notation.

```ts
form.setField("name", "Alex");
form.setField("address.city", "London");
```

This is useful when you want a programmatic way to update nested properties without manually traversing the object.

---

### `getField(path)`

Returns a field value by path.

```ts
const city = form.getField("address.city");
```

---

### `patch(partial)`

Deep merges a partial object into the model.

```ts
form.patch({
  address: {
    city: "Amsterdam",
  },
});
```

This updates only the provided fields and preserves the rest of the nested structure.

---

### `replace(newModel)`

Replaces the entire model.

```ts
form.replace({
  name: "John",
  age: 30,
  address: {
    city: "Paris",
    zip: "75000",
  },
});
```

Use this when you want to overwrite the whole state at once.

---

### `reset()`

Resets the whole model back to the original `initialValues`.

```ts
form.reset();
```

Example:

```ts
const form = useModel({
  name: "Vlad",
  age: 28,
});

form.setField("name", "Alex");
form.reset();

console.log(form.model.name); // Vlad
```

---

### `clear()`

Clears the whole model.

Behavior:

- if `clearValues` contains a matching value, that value is used
- otherwise the field is cleared according to its type

```ts
form.clear();
```

---

### `resetField(path)`

Resets one field back to its original initial value.

```ts
form.resetField("address.city");
```

Example:

```ts
const form = useModel({
  address: {
    city: "Rotterdam",
  },
});

form.setField("address.city", "Berlin");
form.resetField("address.city");

console.log(form.model.address.city); // Rotterdam
```

---

### `clearField(path)`

Clears one field.

Behavior:

- if a value exists in `clearValues` for that path, it is used
- otherwise type-based clearing is applied

```ts
form.clearField("address.city");
```

---

### `removeField(path)`

Deletes a field from the model.

```ts
form.removeField("address.zip");
```

Note: use this carefully if your form relies on a stable object shape.

---

### `isDirty`

A computed Vue ref that tells whether the current model differs from the initial model.

```ts
form.isDirty.value;
```

Example:

```ts
const form = useModel({
  name: "Vlad",
});

console.log(form.isDirty.value); // false

form.setField("name", "Alex");

console.log(form.isDirty.value); // true
```

---

## Clear Behavior

If `clearValues` is not provided for a field, clearing falls back to the field type.

### Default type-based clearing

| Type | Cleared value |
|------|---------------|
| `string` | `""` |
| `number` | `0` |
| `boolean` | `false` |
| `array` | `[]` |
| `object` | recursively cleared |
| `null` | `null` |
| `undefined` | `undefined` |

### Example

Initial model:

```ts
{
  name: "Vlad",
  age: 28,
  isAdmin: true,
  tags: ["vue"],
  address: {
    city: "Rotterdam",
    zip: "3011"
  }
}
```

Custom clear values:

```ts
{
  age: null,
  address: {
    city: "London"
  }
}
```

Result after `clear()`:

```ts
{
  name: "",
  age: null,
  isAdmin: false,
  tags: [],
  address: {
    city: "London",
    zip: ""
  }
}
```

---

## Nested Path Support

`vue-state-kit` supports dot notation for nested fields.

Examples:

```ts
form.setField("user.profile.name", "Alex");
form.getField("user.profile.name");
form.resetField("user.profile.name");
form.clearField("user.profile.name");
form.removeField("user.profile.name");
```

This makes it easier to work with deeply nested form models.

---

## Full Example

```ts
import { useModel } from "vue-state-kit";

const form = useModel(
  {
    name: "Vlad",
    age: 28,
    isAdmin: true,
    tags: ["vue", "typescript"],
    address: {
      city: "Rotterdam",
      zip: "3011",
    },
    preferences: {
      theme: "dark",
    },
  },
  {
    clearValues: {
      age: null,
      address: {
        city: "London",
      },
    },
  }
);

form.setField("name", "Alex");
form.setField("address.city", "Berlin");
form.patch({
  preferences: {
    theme: "light",
  },
});

console.log(form.getField("address.city")); // Berlin
console.log(form.isDirty.value); // true

form.clearField("address.city");
console.log(form.getField("address.city")); // London

form.resetField("address.city");
console.log(form.getField("address.city")); // Rotterdam

form.clear();
/*
{
  name: "",
  age: null,
  isAdmin: false,
  tags: [],
  address: {
    city: "London",
    zip: "",
  },
  preferences: {
    theme: "",
  },
}
*/

form.reset();
```

---

## TypeScript Notes

The package is designed to work well with TypeScript and preserve the model shape.

Current version supports typed model objects, but path strings such as `"address.city"` are not fully type-safe yet.

That means this works:

```ts
form.setField("address.city", "London");
```

But TypeScript will not yet validate that the path is a valid key path at compile time.

This can be improved later with template literal path typing.

---

## Limitations

This package is designed for plain form objects.

Supported use case:

- plain objects
- nested plain objects
- arrays as values
- strings, numbers, booleans, null, undefined

Not intended for:

- `Date`
- `Map`
- `Set`
- class instances
- functions inside the model

Array index paths such as `items.0.name` may have limited support depending on the structure and usage. The main focus is object-based form state.

---

## Recommended Use Cases

`vue-state-kit` is a good fit for:

- form state management in Vue 3
- admin panels
- settings pages
- profile forms
- reusable form composables
- reducing boilerplate in CRUD interfaces

---

## Roadmap

Planned improvements:

- typed path support
- better array path handling
- dirty fields tracking
- touched fields tracking
- validation helpers
- field error helpers

---

## Contributing

Contributions, ideas, and suggestions are welcome.

If you have an idea to improve the developer experience, feel free to open an issue or submit a pull request.

---

## License

MIT
