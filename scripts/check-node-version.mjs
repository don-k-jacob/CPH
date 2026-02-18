const [major, minor] = process.versions.node.split(".").map((v) => Number.parseInt(v, 10));

const minMajor = 18;
const minMinorFor18 = 18;
const maxMajorExclusive = 23;

const isTooOld = major < minMajor || (major === minMajor && minor < minMinorFor18);
const isTooNew = major >= maxMajorExclusive;

if (isTooOld || isTooNew) {
  console.error(
    [
      `Unsupported Node.js version: ${process.versions.node}`,
      "This project supports Node.js 18.18+, 20.x, or 22.x.",
      "Use Node 22 LTS to avoid Next.js dev/runtime chunk errors.",
      "Example:",
      "  nvm install 22",
      "  nvm use 22",
      "  rm -rf .next node_modules package-lock.json",
      "  npm install",
      "  npm run dev"
    ].join("\n")
  );
  process.exit(1);
}
