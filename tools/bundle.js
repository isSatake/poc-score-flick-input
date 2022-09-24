const { build } = require("esbuild");

const isWatch = process.argv[2] === "-w";
const env = isWatch ? "watch" : "prd";

const onSucceeded = () => {
  console.log(`${env} build succeeded: index.ts -> out.js`);
};
const onError = () => {
  console.error(`${env} build failed: index.ts`);
};

if (isWatch) {
  build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    watch: {
      onRebuild: (error, _) => {
        if (error) {
          onError(error);
        } else {
          onSucceeded();
        }
      },
    },
    outfile: "out.js",
  })
    .then(onSucceeded)
    .catch(onError);
} else {
  build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: "out.js",
  })
    .then(onSucceeded)
    .catch(onError);
}
