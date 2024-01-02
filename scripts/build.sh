rm -rf dist
tsc --build src
cp src/client/styles.css dist/client
cp src/plugin/youtube/styles.css dist/plugin/youtube
