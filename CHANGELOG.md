# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-02-15

### Fixed

- Removed duplicate `deepClone` implementation in immutable plugin
- Fixed `any` type usage in parse plugin error handling
- Fixed non-null assertions in parse plugin (opts.maxDepth!, opts.maxLength!)
- Fixed non-null assertion in kernel event emitter
- Fixed non-null assertions in diff plugin path handling
- Added proper type definitions for CLI (CliKernel interface)
- Fixed type safety issues in CLI commands

### Security

- Comprehensive security audit completed
- Documented ReDoS prevention for schema regex patterns
- Documented prototype pollution protection in path operations
- Added input size limit recommendations
- Added safe regex handling guidelines

### Code Quality

- Removed code duplication
- Improved type safety across plugins
- Added proper null checks instead of non-null assertions
- Better error wrapping in safeParse

### Documentation

- Added complete API reference documentation
- Added migration guides (native JSON, JSON5, Lodash)
- Added troubleshooting guide with common issues
- Added FAQ section
- Added performance tuning guide with benchmarks
- Added framework integration guides (React, Vue, Express)
- Added plugin development guide
- Added browser and Web Worker support documentation
- Added memory profiling utilities documentation
- Added stress testing framework documentation

## [1.0.0] - 2026-02-12

### Added

#### Core Features

- `parse()` - Custom JSON parser with safe mode, depth limiting, reviver support
- `safeParse()` - Non-throwing parse returning Result type
- `stringify()` - Custom serializer with circular reference handling, pretty print, sorted keys
- `get()` - Deep property access with dot/bracket notation
- `set()` - Deep property setting (immutable)
- `has()` - Deep property existence check
- `remove()` - Deep property removal (immutable)
- `paths()` - List all dot-notation paths in an object

#### Optional Plugins

- `pathPlugin` - JSONPath expression engine for complex queries
- `transformPlugin` - merge, flatten, unflatten, pick, omit, sortKeys, mapValues, filterValues
- `diffPlugin` - Generate RFC 6902 JSON Patch from differences
- `patchPlugin` - Apply RFC 6902 JSON Patch operations
- `schemaPlugin` - JSON Schema validation (draft-07 compatible)
- `streamPlugin` - Streaming parse/stringify, JSONL/NDJSON support
- `repairPlugin` - Fix malformed JSON automatically
- `json5Plugin` - Full JSON5 parsing and serialization
- `typePlugin` - TypeScript type inference from JSON data
- `immutablePlugin` - Deep freeze and structural sharing

#### CLI Tool

- `format` - Pretty print JSON
- `minify` - Minify JSON
- `get` - Get value by path
- `query` - JSONPath query
- `diff` - Compare two JSON files
- `patch` - Apply JSON patch
- `validate` - Validate against schema
- `repair` - Fix broken JSON
- `infer` - Generate TypeScript types
- `flatten` - Flatten nested JSON
- `unflatten` - Unflatten dotted keys
- `merge` - Deep merge multiple files
- `lines` - Process JSONL files

#### Other

- Factory function `createJson()` for custom instances
- Preset system for loading plugin combinations
- MCP server for LLM integration
- Documentation website (React + Vite)
- 263 unit tests with 100% coverage target
- llms.txt for LLM optimization
- TypeScript strict mode enabled
- ESM + CJS dual build

### Technical Details

- Zero runtime dependencies
- Universal runtime support (Node.js 18+, browsers, edge)
- Tree-shakeable plugin architecture
- Full TypeScript support with strict types
- Source maps included
