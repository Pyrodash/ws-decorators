# ws-decorators

This library aims to make object-oriented WebSocket server design easier with TypeScript decorators. It was inspired by the Fastify plugin [fastify-decorators](https://github.com/L2jLiga/fastify-decorators).

## Setup

### Install
Install with npm
```
npm i ws-decorators
```

### TypeScript configuration
Please enable the `experimentalDecorators` and `emitDecoratorMetadata` features in your TypeScript config:

*tsconfig.json*
```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

### Reflect Metadata
Make sure to import the `reflect-metadata` shim at the beginning of your code:
```ts
import 'reflect-metadata`
```

## Usage

Please see the pizza example.