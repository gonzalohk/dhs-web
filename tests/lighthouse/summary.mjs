// Prints Lighthouse scores from the latest reports in .lighthouseci/.
import { readdirSync, readFileSync } from "node:fs";

const dir = ".lighthouseci";
for (const file of readdirSync(dir).filter((f) => f.startsWith("lhr-") && f.endsWith(".json"))) {
  const lhr = JSON.parse(readFileSync(`${dir}/${file}`, "utf8"));
  const c = lhr.categories;
  const score = (k) => Math.round(c[k].score * 100);
  const lcp = lhr.audits["largest-contentful-paint"].displayValue;
  const cls = lhr.audits["cumulative-layout-shift"].displayValue;
  console.log(
    `${lhr.configSettings.formFactor.padEnd(7)} ${new URL(lhr.finalDisplayedUrl).pathname.padEnd(28)} perf ${score("performance")}  a11y ${score("accessibility")}  bp ${score("best-practices")}  seo ${score("seo")}  LCP ${lcp}  CLS ${cls}`,
  );
}
