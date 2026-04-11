module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[project]/lib/server/dashboard-data.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDashboardPayload",
    ()=>getDashboardPayload,
    "parseFiltersFromSearchParams",
    ()=>parseFiltersFromSearchParams
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
;
;
const DATASET_PATH = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), "mdpr-2026-project-data.csv");
const EMPTY_FILTERS = {
    portfolio: "",
    agency: "",
    tier: "",
    deliveryStatus: "",
    dca2026: ""
};
const DCA_SCORE_MAP = {
    High: 5,
    "Medium-High": 4,
    Medium: 3,
    "Medium-Low": 2,
    Low: 1
};
let cachedProjects = null;
let cachedAt = null;
const projectSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    Portfolio: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    Agency: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    Tier: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    "Project name": __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    "Project description": __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    "DCA 2026": __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    "DCA 2025": __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    "DCA 2024": __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    "Delivery status": __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    "Total budget (millions)": __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().finite(),
    "Digital budget (millions)": __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().finite(),
    "Project end date": __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
});
function parseCSVRows(csvText) {
    const text = csvText.replace(/^\uFEFF/, "");
    const rows = [];
    let row = [];
    let currentValue = "";
    let inQuotes = false;
    for(let i = 0; i < text.length; i++){
        const char = text[i];
        if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
                currentValue += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }
        if (char === "," && !inQuotes) {
            row.push(currentValue.trim());
            currentValue = "";
            continue;
        }
        if ((char === "\n" || char === "\r") && !inQuotes) {
            if (char === "\r" && text[i + 1] === "\n") {
                i++;
            }
            row.push(currentValue.trim());
            if (row.some((cell)=>cell.length > 0)) {
                rows.push(row);
            }
            row = [];
            currentValue = "";
            continue;
        }
        currentValue += char;
    }
    if (currentValue.length > 0 || row.length > 0) {
        row.push(currentValue.trim());
        if (row.some((cell)=>cell.length > 0)) {
            rows.push(row);
        }
    }
    return rows;
}
function normalizeText(value) {
    const trimmed = value.trim();
    if (!trimmed) {
        return "";
    }
    const normalized = trimmed.toUpperCase();
    if (normalized === "N/A" || normalized === "NA" || normalized === "-" || normalized === "NFP" || normalized === "NOT REPORTED") {
        return "";
    }
    return trimmed;
}
function parseBudget(value) {
    const cleanText = normalizeText(value);
    if (!cleanText) {
        return 0;
    }
    const numericText = cleanText.replace(/[^\d.-]/g, "");
    const parsed = Number.parseFloat(numericText);
    return Number.isFinite(parsed) ? parsed : 0;
}
function mapToProjectData(headers, row) {
    const get = (header)=>normalizeText(row[headers.indexOf(header)] || "");
    return {
        Portfolio: get("Portfolio"),
        Agency: get("Agency"),
        Tier: get("Tier"),
        "Project name": get("Project name"),
        "Project description": get("Project description"),
        "DCA 2026": get("DCA 2026"),
        "DCA 2025": get("DCA 2025"),
        "DCA 2024": get("DCA 2024"),
        "Delivery status": get("Delivery status"),
        "Total budget (millions)": parseBudget(get("Total budget (millions)")),
        "Digital budget (millions)": parseBudget(get("Digital budget (millions)")),
        "Project end date": get("Project end date")
    };
}
function parseProjectCSV(csvText) {
    const rows = parseCSVRows(csvText);
    if (rows.length < 2) {
        return [];
    }
    const headers = rows[0].map((header)=>header.trim());
    const validProjects = [];
    for (const row of rows.slice(1)){
        const candidate = mapToProjectData(headers, row);
        const parsed = projectSchema.safeParse(candidate);
        if (parsed.success) {
            validProjects.push(parsed.data);
        }
    }
    return validProjects;
}
async function loadProjectsFromDataset() {
    if (cachedProjects) {
        return cachedProjects;
    }
    const csvText = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readFile"])(DATASET_PATH, "utf8");
    const projects = parseProjectCSV(csvText);
    cachedProjects = projects;
    cachedAt = new Date().toISOString();
    return projects;
}
function parseProjectDate(dateText) {
    if (!dateText) {
        return null;
    }
    let match = dateText.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
    if (match) {
        return new Date(Number.parseInt(match[3], 10), Number.parseInt(match[2], 10) - 1, Number.parseInt(match[1], 10));
    }
    match = dateText.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        return new Date(Number.parseInt(match[1], 10), Number.parseInt(match[2], 10) - 1, Number.parseInt(match[3], 10));
    }
    match = dateText.match(/^([A-Za-z]+)\s+(\d{4})$/);
    if (match) {
        const parsed = new Date(`${match[1]} 1, ${match[2]}`);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    match = dateText.match(/^(\d{4})$/);
    if (match) {
        return new Date(Number.parseInt(match[1], 10), 11, 31);
    }
    const parsed = new Date(dateText);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}
function getQuarter(date) {
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `Q${quarter} ${date.getFullYear()}`;
}
function applyFilters(projects, filters) {
    return projects.filter((project)=>{
        if (filters.portfolio && project.Portfolio !== filters.portfolio) {
            return false;
        }
        if (filters.agency && project.Agency !== filters.agency) {
            return false;
        }
        if (filters.tier && project.Tier !== filters.tier) {
            return false;
        }
        if (filters.deliveryStatus && project["Delivery status"] !== filters.deliveryStatus) {
            return false;
        }
        if (filters.dca2026 && project["DCA 2026"] !== filters.dca2026) {
            return false;
        }
        return true;
    });
}
function uniqueSortedValues(projects, key) {
    const values = new Set();
    for (const project of projects){
        const value = String(project[key] || "").trim();
        if (value) {
            values.add(value);
        }
    }
    return Array.from(values).sort((a, b)=>a.localeCompare(b));
}
function buildFilterOptions(projects) {
    return {
        portfolios: uniqueSortedValues(projects, "Portfolio"),
        agencies: uniqueSortedValues(projects, "Agency"),
        tiers: uniqueSortedValues(projects, "Tier"),
        statuses: uniqueSortedValues(projects, "Delivery status"),
        dcaLevels: uniqueSortedValues(projects, "DCA 2026")
    };
}
function buildKpis(projects) {
    const activeProjects = projects.filter((p)=>p["Delivery status"].toLowerCase() === "active").length;
    const totalDigitalBudget = projects.reduce((sum, p)=>sum + (p["Digital budget (millions)"] || 0), 0);
    const highRiskProjects = projects.filter((p)=>{
        const dca = p["DCA 2025"].toLowerCase();
        return dca === "low" || dca === "medium-low";
    }).length;
    const tier12Projects = projects.filter((p)=>{
        const tier = p.Tier.toLowerCase();
        return tier === "tier 1" || tier === "tier 2";
    });
    const healthyTier12 = tier12Projects.filter((p)=>{
        const dca = p["DCA 2025"].toLowerCase();
        return dca === "high" || dca === "medium-high";
    }).length;
    const healthyPercentage = tier12Projects.length > 0 ? Math.round(healthyTier12 / tier12Projects.length * 100) : 0;
    return {
        activeProjects,
        totalProjects: projects.length,
        totalDigitalBudget,
        highRiskProjects,
        healthyTier12,
        tier12Projects: tier12Projects.length,
        healthyPercentage
    };
}
function buildDcaByTierChart(projects) {
    const tiers = [
        "Tier 1",
        "Tier 2",
        "Tier 3"
    ];
    return tiers.map((tier)=>{
        const tierProjects = projects.filter((project)=>project.Tier === tier);
        return {
            name: tier,
            High: tierProjects.filter((p)=>p["DCA 2026"] === "High").length,
            "Medium-High": tierProjects.filter((p)=>p["DCA 2026"] === "Medium-High").length,
            Medium: tierProjects.filter((p)=>p["DCA 2026"] === "Medium").length,
            "Medium-Low": tierProjects.filter((p)=>p["DCA 2026"] === "Medium-Low").length,
            Low: tierProjects.filter((p)=>p["DCA 2026"] === "Low").length
        };
    });
}
function buildBudgetByPortfolioChart(projects) {
    const portfolioBudget = new Map();
    for (const project of projects){
        const portfolio = project.Portfolio || "Unknown";
        const budget = project["Digital budget (millions)"] || 0;
        portfolioBudget.set(portfolio, (portfolioBudget.get(portfolio) || 0) + budget);
    }
    return Array.from(portfolioBudget.entries()).filter(([, value])=>value > 0).sort((a, b)=>b[1] - a[1]).slice(0, 10).map(([name, value])=>({
            name,
            fullName: name,
            value: Math.round(value)
        }));
}
function buildDcaComparisonChart(projects) {
    return projects.filter((project)=>project["DCA 2025"] && project["DCA 2026"]).slice(0, 15).map((project)=>({
            name: project["Project name"].length > 12 ? `${project["Project name"].substring(0, 12)}...` : project["Project name"],
            fullName: project["Project name"],
            agency: project.Agency,
            "DCA 2025": DCA_SCORE_MAP[project["DCA 2025"]] || 0,
            "DCA 2026": DCA_SCORE_MAP[project["DCA 2026"]] || 0,
            dca2025Text: project["DCA 2025"],
            dca2026Text: project["DCA 2026"],
            change: (DCA_SCORE_MAP[project["DCA 2026"]] || 0) - (DCA_SCORE_MAP[project["DCA 2025"]] || 0)
        }));
}
function buildCriticalTimeline(projects) {
    const now = new Date();
    const threeMonthsAhead = new Date();
    threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);
    const criticalProjects = projects.filter((project)=>{
        const dca = project["DCA 2025"].toLowerCase();
        return dca === "low" || dca === "medium-low";
    }).map((project)=>{
        const endDate = parseProjectDate(project["Project end date"]);
        return {
            name: project["Project name"],
            portfolio: project.Portfolio,
            agency: project.Agency,
            dca: project["DCA 2025"],
            endDate,
            dateStr: project["Project end date"],
            budget: project["Total budget (millions)"]
        };
    }).filter((project)=>project.endDate).sort((a, b)=>a.endDate.getTime() - b.endDate.getTime());
    let overdue = 0;
    let upcoming = 0;
    const grouped = new Map();
    for (const project of criticalProjects){
        const endDate = project.endDate;
        const quarter = getQuarter(endDate);
        const isOverdue = endDate < now;
        if (isOverdue) {
            overdue++;
        } else if (endDate <= threeMonthsAhead) {
            upcoming++;
        }
        if (!grouped.has(quarter)) {
            grouped.set(quarter, {
                quarter,
                projects: []
            });
        }
        grouped.get(quarter).projects.push({
            name: project.name,
            portfolio: project.portfolio,
            agency: project.agency,
            dca: project.dca,
            budget: project.budget,
            dateStr: project.dateStr,
            isOverdue
        });
    }
    return {
        groups: Array.from(grouped.values()),
        stats: {
            total: criticalProjects.length,
            overdue,
            upcoming
        }
    };
}
async function getDashboardPayload(filters) {
    const projects = await loadProjectsFromDataset();
    const normalizedFilters = {
        ...EMPTY_FILTERS,
        ...filters
    };
    const filteredProjects = applyFilters(projects, normalizedFilters);
    return {
        metadata: {
            totalProjects: projects.length,
            filteredProjects: filteredProjects.length,
            lastUpdated: cachedAt || new Date().toISOString(),
            source: "local-csv"
        },
        filters: buildFilterOptions(projects),
        appliedFilters: normalizedFilters,
        kpis: buildKpis(filteredProjects),
        charts: {
            dcaByTier: buildDcaByTierChart(filteredProjects),
            budgetByPortfolio: buildBudgetByPortfolioChart(filteredProjects),
            dcaComparison: buildDcaComparisonChart(filteredProjects),
            criticalTimeline: buildCriticalTimeline(filteredProjects)
        },
        projects: filteredProjects
    };
}
function parseFiltersFromSearchParams(searchParams) {
    return {
        portfolio: searchParams.get("portfolio") || "",
        agency: searchParams.get("agency") || "",
        tier: searchParams.get("tier") || "",
        deliveryStatus: searchParams.get("deliveryStatus") || "",
        dca2026: searchParams.get("dca2026") || ""
    };
}
}),
"[project]/app/api/dashboard/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$dashboard$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/dashboard-data.ts [app-route] (ecmascript)");
;
;
const CACHE_TTL_MS = 60 * 1000;
const responseCache = new Map();
function buildCacheKey(searchParams) {
    const entries = Array.from(searchParams.entries()).sort(([a], [b])=>a.localeCompare(b));
    return JSON.stringify(entries);
}
function pruneExpiredCache() {
    const now = Date.now();
    for (const [key, entry] of responseCache.entries()){
        if (entry.expiresAt <= now) {
            responseCache.delete(key);
        }
    }
}
async function GET(request) {
    try {
        pruneExpiredCache();
        const cacheKey = buildCacheKey(request.nextUrl.searchParams);
        const cached = responseCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(cached.payload, {
                status: 200,
                headers: {
                    "Cache-Control": "private, max-age=30, stale-while-revalidate=30",
                    "X-Dashboard-Cache": "HIT"
                }
            });
        }
        const filters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$dashboard$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseFiltersFromSearchParams"])(request.nextUrl.searchParams);
        const payload = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$dashboard$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDashboardPayload"])(filters);
        responseCache.set(cacheKey, {
            payload,
            expiresAt: Date.now() + CACHE_TTL_MS
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(payload, {
            status: 200,
            headers: {
                "Cache-Control": "private, max-age=30, stale-while-revalidate=30",
                "X-Dashboard-Cache": "MISS"
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown server error";
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to load dashboard data",
            details: message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0uqtb0f._.js.map