const tsConfigPaths = require("tsconfig-paths");

tsConfigPaths.register({
  baseUrl: "./dist",
  paths: {
    "@/*": ["*"],
    "@config/*": ["config/*"],
    "@modules/*": ["modules/*"],
    "@middleware/*": ["middleware/*"],
    "@utils/*": ["utils/*"],
    "@types/*": ["types/*"],
    "@/jobs": ["jobs/index.js"],
  },
});
