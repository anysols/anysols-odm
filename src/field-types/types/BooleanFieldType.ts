import FieldType from '../FieldType';
import Schema from '../../collection/Schema';
import FieldTypeUtils from '../FieldTypeUtils';
import ODM from '../../ODM';
import PrimitiveDataType from '../../core/data-types/PrimitiveDataType';

export default class BooleanFieldType extends FieldType {
  constructor(odm: ODM) {
    super(odm, PrimitiveDataType.BOOLEAN);
  }

  getName(): string {
    return 'boolean';
  }

  async validateValue(
    schema: Schema,
    fieldName: string,
    value: any,
    context: any
  ) {
    FieldTypeUtils.requiredValidation(schema, fieldName, value);
    await FieldTypeUtils.uniqueValidation(
      this.getODM(),
      schema,
      fieldName,
      value
    );
  }

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
  }

  async getDisplayValue(schema: Schema, fieldName: string, record: any) {
    return this.getDataType().toJSON(record[fieldName]);
  }

  setValueIntercept(
    schema: Schema,
    fieldName: string,
    value: any,
    record: any
  ): any {
    return value;
  }
}
