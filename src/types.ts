import type { JSONPrimitive, UUID4 } from "../deps.ts";

export type TForeignKey = {
  table: string;
  column: string;
  on_delete?: "NO ACTION" | "CASCADE" | "SET NULL" | "SET DEFAULT";
};

export type TColumnDefinition = {
  name: string;
  type: string;
  not_null?: boolean;
  default?: unknown;
  unique?: boolean;
  foreign_key?: TForeignKey;
};

export type TColumnDefinitionStrict = {
  name: string;
  type: string;
  not_null: boolean;
  default: any;
  unique: boolean;
  foreign_key?: TForeignKey;
};

export type __TColumnDefinitionNative = {
  name: string;
  native_type?: string;
  not_null: boolean;
  unique: boolean;
  foreign_key?: TForeignKey;
};

export type TTableDefinition = {
  schema?: string;
  name: string;
  inherits?: string;
  final?: boolean;
  columns?: TColumnDefinition[];
};

export type TTableDefinitionStrict = {
  schema: string;
  name: string;
  inherits?: string;
  final: boolean;
  columns: TColumnDefinitionStrict[];
};

export type TColumnDataType =
  | "VARCHAR"
  | "UUID"
  | "CHAR"
  | "TEXT"
  | "DECIMAL"
  | "INTEGER"
  | "BOOLEAN"
  | "DATE"
  | "JSON"
  | "TIME"
  | "TIMESTAMP";

export type TRecord = {
  id?: UUID4;
  _table?: string;
  [key: string]: unknown;
};

export type TRecordInterceptorType =
  | "BEFORE_INSERT"
  | "AFTER_INSERT"
  | "BEFORE_UPDATE"
  | "AFTER_UPDATE"
  | "BEFORE_DELETE"
  | "AFTER_DELETE"
  | "BEFORE_SELECT"
  | "AFTER_SELECT";

export type TRecordInterceptorContext = any;

export type SimpleCondition = {
  column: string | number;
  operator: string;
  value: JSONPrimitive | JSONPrimitive[];
};
