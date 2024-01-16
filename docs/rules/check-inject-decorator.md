---
description: 'Detects incorrect usage of `@Inject(TOKEN)` decorator'
---

@Inject() decorators are useful for injecting [custom providers](https://docs.nestjs.com/fundamentals/custom-providers) into a class. However, it is easy to misuse the decorator by passing a token that does not match the type of the property - or by passing a token that duplicates the type of the property. This rule detects these cases.

## Options

This rule has no additional options yet.


## Examples

### ❌ Incorrect

```ts
class FooBarController {
	constructor(
		// 🚫 Type is an interface and cannot be injected
		private readonly barService: IService<Bar>,

		@Inject(BazService) // ⚠️ Token duplicates type
		private readonly bazService: BazService,
	) {}
}
```

### ✅ Correct

```ts
class FooBarController {
	@Inject(FooService) // ✅ Token duplicates type, but class properties don't have type metadata
	private readonly fooService: FooService;

	constructor(
		@Inject('BAR_SERVICE') // ✅ Token differs from type
		private readonly barService: IService<Bar>,

		// ✅ Type metadata is sufficient to inject
		private readonly bazService: BazService,
	) {}
}
```

## When Not To Use It

If you want to manage injection tokens manually, you can disable this rule.
