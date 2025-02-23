/**
 * @license Copyright 2016 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {strict as assert} from 'assert';
import path from 'path';
import {createRequire} from 'module';

import log from 'lighthouse-logger';

import Config from '../../config/config.js';
import defaultConfig from '../../config/default-config.js';
import constants from '../../config/constants.js';
import Gatherer from '../../gather/gatherers/gatherer.js';
import Audit from '../../audits/audit.js';
import i18n from '../../lib/i18n/i18n.js';
import format from '../../../shared/localization/format.js';
import {getModuleDirectory, getModulePath} from '../../../esm-utils.mjs';

const require = createRequire(import.meta.url);
const modulePath = getModulePath(import.meta);
const moduleDir = getModuleDirectory(import.meta);

describe('Config', () => {
  let origConfig;
  beforeEach(() => {
    origConfig = JSON.parse(JSON.stringify(defaultConfig));
  });

  it('returns new object', async () => {
    const config = {
      audits: ['is-on-https'],
    };
    const newConfig = Config.fromJson(config, {});
    assert.notEqual(config, newConfig);
  });

  it('doesn\'t change directly injected gatherer implementations', async () => {
    class MyGatherer extends Gatherer {}
    class MyAudit extends Audit {
      static get meta() {
        return {
          id: 'my-audit',
          title: 'My audit',
          failureTitle: 'My failing audit',
          description: '.',
          requiredArtifacts: ['MyGatherer'],
        };
      }
      static audit() {}
    }
    const config = {
      // Extend default to double test our ability to handle injection.
      extends: 'lighthouse:default',
      settings: {onlyAudits: ['my-audit']},
      passes: [{
        gatherers: [MyGatherer],
      }],
      audits: [MyAudit],
    };
    const newConfig = await Config.fromJson(config);
    assert.equal(MyGatherer, newConfig.passes[0].gatherers[0].implementation);
    assert.equal(MyAudit, newConfig.audits[0].implementation);
  });

  it('doesn\'t change directly injected gatherer instances', async () => {
    class MyGatherer extends Gatherer {
      constructor(secretVal) {
        super();
        this.secret = secretVal;
      }

      get name() {
        // Use unique artifact name per instance so gatherers aren't deduplicated.
        return `MyGatherer${this.secret}`;
      }
    }
    const myGatherer1 = new MyGatherer(1729);
    const myGatherer2 = new MyGatherer(6);
    const config = {
      passes: [{
        gatherers: [
          myGatherer1,
          {instance: myGatherer2},
        ],
      }],
    };
    const newConfig = await Config.fromJson(config);
    const configGatherers = newConfig.passes[0].gatherers;
    assert(configGatherers[0].instance instanceof MyGatherer);
    assert.equal(configGatherers[0].instance.secret, 1729);
    assert(configGatherers[1].instance instanceof MyGatherer);
    assert.equal(configGatherers[1].instance.secret, 6);
  });

  it('uses the default config when no config is provided', async () => {
    const config = await Config.fromJson();
    assert.deepStrictEqual(config.categories, origConfig.categories);
    assert.deepStrictEqual(config.audits.map(a => a.path), origConfig.audits);
  });

  it('throws when a passName is used twice', async () => {
    const unlikelyPassName = 'unlikelyPassName';
    const configJson = {
      passes: [{
        passName: unlikelyPassName,
        gatherers: ['meta-elements'],
      }, {
        passName: unlikelyPassName,
        gatherers: ['viewport-dimensions'],
      }],
    };

    await assert.rejects(Config.fromJson(configJson), /unique/);
  });

  it('defaults passName to defaultPass', async () => {
    class MyGatherer extends Gatherer {}
    const configJson = {
      passes: [{
        gatherers: [MyGatherer],
      }],
    };

    const config = await Config.fromJson(configJson);
    const defaultPass = config.passes.find(pass => pass.passName === 'defaultPass');
    assert.ok(
      defaultPass.gatherers.find(gatherer => gatherer.implementation === MyGatherer),
      'defaultPass should have contained extra gatherer'
    );
  });

  it('throws when an audit requires an artifact with no gatherer supplying it', () => {
    class NeedsWhatYouCantGive extends Audit {
      static get meta() {
        return {
          id: 'missing-artifact-audit',
          title: 'none',
          failureTitle: 'none',
          description: 'none',
          requiredArtifacts: [
            // Require fake artifact amidst base artifact and default artifacts.
            'URL',
            'ConsoleMessages',
            'VRMLElements', // not a real gatherer
            'ViewportDimensions',
          ],
        };
      }

      static audit() {}
    }

    expect(Config.fromJson({
      extends: 'lighthouse:default',
      audits: [NeedsWhatYouCantGive],
    // eslint-disable-next-line max-len
    })).rejects.toThrow('VRMLElements gatherer, required by audit missing-artifact-audit, was not found in config');
  });

  // eslint-disable-next-line max-len
  it('does not throw when an audit requests an optional artifact with no gatherer supplying it', async () => {
    class DoesntNeedYourCrap extends Audit {
      static get meta() {
        return {
          id: 'optional-artifact-audit',
          title: 'none',
          failureTitle: 'none',
          description: 'none',
          requiredArtifacts: [
            'URL', // base artifact
            'ViewportDimensions', // from gatherer
          ],
          __internalOptionalArtifacts: [
            'NotInTheConfig',
          ],
        };
      }

      static audit() {}
    }

    // Shouldn't throw.
    const config = await Config.fromJson({
      extends: 'lighthouse:default',
      audits: [DoesntNeedYourCrap],
    }, {
      // Trigger filtering logic.
      onlyAudits: ['optional-artifact-audit'],
    });
    expect(config.passes[0].gatherers.map(g => g.path)).toEqual(['viewport-dimensions']);
  });

  it('should keep optional artifacts in gatherers after filter', async () => {
    class ButWillStillTakeYourCrap extends Audit {
      static get meta() {
        return {
          id: 'optional-artifact-audit',
          title: 'none',
          failureTitle: 'none',
          description: 'none',
          requiredArtifacts: [
            'URL', // base artifact
            'ViewportDimensions', // from gatherer
          ],
          __internalOptionalArtifacts: [
            'SourceMaps', // Is in the config.
          ],
        };
      }

      static audit() {}
    }

    const config = await Config.fromJson({
      extends: 'lighthouse:default',
      audits: [ButWillStillTakeYourCrap],
    }, {
      // Trigger filtering logic.
      onlyAudits: ['optional-artifact-audit'],
    });
    expect(config.passes[0].gatherers.map(g => g.path))
      .toEqual(['viewport-dimensions', 'source-maps']);
  });

  it('should keep optional artifacts in gatherers after filter', async () => {
    class ButWillStillTakeYourCrap extends Audit {
      static get meta() {
        return {
          id: 'optional-artifact-audit',
          title: 'none',
          failureTitle: 'none',
          description: 'none',
          requiredArtifacts: [
            'URL', // base artifact
            'ViewportDimensions', // from gatherer
          ],
          __internalOptionalArtifacts: [
            'SourceMaps', // Is in the config.
          ],
        };
      }

      static audit() {}
    }

    const config = await Config.fromJson({
      extends: 'lighthouse:default',
      audits: [ButWillStillTakeYourCrap],
    }, {
      // Trigger filtering logic.
      onlyAudits: ['optional-artifact-audit'],
    });
    expect(config.passes[0].gatherers.map(g => g.path))
      .toEqual(['viewport-dimensions', 'source-maps']);
  });

  it('should keep optional artifacts in gatherers after filter', async () => {
    class ButWillStillTakeYourCrap extends Audit {
      static get meta() {
        return {
          id: 'optional-artifact-audit',
          title: 'none',
          failureTitle: 'none',
          description: 'none',
          requiredArtifacts: [
            'URL', // base artifact
            'ViewportDimensions', // from gatherer
          ],
          __internalOptionalArtifacts: [
            'SourceMaps', // Is in the config.
          ],
        };
      }

      static audit() {}
    }

    const config = await Config.fromJson({
      extends: 'lighthouse:default',
      audits: [ButWillStillTakeYourCrap],
    }, {
      // Trigger filtering logic.
      onlyAudits: ['optional-artifact-audit'],
    });
    expect(config.passes[0].gatherers.map(g => g.path))
      .toEqual(['viewport-dimensions', 'source-maps']);
  });

  it('does not throw when an audit requires only base artifacts', async () => {
    class BaseArtifactsAudit extends Audit {
      static get meta() {
        return {
          id: 'base-artifacts-audit',
          title: 'base',
          failureTitle: 'base',
          description: 'base',
          requiredArtifacts: ['HostUserAgent', 'URL', 'Stacks', 'WebAppManifest'],
        };
      }

      static audit() {}
    }

    const config = await Config.fromJson({
      extends: 'lighthouse:default',
      audits: [BaseArtifactsAudit],
    }, {onlyAudits: ['base-artifacts-audit']});

    assert.strictEqual(config.audits.length, 1);
    assert.strictEqual(config.audits[0].implementation.meta.id, 'base-artifacts-audit');
  });

  it('throws for unknown gatherers', async () => {
    const config = {
      passes: [{
        gatherers: ['fuzz'],
      }],
      audits: [
        'is-on-https',
      ],
    };

    await assert.rejects(Config.fromJson(config), /Unable to locate/);
  });

  it('doesn\'t mutate old gatherers when filtering passes', async () => {
    const configJSON = {
      passes: [{
        gatherers: [
          'viewport-dimensions',
          'meta-elements',
          'inspector-issues',
        ],
      }],
      audits: ['is-on-https'],
    };

    const _ = await Config.fromJson(configJSON);
    assert.equal(configJSON.passes[0].gatherers.length, 3);
  });

  it('expands audits', async () => {
    const config = await Config.fromJson({
      audits: ['user-timings'],
    });

    assert.ok(Array.isArray(config.audits));
    assert.equal(config.audits.length, 1);
    assert.equal(config.audits[0].path, 'user-timings');
    assert.equal(typeof config.audits[0].implementation, 'function');
    assert.deepEqual(config.audits[0].options, {});
  });

  it('throws when an audit is not found', async () => {
    await assert.rejects(Config.fromJson({
      audits: ['/fake-path/non-existent-audit'],
    }), /locate audit/);
  });

  it('throws on a non-absolute config path', async () => {
    const configPath = '../../config/default-config.js';

    await assert.rejects(Config.fromJson({
      audits: [],
    }, {configPath}), /absolute path/);
  });

  it('loads an audit relative to a config path', () => {
    const configPath = modulePath;

    return assert.doesNotThrow(_ => Config.fromJson({
      audits: ['../fixtures/valid-custom-audit'],
    }, {configPath}));
  });

  it('loads an audit from node_modules/', async () => {
    await assert.rejects(Config.fromJson({
      // Use a lighthouse dep as a stand in for a module.
      audits: ['lighthouse-logger'],
    }), function(err) {
      // Should throw an audit validation error, but *not* an audit not found error.
      return !/locate audit/.test(err) && /audit\(\) method/.test(err);
    });
  });

  it('loads an audit relative to the working directory', async () => {
    // Construct an audit URL relative to current working directory, regardless
    // of where test was started from.
    const absoluteAuditPath = path.resolve(moduleDir, '../fixtures/valid-custom-audit');
    assert.doesNotThrow(_ => require.resolve(absoluteAuditPath));
    const relativePath = path.relative(process.cwd(), absoluteAuditPath);

    return assert.doesNotThrow(_ => Config.fromJson({
      audits: [relativePath],
    }));
  });

  it('throws but not for missing audit when audit has a dependency error', async () => {
    await assert.rejects(Config.fromJson({
      audits: [path.resolve(moduleDir, '../fixtures/invalid-audits/require-error.js')],
    }), function(err) {
      // We're expecting not to find parent class Audit, so only reject on our
      // own custom locate audit error, not the usual MODULE_NOT_FOUND.
      return !/locate audit/.test(err) && err.code === 'MODULE_NOT_FOUND';
    });
  });

  it('throws when it finds invalid audits', async () => {
    const basePath = path.resolve(moduleDir, '../fixtures/invalid-audits');
    await assert.rejects(Config.fromJson({
      audits: [basePath + '/missing-audit'],
    }), /audit\(\) method/);

    await assert.rejects(Config.fromJson({
      audits: [basePath + '/missing-id'],
    }), /meta.id property/);

    await assert.rejects(Config.fromJson({
      audits: [basePath + '/missing-title'],
    }), /meta.title property/);

    await assert.rejects(Config.fromJson({
      audits: [
        class BinaryButNoFailureTitleAudit extends Audit {
          static get meta() {
            return {
              id: 'no-failure-title',
              title: 'title',
              description: 'help',
              requiredArtifacts: [],
              scoreDisplayMode: 'binary',
            };
          }

          static audit() {
            throw new Error('Unimplemented');
          }
        },
      ],
    }), /no meta.failureTitle and should/);

    await assert.rejects(Config.fromJson({
      audits: [basePath + '/missing-description'],
    }), /meta.description property/);

    await assert.rejects(Config.fromJson({
      audits: [
        class EmptyStringDescriptionAudit extends Audit {
          static get meta() {
            return {
              id: 'empty-string-description',
              title: 'title',
              failureTitle: 'none',
              description: '',
              requiredArtifacts: [],
            };
          }

          static audit() {
            throw new Error('Unimplemented');
          }
        },
      ],
    }), /empty meta.description string/);

    await assert.rejects(Config.fromJson({
      audits: [basePath + '/missing-required-artifacts'],
    }), /meta.requiredArtifacts property/);
  });

  it('throws when a category references a non-existent audit', async () => {
    await assert.rejects(Config.fromJson({
      audits: [],
      categories: {
        pwa: {
          auditRefs: [
            {id: 'missing-audit'},
          ],
        },
      },
    }), /could not find missing-audit/);
  });

  it('throws when a category fails to specify an audit id', async () => {
    await assert.rejects(Config.fromJson({
      audits: [],
      categories: {
        pwa: {
          auditRefs: [
            'oops-wrong-format',
          ],
        },
      },
    }), /missing an audit id at pwa\[0\]/);
  });

  it('throws when an accessibility audit does not have a group', async () => {
    await assert.rejects(Config.fromJson({
      audits: ['accessibility/color-contrast'],
      categories: {
        accessibility: {
          auditRefs: [
            {id: 'color-contrast'},
          ],
        },
      },
    }), /does not have a group/);
  });

  it('throws when an audit references an unknown group', async () => {
    await assert.rejects(Config.fromJson({
      groups: {
        'group-a': {
          title: 'Group A',
          description: 'The best group around.',
        },
      },
      audits: ['metrics/first-meaningful-paint'],
      categories: {
        pwa: {
          auditRefs: [
            {id: 'first-meaningful-paint', group: 'group-a'},
            {id: 'first-meaningful-paint', group: 'missing-group'},
          ],
        },
      },
    }), /unknown group missing-group/);
  });

  it('throws when a manual audit has weight', async () => {
    await assert.rejects(Config.fromJson({
      audits: ['manual/pwa-cross-browser'],
      categories: {
        accessibility: {
          auditRefs: [
            {id: 'pwa-cross-browser', weight: 10},
          ],
        },
      },
    }), /cross-browser .*has a positive weight/);
  });

  it('filters the config', async () => {
    const config = await Config.fromJson({
      settings: {
        onlyCategories: ['needed-category'],
        onlyAudits: ['color-contrast'],
      },
      passes: [
        {recordTrace: true, gatherers: []},
        {passName: 'a11y', gatherers: ['accessibility']},
      ],
      audits: [
        'accessibility/color-contrast',
        'metrics/first-meaningful-paint',
        'metrics/first-contentful-paint',
        'metrics/cumulative-layout-shift',
      ],
      categories: {
        'needed-category': {
          auditRefs: [
            {id: 'first-meaningful-paint'},
            {id: 'first-contentful-paint'},
          ],
        },
        'other-category': {
          auditRefs: [
            {id: 'color-contrast'},
            {id: 'cumulative-layout-shift'},
          ],
        },
        'unused-category': {
          auditRefs: [
            {id: 'cumulative-layout-shift'},
          ],
        },
      },
    });

    assert.equal(config.audits.length, 3, 'reduces audit count');
    assert.equal(config.passes.length, 2, 'preserves both passes');
    assert.ok(config.passes[0].recordTrace, 'preserves recordTrace pass');
    assert.ok(!config.categories['unused-category'], 'removes unused categories');
    assert.equal(config.categories['needed-category'].auditRefs.length, 2);
    assert.equal(config.categories['other-category'].auditRefs.length, 1);
  });

  it('filters the config w/ skipAudits', async () => {
    const config = await Config.fromJson({
      settings: {
        skipAudits: ['first-meaningful-paint'],
      },
      passes: [
        {recordTrace: true, gatherers: []},
        {passName: 'a11y', gatherers: ['accessibility']},
      ],
      audits: [
        'accessibility/color-contrast',
        'metrics/first-meaningful-paint',
        'metrics/first-contentful-paint',
        'metrics/cumulative-layout-shift',
      ],
      categories: {
        'needed-category': {
          auditRefs: [
            {id: 'first-meaningful-paint'},
            {id: 'first-contentful-paint'},
            {id: 'color-contrast'},
          ],
        },
        'other-category': {
          auditRefs: [
            {id: 'color-contrast'},
            {id: 'cumulative-layout-shift'},
          ],
        },
      },
    });

    assert.equal(config.audits.length, 3, 'skips the FMP audit');
    assert.equal(config.passes.length, 2, 'preserves both passes');
    assert.ok(config.passes[0].recordTrace, 'preserves recordTrace pass');
    assert.equal(config.categories['needed-category'].auditRefs.length, 2,
      'removes skipped audit from category');
  });


  it('filtering filters out traces when not needed', async () => {
    const warnings = [];
    const saveWarning = evt => warnings.push(evt);
    log.events.addListener('warning', saveWarning);
    const config = await Config.fromJson({
      extends: 'lighthouse:default',
      settings: {
        onlyCategories: ['accessibility'],
      },
    });

    log.events.removeListener('warning', saveWarning);
    assert.ok(config.audits.length, 'inherited audits by extension');
    assert.equal(config.passes.length, 1, 'filtered out passes');
    assert.equal(warnings.length, 1, 'warned about dropping trace');
    assert.equal(config.passes[0].recordTrace, false, 'turns off tracing if not needed');
  });

  it('forces the first pass to have a fatal loadFailureMode', async () => {
    const warnings = [];
    const saveWarning = evt => warnings.push(evt);
    log.events.addListener('warning', saveWarning);
    const config = await Config.fromJson({
      extends: 'lighthouse:default',
      settings: {
        onlyCategories: ['performance', 'pwa'],
      },
      passes: [
        {passName: 'defaultPass', loadFailureMode: 'warn'},
      ],
    });

    log.events.removeListener('warning', saveWarning);
    expect(warnings).toHaveLength(1);
    expect(warnings[0][0]).toMatch(/loadFailureMode.*fatal/);
    expect(config.passes[0]).toHaveProperty('loadFailureMode', 'fatal');
  });

  it('filters works with extension', async () => {
    const config = await Config.fromJson({
      extends: 'lighthouse:default',
      settings: {
        onlyCategories: ['performance'],
        onlyAudits: ['is-on-https'],
      },
    });

    assert.ok(config.audits.length, 'inherited audits by extension');
    // +1 for `is-on-https`, +1 for `full-page-screenshot`.
    assert.equal(config.audits.length, origConfig.categories.performance.auditRefs.length + 2);
    assert.equal(config.passes.length, 1, 'filtered out passes');
    assert.ok(config.audits.find(a => a.implementation.meta.id === 'is-on-https'));
    assert.ok(config.audits.find(a => a.implementation.meta.id === 'full-page-screenshot'));
  });

  it('warns for invalid filters', async () => {
    const warnings = [];
    const saveWarning = evt => warnings.push(evt);
    log.events.addListener('warning', saveWarning);
    const config = await Config.fromJson({
      extends: 'lighthouse:default',
      settings: {
        onlyCategories: ['performance', 'missing-category'],
        onlyAudits: ['first-contentful-paint', 'missing-audit'],
      },
    });

    log.events.removeListener('warning', saveWarning);
    assert.ok(config, 'failed to generate config');
    assert.equal(warnings.length, 3, 'did not warn enough');
  });

  it('throws for invalid use of skipAudits and onlyAudits', async () => {
    await assert.rejects(() => {
      return Config.fromJson({
        extends: 'lighthouse:default',
        settings: {
          onlyAudits: ['first-meaningful-paint'],
          skipAudits: ['first-meaningful-paint'],
        },
      });
    });
  });

  it('cleans up flags for settings', async () => {
    const config = await Config.fromJson({extends: 'lighthouse:default'},
      {nonsense: 1, foo: 2, throttlingMethod: 'provided'});
    assert.equal(config.settings.throttlingMethod, 'provided');
    assert.ok(config.settings.nonsense === undefined, 'did not cleanup settings');
  });

  it('allows overriding of array-typed settings', async () => {
    const config = await Config.fromJson(
      {extends: 'lighthouse:default'},
      {output: ['html']}
    );
    assert.deepStrictEqual(config.settings.output, ['html']);
  });

  it('extends the config', async () => {
    class CustomAudit extends Audit {
      static get meta() {
        return {
          id: 'custom-audit',
          title: 'none',
          failureTitle: 'none',
          description: 'none',
          requiredArtifacts: [],
        };
      }

      static audit() {
        throw new Error('Unimplemented');
      }
    }

    const config = await Config.fromJson({
      extends: 'lighthouse:default',
      audits: [
        CustomAudit,
      ],
    });

    const auditNames = new Set(config.audits.map(audit => audit.implementation.meta.id));
    assert.ok(config, 'failed to generate config');
    assert.ok(auditNames.has('custom-audit'), 'did not include custom audit');
    assert.ok(auditNames.has('unused-javascript'), 'did not include full audits');
    assert.ok(auditNames.has('first-meaningful-paint'), 'did not include default audits');
  });

  it('ensures quiet thresholds are sufficient when using devtools', async () => {
    const config = await Config.fromJson({
      extends: 'lighthouse:default',
      settings: {
        throttlingMethod: 'devtools',
      },
    });

    assert.equal(config.settings.throttlingMethod, 'devtools');
    assert.equal(config.passes[0].passName, 'defaultPass');
    assert.ok(config.passes[0].pauseAfterFcpMs >= 5000, 'did not adjust fcp quiet ms');
    assert.ok(config.passes[0].pauseAfterLoadMs >= 5000, 'did not adjust load quiet ms');
    assert.ok(config.passes[0].cpuQuietThresholdMs >= 5000, 'did not adjust cpu quiet ms');
    assert.ok(config.passes[0].networkQuietThresholdMs >= 5000, 'did not adjust network quiet ms');
    assert.equal(config.passes[1].pauseAfterLoadMs, 0, 'should not have touched non-defaultPass');
  });

  it('does nothing when thresholds for devtools are already sufficient', async () => {
    const config = await Config.fromJson({
      extends: 'lighthouse:default',
      settings: {
        throttlingMethod: 'devtools',
        onlyCategories: ['performance'],
      },
      passes: [
        {
          pauseAfterLoadMs: 10001,
          cpuQuietThresholdMs: 10002,
          networkQuietThresholdMs: 10003,
        },
      ],
    });

    assert.equal(config.settings.throttlingMethod, 'devtools');
    assert.equal(config.passes[0].pauseAfterLoadMs, 10001);
    assert.equal(config.passes[0].cpuQuietThresholdMs, 10002);
    assert.equal(config.passes[0].networkQuietThresholdMs, 10003);
  });

  it('only supports `lighthouse:default` extension', () => {
    const createConfig = extendsValue => Config.fromJson({extends: extendsValue});

    expect(createConfig(true)).rejects.toThrow(/default` is the only valid extension/);
    expect(createConfig('lighthouse')).rejects.toThrow(/default` is the only valid/);
    expect(createConfig('lighthouse:full')).rejects.toThrow(/default` is the only valid/);
  });

  it('merges settings with correct priority', async () => {
    const config = await Config.fromJson(
      {
        extends: 'lighthouse:default',
        settings: {
          disableStorageReset: true,
          formFactor: 'desktop',
          throttling: constants.throttling.desktopDense4G,
          screenEmulation: constants.screenEmulationMetrics.desktop,
          emulatedUserAgent: constants.userAgents.desktop,
        },
      },
      {formFactor: 'desktop'}
    );

    assert.ok(config, 'failed to generate config');
    assert.ok(typeof config.settings.maxWaitForLoad === 'number', 'missing setting from default');
    assert.ok(config.settings.disableStorageReset, 'missing setting from extension config');
    assert.ok(config.settings.formFactor === 'desktop', 'missing setting from flags');
  });

  it('inherits default settings when undefined', async () => {
    const config = await Config.fromJson({settings: undefined});
    assert.ok(typeof config.settings.maxWaitForLoad === 'number', 'missing setting from default');
  });

  describe('locale', () => {
    it('falls back to default locale if none specified', async () => {
      const config = await Config.fromJson({settings: undefined});
      // Don't assert specific locale so it isn't tied to where tests are run, but
      // check that it's valid and available.
      assert.ok(config.settings.locale);
      assert.strictEqual(config.settings.locale, i18n.lookupLocale(config.settings.locale));
    });

    it('uses config setting for locale if set', async () => {
      const locale = 'ar-XB';
      const config = await Config.fromJson({settings: {locale}});
      assert.strictEqual(config.settings.locale, locale);
    });

    it('uses flag setting for locale if set', async () => {
      const settingsLocale = 'en-XA';
      const flagsLocale = 'ar-XB';
      const config = await Config.fromJson({
        settings: {locale: settingsLocale}},
        {locale: flagsLocale}
      );
      assert.strictEqual(config.settings.locale, flagsLocale);
    });
  });

  describe('emulatedUserAgent', () => {
    it('uses the default UA string when emulatedUserAgent is undefined', async () => {
      const config = await Config.fromJson({});
      expect(config.settings.emulatedUserAgent).toMatch(/^Mozilla\/5.*Chrome-Lighthouse$/);
    });

    it('uses the default UA string when emulatedUserAgent is true', async () => {
      const config = await Config.fromJson({
        settings: {
          emulatedUserAgent: true,
        },
      });
      expect(config.settings.emulatedUserAgent).toMatch(/^Mozilla\/5.*Chrome-Lighthouse$/);
    });

    it('does not use a UA string when emulatedUserAgent is false', async () => {
      const config = await Config.fromJson({
        settings: {
          emulatedUserAgent: false,
        },
      });
      expect(config.settings.emulatedUserAgent).toEqual(false);
    });

    it('uses the UA string provided if it is a string', async () => {
      const emulatedUserAgent = 'one weird trick to get a perfect LH score';
      const config = await Config.fromJson({
        settings: {
          emulatedUserAgent,
        },
      });
      expect(config.settings.emulatedUserAgent).toEqual(emulatedUserAgent);
    });
  });

  it('is idempotent when accepting a canonicalized Config as valid ConfigJson input', async () => {
    const config = await Config.fromJson(defaultConfig);
    const configAgain = await Config.fromJson(config);
    assert.deepEqual(config, configAgain);
  });

  // eslint-disable-next-line max-len
  it('is idempotent accepting a canonicalized filtered Config as valid ConfigJson input', async () => {
    const extendedJson = {
      extends: 'lighthouse:default',
      settings: {
        onlyCategories: ['pwa'],
      },
    };
    const config = await Config.fromJson(extendedJson);
    assert.equal(config.passes.length, 2, 'did not filter config');
    assert.equal(Object.keys(config.categories).length, 1, 'did not filter config');
    assert.deepEqual(config.settings.onlyCategories, ['pwa']);
    const configAgain = await Config.fromJson(config);
    assert.deepEqual(config, configAgain);
  });

  describe('#extendConfigJSON', () => {
    it('should merge passes', async () => {
      const configA = {
        passes: [
          {passName: 'passA', gatherers: ['a']},
          {passName: 'passB', gatherers: ['b']},
          {gatherers: ['c']},
        ],
      };
      const configB = {
        passes: [
          {passName: 'passB', recordTrace: true, gatherers: ['d']},
          {gatherers: ['e']},
        ],
      };

      const merged = Config.extendConfigJSON(configA, configB);
      assert.equal(merged.passes.length, 4);
      assert.equal(merged.passes[1].recordTrace, true);
      assert.deepEqual(merged.passes[1].gatherers, ['b', 'd']);
      assert.deepEqual(merged.passes[3].gatherers, ['e']);
    });

    it('should merge audits', async () => {
      const configA = {audits: ['a', 'b']};
      const configB = {audits: ['c']};
      const merged = Config.extendConfigJSON(configA, configB);
      assert.deepEqual(merged.audits, ['a', 'b', 'c']);
    });

    it('should merge categories', async () => {
      const configA = {categories: {A: {title: 'Acat'}, B: {title: 'Bcat'}}};
      const configB = {categories: {C: {title: 'Ccat'}}};
      const merged = Config.extendConfigJSON(configA, configB);
      assert.deepStrictEqual(merged.categories, {
        A: {title: 'Acat'},
        B: {title: 'Bcat'},
        C: {title: 'Ccat'},
      });
    });

    it('should merge other values', async () => {
      const artifacts = {
        traces: {defaultPass: '../some/long/path'},
        devtoolsLogs: {defaultPass: 'path/to/devtools/log'},
      };
      const configA = {};
      const configB = {extends: 'lighthouse:default', artifacts};
      const merged = Config.extendConfigJSON(configA, configB);
      assert.equal(merged.extends, 'lighthouse:default');
      assert.equal(merged.artifacts, configB.artifacts);
    });
  });

  describe('mergePlugins', () => {
    // Include a configPath flag so that config.js looks for the plugins in the fixtures dir.
    const configFixturePath = moduleDir + '/../fixtures/config-plugins/';

    it('should append audits', async () => {
      const configJson = {
        audits: ['installable-manifest', 'metrics'],
        plugins: ['lighthouse-plugin-simple'],
      };
      const config = await Config.fromJson(configJson, {configPath: configFixturePath});
      assert.deepStrictEqual(config.audits.map(a => a.path),
        ['installable-manifest', 'metrics', 'redirects', 'user-timings']);
    });

    it('should append and use plugin-prefixed groups', async () => {
      const configJson = {
        audits: ['installable-manifest', 'metrics'],
        plugins: ['lighthouse-plugin-simple'],
        groups: {
          configGroup: {title: 'This is a group in the base config'},
        },
      };
      const config = await Config.fromJson(configJson, {configPath: configFixturePath});

      const groupIds = Object.keys(config.groups);
      assert.ok(groupIds.length === 2);
      assert.strictEqual(groupIds[0], 'configGroup');
      assert.strictEqual(groupIds[1], 'lighthouse-plugin-simple-new-group');
      assert.strictEqual(config.groups['lighthouse-plugin-simple-new-group'].title, 'New Group');
      assert.strictEqual(config.categories['lighthouse-plugin-simple'].auditRefs[0].group,
        'lighthouse-plugin-simple-new-group');
    });

    it('should append a category', async () => {
      const configJson = {
        extends: 'lighthouse:default',
        plugins: ['lighthouse-plugin-simple'],
      };
      const config = await Config.fromJson(configJson, {configPath: configFixturePath});
      const categoryNames = Object.keys(config.categories);
      assert.ok(categoryNames.length > 1);
      assert.strictEqual(categoryNames[categoryNames.length - 1], 'lighthouse-plugin-simple');
      assert.strictEqual(config.categories['lighthouse-plugin-simple'].title, 'Simple');
    });

    describe('budget setting', () => {
      it('should be initialized', async () => {
        const configJson = {
          settings: {
            budgets: [{
              path: '/',
              resourceCounts: [{
                resourceType: 'image',
                budget: 500,
              }],
            }],
          },
        };
        const config = await Config.fromJson(configJson);
        assert.equal(config.settings.budgets[0].resourceCounts.length, 1);
        assert.equal(config.settings.budgets[0].resourceCounts[0].resourceType, 'image');
        assert.equal(config.settings.budgets[0].resourceCounts[0].budget, 500);
      });

      it('should throw when provided an invalid budget', async () => {
        await assert.rejects(
          () => Config.fromJson({settings: {budgets: ['invalid123']}}),
          /Budget file is not defined as an array of budgets/);
      });
    });

    it('should load plugins from the config and from passed-in flags', async () => {
      const baseConfigJson = {
        audits: ['installable-manifest'],
        categories: {
          myManifest: {
            auditRefs: [{id: 'installable-manifest', weight: 9000}],
          },
        },
      };
      const baseFlags = {configPath: configFixturePath};
      const simplePluginName = 'lighthouse-plugin-simple';
      const noGroupsPluginName = 'lighthouse-plugin-no-groups';

      const allConfigConfigJson = {...baseConfigJson, plugins: [simplePluginName,
        noGroupsPluginName]};
      const allPluginsInConfigConfig = await Config.fromJson(allConfigConfigJson, baseFlags);

      const allFlagsFlags = {...baseFlags, plugins: [simplePluginName, noGroupsPluginName]};
      const allPluginsInFlagsConfig = await Config.fromJson(baseConfigJson, allFlagsFlags);

      const mixedConfigJson = {...baseConfigJson, plugins: [simplePluginName]};
      const mixedFlags = {...baseFlags, plugins: [noGroupsPluginName]};
      const pluginsInConfigAndFlagsConfig = await Config.fromJson(mixedConfigJson, mixedFlags);

      // Double check that we're not comparing empty objects.
      const categoryNames = Object.keys(allPluginsInConfigConfig.categories);
      assert.deepStrictEqual(categoryNames,
        ['myManifest', 'lighthouse-plugin-simple', 'lighthouse-plugin-no-groups']);

      assert.deepStrictEqual(allPluginsInConfigConfig, allPluginsInFlagsConfig);
      assert.deepStrictEqual(allPluginsInConfigConfig, pluginsInConfigAndFlagsConfig);
    });

    it('should throw if the plugin is invalid', async () => {
      const configJson = {
        extends: 'lighthouse:default',
        plugins: ['lighthouse-plugin-no-category'],
      };
      // Required to have a `category`, so plugin is invalid.
      await assert.rejects(
        () => Config.fromJson(configJson, {configPath: configFixturePath}),
        /^Error: lighthouse-plugin-no-category has no valid category/);
    });

    it('should throw if the plugin is not found', async () => {
      const configJson = {
        extends: 'lighthouse:default',
        plugins: ['lighthouse-plugin-not-a-plugin'],
      };
      await assert.rejects(
        () => Config.fromJson(configJson, {configPath: configFixturePath}),
        /^Error: Unable to locate plugin: `lighthouse-plugin-not-a-plugin/);
    });

    it('should throw if the plugin name does not begin with "lighthouse-plugin-"', async () => {
      const configJson = {
        extends: 'lighthouse:default',
        plugins: ['just-let-me-be-a-plugin'],
      };
      await assert.rejects(
        () => Config.fromJson(configJson, {configPath: configFixturePath}),
        /^Error: plugin name 'just-let-me-be-a-plugin' does not start with 'lighthouse-plugin-'/);
    });

    it('should throw if the plugin name would shadow a category id', async () => {
      const configJson = {
        extends: 'lighthouse:default',
        plugins: ['lighthouse-plugin-simple'],
        categories: {
          'lighthouse-plugin-simple': {auditRefs: [{id: 'missing-audit'}]},
        },
      };
      await assert.rejects(
        () => Config.fromJson(configJson, {configPath: configFixturePath}),
        /^Error: plugin name 'lighthouse-plugin-simple' not allowed because it is the id of a category/); // eslint-disable-line max-len
    });
  });

  describe('filterConfigIfNeeded', () => {
    it('should not mutate the original config', async () => {
      const configCopy = JSON.parse(JSON.stringify(origConfig));
      configCopy.settings.onlyCategories = ['performance'];
      const config = await Config.fromJson(configCopy);
      configCopy.settings.onlyCategories = null;
      assert.equal(config.passes.length, 1, 'did not filter config');
      assert.deepStrictEqual(configCopy, origConfig, 'had mutations');
    });

    it('should generate the same filtered config, extended or original', async () => {
      const configCopy = JSON.parse(JSON.stringify(origConfig));
      configCopy.settings.onlyCategories = ['performance'];
      const config = await Config.fromJson(configCopy);

      const extended = {
        extends: 'lighthouse:default',
        settings: {
          onlyCategories: ['performance'],
        },
      };
      const extendedConfig = await Config.fromJson(extended);

      // When gatherers have instance properties that are bind()'d, they'll not match.
      // Gatherers in each config will still be compared via the constructor on .implementation.
      // https://github.com/GoogleChrome/lighthouse/pull/10090#discussion_r382864319
      function deleteInstancesForTest(config) {
        for (const pass of config.passes) {
          for (const gatherer of pass.gatherers) {
            delete gatherer.instance;
          }
        }
      }
      deleteInstancesForTest(extendedConfig);
      deleteInstancesForTest(config);

      assert.equal(config.passes.length, 1, 'did not filter config');
      expect(config).toEqual(extendedConfig); // ensure we didn't have mutations
    });

    it('should filter out other passes if passed Performance', async () => {
      const totalAuditCount = origConfig.audits.length;
      const extended = {
        extends: 'lighthouse:default',
        settings: {
          onlyCategories: ['performance'],
        },
      };
      const config = await Config.fromJson(extended);
      assert.equal(Object.keys(config.categories).length, 1, 'other categories are present');
      assert.equal(config.passes.length, 1, 'incorrect # of passes');
      assert.ok(config.audits.length < totalAuditCount, 'audit filtering probably failed');
    });

    it('should filter out other passes if passed PWA', async () => {
      const totalAuditCount = origConfig.audits.length;
      const extended = {
        extends: 'lighthouse:default',
        settings: {
          onlyCategories: ['pwa'],
        },
      };
      const config = await Config.fromJson(extended);
      assert.equal(Object.keys(config.categories).length, 1, 'other categories are present');
      assert.ok(config.audits.length < totalAuditCount, 'audit filtering probably failed');
    });

    it('should filter out other passes if passed Best Practices', async () => {
      const totalAuditCount = origConfig.audits.length;
      const extended = {
        extends: 'lighthouse:default',
        settings: {
          onlyCategories: ['best-practices'],
        },
      };
      const config = await Config.fromJson(extended);
      assert.equal(Object.keys(config.categories).length, 1, 'other categories are present');
      assert.equal(config.passes.length, 1, 'incorrect # of passes');
      assert.ok(config.audits.length < totalAuditCount, 'audit filtering probably failed');
    });

    it('should only run audits for ones named by the category', async () => {
      const extended = {
        extends: 'lighthouse:default',
        settings: {
          onlyCategories: ['performance'],
        },
      };
      const config = await Config.fromJson(extended);
      const selectedCategory = origConfig.categories.performance;
      // +1 for `full-page-screenshot`.
      const auditCount = Object.keys(selectedCategory.auditRefs).length + 1;

      assert.equal(config.audits.length, auditCount, '# of audits match category list');
      assert.ok(config.audits.find(a => a.implementation.meta.id === 'full-page-screenshot'));
    });

    it('should only run specified audits', async () => {
      const extended = {
        extends: 'lighthouse:default',
        settings: {
          onlyAudits: ['service-worker'], // something from non-defaultPass
        },
      };
      const config = await Config.fromJson(extended);
      assert.equal(config.passes.length, 2, 'incorrect # of passes');
      assert.equal(config.audits.length, 1, 'audit filtering failed');
    });

    it('should combine audits and categories additively', async () => {
      const extended = {
        extends: 'lighthouse:default',
        settings: {
          onlyCategories: ['performance'],
          onlyAudits: ['service-worker'], // something from non-defaultPass
        },
      };
      const config = await Config.fromJson(extended);
      const selectedCategory = origConfig.categories.performance;
      // +1 for `service-worker`, +1 for `full-page-screenshot`.
      const auditCount = Object.keys(selectedCategory.auditRefs).length + 2;
      assert.equal(config.passes.length, 2, 'incorrect # of passes');
      assert.equal(config.audits.length, auditCount, 'audit filtering failed');
      assert.ok(config.audits.find(a => a.implementation.meta.id === 'service-worker'));
      assert.ok(config.audits.find(a => a.implementation.meta.id === 'full-page-screenshot'));
    });

    it('should support redundant filtering', async () => {
      const extended = {
        extends: 'lighthouse:default',
        settings: {
          onlyCategories: ['pwa'],
          onlyAudits: ['apple-touch-icon'],
        },
      };
      const config = await Config.fromJson(extended);
      const selectedCategory = origConfig.categories.pwa;
      // +1 for `full-page-screenshot`.
      const auditCount = Object.keys(selectedCategory.auditRefs).length + 1;
      assert.equal(config.passes.length, 2, 'incorrect # of passes');
      assert.equal(config.audits.length, auditCount, 'audit filtering failed');
      assert.ok(config.audits.find(a => a.implementation.meta.id === 'full-page-screenshot'));
    });

    it('should keep full-page-screenshot even if onlyCategories is set', async () => {
      assert.ok(origConfig.audits.includes('full-page-screenshot'));
      // full-page-screenshot does not belong to a category.
      const matchCategories = Object.values(origConfig.categories).filter(cat =>
          cat.auditRefs.find(ref => ref.id === 'full-page-screenshot'));
      assert.equal(matchCategories.length, 0);

      const extended = {
        extends: 'lighthouse:default',
        settings: {
          onlyCategories: ['accessibility'],
        },
      };
      const config = await Config.fromJson(extended);

      assert.ok(config.audits.find(a => a.implementation.meta.id === 'full-page-screenshot'));
    });

    it('should keep full-page-screenshot even if skipAudits is set', async () => {
      const extended = {
        extends: 'lighthouse:default',
        settings: {
          skipAudits: ['font-size'],
        },
      };
      const config = await Config.fromJson(extended);
      assert.ok(config.audits.find(a => a.implementation.meta.id === 'full-page-screenshot'));
    });
  });

  describe('#requireAudits', () => {
    it('should merge audits', async () => {
      const audits = [
        'user-timings',
        {path: 'is-on-https', options: {x: 1, y: 1}},
        {path: 'is-on-https', options: {x: 2}},
      ];
      const merged = await Config.requireAudits(audits);
      // Round-trip through JSON to drop live 'implementation' prop.
      const mergedJson = JSON.parse(JSON.stringify(merged));
      assert.deepEqual(mergedJson,
        [{path: 'user-timings', options: {}}, {path: 'is-on-https', options: {x: 2, y: 1}}]);
    });

    it('throws for invalid auditDefns', async () => {
      const configJson = {
        audits: [
          new Gatherer(),
        ],
      };
      await assert.rejects(Config.fromJson(configJson), /Invalid Audit type/);
    });
  });

  describe('#requireGatherers', () => {
    it('should deduplicate gatherers', async () => {
      const gatherers = [
        'viewport-dimensions',
        {path: 'viewport-dimensions'},
      ];

      const merged = await Config.requireGatherers([{gatherers}]);
      // Round-trip through JSON to drop live 'instance'/'implementation' props.
      const mergedJson = JSON.parse(JSON.stringify(merged));

      const expectedInstance = {
        meta: {
          supportedModes: ['snapshot', 'timespan', 'navigation'],
        },
      };
      assert.deepEqual(mergedJson[0].gatherers,
        [{path: 'viewport-dimensions', instance: expectedInstance}]);
    });

    async function loadGatherer(gathererEntry) {
      const config = await Config.fromJson({passes: [{gatherers: [gathererEntry]}]});
      return config.passes[0].gatherers[0];
    }

    it('loads a core gatherer', async () => {
      const gatherer = await loadGatherer('viewport-dimensions');
      assert.equal(gatherer.instance.name, 'ViewportDimensions');
      assert.equal(typeof gatherer.instance.beforePass, 'function');
    });

    it('loads gatherers from custom paths', async () => {
      const customPath = path.resolve(moduleDir, '../fixtures/valid-custom-gatherer');
      const gatherer = await loadGatherer(customPath);
      assert.equal(gatherer.instance.name, 'CustomGatherer');
      assert.equal(typeof gatherer.instance.beforePass, 'function');
    });

    it('loads a gatherer relative to a config path', async () => {
      const config = await Config.fromJson({
        passes: [{gatherers: ['../fixtures/valid-custom-gatherer']}],
      }, {configPath: modulePath});
      const gatherer = config.passes[0].gatherers[0];

      assert.equal(gatherer.instance.name, 'CustomGatherer');
      assert.equal(typeof gatherer.instance.beforePass, 'function');
    });

    it('returns gatherer when gatherer class, not package-name string, is provided', async () => {
      class TestGatherer extends Gatherer {}
      const gatherer = await loadGatherer(TestGatherer);
      assert.equal(gatherer.instance.name, 'TestGatherer');
      assert.equal(typeof gatherer.instance.beforePass, 'function');
    });

    // eslint-disable-next-line max-len
    it('returns gatherer when gatherer instance, not package-name string, is provided', async () => {
      class TestGatherer extends Gatherer {}
      const gatherer = await loadGatherer(new TestGatherer());
      assert.equal(gatherer.instance.name, 'TestGatherer');
      assert.equal(typeof gatherer.instance.beforePass, 'function');
    });

    it('returns gatherer when `gathererDefn` with instance is provided', async () => {
      class TestGatherer extends Gatherer {}
      const gatherer = await loadGatherer({instance: new TestGatherer()});
      assert.equal(gatherer.instance.name, 'TestGatherer');
      assert.equal(typeof gatherer.instance.beforePass, 'function');
    });

    it('throws when a gatherer is not found', async () => {
      await assert.rejects(loadGatherer('/fake-non-existent-gatherer'), /locate gatherer/);
    });

    it('loads a gatherer from node_modules/', async () => {
      // Use a lighthouse dep as a stand in for a module.
      await assert.rejects(loadGatherer('lighthouse-logger'), function(err) {
        // Should throw a gatherer validation error, but *not* a gatherer not found error.
        return !/locate gatherer/.test(err) && /beforePass\(\) method/.test(err);
      });
    });

    it('loads a gatherer relative to the working directory', async () => {
      // Construct a gatherer URL relative to current working directory,
      // regardless of where test was started from.
      const absoluteGathererPath = path.resolve(moduleDir, '../fixtures/valid-custom-gatherer');
      assert.doesNotThrow(_ => require.resolve(absoluteGathererPath));
      const relativeGathererPath = path.relative(process.cwd(), absoluteGathererPath);

      const gatherer = await loadGatherer(relativeGathererPath);
      assert.equal(gatherer.instance.name, 'CustomGatherer');
      assert.equal(typeof gatherer.instance.beforePass, 'function');
    });

    it('throws but not for missing gatherer when it has a dependency error', async () => {
      const gathererPath = path.resolve(moduleDir, '../fixtures/invalid-gatherers/require-error');
      await assert.rejects(loadGatherer(gathererPath),
          function(err) {
            // We're expecting not to find parent class Gatherer, so only reject on
            // our own custom locate gatherer error, not the usual MODULE_NOT_FOUND.
            return !/locate gatherer/.test(err) && err.code === 'MODULE_NOT_FOUND';
          });
    });

    it('throws for invalid gathererDefns', async () => {
      await assert.rejects(loadGatherer({path: 55}), /Invalid Gatherer type/);
      await assert.rejects(loadGatherer(new Audit()), /Invalid Gatherer type/);
    });

    it('throws for invalid gatherers', async () => {
      const root = path.resolve(moduleDir, '../fixtures/invalid-gatherers');

      await assert.rejects(loadGatherer(`${root}/missing-before-pass`),
        /beforePass\(\) method/);

      await assert.rejects(loadGatherer(`${root}/missing-pass`),
        /pass\(\) method/);

      await assert.rejects(loadGatherer(`${root}/missing-after-pass`),
        /afterPass\(\) method/);
    });
  });

  describe('#getPrintString', () => {
    it('doesn\'t include empty audit options in output', async () => {
      const aOpt = 'auditOption';
      const configJson = {
        extends: 'lighthouse:default',
        passes: [{
          passName: 'defaultPass',
          gatherers: [
            {path: 'script-elements'},
          ],
        }],
        audits: [
          // `options` merged into default `metrics` audit.
          {path: 'metrics', options: {aOpt}},
        ],
      };

      const printed = (await Config.fromJson(configJson)).getPrintString();
      const printedConfig = JSON.parse(printed);

      // Check that options weren't completely eliminated.
      const metricsAudit = printedConfig.audits.find(a => a.path === 'metrics');
      assert.strictEqual(metricsAudit.options.aOpt, aOpt);

      for (const audit of printedConfig.audits) {
        if (audit.options) {
          assert.ok(Object.keys(audit.options).length > 0);
        }
      }
    });

    it('prints localized category titles', async () => {
      const printed = (await Config.fromJson(defaultConfig)).getPrintString();
      const printedConfig = JSON.parse(printed);
      let localizableCount = 0;

      Object.entries(printedConfig.categories).forEach(([printedCategoryId, printedCategory]) => {
        const origTitle = origConfig.categories[printedCategoryId].title;
        if (format.isIcuMessage(origTitle)) localizableCount++;
        const i18nOrigTitle = format.getFormatted(origTitle, origConfig.settings.locale);

        assert.strictEqual(printedCategory.title, i18nOrigTitle);
      });

      // Should have localized at least one string.
      assert.ok(localizableCount > 0);
    });

    it('prints a valid ConfigJson that can make an identical Config', async () => {
      // depends on defaultConfig having a `path` for all gatherers and audits.
      const firstConfig = await Config.fromJson(defaultConfig);
      const firstPrint = firstConfig.getPrintString();

      const secondConfig = await Config.fromJson(JSON.parse(firstPrint));
      const secondPrint = secondConfig.getPrintString();

      assert.strictEqual(firstPrint, secondPrint);
    });
  });
});
