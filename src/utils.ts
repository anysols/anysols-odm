import type { Logger } from "../deps.ts";
import * as minify from "npm:pg-minify@1.6.4";
import { DatabaseConnection } from "./core/connection/DatabaseConnection.ts";

export function logSQLQuery(logger: Logger, query: string): void {
  try {
    logger.debug(minify.default(query));
  } catch (error) {
    logger.error(error);
    logger.debug(query);
  }
}

export async function runSQLQuery(
  client: DatabaseConnection,
  query: string,
): Promise<any> {
  const { rows }: any = await client.runQuery(query);
  return rows;
}

export function getFullFormTableName(name: string): string {
  const parts = name.split(".");
  let schemaName = "public";
  let tableName = name;
  if (parts.length == 2) {
    schemaName = parts[0];
    tableName = parts[1];
  }
  return `${schemaName}.${tableName}`;
}

export function getShortFormTableName(name: string): string {
  const parts = name.split(".");
  if (parts.length == 2 && parts[0] === "public") {
    return parts[1];
  }
  return name;
}

export function getTableNameWithoutSchema(name: string): string {
  const parts = name.split(".");
  if (parts.length == 2) {
    return parts[1];
  }
  return name;
}
