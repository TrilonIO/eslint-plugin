---
description: 'Detects usage of `forwardRef()` function commonly used to handle circular references'
---

[Forward references](https://docs.nestjs.com/fundamentals/circular-dependency#forward-reference) are commonly used to handle circular dependencies between services or modules. For example, if `FooService` and `BarService` depend on each other, you can use `forwardRef()` to resolve the circular dependency. However, `forwardRef()` must be a last resort, and we generally recommend changing your code to avoid circular dependencies. This rule detects usage of the `forwardRef()` method so you can keep track of what potentially needs refactoring.

## Options

This rule has no additional options yet.


## Examples

### ❌ Incorrect

```ts
import { forwardRef } from '@nestjs/common';

@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService)) // ⚠️ Circular-dependency detected
    private commonService: CommonService,
  ) {}
}

@Module({
  imports: [forwardRef(() => CatsModule)], // ⚠️ Circular-dependency detected
})
export class FooModule {}
```

### ✅ Correct

```ts
import { forwardRef } from '@nestjs/common';

@Injectable()
export class CatsService {
  constructor(
    private commonService: CommonService,
  ) {}
}

@Module({
  imports: [CatsModule],
})
export class FooModule {}
```

## When Not To Use It

If your project uses `forwardRef()` extensively, you can disable this rule.
