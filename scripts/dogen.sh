# https://api-extractor.com/pages/configs/api-extractor_json/
echo '{
         "$schema": "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
         "mainEntryPointFilePath": "dist/server/index.d.ts",
         "projectFolder": "src",
         "newlineKind": "lf",
         "apiReport": { "enabled": false },
         "dtsRollup": { "enabled": false },
         "docModel": { "enabled": true, "includeForgottenExports": true },
     }' > api-extractor.json

# https://api-extractor.com/pages/setup/invoking/
api-extractor run --local

# https://api-extractor.com/pages/setup/generating_docs/
api-documenter markdown -i src/temp -o docs/api

rm api-extractor.json
rm tsdoc-metadata.json
rm -rf src/temp
