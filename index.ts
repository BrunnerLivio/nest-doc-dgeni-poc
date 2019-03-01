import { Dgeni, Package } from 'dgeni';
import { resolve } from 'path';

const jsdocPackage = require('dgeni-packages/jsdoc');
const nunjucksPackage = require('dgeni-packages/nunjucks');
const typeScriptPackage = require('dgeni-packages/typescript');

const PROJECT_ROOT = resolve(__dirname, '../nest/');
const API_SOURCE_PATH = resolve(PROJECT_ROOT, 'packages');
const OUTPUT_PATH = resolve(__dirname, 'generated');
const DOCS_OUTPUT_PATH = resolve(OUTPUT_PATH, 'docs');

const nestjs = new Package('nestjs', [
  jsdocPackage, nunjucksPackage, typeScriptPackage
])
  // .processor(require('./processors/splitDescription'))
  .factory(require('./readers/package-content'))
  .config(function (readTypeScriptModules, tsParser) {
    // Tell TypeScript how to load modules that start with with `@angular`
    tsParser.options.paths = { '@nestjs/*': [API_SOURCE_PATH + '/*'] };
    tsParser.options.baseUrl = '.';

    // API files are typescript
    readTypeScriptModules.basePath = API_SOURCE_PATH;

    readTypeScriptModules.sourceFiles = [
      './core/**/*.ts',
    ];
  })
  .config(function(readFilesProcessor, readTypeScriptModules) {
    readFilesProcessor.$enabled = false;
    readFilesProcessor.basePath = API_SOURCE_PATH;
  })
  .config(function (writeFilesProcessor) {
    writeFilesProcessor.outputFolder = DOCS_OUTPUT_PATH;
  })
  .config(function(parseTagsProcessor) {
    parseTagsProcessor.tagDefinitions.push({ name: 'description' });
  })
  .config(function (templateFinder) {
    templateFinder.templateFolders.unshift(resolve(__dirname, 'templates'));

    // Specify how to match docs to templates.
    // In this case we just use the same static template for all docs
    templateFinder.templatePatterns.unshift('common.template.html');

  });

new Dgeni([nestjs]).generate();