---
description: 'Enforces a styleguide for provider types'
---

Large teams can have the desire to limit or enforce a particular style of creating [custom providers](https://docs.nestjs.com/fundamentals/custom-providers); e.g. banning request-scoped providers to avoid potential circular dependencies, or [preferring factory providers over value providers to significantly increase performance](https://github.com/nestjs/nest/pull/12753). This rule enforces a particular type of provider to be used.

## Options

This rule accepts an object with the "prefer" property, which is an array containing one or more of the following values:

- `value`: Enforces the use of value providers.
- `factory`: Enforces the use of factory providers.
- `class`: Enforces the use of class providers.
- `existing`: Enforces the use of existing providers.


### Example of Options

```json
"rules": {
  "@trilon/enforce-custom-provider-type": [ 
   "warn", {  
     "prefer": ["factory", "value"]
   }
  ]
}
```

## Examples
Considering the options above, the following examples will show how the rule behaves when the `prefer` option is set to `factory`.

### ❌ Incorrect

```ts
const customValueProvider: Provider = {
  provide: 'TOKEN',
  useExisting: 'some-value' // ⚠️ provider is not of type ["factory", "value"]
}

const customClassProvider: Provider = {
  provide: AbstractClass,
  useClass: SomeClass  // ⚠️ provider is not of type ["factory", "value"]
}
```

### ✅ Correct

const factoryProvider: Provider = {
  provide: 'TOKEN',
  useFactory: () => 'some-value'
}

## When Not To Use It

If you don't want to enforce a particular style of provider, you can disable this rule.
