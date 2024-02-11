export function schema(schema, errorSchema) {
  return function validate(data) {
    const error = validateSchemaPart(data, schema);
    if (Object.keys(error).length > 0) {
      return {
        error: errorSchema ? parseErrorPart(error, errorSchema) : error,
      };
    }
    return { data };
  };
}

function validateSchemaPart(data, schemaPart) {
  const error = {};

  for (const key in schemaPart) {
    const s = schemaPart[key];

    if (!data.hasOwnProperty(key)) {
      if (!(Array.isArray(s) && s.includes("optional"))) {
        if (typeof s === "object" && !Array.isArray(s)) {
          error[key] = missingForNestedSchema(s);
        } else {
          error[key] = "MISSING";
        }
      }
      continue;
    }

    if (typeof s === "string") {
      if (typeof data[key] !== s) {
        error[key] = "INVALID";
      }
    } else if (Array.isArray(s)) {
      for (let i = 0; i < s.length; i++) {
        const check = s[i];
        if (check === "optional") continue;
        if (typeof check === "string") {
          if (typeof data[key] !== check) {
            error[key] = "INVALID:" + i;
            break;
          }
        } else if (!check(data[key], data)) {
          error[key] = "INVALID:" + i;
          break;
        }
      }
    } else if (typeof s === "function") {
      if (!s(data[key], data)) {
        error[key] = "INVALID";
      }
    } else if (typeof s === "object") {
      const partError = validateSchemaPart(data[key], s);
      if (Object.keys(partError).length > 0) {
        error[key] = partError;
      }
    }
  }

  return error;
}

function missingForNestedSchema(schemaPart) {
  const error = {};
  for (const key in schemaPart) {
    const s = schemaPart[key];
    if (typeof s === "object" && !Array.isArray(s)) {
      error[key] = missingForNestedSchema(s);
    } else if (!(Array.isArray(s) && s.includes("optional"))) {
      error[key] = "MISSING";
    }
  }
  return error;
}

function parseErrorPart(errorPart, schemaPart) {
  if (typeof schemaPart === "string") return schemaPart;

  if (typeof errorPart !== "object") {
    if (errorPart.startsWith("INVALID:")) {
      const index = parseInt(errorPart.split(":")[1]);
      return schemaPart[index] ?? schemaPart.INVALID ?? errorPart;
    } else {
      return schemaPart[errorPart] || errorPart;
    }
  }

  const parsed = {};

  for (const key in errorPart) {
    const s = schemaPart[key];
    if (!s) {
      parsed[key] = errorPart[key];
    } else {
      parsed[key] = parseErrorPart(errorPart[key], s);
    }
  }

  return parsed;
}
