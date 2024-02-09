import { expect, test } from "vitest";
import { schema } from "../src/eck";

test("schema validates valid data", () => {
  const validate = schema({
    name: "string",
    age: "number",
  });
  const data = { name: "John", age: 30 };
  const result = validate(data);
  expect(result).toEqual({ data });
});

test("schema validates missing data", () => {
  const validate = schema({
    name: "string",
    age: "number",
  });

  const data = { age: 30 };
  const result = validate(data);
  expect(result).toEqual({ error: { name: "MISSING" } });
});

test("schema validates invalid data", () => {
  const validate = schema({
    age: "number",
  });

  const data = { age: "10" };
  const result = validate(data);
  expect(result).toEqual({ error: { age: "INVALID" } });
});

const validateAllTypes = schema({
  // All values of typeof
  string: "string",
  number: "number",
  boolean: "boolean",
  undefined: "undefined",
  symbol: "symbol",
  bigint: "bigint",
  object: "object",
  function: "function",
  // Custom functions
  array: Array.isArray,
  date: (d) => d instanceof Date,
  // Nested schema
  nested: {
    name: "string",
    array: Array.isArray,
  },
});

test("schema validates all types", () => {
  const data = {
    string: "string",
    number: 1,
    boolean: true,
    undefined: undefined,
    symbol: Symbol("symbol"),
    bigint: BigInt(1),
    object: {},
    function: () => {},
    array: [],
    date: new Date(),
    nested: {
      name: "name",
      array: [],
    },
  };

  const result = validateAllTypes(data);
  expect(result).toEqual({ data });
});

test("schema validates all types with invalid data", () => {
  const data = {
    string: 1,
    number: "1",
    boolean: "true",
    undefined: null,
    symbol: "symbol",
    bigint: "1",
    object: "object",
    function: {},
    array: {},
    date: "date",
    nested: {
      name: 1,
      array: {},
    },
  };

  const result = validateAllTypes(data);
  expect(result).toEqual({
    error: {
      string: "INVALID",
      number: "INVALID",
      boolean: "INVALID",
      undefined: "INVALID",
      symbol: "INVALID",
      bigint: "INVALID",
      object: "INVALID",
      function: "INVALID",
      array: "INVALID",
      date: "INVALID",
      nested: {
        name: "INVALID",
        array: "INVALID",
      },
    },
  });
});

test("Missing data in nested schema", () => {
  const validate = schema({
    nested: {
      name: "string",
      array: Array.isArray,
    },
  });

  const result1 = validate({});
  expect(result1).toEqual({
    error: {
      nested: {
        name: "MISSING",
        array: "MISSING",
      },
    },
  });

  const result2 = validate({ nested: { name: "Dan" } });
  expect(result2).toEqual({
    error: {
      nested: {
        array: "MISSING",
      },
    },
  });
});

test("Missing doubly nested data", () => {
  const validate = schema({
    nested: {
      nested: {
        name: "string",
      },
    },
  });

  const result1 = validate({});
  expect(result1).toEqual({
    error: {
      nested: {
        nested: {
          name: "MISSING",
        },
      },
    },
  });

  const result2 = validate({ nested: {} });
  expect(result2).toEqual({
    error: {
      nested: {
        nested: {
          name: "MISSING",
        },
      },
    },
  });
});

test("Handles and array with optional validator", () => {
  const validate = schema({
    name: ["string", (d) => d.length >= 3, (d) => d.length <= 100],
    age: ["number", "optional", (d) => d >= 18],
    email: ["optional", "string"],
  });

  const result1 = validate({ name: "Dan", age: 30 });
  expect(result1).toEqual({ data: { name: "Dan", age: 30 } });

  const result2 = validate({ name: "Dan", age: 17 });
  expect(result2).toEqual({ error: { age: "INVALID:2" } });

  const result3 = validate({ name: "Dan", email: "foo@example.com" });
  expect(result3).toEqual({ data: { name: "Dan", email: "foo@example.com" } });

  const result4 = validate({ name: "A" });
  expect(result4).toEqual({ error: { name: "INVALID:1" } });

  const result5 = validate({});
  expect(result5).toEqual({ error: { name: "MISSING" } });

  const result6 = validate({ name: 100 });
  expect(result6).toEqual({ error: { name: "INVALID:0" } });
});

test("Handles mutating in the validator even on fail", () => {
  const validate1 = schema({
    name: (_, data) => {
      data.name += "!";
      data.foo = "bar";
      return false;
    },
  });
  const data1 = { name: "Dan" };
  const result2 = validate1(data1);
  expect(result2).toEqual({ error: { name: "INVALID" } });
  expect(data1).toEqual({ name: "Dan!", foo: "bar" });

  const validate2 = schema({
    name: (_, data) => {
      data.name += "!";
      data.foo = "bar";
      return true;
    },
  });
  const data2 = { name: "Dan" };
  const result3 = validate2(data2);
  expect(result3).toEqual({ data: { name: "Dan!", foo: "bar" } });
  expect(data2).toEqual({ name: "Dan!", foo: "bar" });
});

test("Converting errors into messages", () => {
  const validate = schema(
    {
      name: "string",
      age: "number",
    },
    {
      name: "Name is required",
      age: {
        MISSING: "Age is required",
        INVALID: "Age must be a number",
      },
    },
  );

  const result = validate({ name: 1, age: "10" });

  expect(result).toEqual({
    error: {
      name: "Name is required",
      age: "Age must be a number",
    },
  });
});

test("Converting with missing errors", () => {
  const validate = schema(
    {
      name: "string",
      age: "number",
    },
    {
      age: {
        MISSING: "Age is required",
      },
    },
  );

  const result = validate({ name: 1, age: "10" });

  expect(result).toEqual({
    error: {
      name: "INVALID",
      age: "INVALID",
    },
  });
});

test("Converting with missing errors and nested schema", () => {
  const validate = schema(
    {
      name: "string",
      age: "number",
      nested: {
        name: "string",
      },
    },
    {
      age: {
        INVALID: "Age is required",
      },
      nested: {
        name: "Name is required",
      },
    },
  );

  const result = validate({ name: 1, age: "10", nested: {} });

  expect(result).toEqual({
    error: {
      name: "INVALID",
      age: "Age is required",
      nested: {
        name: "Name is required",
      },
    },
  });
});

test("Converting invalid array errors", () => {
  const validate = schema(
    {
      name: ["string", (d) => d.length >= 3, (d) => d.length <= 100],
      foo: ["optional", "string", (d) => d.length <= 100],
    },
    {
      name: {
        INVALID: "Name must be a string",
        2: "Name must be at most 100 characters",
      },
      foo: {
        2: "Foo must be at most 100 characters",
      },
    },
  );

  const result1 = validate({ name: 1, foo: {} });
  expect(result1).toEqual({
    error: {
      name: "Name must be a string",
      foo: "INVALID:1",
    },
  });

  const result2 = validate({ name: "A", foo: {} });
  expect(result2).toEqual({
    error: {
      name: "Name must be a string",
      foo: "INVALID:1",
    },
  });

  const result3 = validate({ name: "A".repeat(101), foo: {} });
  expect(result3).toEqual({
    error: {
      name: "Name must be at most 100 characters",
      foo: "INVALID:1",
    },
  });
});

test("Converting errors with empty error schema", () => {
  const validate = schema(
    {
      name: "string",
      age: "number",
      nested: {
        name: "string",
      },
    },
    {},
  );

  const result = validate({ name: 1, age: "10" });

  expect(result).toEqual({
    error: {
      name: "INVALID",
      age: "INVALID",
      nested: {
        name: "MISSING",
      },
    },
  });
});

test("Nested optional fields", () => {
  const validate = schema({
    name: ["string", "optional"],
    age: "number",
    nested: {
      name: ["string", "optional"],
      age: "number",
      nested: {
        name: ["string", "optional"],
        age: "number",
      },
    },
  });

  const result1 = validate({ age: 10 });
  expect(result1).toEqual({
    error: { age: 10, nested: { age: "MISSING", nested: { age: "MISSING" } } },
  });
});

// TODO: Add tests for objects in arrays (object validation + optional part of tree)
