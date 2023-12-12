rm -rf dist
tsc --build --declaration
cp src/client/styles.css dist/client
cp src/plugin/youtube/styles.css dist/plugin/youtube
