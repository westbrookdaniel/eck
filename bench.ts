/* v8 ignore start */
import Benchmarkify from "benchmarkify";
import { schema } from "./src/eck";
import * as yup from "yup";
import * as zod from "zod";
import Ajv from "ajv";
import Validator from "fastest-validator";

const benchmark = new Benchmarkify("Benchmark").printHeader();

const bench = benchmark.createSuite("Simple object", {});

const object = {
  name: "john doe",
  email: "john.doe@company.space",
  firstName: "John",
  phone: "123-4567",
  age: 33,
};

const validate = schema({
  name: ["string", (d) => d.length >= 3, (d) => d.length <= 100],
  email: "string",
  firstName: "string",
  phone: "string",
  age: "number",
});

bench.add("eck", () => {
  validate(object);
});

const ajv = new Ajv();
const ajvValidate = ajv.compile({
  type: "object",
  properties: {
    name: { type: "string", minLength: 3, maxLength: 100 },
    email: { type: "string" },
    firstName: { type: "string" },
    phone: { type: "string" },
    age: { type: "number" },
  },
  required: ["name", "email", "firstName", "phone", "age"],
});

bench.add("ajv", () => {
  ajvValidate(object);
});

const va = new Validator();
const fastestValidator = va.compile({
  name: { type: "string", min: 3, max: 100 },
  email: { type: "string" },
  firstName: { type: "string" },
  phone: { type: "string" },
  age: { type: "number" },
});

bench.add("fastest-validator", () => {
  fastestValidator(object);
});

const yupSchema = yup.object({
  name: yup.string().min(3).max(100),
  email: yup.string(),
  firstName: yup.string(),
  phone: yup.string(),
  age: yup.number(),
});

bench.add("yup", () => {
  yupSchema.validateSync(object);
});

const zodSchema = zod.object({
  name: zod.string().min(3).max(100),
  email: zod.string(),
  firstName: zod.string(),
  phone: zod.string(),
  age: zod.number(),
});

bench.add("zod", () => {
  zodSchema.parse(object);
});

bench.run();
/* v8 ignore end */
