import fs from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";

const projectRoot = path.resolve(import.meta.dirname, "..");
const statisticsInputPath = path.join(projectRoot, "logs", "member-statistics-report--5-15-26.csv");
const publicInputPath = path.join(projectRoot, "public", "hsba-member-records.csv");
const outputPath = path.join(projectRoot, "logs", "hsba-member-records.csv");

// As specified in the plan: month-level age as of 2026-05-15.
const asOfYear = 2026;
const asOfMonth = 5;

function normalizeJd(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const raw = String(value).trim();
  if (!raw) {
    return "";
  }

  if (!/^\d+$/.test(raw)) {
    return "";
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return "";
  }

  return String(parsed).padStart(6, "0");
}

function parseMonthYear(dobValue) {
  if (dobValue === null || dobValue === undefined) {
    return null;
  }

  const trimmed = String(dobValue).trim();
  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(/^(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const month = Number.parseInt(match[1], 10);
  const year = Number.parseInt(match[2], 10);

  if (month < 1 || month > 12 || year < 1800 || year > asOfYear) {
    return null;
  }

  return { month, year };
}

function calculateAgeFromMonthYear(dobValue) {
  const parsed = parseMonthYear(dobValue);
  if (!parsed) {
    return "";
  }

  let age = asOfYear - parsed.year;
  if (parsed.month > asOfMonth) {
    age -= 1;
  }

  if (age < 0 || age > 130) {
    return "";
  }

  return String(age);
}

function parseCsv(text, inputName) {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    const firstError = result.errors[0];
    throw new Error(`Failed parsing ${inputName}: ${firstError.message}`);
  }

  return {
    rows: result.data,
    fields: result.meta.fields ?? [],
  };
}

async function main() {
  const [statisticsCsv, publicCsv] = await Promise.all([
    fs.readFile(statisticsInputPath, "utf8"),
    fs.readFile(publicInputPath, "utf8"),
  ]);

  const statisticsParsed = parseCsv(statisticsCsv, "statistics report");
  const publicParsed = parseCsv(publicCsv, "public member records");

  const statisticsLookup = new Map();
  const duplicateJds = new Set();

  for (const row of statisticsParsed.rows) {
    const normalizedJd = normalizeJd(row.JD);
    if (!normalizedJd) {
      continue;
    }

    if (statisticsLookup.has(normalizedJd)) {
      duplicateJds.add(normalizedJd);
    }

    const age = calculateAgeFromMonthYear(row.DOB);
    const workAddressZip = row["Work Address Zip"] ? String(row["Work Address Zip"]).trim() : "";

    statisticsLookup.set(normalizedJd, {
      age,
      workAddressZip,
    });
  }

  const outputFields = [...publicParsed.fields, "age", "work_address_zip"];

  let matchedAges = 0;
  let blankAges = 0;
  let matchedZipCodes = 0;
  let blankZipCodes = 0;

  const outputRows = publicParsed.rows.map((row) => {
    const normalizedJd = normalizeJd(row.jd_number);
    const supplemental = normalizedJd ? statisticsLookup.get(normalizedJd) : undefined;

    const age = supplemental?.age ?? "";
    const workAddressZip = supplemental?.workAddressZip ?? "";

    if (age) {
      matchedAges += 1;
    } else {
      blankAges += 1;
    }

    if (workAddressZip) {
      matchedZipCodes += 1;
    } else {
      blankZipCodes += 1;
    }

    return {
      ...row,
      age,
      work_address_zip: workAddressZip,
    };
  });

  const outputCsv = Papa.unparse(outputRows, {
    columns: outputFields,
    newline: "\n",
  });

  await fs.writeFile(outputPath, `${outputCsv}\n`, "utf8");

  console.log("Appended age and zip code columns successfully.");
  console.log(`Output file: ${outputPath}`);
  console.log(`Total output rows: ${outputRows.length}`);
  console.log(`Matched ages: ${matchedAges}`);
  console.log(`Blank ages: ${blankAges}`);
  console.log(`Matched zip codes: ${matchedZipCodes}`);
  console.log(`Blank zip codes: ${blankZipCodes}`);
  console.log(`Duplicate JD values in statistics report: ${duplicateJds.size}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
