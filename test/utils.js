import test from "ava";
import normalizeData from "../utils/normalizeData.js";
import isConstructable from "../utils/isConstructable.js";
import globalValue from "../utils/globalValue.js";

test("it normalize data", (t) => {
  const isTrue = normalizeData("true");
  t.is(isTrue, true);

  // If we only have single quoted values, it will still pass
  const arrayValue = normalizeData("['Y', 'm', 'd']");
  const target = ["Y", "m", "d"];
  t.deepEqual(arrayValue, target);

  // If values contains single quotes, escape doubles quotes
  const arrayWithQuote = normalizeData('["Y\'t"]');
  const targetWithQuote = ["Y't"];
  t.deepEqual(arrayWithQuote, targetWithQuote);
});

test("it can verify it's constructable", (t) => {
  t.true(isConstructable(class {})); // true
  t.true(isConstructable(class {}.bind())); // true
  t.true(isConstructable(function () {})); // true
  t.true(isConstructable(function () {}.bind())); // true
  t.false(isConstructable(() => {})); // false
  t.false(isConstructable((() => {}).bind())); // false
  t.false(isConstructable(async () => {})); // false
  t.false(isConstructable(async function () {})); // false
  t.false(isConstructable(function* () {})); // false
  t.false(isConstructable({ foo() {} }.foo)); // false
  t.true(isConstructable(URL)); // true
});

test("it can get a global value", (t) => {
  window.myValue = "myValue";
  window.app = {
    myValue: "myValue",
  };

  t.is(globalValue("myValueNull"), null);
  t.is(globalValue("myValue"), window.myValue);
  t.is(globalValue("app.myValue"), window.app.myValue);
});
