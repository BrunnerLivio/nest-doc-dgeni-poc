module.exports = function processPackages() {
  return {
    docTypes: [],
    $runAfter: ['parseTagsProcessor'],
    $process(docs: any[]) {
      docs.forEach((doc, index) => {
        if (doc.docType === 'module') {
          // Convert the doc type from 'module' to 'package'
          doc.docType = 'package';
          // The name is actually the full id
          doc.name = `@nestjs/${doc.id}`;

          if (doc.exports) {
            const publicExports = doc.exports.filter(doc => !doc.privateExport);
            doc.ngmodules = publicExports.filter(doc => doc.docType === 'ngmodule').sort(byId);
            doc.classes = publicExports.filter(doc => doc.docType === 'class').sort(byId);
            doc.decorators = publicExports.filter(doc => doc.docType === 'decorator').sort(byId);
            doc.functions = publicExports.filter(doc => doc.docType === 'function').sort(byId);
            doc.structures = publicExports.filter(doc => doc.docType === 'enum' || doc.docType === 'interface').sort(byId);
            doc.directives = publicExports.filter(doc => doc.docType === 'directive').sort(byId);
            doc.pipes = publicExports.filter(doc => doc.docType === 'pipe').sort(byId);
            doc.types = publicExports.filter(doc => doc.docType === 'type-alias' || doc.docType === 'const').sort(byId);
            if (publicExports.every(doc => !!doc.deprecated)) {
              doc.deprecated = 'all exports of this entry point are deprecated.';
            }

            console.log(doc.classes);
          }
        }
      });
    }
  };
};

function byId(a, b) {
  return a.id > b.id ? 1 : -1;
}
