// Convertit la grille Excel des Easy Checks en JSON exploitable par l'app.
// Usage : npm run convert-xlsx
//
// Lit l'onglet "criteres" du classeur et produit src/data/checks.json.
// Affiche aussi un aperçu de chaque onglet pour faciliter le mapping.

import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import ExcelJS from "exceljs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const SOURCE_XLSX = join(projectRoot, "grille-reduite.xlsx");
const OUTPUT_JSON = join(projectRoot, "src", "data", "checks.json");
const CRITERIA_SHEET = "criteres";

/**
 * Normalise une clé de colonne : minuscules, sans accents, espaces -> _.
 * @param {string} key
 */
function normalizeKey(key) {
  return String(key)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Tente de retrouver une valeur parmi plusieurs alias de colonnes.
 * @param {Record<string, unknown>} row
 * @param {string[]} aliases
 */
function pick(row, aliases) {
  for (const alias of aliases) {
    const value = row[alias];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

/**
 * Extrait la valeur textuelle d'une cellule exceljs (gère les rich-text).
 * @param {unknown} cell
 */
function cellText(cell) {
  if (cell === null || cell === undefined) return "";
  if (typeof cell === "object" && "richText" in cell) {
    return cell.richText.map((r) => r.text).join("");
  }
  if (typeof cell === "object" && "text" in cell) {
    return String(cell.text);
  }
  return String(cell);
}

async function main() {
  if (!existsSync(SOURCE_XLSX)) {
    console.error(`❌ Fichier introuvable : ${SOURCE_XLSX}`);
    process.exit(1);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(SOURCE_XLSX);

  const sheetNames = workbook.worksheets.map((ws) => ws.name);
  console.log("📑 Onglets détectés :", sheetNames.join(", "));

  const sheetName = sheetNames.find(
    (name) => normalizeKey(name) === normalizeKey(CRITERIA_SHEET),
  );

  if (!sheetName) {
    console.error(`❌ Onglet "${CRITERIA_SHEET}" introuvable.`);
    process.exit(1);
  }

  const sheet = workbook.getWorksheet(sheetName);

  // Lire la première ligne comme en-têtes
  /** @type {string[]} */
  let headers = [];
  /** @type {Record<string, unknown>[]} */
  const rawRows = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // row.values est indexé à partir de 1, index 0 = null
      headers = row.values.slice(1).map((v) => cellText(v));
      return;
    }
    /** @type {Record<string, unknown>} */
    const obj = {};
    row.values.slice(1).forEach((val, idx) => {
      obj[headers[idx] ?? `col_${idx}`] = cellText(val);
    });
    rawRows.push(obj);
  });

  if (rawRows.length === 0) {
    console.error(`❌ L'onglet "${sheetName}" est vide.`);
    process.exit(1);
  }

  console.log(`🔎 Colonnes de "${sheetName}" :`, headers.join(" | "));

  let lastCategory = "";
  const checks = rawRows
    .map((rawRow, index) => {
      /** @type {Record<string, unknown>} */
      const row = {};
      for (const [key, value] of Object.entries(rawRow)) {
        row[normalizeKey(key)] = value;
      }

      // "Section" = catégorie (peut être fusionnée sur plusieurs lignes),
      // "Sous-section" = libellé du critère à tester.
      const category = pick(row, ["section", "categorie", "theme", "groupe"]);
      if (category) lastCategory = category;

      const title = pick(row, [
        "sous_section",
        "critere",
        "titre",
        "intitule",
        "libelle",
      ]);
      if (!title) return null;

      return {
        id: pick(row, ["id", "ref", "reference", "code"]) || `C${index + 1}`,
        category: lastCategory,
        title,
        defaultConformity: pick(row, ["conformite", "conformity", "statut"]),
        notes: pick(row, ["notes", "note", "commentaire", "aide", "detail"]),
      };
    })
    .filter((check) => check !== null);

  await mkdir(dirname(OUTPUT_JSON), { recursive: true });
  await writeFile(OUTPUT_JSON, JSON.stringify(checks, null, 2), "utf-8");

  console.log(`✅ ${checks.length} critères écrits dans ${OUTPUT_JSON}`);
}

main().catch((error) => {
  console.error("❌ Erreur lors de la conversion :", error);
  process.exit(1);
});
