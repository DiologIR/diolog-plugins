# DiologIR Claude Code Plugins

A marketplace of Claude Code plugins by [DiologIR](https://github.com/DiologIR).

## Available Plugins

| Plugin | Description |
|--------|-------------|
| **discovery-sentinel** | Analyze product discovery and customer feedback documents using the Discovery Sentinel persona. Produces structured Feedback Classification Reports, Discovery Insight Briefs, and Prioritised Opportunity Assessments. |

## Installation

### 1. Register the marketplace

```
/plugin marketplace add DiologIR/claude-plugins
```

### 2. Install a plugin

```
/plugin install discovery-sentinel@diolog-plugins
```

## Contributing

To add a new plugin, create a directory under `plugins/` following the standard Claude Code plugin structure, then add an entry to `.claude-plugin/marketplace.json`.

## License

MIT
