# Eck

Small and fast object javascript object checker

- It's typesafe (of course)
- It's fast (isn't that nice)
- It's small (~1kb)

```js
import { schema } from "eck";

const personValidator = schema({
  name: "string",
  age: "number",
  email: ["string", "optional"],
});

const result = personValidator({
  age: 42,
});

console.log(result.error);
/** { name: "MISSING" } */
```

> [!WARNING]  
> This package is under construction, but contributions are welcome!
> See `CONTRIBUTING.md` for details

**Why use this over existing validators?**

Eck is very small in size, and in order to hit that small size it's
been crafted to be extremely extensible which means it can be tailored
to your code base and a lot easier. Since it also relys on standard
JS features like `typeof` it's quicker to get started and learn too.

## Getting Started

Documentation is still under construction, see the tests for usage examples
