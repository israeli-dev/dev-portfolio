/**
 * Data layer.
 *
 * A deliberately small, typed query facade over PostgreSQL. Locally the driver
 * is PGlite (Postgres compiled to WASM, persisted under `.data/pglite`); in
 * production the same SQL runs against a real Postgres instance when
 * DATABASE_URL starts with `postgres://` or `postgresql://`.
 *
 * The API mirrors the handful of Prisma-style calls the application uses
 * (`findUnique`, `findMany`, `create`, `update`, `upsert`, …) so route code
 * stays declarative, while every value is parameterised and every identifier
 * comes from the static metadata below — never from user input.
 *
 * This exists because Prisma's engine binaries cannot be fetched in restricted
 * build environments. See docs/ARCHITECTURE.md for the trade-off and how to
 * switch to another ORM.
 */
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { SCHEMA_SQL } from "@/db/schema";
import type {
  AchievementRow,
  ActivityLogRow,
  CertificationRow,
  ContactMessageRow,
  EducationRow,
  ExperienceRow,
  GithubIntegrationRow,
  OwnerProfileRow,
  PasswordResetTokenRow,
  PortfolioRow,
  ProjectImageRow,
  ProjectRow,
  SessionRow,
  SkillGroupRow,
  SkillRow,
  SocialLinkRow,
  TimelineRow,
  UserRow,
} from "@/lib/rows";

type Row = Record<string, any>;
type Where = Record<string, any>;
type OrderBy = Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[];

interface ModelConfig {
  table: string;
  fields: Record<string, string>;
  timestamps?: boolean;
  dateFields?: string[];
}

const model = (
  table: string,
  fields: Record<string, string>,
  options: { timestamps?: boolean; dateFields?: string[] } = {},
): ModelConfig => ({ table, fields, ...options });

const MODELS = {
  user: model("users", {
    id: "id",
    email: "email",
    name: "name",
    passwordHash: "password_hash",
    role: "role",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }, { timestamps: true, dateFields: ["createdAt", "updatedAt"] }),

  session: model("sessions", {
    id: "id",
    tokenHash: "token_hash",
    userId: "user_id",
    expiresAt: "expires_at",
    createdAt: "created_at",
    userAgent: "user_agent",
    ip: "ip",
  }, { dateFields: ["expiresAt", "createdAt"] }),

  passwordResetToken: model("password_reset_tokens", {
    id: "id",
    tokenHash: "token_hash",
    userId: "user_id",
    expiresAt: "expires_at",
    usedAt: "used_at",
    createdAt: "created_at",
  }, { dateFields: ["expiresAt", "usedAt", "createdAt"] }),

  portfolio: model("portfolios", {
    id: "id",
    userId: "user_id",
    slug: "slug",
    title: "title",
    headline: "headline",
    bio: "bio",
    location: "location",
    email: "email",
    phone: "phone",
    avatarUrl: "avatar_url",
    coverUrl: "cover_url",
    availability: "availability",
    template: "template",
    accent: "accent",
    fontStyle: "font_style",
    appearance: "appearance",
    published: "published",
    publishedAt: "published_at",
    sections: "sections",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }, { timestamps: true, dateFields: ["publishedAt", "createdAt", "updatedAt"] }),

  ownerProfile: model("owner_profile", {
    id: "id",
    fullName: "full_name",
    title: "title",
    tagline: "tagline",
    story: "story",
    location: "location",
    email: "email",
    githubUrl: "github_url",
    linkedin: "linkedin",
    twitter: "twitter",
    resumeUrl: "resume_url",
    avatarUrl: "avatar_url",
    updatedAt: "updated_at",
  }, { dateFields: ["updatedAt"] }),

  timelineEntry: model("timeline_entries", {
    id: "id",
    year: "year",
    title: "title",
    detail: "detail",
    kind: "kind",
    verified: "verified",
    sortOrder: "sort_order",
  }),

  socialLink: model("social_links", {
    id: "id",
    portfolioId: "portfolio_id",
    label: "label",
    url: "url",
    sortOrder: "sort_order",
  }),

  skillGroup: model("skill_groups", {
    id: "id",
    portfolioId: "portfolio_id",
    name: "name",
    sortOrder: "sort_order",
  }),

  skill: model("skills", {
    id: "id",
    portfolioId: "portfolio_id",
    groupId: "group_id",
    name: "name",
    learning: "learning",
    sortOrder: "sort_order",
  }),

  experience: model("experiences", {
    id: "id",
    portfolioId: "portfolio_id",
    role: "role",
    organization: "organization",
    startDate: "start_date",
    endDate: "end_date",
    current: "current",
    location: "location",
    summary: "summary",
    highlights: "highlights",
    tech: "tech",
    sortOrder: "sort_order",
  }),

  education: model("educations", {
    id: "id",
    portfolioId: "portfolio_id",
    degree: "degree",
    institution: "institution",
    year: "year",
    location: "location",
    detail: "detail",
    sortOrder: "sort_order",
  }),

  certification: model("certifications", {
    id: "id",
    portfolioId: "portfolio_id",
    title: "title",
    issuer: "issuer",
    year: "year",
    url: "url",
    learning: "learning",
    sortOrder: "sort_order",
  }),

  achievement: model("achievements", {
    id: "id",
    portfolioId: "portfolio_id",
    title: "title",
    detail: "detail",
    year: "year",
    kind: "kind",
    sortOrder: "sort_order",
  }),

  project: model("projects", {
    id: "id",
    portfolioId: "portfolio_id",
    slug: "slug",
    name: "name",
    tagline: "tagline",
    description: "description",
    category: "category",
    status: "status",
    progress: "progress",
    repoUrl: "repo_url",
    repoName: "repo_name",
    demoUrl: "demo_url",
    imageUrl: "image_url",
    stack: "stack",
    features: "features",
    problem: "problem",
    contribution: "contribution",
    architecture: "architecture",
    featured: "featured",
    published: "published",
    excluded: "excluded",
    source: "source",
    githubRepoId: "github_repo_id",
    language: "language",
    stars: "stars",
    forks: "forks",
    lastPushedAt: "last_pushed_at",
    readmeNote: "readme_note",
    sortOrder: "sort_order",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }, { timestamps: true, dateFields: ["lastPushedAt", "createdAt", "updatedAt"] }),

  projectImage: model("project_images", {
    id: "id",
    projectId: "project_id",
    url: "url",
    alt: "alt",
    sortOrder: "sort_order",
  }),

  gitHubIntegration: model("github_integrations", {
    id: "id",
    portfolioId: "portfolio_id",
    username: "username",
    lastSyncedAt: "last_synced_at",
    etag: "etag",
    rateRemaining: "rate_remaining",
    rateReset: "rate_reset",
    lastError: "last_error",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }, { timestamps: true, dateFields: ["lastSyncedAt", "rateReset", "createdAt", "updatedAt"] }),

  contactMessage: model("contact_messages", {
    id: "id",
    userId: "user_id",
    portfolioId: "portfolio_id",
    name: "name",
    email: "email",
    subject: "subject",
    message: "message",
    read: "read",
    createdAt: "created_at",
  }, { dateFields: ["createdAt"] }),

  activityLog: model("activity_logs", {
    id: "id",
    portfolioId: "portfolio_id",
    action: "action",
    detail: "detail",
    createdAt: "created_at",
  }, { dateFields: ["createdAt"] }),
} as const;

type ModelName = keyof typeof MODELS;

/* ── Driver ─────────────────────────────────────────────────── */

interface Driver {
  query(sql: string, params?: unknown[]): Promise<Row[]>;
  exec(sql: string): Promise<void>;
}

function createPgliteDriver(): Driver {
  // Imported lazily so production Postgres deployments never load the WASM build.
  const { PGlite } = require("@electric-sql/pglite") as typeof import("@electric-sql/pglite");
  const configured = process.env.DATABASE_URL ?? "file:.data/pglite";
  const target = configured.replace(/^file:/, "");

  let client: InstanceType<typeof PGlite> | null = null;

  if (target === "memory:" || target === ":memory:") {
    client = new PGlite();
  } else {
    const directory = path.isAbsolute(target) ? target : path.join(process.cwd(), target);
    mkdirSync(directory, { recursive: true });
    client = new PGlite(directory);
  }

  return {
    async query(sql, params) {
      const result = await client!.query(sql, params as any[]);
      return result.rows as Row[];
    },
    async exec(sql) {
      await client!.exec(sql);
    },
  };
}

function createPostgresDriver(): Driver {
  // `postgres` is ESM-only, so it is loaded with a dynamic import. The client is
  // created once, lazily, on the first query.
  let connection: Promise<any> | null = null;
  const connect = () => {
    if (!connection) {
      connection = import("postgres").then((module) => {
        const factory = ((module as any).default ?? module) as any;
        return factory(process.env.DATABASE_URL!, { max: 5, idle_timeout: 20, prepare: false });
      });
    }
    return connection;
  };

  return {
    async query(text, params) {
      const sql = await connect();
      return (await sql.unsafe(text, (params ?? []) as any[])) as unknown as Row[];
    },
    async exec(text) {
      const sql = await connect();
      await sql.unsafe(text);
    },
  };
}

const globalForDb = globalThis as unknown as {
  folioDb?: { driver: Driver; ready: Promise<void> };
};

function initialise() {
  if (globalForDb.folioDb) return globalForDb.folioDb;

  const url = process.env.DATABASE_URL ?? "file:.data/pglite";
  const driver = url.startsWith("postgres://") || url.startsWith("postgresql://")
    ? createPostgresDriver()
    : createPgliteDriver();

  const ready = driver
    .exec(SCHEMA_SQL)
    .catch((error) => {
      console.error("Database bootstrap failed", error);
      throw error;
    });

  const state = { driver, ready };
  globalForDb.folioDb = state;
  return state;
}

async function run(sql: string, params: unknown[] = []): Promise<Row[]> {
  const { driver, ready } = initialise();
  await ready;
  return driver.query(sql, params);
}

/* ── Query construction ─────────────────────────────────────── */

class QueryError extends Error {
  code: string;
  constructor(message: string, code = "QUERY_ERROR") {
    super(message);
    this.code = code;
  }
}

function coerce(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "boolean") return value;
  if (value === undefined) return null;
  return value;
}

function buildWhere(config: ModelConfig, where: Where | undefined, params: unknown[], depth = 0): string {
  if (!where) return "1=1";
  const clauses: string[] = [];

  for (const [key, value] of Object.entries(where)) {
    if (value === undefined) continue;

    if (key === "OR" || key === "AND") {
      if (!Array.isArray(value)) continue;
      const parts = value.map((entry) => buildWhere(config, entry as Where, params, depth + 1));
      if (parts.length) clauses.push(`(${parts.join(key === "OR" ? " OR " : " AND ")})`);
      continue;
    }

    if (key === "NOT") {
      if (!value || typeof value !== "object") continue;
      clauses.push(`NOT (${buildWhere(config, value as Where, params, depth + 1)})`);
      continue;
    }

    const column = config.fields[key];
    if (!column) throw new QueryError(`Unknown field "${key}" in where clause`, "UNKNOWN_FIELD");

    if (value === null) {
      clauses.push(`"${column}" IS NULL`);
      continue;
    }

    if (typeof value === "object" && !(value instanceof Date) && !Array.isArray(value)) {
      const operators = value as Record<string, unknown>;
      for (const [operator, operand] of Object.entries(operators)) {
        if (operand === undefined) continue;
        switch (operator) {
          case "in": {
            const list = (operand as unknown[]).map(coerce);
            if (!list.length) {
              clauses.push("1=0");
            } else {
              params.push(list);
              clauses.push(`"${column}" = ANY($${params.length})`);
            }
            break;
          }
          case "notIn": {
            const list = (operand as unknown[]).map(coerce);
            if (list.length) {
              params.push(list);
              clauses.push(`"${column}" <> ALL($${params.length})`);
            }
            break;
          }
          case "lt":
          case "lte":
          case "gt":
          case "gte": {
            const symbol = { lt: "<", lte: "<=", gt: ">", gte: ">=" }[operator];
            params.push(coerce(operand));
            clauses.push(`"${column}" ${symbol} $${params.length}`);
            break;
          }
          case "not":
            if (operand === null) clauses.push(`"${column}" IS NOT NULL`);
            else {
              params.push(coerce(operand));
              clauses.push(`"${column}" <> $${params.length}`);
            }
            break;
          case "equals":
            params.push(coerce(operand));
            clauses.push(`"${column}" = $${params.length}`);
            break;
          // Case-sensitive pattern matching. User input is escaped, so a value
          // containing % or _ cannot widen the match.
          case "contains":
          case "startsWith":
          case "endsWith": {
            const raw = String(operand ?? "").replace(/([%_\\])/g, "\\$1");
            const pattern =
              operator === "contains" ? `%${raw}%` : operator === "startsWith" ? `${raw}%` : `%${raw}`;
            params.push(pattern);
            clauses.push(`"${column}" LIKE $${params.length}`);
            break;
          }
          default:
            throw new QueryError(`Unsupported operator "${operator}"`, "UNSUPPORTED_OPERATOR");
        }
      }
      continue;
    }

    params.push(coerce(value));
    clauses.push(`"${column}" = $${params.length}`);
  }

  return clauses.length ? clauses.join(" AND ") : "1=1";
}

function buildOrderBy(config: ModelConfig, orderBy: OrderBy | undefined): string {
  if (!orderBy) return "";
  const entries = Array.isArray(orderBy) ? orderBy : [orderBy];
  const parts: string[] = [];
  for (const entry of entries) {
    for (const [key, direction] of Object.entries(entry)) {
      const column = config.fields[key];
      if (!column) throw new QueryError(`Unknown orderBy field "${key}"`, "UNKNOWN_FIELD");
      parts.push(`"${column}" ${direction === "desc" ? "DESC" : "ASC"}`);
    }
  }
  return parts.length ? ` ORDER BY ${parts.join(", ")}` : "";
}

function mapRow(config: ModelConfig, row: Row): Row {
  const output: Row = {};
  for (const [field, column] of Object.entries(config.fields)) {
    const value = row[column];
    if (config.dateFields?.includes(field)) {
      output[field] = value ? new Date(value as string) : null;
    } else {
      output[field] = value === undefined ? null : value;
    }
  }
  return output;
}

function applySelect(row: Row, select?: Record<string, boolean | object> | null): Row {
  if (!select) return row;
  const output: Row = {};
  for (const key of Object.keys(select)) {
    if (key in row) output[key] = row[key];
  }
  return output;
}

function mapData(config: ModelConfig, data: Row): { columns: string[]; values: unknown[] } {
  const columns: string[] = [];
  const values: unknown[] = [];
  for (const [key, rawValue] of Object.entries(data)) {
    if (rawValue === undefined) continue;
    const column = config.fields[key];
    if (!column) continue; // relations / unknown keys are handled by the caller
    columns.push(column);
    values.push(coerce(rawValue));
  }
  return { columns, values };
}

/* ── Includes ───────────────────────────────────────────────── */

type Include = Record<string, any>;

async function hydrate(name: ModelName, row: Row | null, include?: Include | null): Promise<Row | null> {
  if (!row || !include) return row;
  const output: Row = { ...row };

  if (name === "session" && include.user && row.userId) {
    output.user = await db.user.findUnique({
      where: { id: row.userId },
      select: include.user.select,
    });
  }

  if (name === "portfolio") {
    const portfolioId = row.id as string;
    const tasks: Promise<void>[] = [];

    if (include.socialLinks) {
      tasks.push(db.socialLink.findMany({ where: { portfolioId }, orderBy: { sortOrder: "asc" } }).then((links) => {
        output.socialLinks = links;
      }));
    }
    if (include.skills) {
      tasks.push(db.skill.findMany({ where: { portfolioId }, orderBy: { sortOrder: "asc" } }).then((skills) => {
        output.skills = skills;
      }));
    }
    if (include.skillGroups) {
      tasks.push(
        db.skillGroup.findMany({ where: { portfolioId }, orderBy: { sortOrder: "asc" } }).then(async (groups) => {
          const skills = include.skillGroups?.include?.skills
            ? await db.skill.findMany({ where: { portfolioId }, orderBy: { sortOrder: "asc" } })
            : [];
          output.skillGroups = (groups as Row[]).map((group) => ({
            ...group,
            skills: (skills as Row[]).filter((skill) => skill.groupId === group.id),
          }));
        }),
      );
    }
    if (include.experiences) {
      tasks.push(db.experience.findMany({ where: { portfolioId }, orderBy: { sortOrder: "asc" } }).then((items) => {
        output.experiences = items;
      }));
    }
    if (include.education) {
      tasks.push(db.education.findMany({ where: { portfolioId }, orderBy: { sortOrder: "asc" } }).then((items) => {
        output.education = items;
      }));
    }
    if (include.certifications) {
      tasks.push(db.certification.findMany({ where: { portfolioId }, orderBy: { sortOrder: "asc" } }).then((items) => {
        output.certifications = items;
      }));
    }
    if (include.achievements) {
      tasks.push(db.achievement.findMany({ where: { portfolioId }, orderBy: { sortOrder: "asc" } }).then((items) => {
        output.achievements = items;
      }));
    }
    if (include.projects) {
      tasks.push(
        db.project.findMany({ where: { portfolioId }, orderBy: { sortOrder: "asc" } }).then(async (projects) => {
          if (!include.projects?.include?.images) {
            output.projects = projects;
            return;
          }
          const ids = (projects as Row[]).map((project) => project.id);
          const images = ids.length
            ? await db.projectImage.findMany({ where: { projectId: { in: ids } }, orderBy: { sortOrder: "asc" } })
            : [];
          output.projects = (projects as Row[]).map((project) => ({
            ...project,
            images: (images as Row[]).filter((image) => image.projectId === project.id),
          }));
        }),
      );
    }
    if (include.user) {
      tasks.push(
        db.user.findUnique({ where: { id: row.userId }, select: include.user.select }).then((user) => {
          output.user = user;
        }),
      );
    }
    if (include.github) {
      tasks.push(
        db.gitHubIntegration.findUnique({ where: { portfolioId } }).then((integration) => {
          output.github = integration;
        }),
      );
    }
    if (include.activity) {
      tasks.push(
        db.activityLog
          .findMany({ where: { portfolioId }, orderBy: { createdAt: "desc" }, take: include.activity.take })
          .then((items) => {
            output.activity = items;
          }),
      );
    }
    if (include.messages) {
      tasks.push(
        db.contactMessage
          .findMany({ where: { portfolioId }, orderBy: { createdAt: "desc" }, take: include.messages.take })
          .then((items) => {
            output.messages = items;
          }),
      );
    }

    await Promise.all(tasks);
  }

  if (name === "project" && include.images && row.id) {
    output.images = await db.projectImage.findMany({ where: { projectId: row.id }, orderBy: { sortOrder: "asc" } });
  }

  if (name === "user" && include.portfolios) {
    const portfolios = await db.portfolio.findMany({
      where: { userId: row.id },
      orderBy: { createdAt: "asc" },
      select: include.portfolios.select,
    });
    if (include.portfolios.select?._count) {
      output.portfolios = await Promise.all(
        (portfolios as Row[]).map(async (portfolio) => ({
          ...portfolio,
          _count: { projects: await db.project.count({ where: { portfolioId: portfolio.id } }) },
        })),
      );
    } else {
      output.portfolios = portfolios;
    }
  }

  return output;
}

/* ── Model client ───────────────────────────────────────────── */

export interface ModelApi<T = Row> {
  findMany(args?: FindArgs): Promise<T[]>;
  findFirst(args?: FindArgs): Promise<T | null>;
  findUnique(args: FindArgs): Promise<T | null>;
  count(args?: { where?: Where }): Promise<number>;
  create(args: { data: Row; include?: Include | null; select?: Record<string, boolean> }): Promise<T>;
  createMany(args: { data: Row[] }): Promise<{ count: number }>;
  update(args: { where: Where; data: Row; include?: Include | null }): Promise<T | null>;
  updateMany(args: { where?: Where; data: Row }): Promise<{ count: number }>;
  upsert(args: { where: Where; create: Row; update: Row; include?: Include | null }): Promise<T | null>;
  delete(args: { where: Where }): Promise<T>;
  deleteMany(args?: { where?: Where }): Promise<{ count: number }>;
}

interface FindArgs {
  where?: Where;
  orderBy?: OrderBy;
  take?: number;
  skip?: number;
  select?: Record<string, boolean | object> | null;
  include?: Include | null;
}

class ModelClient<T = Row> implements ModelApi<T> {
  private name: ModelName;
  private config: ModelConfig;

  constructor(name: ModelName) {
    this.name = name;
    this.config = MODELS[name];
  }

  private async rows(args: FindArgs = {}): Promise<Row[]> {
    const params: unknown[] = [];
    const where = buildWhere(this.config, args.where, params);
    const order = buildOrderBy(this.config, args.orderBy);
    const limit = typeof args.take === "number" ? ` LIMIT ${Math.max(0, Math.trunc(args.take))}` : "";
    const offset = typeof args.skip === "number" ? ` OFFSET ${Math.max(0, Math.trunc(args.skip))}` : "";

    const result = await run(`SELECT * FROM "${this.config.table}" WHERE ${where}${order}${limit}${offset}`, params);
    return result.map((row) => mapRow(this.config, row));
  }

  async findMany(args: FindArgs = {}): Promise<T[]> {
    const rows = await this.rows(args);
    const hydrated = await Promise.all(rows.map((row) => hydrate(this.name, row, args.include)));
    return hydrated.map((row) => applySelect(row as Row, args.select)) as T[];
  }

  async findFirst(args: FindArgs = {}): Promise<T | null> {
    const rows = await this.findMany({ ...args, take: 1 });
    return rows[0] ?? null;
  }

  async findUnique(args: FindArgs): Promise<T | null> {
    return this.findFirst(args);
  }

  async count(args: { where?: Where } = {}): Promise<number> {
    const params: unknown[] = [];
    const where = buildWhere(this.config, args.where, params);
    const result = await run(`SELECT COUNT(*)::int AS count FROM "${this.config.table}" WHERE ${where}`, params);
    return Number(result[0]?.count ?? 0);
  }

  async create(args: { data: Row; include?: Include | null; select?: Record<string, boolean> }): Promise<T> {
    const data: Row = { ...args.data };
    const id = typeof data.id === "string" && data.id ? data.id : randomUUID();
    data.id = id;

    const relating: { model: ModelName; create: Row | Row[]; foreignKey: string }[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === "object" && !Array.isArray(value) && "create" in (value as Row)) {
        const childModel = key as ModelName;
        if (childModel in MODELS) {
          relating.push({ model: childModel, create: (value as Row).create, foreignKey: `${this.name}Id` });
          delete data[key];
        }
      }
    }

    if (this.config.timestamps) {
      if (data.createdAt === undefined) data.createdAt = new Date();
      if (data.updatedAt === undefined) data.updatedAt = new Date();
    }

    const { columns, values } = mapData(this.config, data);
    if (!columns.includes("id")) {
      columns.unshift("id");
      values.unshift(id);
    }

    const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
    const inserted = await run(
      `INSERT INTO "${this.config.table}" (${columns.map((column) => `"${column}"`).join(", ")}) VALUES (${placeholders}) RETURNING *`,
      values,
    );

    // Nested creates use the parent id, matching the relational style used by the seed.
    for (const relation of relating) {
      const children = Array.isArray(relation.create) ? relation.create : [relation.create];
      for (const child of children) {
        await modelClient(relation.model).create({
          data: { ...child, portfolioId: relation.foreignKey === "portfolioId" ? id : child.portfolioId, projectId: relation.foreignKey === "projectId" ? id : child.projectId },
        });
      }
    }

    const row = mapRow(this.config, inserted[0] ?? {});
    return (await hydrate(this.name, row, args.include)) as T;
  }

  async createMany(args: { data: Row[] }): Promise<{ count: number }> {
    let count = 0;
    for (const entry of args.data) {
      await this.create({ data: entry });
      count += 1;
    }
    return { count };
  }

  async update(args: { where: Where; data: Row; include?: Include | null }): Promise<T | null> {
    const data: Row = { ...args.data };
    // Never allow relational keys or undefined values into an UPDATE.
    for (const key of Object.keys(data)) {
      if (data[key] && typeof data[key] === "object" && !(data[key] instanceof Date) && !Array.isArray(data[key])) {
        delete data[key];
      }
    }
    if (this.config.timestamps && data.updatedAt === undefined && "updatedAt" in this.config.fields) {
      data.updatedAt = new Date();
    }

    const params: unknown[] = [];
    const where = buildWhere(this.config, args.where, params);
    const { columns, values } = mapData(this.config, data);
    if (!columns.length) {
      const existing = await this.findFirst({ where: args.where, include: args.include });
      return existing as T | null;
    }

    const assignments = columns.map((column, index) => `"${column}" = $${params.length + index + 1}`).join(", ");
    const updated = await run(
      `UPDATE "${this.config.table}" SET ${assignments} WHERE ${where} RETURNING *`,
      [...params, ...values],
    );

    if (!updated.length) throw new QueryError("Record to update not found", "P2025");
    const row = mapRow(this.config, updated[0]);
    return (await hydrate(this.name, row, args.include)) as T | null;
  }

  async updateMany(args: { where?: Where; data: Row }): Promise<{ count: number }> {
    const data: Row = { ...args.data };
    const params: unknown[] = [];
    const where = buildWhere(this.config, args.where, params);
    const { columns, values } = mapData(this.config, data);
    if (!columns.length) return { count: 0 };

    const assignments = columns.map((column, index) => `"${column}" = $${params.length + index + 1}`).join(", ");
    const updated = await run(
      `UPDATE "${this.config.table}" SET ${assignments} WHERE ${where} RETURNING id`,
      [...params, ...values],
    );
    return { count: updated.length };
  }

  async upsert(args: { where: Where; create: Row; update: Row; include?: Include | null }): Promise<T | null> {
    const existing = await this.findFirst({ where: args.where });
    if (existing) {
      return this.update({ where: args.where, data: args.update, include: args.include });
    }
    return this.create({ data: { ...args.create, ...args.where }, include: args.include });
  }

  async delete(args: { where: Where }): Promise<T> {
    const params: unknown[] = [];
    const where = buildWhere(this.config, args.where, params);
    const deleted = await run(`DELETE FROM "${this.config.table}" WHERE ${where} RETURNING *`, params);
    if (!deleted.length) throw new QueryError("Record to delete does not exist", "P2025");
    return mapRow(this.config, deleted[0]) as T;
  }

  async deleteMany(args: { where?: Where } = {}): Promise<{ count: number }> {
    const params: unknown[] = [];
    const where = buildWhere(this.config, args.where, params);
    const deleted = await run(`DELETE FROM "${this.config.table}" WHERE ${where} RETURNING id`, params);
    return { count: deleted.length };
  }
}

const clients = new Map<ModelName, ModelClient>();

function modelClient<T = Row>(name: ModelName): ModelApi<T> {
  let client = clients.get(name);
  if (!client) {
    client = new ModelClient(name);
    clients.set(name, client);
  }
  return client as unknown as ModelApi<T>;
}

/* ── Public client ──────────────────────────────────────────── */

export interface DbClient {
  user: ModelApi<UserRow>;
  session: ModelApi<SessionRow>;
  passwordResetToken: ModelApi<PasswordResetTokenRow>;
  portfolio: ModelApi<PortfolioRow>;
  ownerProfile: ModelApi<OwnerProfileRow>;
  timelineEntry: ModelApi<TimelineRow>;
  socialLink: ModelApi<SocialLinkRow>;
  skillGroup: ModelApi<SkillGroupRow>;
  skill: ModelApi<SkillRow>;
  experience: ModelApi<ExperienceRow>;
  education: ModelApi<EducationRow>;
  certification: ModelApi<CertificationRow>;
  achievement: ModelApi<AchievementRow>;
  project: ModelApi<ProjectRow>;
  projectImage: ModelApi<ProjectImageRow>;
  gitHubIntegration: ModelApi<GithubIntegrationRow>;
  contactMessage: ModelApi<ContactMessageRow>;
  activityLog: ModelApi<ActivityLogRow>;
  $transaction<T>(operations: Promise<unknown>[] | ((client: DbClient) => Promise<T>)): Promise<T>;
  $queryRaw(strings: TemplateStringsArray, ...values: unknown[]): Promise<Row[]>;
  $ensureSchema(): Promise<void>;
}

export const db: DbClient = {
  user: modelClient("user"),
  session: modelClient("session"),
  passwordResetToken: modelClient("passwordResetToken"),
  portfolio: modelClient("portfolio"),
  ownerProfile: modelClient("ownerProfile"),
  timelineEntry: modelClient("timelineEntry"),
  socialLink: modelClient("socialLink"),
  skillGroup: modelClient("skillGroup"),
  skill: modelClient("skill"),
  experience: modelClient("experience"),
  education: modelClient("education"),
  certification: modelClient("certification"),
  achievement: modelClient("achievement"),
  project: modelClient("project"),
  projectImage: modelClient("projectImage"),
  gitHubIntegration: modelClient("gitHubIntegration"),
  contactMessage: modelClient("contactMessage"),
  activityLog: modelClient("activityLog"),

  async $transaction<T>(operations: Promise<unknown>[] | ((client: DbClient) => Promise<T>)): Promise<T> {
    if (typeof operations === "function") return operations(db);
    await Promise.all(operations as Promise<unknown>[]);
    return undefined as T;
  },

  async $queryRaw(strings: TemplateStringsArray, ...values: unknown[]): Promise<Row[]> {
    const text = strings.reduce((accumulator, part, index) => {
      const placeholder = index < values.length ? `$${index + 1}` : "";
      return `${accumulator}${part}${placeholder}`;
    }, "");
    return run(text, values.map(coerce));
  },

  /** Test/maintenance helper: create the schema in a fresh database. */
  async $ensureSchema() {
    const { ready } = initialise();
    await ready;
  },
};

