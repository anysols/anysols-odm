import DataType from "../DataType.ts";
import TableSchema from "../../table/TableSchema.ts";
import { NATIVE_DATA_TYPES } from "../../core/NativeDataType.ts";
import { ColumnDefinition } from "../../table/definitions/ColumnDefinition.ts";
import { RawRecord } from "../../record/RawRecord.ts";

export default class BooleanDataType extends DataType {
  constructor() {
    super(NATIVE_DATA_TYPES.BOOLEAN);
  }

  getName(): string {
    return "boolean";
  }

  validateDefinition(_definition: ColumnDefinition): boolean {
    return true;
  }

  setValueIntercept(
    _schema: TableSchema,
    _fieldName: string,
    value: any,
    _record: RawRecord
  ): any {
    return value;
  }

  async validateValue(
    _schema: TableSchema,
    _fieldName: string,
    _record: RawRecord
  ) {}
}