import { describe, it, expect } from 'vitest';
import { createJson } from '../../src/kernel';
import { createPreset, createCustomPreset, corePlugins, optionalPlugins, preset } from '../../src/plugins';
import { parsePlugin, stringifyPlugin, queryPlugin } from '../../src/plugins/core';
import { transformPlugin } from '../../src/plugins/optional/transform.plugin';
import { repairPlugin } from '../../src/plugins/optional/repair.plugin';
import { diffPlugin, patchPlugin } from '../../src/plugins/optional/diff.plugin';
import { schemaPlugin } from '../../src/plugins/optional/schema.plugin';
import { typePlugin } from '../../src/plugins/optional/type.plugin';

describe('plugins/index', () => {
  describe('transform plugin edge cases', () => {
    it('should handle merge with non-object target', () => {
      const json = createJson({});
      json.use(transformPlugin);

      // merge with null/undefined target
      expect(json.merge(null, { a: 1 })).toEqual({ a: 1 });
      expect(json.merge(undefined, { a: 1 })).toEqual({ a: 1 });
    });

    it('should handle merge with non-object source', () => {
      const json = createJson({});
      json.use(transformPlugin);

      // merge with non-object source should return source
      expect(json.merge({ a: 1 }, null)).toEqual(null);
      expect(json.merge({ a: 1 }, 'string')).toEqual('string');
    });

    it('should handle mapValues with primitive values', () => {
      const json = createJson({});
      json.use(transformPlugin);

      // mapValues on primitive should call fn with empty key
      const result = json.mapValues(42, (v, k) => typeof v === 'number' ? v * 2 : v);
      expect(result).toBe(84);
    });

    it('should handle filterValues with primitive values', () => {
      const json = createJson({});
      json.use(transformPlugin);

      // filterValues on primitive
      const result = json.filterValues(42, (v) => typeof v === 'number');
      expect(result).toBe(42);

      const result2 = json.filterValues('string', (v) => typeof v === 'number');
      expect(result2).toBeUndefined();
    });

    it('should handle filterValues removing nested empty objects', () => {
      const json = createJson({});
      json.use(transformPlugin);

      const result = json.filterValues(
        { a: { b: 1, c: 'remove' }, d: { e: 'remove' } },
        (v) => typeof v !== 'string' || v !== 'remove'
      );
      expect(result).toEqual({ a: { b: 1 } });
    });
  });

  describe('plugins/index original', () => {
    describe('createPreset (lines 34-45)', () => {
      it('should create a preset from plugins', () => {
        // Tests lines 34-43: createPreset function and install method
        const customPreset = createPreset([parsePlugin, stringifyPlugin]);
        const json = createJson({});
        json.use(customPreset);

        expect(json.has('parse')).toBe(true);
        expect(json.has('stringify')).toBe(true);
      });

      it('should create preset with correct name', () => {
        // Tests line 36: preset name generation
        const customPreset = createPreset([parsePlugin, stringifyPlugin]);
        expect(customPreset.name).toBe('preset-parse-stringify');
      });

      it('should create preset with version', () => {
        // Tests line 37: preset version
        const customPreset = createPreset([parsePlugin]);
        expect(customPreset.version).toBe('1.0.0');
      });

      it('should install all plugins from preset', () => {
        // Tests lines 39-43: install method that loops through plugins
        const customPreset = createPreset([parsePlugin, stringifyPlugin, queryPlugin]);
        const json = createJson({});
        json.use(customPreset);

        expect(json.has('parse')).toBe(true);
        expect(json.has('stringify')).toBe(true);
        expect(json.has('get')).toBe(true); // from queryPlugin
      });

      it('should install multiple plugins in sequence', () => {
        // Tests lines 40-42: for loop installing plugins
        const pluginList = [parsePlugin, stringifyPlugin, transformPlugin];
        const customPreset = createPreset(pluginList);
        const json = createJson({});
        json.use(customPreset);

        expect(json.has('parse')).toBe(true);
        expect(json.has('stringify')).toBe(true);
        expect(json.has('merge')).toBe(true); // from transformPlugin
      });

      it('should create preset with single plugin', () => {
        const customPreset = createPreset([repairPlugin]);
        const json = createJson({});
        json.use(customPreset);

        expect(json.has('repair')).toBe(true);
      });

      it('should create preset with no plugins', () => {
        const customPreset = createPreset([]);
        const json = createJson({});
        json.use(customPreset);

        // Should not throw, just no plugins installed
        expect(json).toBeDefined();
      });
    });

    describe('createCustomPreset (line 54)', () => {
      it('should export createPreset as createCustomPreset', () => {
        // Tests line 54: export alias
        expect(createCustomPreset).toBe(createPreset);
      });

      it('should work with createCustomPreset alias', () => {
        const customPreset = createCustomPreset([parsePlugin, stringifyPlugin]);
        const json = createJson({});
        json.use(customPreset);

        expect(json.has('parse')).toBe(true);
        expect(json.has('stringify')).toBe(true);
      });
    });

    describe('preset configurations (lines 47-52)', () => {
      it('should have minimal preset', () => {
        // Tests line 48: minimal preset
        const json = createJson({});
        json.use(preset.minimal);

        expect(json.has('repair')).toBe(true);
        expect(json.has('merge')).toBe(true); // from transformPlugin
      });

      it('should have full preset', () => {
        // Tests line 49: full preset
        const json = createJson({});
        json.use(preset.full);

        // Check that all optional plugins are loaded
        expect(json.has('repair')).toBe(true);
        expect(json.has('merge')).toBe(true); // from transformPlugin
      });

      it('should have validation preset', () => {
        // Tests line 50: validation preset
        const json = createJson({});
        json.use(preset.validation);

        expect(json.has('validate')).toBe(true); // from schemaPlugin
        expect(json.has('infer')).toBe(true); // from typePlugin
      });

      it('should have processing preset', () => {
        // Tests line 51: processing preset
        const json = createJson({});
        json.use(preset.processing);

        expect(json.has('merge')).toBe(true); // from transformPlugin
        expect(json.has('diff')).toBe(true); // from diffPlugin
        expect(json.has('patch')).toBe(true); // from patchPlugin
      });
    });

    describe('corePlugins and optionalPlugins', () => {
      it('should export corePlugins array', () => {
        // Tests line 19: corePlugins export
        expect(corePlugins).toBeInstanceOf(Array);
        expect(corePlugins.length).toBeGreaterThan(0);
        expect(corePlugins[0]?.name).toBe('parse');
      });

      it('should export optionalPlugins array', () => {
        // Tests lines 21-32: optionalPlugins export
        expect(optionalPlugins).toBeInstanceOf(Array);
        expect(optionalPlugins.length).toBeGreaterThan(0);
      });

      it('should contain expected plugins in optionalPlugins', () => {
        const pluginNames = optionalPlugins.map((p) => p.name);
        expect(pluginNames).toContain('transform');
        expect(pluginNames).toContain('diff');
        expect(pluginNames).toContain('patch');
        expect(pluginNames).toContain('schema');
        expect(pluginNames).toContain('repair');
        expect(pluginNames).toContain('json5');
        expect(pluginNames).toContain('type');
        expect(pluginNames).toContain('immutable');
      });
    });

    describe('preset plugin integration', () => {
      it('should work with diff and patch together', () => {
        const customPreset = createPreset([diffPlugin, patchPlugin]);
        const json = createJson({});
        json.use(customPreset);

        expect(json.has('diff')).toBe(true);
        expect(json.has('patch')).toBe(true);
      });

      it('should work with schema and type together', () => {
        const customPreset = createPreset([schemaPlugin, typePlugin]);
        const json = createJson({});
        json.use(customPreset);

        expect(json.has('validate')).toBe(true);
        expect(json.has('infer')).toBe(true);
      });

      it('should work with all core plugins', () => {
        const json = createJson({});
        corePlugins.forEach((plugin) => json.use(plugin));

        expect(json.has('parse')).toBe(true);
        expect(json.has('stringify')).toBe(true);
        expect(json.has('get')).toBe(true);
      });
    });

    describe('preset naming edge cases', () => {
      it('should handle plugins with hyphens in names', () => {
        const mockPlugin = { name: 'my-plugin', version: '1.0.0', install: () => {} };
        const customPreset = createPreset([mockPlugin]);
        expect(customPreset.name).toContain('my-plugin');
      });

      it('should handle plugins with underscores in names', () => {
        const mockPlugin = { name: 'my_plugin', version: '1.0.0', install: () => {} };
        const customPreset = createPreset([mockPlugin]);
        expect(customPreset.name).toContain('my_plugin');
      });

      it('should handle single plugin in preset name', () => {
        const customPreset = createPreset([parsePlugin]);
        expect(customPreset.name).toBe('preset-parse');
      });

      it('should handle many plugins in preset name', () => {
        const customPreset = createPreset([parsePlugin, stringifyPlugin, queryPlugin]);
        expect(customPreset.name).toBe('preset-parse-stringify-query');
      });
    });
  });
});
