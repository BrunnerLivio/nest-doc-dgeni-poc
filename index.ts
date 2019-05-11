import { Dgeni, Package } from "dgeni";
import { resolve } from "path";
import { requireFolder } from "./util";

const jsdocPackage = require("dgeni-packages/jsdoc");
const nunjucksPackage = require("dgeni-packages/nunjucks");
const typeScriptPackage = require("dgeni-packages/typescript");

const PROJECT_ROOT = resolve(__dirname, "../nest/");
const API_SOURCE_PATH = resolve(PROJECT_ROOT, "packages");
const OUTPUT_PATH = resolve(__dirname, "generated");
const DOCS_OUTPUT_PATH = resolve(OUTPUT_PATH, "docs");

const nestjs = new Package("nestjs", [
  jsdocPackage,
  nunjucksPackage,
  typeScriptPackage
])
  .factory(require("./readers/package-content"))

  .processor(require("./processors/processPackages"))
  .processor(require("./processors/generateApiListDoc"))
  .processor(require("./processors/test"))

  .config(function(readTypeScriptModules, tsParser) {
    // Tell TypeScript how to load modules that start with with `@nestjs`
    tsParser.options.paths = { "@nestjs/*": [API_SOURCE_PATH + "/*"] };
    tsParser.options.baseUrl = ".";

    // API files are typescript
    readTypeScriptModules.basePath = API_SOURCE_PATH;

    readTypeScriptModules.sourceFiles = ["./core/index.ts", "./common/index.ts"];
  })
  .config(function(readFilesProcessor, readTypeScriptModules) {
    readFilesProcessor.$enabled = false;
    readFilesProcessor.basePath = API_SOURCE_PATH;
  })
  .config(function(parseTagsProcessor, getInjectables, tsHost) {
    // Load up all the tag definitions in the tag-defs folder
    parseTagsProcessor.tagDefinitions = parseTagsProcessor.tagDefinitions.concat(
      getInjectables(requireFolder(__dirname, "./tag-defs"))
    );
    // We don't want license headers to be joined to the first API item's comment
    tsHost.concatMultipleLeadingComments = false;
  })
  .config(function(writeFilesProcessor) {
    writeFilesProcessor.outputFolder = DOCS_OUTPUT_PATH;
  })
  .config(function(templateFinder) {
    templateFinder.templateFolders.unshift(resolve(__dirname, "templates"));
    templateFinder.templatePatterns = templateFinder.templatePatterns = [
      '${ doc.template }', '${ doc.id }.${ doc.docType }.template.html',
      '${ doc.id }.template.html', '${ doc.docType }.template.html',
      '${ doc.id }.${ doc.docType }.template.js', '${ doc.id }.template.js',
      '${ doc.docType }.template.js', '${ doc.id }.${ doc.docType }.template.json',
      '${ doc.id }.template.json', '${ doc.docType }.template.json', 'common.template.html'
    ];;

    // Specify how to match docs to templates.
    // In this case we just use the same static template for all docs
    // templateFinder.templatePatterns.unshift("common.template.html");
  });

new Dgeni([nestjs]).generate();
