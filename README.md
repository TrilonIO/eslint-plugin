# Trilon eslint-plugin

[![Node.js CI](https://github.com/TrilonIO/eslint-plugin/actions/workflows/node-ci.yml/badge.svg)](https://github.com/TrilonIO/eslint-plugin/actions/workflows/node-ci.yml)

At Trilon, our goal is to help elevate teams - giving them the push they need to continuously succeed in today's ever-changing tech world.

As part of that, we focus on developing tools that make **your** dev experience easier, enjoyable, and safer.

The official Trilon Eslint Plugin is part of that toolbelt to help your team to thrive, applying best practices for NestJS, curated by our key contributors and core team.

## Installation

> Once this package gets published

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
