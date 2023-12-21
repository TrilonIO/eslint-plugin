---
description: 'Ensure NestJS testing modules are closed properly'
---

[Testing modules](https://docs.nestjs.com/fundamentals/testing#testing-utilities) are generally used to mimic the behavior of underlying services and modules, allowing the developer to override and configure them for testing purposes. However, if the testing module is not closed properly, it can cause many issues, such as memory leaks, hanging processes and open database connections. This rule ensures that all testing modules are closed properly - and also closed in the correct hook.

## Options

This rule accepts an object with two properties: `createAliases` and `closeAliases`. Each property is an array of objects, where each object specifies a `kind` (either 'function' or 'method') and a `name` (the name of the function or method).

- `createAliases`: Defines functions or methods that behave similarly to `Test.createTestingModule()`.
- `closeAliases`: Defines functions or methods that are equivalent to `TestingModule.close()`.

### Example of Options

```json
{
  "nestjs/close-testing-modules": [
    "error",
    {
      "createAliases": [
        { "kind": "function", "name": "customCreateTestingModule" },
        { "kind": "method", "name": "alternativeCreateMethod" }
      ],
      "closeAliases": [{ "kind": "method", "name": "customCloseMethod" }]
    }
  ]
}
```

## Examples

### ❌ Incorrect

```ts
describe('Creates a testingModule in the "beforeEach" hook but does not close it', () => {
  let testingModule: TestingModule;
  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(testingModule).toBeDefined();
  });
});

describe('Creates a testingModule in the "beforeEach" hook but closes it in the "afterAll"', () => {
  let testingModule: TestingModule;
  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(testingModule).toBeDefined();
  });

  afterAll(async () => {
    await testingModule.close();
  });
});
```

### ✅ Correct

```ts
describe('Closes the testingModule in the "afterEach" hook', () => {
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterEach(async () => {
    await testingModule.close();
  });

  it('should be defined', () => {
    expect(testingModule).toBeDefined();
  });
});

describe('Closes the appModule created from the testingModule', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = testingModule.createNestApplication();
  });

  it('should be defined', () => {
    expect(testingModule).toBeDefined();
  });

  afterEach(async () => {
    await app.close();
  });
});

describe('Creates and closes the appModule using custom functions', () => {
  let app: INestApplication;
  beforeEach(async () => {
    // defined via the "createAliases" option as { kind: 'function', name: 'createTestingModule' }
    const testingModule = await createTestingModule();
    app = testingModule.createNestApplication();
  });

  it('should be defined', () => {
    expect(testingModule).toBeDefined();
  });

  afterEach(async () => {
    // defined via the "closeAliases" option as { kind: 'function', name: 'closeTestingModule' }
    await closeTestingModule(testingModule);
  });
});

describe('Creates and closes the appModule using custom methods', () => {
  let app: INestApplication;
  beforeEach(async () => {
    // defined via the "createAliases" option as { kind: 'method', name: 'createTestingModule' }
    const testingModule = await testUtils.createTestingModule();
    app = testingModule.createNestApplication();
  });

  it('should be defined', () => {
    expect(testingModule).toBeDefined();
  });

  afterEach(async () => {
    // defined via the "closeAliases" option as { kind: 'method', name: 'close' }
    await testUtils.close(testingModule);
  });
});
```

## When Not To Use It

If you don't use testing modules, you can disable this rule. Moreover, you can also enable this rule
only for files ending with `.spec.ts` or `.e2e-spec.ts`, so you can create utility functions in other files
that create testing modules without closing them.
