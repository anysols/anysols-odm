import IDataType from "../IDataType.ts";
import type { TColumnDataType, TColumnDefinitionStrict } from "../../types.ts";
import { CommonUtils, type UUID4 } from "../../../deps.ts";

export default class UUIDDataType extends IDataType {
  constructor() {
    super("uuid");
  }

  getNativeType(_definition: TColumnDefinitionStrict): TColumnDataType {
    return "UUID";
  }

  validateDefinition(_definition: TColumnDefinitionStrict) {}

  toJSONValue(value: UUID4 | null): string | null {
    return value;
  }

  setValueIntercept(value: UUID4 | null): UUID4 | null {
    return value;
  }

  async validateValue(value: string | null) {
    if (typeof value === "string" && !CommonUtils.validateUUID(value)) {
      throw new Error(`Invalid UUID value: ${value}`);
    }
  }
}
