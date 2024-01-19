# Trilon eslint-plugin

[![Apache-2.0 license](https://img.shields.io/badge/license-Apache-blue.svg?style=for-the-badge&color=e51384)](/LICENSE) 


<!--[![NPM Downloads](https://img.shields.io/npm/dt/@trilon/ng-universal.svg?color=b31ae7&style=for-the-badge)](https://www.npmjs.com/@trilon/ng-universal)-->


---

<p align="center">
  <a href="https://trilon.io" target="_blank">
        <img width="500" height="auto" src="https://trilon.io/trilon-logo-clear.png" alt="Trilon.io - Angular Universal, NestJS, JavaScript Application Consulting Development and Training">
  </a>
</p>


<h3 align="center"> Made with :heart: by <a href="https://trilon.io">Trilon.io</a></h3>

---

[![Node.js CI](https://github.com/TrilonIO/eslint-plugin/actions/workflows/node-ci.yml/badge.svg)](https://github.com/TrilonIO/eslint-plugin/actions/workflows/node-ci.yml)

At Trilon, our goal is to help elevate teams - giving them the push they need to continuously succeed in today's ever-changing tech world.

As part of that, we focus on developing tools that make **your** dev experience easier, enjoyable, and safer.

The official Trilon Eslint Plugin is part of that toolbelt to help your team to thrive, applying best practices for NestJS, curated by our key contributors and core team.

## Installation

```sh
npm install @trilon/eslint-plugin
```

And add these the plugin to your `.eslintrc`:

```js
{
  plugins: ['@trilon/eslint-plugin'],
  extends: ['plugin:@trilon/recommended'],
}
```

The "recommended" preset contains the rules listed below. If you need custom configuration, please refer to the documentation of the individual linting rules.

## Rules

| Rule                                                                                 | Description                                                    | Recommended |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------- | ----------- |
| [`@trilon/enforce-close-testing-module`](docs/rules/enforce-close-testing-module.md) | Ensures NestJS testing modules are closed properly after tests | ✅          |
| [`@trilon/check-inject-decorator`](docs/rules/check-inject-decorator.md)             | Detects incorrect usage of `@Inject(TOKEN)` decorator          | ✅          |

---

# Trilon Consulting 

## JavaScript, Node, NestJS Consulting from Open-Source Fanatics and Key Contributors!

Check out **[Trilon.io](https://Trilon.io)** for more info! 

Contact us at <hello@trilon.io>, and let's talk about your projects needs.

<br><br>

<p align="center">
  <a href="https://trilon.io" target="_blank">
        <img width="500" height="auto" src="https://trilon.io/trilon-logo-clear.png" alt="Trilon.io - Angular Universal, NestJS, JavaScript Application Consulting Development and Training">
  </a>
</p>

<h3 align="center"> Made with :heart: by <a href="https://trilon.io">Trilon.io</a></h3>