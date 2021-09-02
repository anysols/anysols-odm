import DataType from '../../core/data-types/dataType.interface';
import ObjectDataType from '../../core/data-types/types/objectDataType';
import FieldType from '../FieldType.interface';
import Schema from '../../collection/Schema';
import ODM from '../../ODM';
import FieldTypeUtils from '../FieldTypeUtils';
import Field from '../../collection/Field';

export default class ObjectFieldType extends FieldType {
  #dataType: DataType = new ObjectDataType();

  #odm?: ODM;

  setODM(odm: ODM): void {
    this.#odm = odm;
  }

  getDataType(): DataType {
    return this.#dataType;
  }

  getType(): string {
    return 'object';
  }

  async validateValue(
    schema: Schema,
    field: Field,
    record: any,
    context: any
  ): Promise<void> {
    FieldTypeUtils.requiredValidation(schema, field, record);
    await FieldTypeUtils.uniqueValidation(this.#odm, schema, field, record);
  }

  validateDefinition(fieldDefinition: any): boolean {
    return !!fieldDefinition.name;
  }

  async getDisplayValue(
    schema: Schema,
    field: Field,
    record: any,
    context: any
  ): Promise<string> {
    return record[field.getName()];
  }

  getValueIntercept(
    schema: Schema,
    field: Field,
    record: any,
    context: any
  ): any {
    return record[field.getName()];
  }

  setValueIntercept(
    schema: Schema,
    field: Field,
    newValue: any,
    record: any,
    context: any
  ): any {
    return newValue;
  }
}
