import { RuleTester } from '@typescript-eslint/rule-tester';
import { after, describe, it } from 'node:test';

// We need to specify these functions for RuleTester to work. See [Docs](https://eslint.org/docs/latest/integrate/nodejs-api#customizing-ruletester)
console.log('Loading global setup for RuleTester...');
RuleTester.afterAll = after;
RuleTester.describe = describe;
RuleTester.it = it;
