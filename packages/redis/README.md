![NPM Version](https://img.shields.io/npm/v/%40songkeys%2Fnestjs-redis?style=for-the-badge)
[![Downloads][downloads-shield]][downloads-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]

<p align="center">
  <a href="https://nestjs.com/">
    <img src="https://nestjs.com/img/logo-small.svg" alt="Nest Logo" width="120">
  </a>
</p>

<div align="center">
  <h1 align="center">Nest Redis Module</h1>

  <p align="center">
    Redis(ioredis) module for Nest framework (node.js).
    <br />
    <a href="#usage"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="/docs/latest/redis.md">View Examples</a>
    ·
    <a href="https://github.com/songkeys/nestjs-redis/issues/new/choose">Report Bug</a>
    ·
    <a href="https://github.com/songkeys/nestjs-redis/issues">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#features">Features</a></li>

      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#faqs">FAQs</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>

  </ol>
</details>

## About The Project

### Features

- **Both redis & cluster are supported**: You can also specify multiple instances.
- **Health**: Checks health of **redis & cluster** server.
- **Tested**: Unit tests and Redis/Cluster integration tests on Node.js 24 and 26.
- **Services**: Retrieves **redis & cluster** connection via `RedisService`, `ClusterService`.

## Migration

This branch adopts the upstream Service API and removes the old injection decorators.
See the [migration guide](/docs/upstream-migration.md) before upgrading.

## Getting Started

### Prerequisites

This lib requires **Node.js >=24.11.0**, **NestJS 12**, and **ioredis 6**.

See the [v12 migration guide](https://github.com/songkeys/nestjs-redis/blob/main/docs/upstream-migration.md) for the breaking API changes.

### Installation

```sh
# with npm
npm install @songkeys/nestjs-redis ioredis
# with yarn
yarn add @songkeys/nestjs-redis ioredis
# with pnpm
pnpm add @songkeys/nestjs-redis ioredis
```

## Usage

- [Redis](/docs/latest/redis.md)
  - [Usage](/docs/latest/redis.md)
  - [Configuration](/docs/latest/redis.md#configuration)
  - [Testing](/docs/latest/redis.md#testing)
  - [Non-Global](/docs/latest/redis.md#non-global)
  - [Auto-reconnect](https://luin.github.io/ioredis/interfaces/CommonRedisOptions.html#retryStrategy)
  - [Unix domain socket](/docs/latest/redis.md#unix-domain-socket)
- [Cluster](/docs/latest/cluster.md)
  - [Usage](/docs/latest/cluster.md)
  - [Configuration](/docs/latest/cluster.md#configuration)
  - [Testing](/docs/latest/cluster.md#testing)
  - [Non-Global](/docs/latest/cluster.md#non-global)
  - [Auto-reconnect](https://luin.github.io/ioredis/interfaces/ClusterOptions.html#clusterRetryStrategy)
- [Health Checks](/packages/redis-health/README.md)
- [Examples](/docs/latest/examples.md)
  - [Redis Sentinel](/docs/latest/examples.md#sentinel)

### Legacy

- version 9, [click here](/docs/v9)
- version 8, [click here](/docs/v8)
- version 7, [click here](/docs/v7)

## FAQs

### Circular dependency ⚠️

<details>
  <summary>Click to expand</summary>

[A circular dependency](https://docs.nestjs.com/fundamentals/circular-dependency) might also be caused when using "barrel files"/index.ts files to group imports. Barrel files should be omitted when it comes to module/provider classes. For example, barrel files should not be used when importing files within the same directory as the barrel file, i.e. `cats/cats.controller` should not import `cats` to import the `cats/cats.service` file. For more details please also see [this github issue](https://github.com/nestjs/nest/issues/1181#issuecomment-430197191).

</details>

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgments

- [Full-Featured Redis Client - ioredis](https://github.com/luin/ioredis)
- [Official Redis Documentation](https://redis.io/)
- [Official Redis Docker Image](https://hub.docker.com/_/redis)

[downloads-shield]: https://img.shields.io/npm/dm/@songkeys/nestjs-redis?style=for-the-badge
[downloads-url]: https://www.npmjs.com/package/@songkeys/nestjs-redis
[stars-shield]: https://img.shields.io/github/stars/songkeys/nestjs-redis?style=for-the-badge
[stars-url]: https://github.com/songkeys/nestjs-redis/stargazers
[issues-shield]: https://img.shields.io/github/issues/songkeys/nestjs-redis?style=for-the-badge
[issues-url]: https://github.com/songkeys/nestjs-redis/issues
[license-shield]: https://img.shields.io/npm/l/@songkeys/nestjs-redis?style=for-the-badge
[license-url]: https://github.com/songkeys/nestjs-redis/blob/main/LICENSE
