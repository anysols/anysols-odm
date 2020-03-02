import FieldTypeRegistry from "./field-types/FieldTypeRegistry";
import FieldType from "./field-types/FieldType.interface";
import CollectionRegistry from "./collection/CollectionRegistry";
import Collection from "./collection/Collection";

const privates = new WeakMap();

export default class Schema {

    constructor(schemaObject: any, fieldTypeRegistry: FieldTypeRegistry, collectionRegistry: CollectionRegistry) {
        privates.set(this, {fieldTypeRegistry, collectionRegistry, schema: schemaObject});
        _validateSchemaObject(this);
    }

    getName(): string {
        return _getSchemaObject(this).name;
    }

    getExtends(): string {
        return _getSchemaObject(this).extends;
    }

    isFinal(): boolean {
        return !!_getSchemaObject(this).final;
    }

    getHostName(): string {
        let hostName = this.getName();
        const extendsCollectionName = this.getExtends();
        if (extendsCollectionName) {
            const extendedSchema = _getCollection(this, extendsCollectionName).getSchema();
            hostName = extendedSchema.getName();
        }
        return hostName;
    }

    getFields(): any[] {
        const schemaObject: any = _getSchemaObject(this);
        let allFields: any[] = [];

        let fields = _getFields(this);
        if (fields)
            allFields = allFields.concat(fields);

        const extendsCollectionName = this.getExtends();
        if (extendsCollectionName) {
            const extendedSchema = _getCollection(this, extendsCollectionName).getSchema();
            allFields = allFields.concat(extendedSchema.getFields());
        } else {
            allFields.push({
                name: '_id',
                type: 'object'
            });
        }
        return allFields;
    }

    validate(recordObject: any) {
        const that = this;
        const errorMessages: string[] = [];
        for (let field of this.getFields()) {
            if (field.name === '_id')
                continue;
            let fieldType = _getFieldType(that, field.type);
            if (!fieldType)
                throw Error("Field type should be defined");
            try {
                fieldType.getDataType(field).validate(recordObject[field.name]);
            } catch (err) {
                if (err.message === "REQUIRED")
                    errorMessages.push(field.name + " is a required field");
                else if (err.message === "NOT_VALID_TYPE")
                    errorMessages.push(field.name + " should be a " + fieldType.getType());
                else
                    errorMessages.push(field.name + " should be a valid " + fieldType.getType());
            }
        }
        if (errorMessages.length)
            throw new Error(errorMessages.join(", \n"));
    }

}

function _validateSchemaError(message: string): Error {
    return new Error("[Schema::_validateSchemaJSON] " + message)
}

function _validateSchemaObject(that: Schema) {
    const schemaObject = _getSchemaObject(that);
    if (!schemaObject)
        throw _validateSchemaError("Schema not provided");
    if (!schemaObject.name)
        throw  _validateSchemaError("Collection name not provided");
    if (typeof schemaObject.name !== 'string')
        throw  _validateSchemaError("Collection name should be a string - [collectionName=" + schemaObject.name + "]");
    if (!(/^[a-z0-9_]+$/i.test(schemaObject.name)))
        throw  _validateSchemaError("Collection name should be alphanumeric - [collectionName=" + schemaObject.name + "]");
    if (_hasCollection(that, schemaObject.name))
        throw  _validateSchemaError("Collection name already exists");
    if (schemaObject.extends) {
        let extendsCol: Collection | null;
        extendsCol = _getCollection(that, schemaObject.extends);
        if (!extendsCol)
            throw _validateSchemaError("'" + schemaObject.name + "' cannot extend '" + schemaObject.extends + "'. '" + schemaObject.extends + "' does not exists.");
        if (extendsCol.getSchema().isFinal())
            throw _validateSchemaError("'" + schemaObject.name + "' cannot extend '" + schemaObject.extends + "'. '" + schemaObject.extends + "' is final schema .");
    }

    const allFieldsObjects = that.getFields();
    for (const fieldObject of allFieldsObjects) {
        if (!fieldObject || !fieldObject.type)
            throw _validateSchemaError("field type provided - [collectionName=" + schemaObject.name + "]");
        const fieldType = _getFieldType(that, fieldObject.type);
        if (!fieldType)
            throw _validateSchemaError("No such field type  - [collectionName=" + schemaObject.name + ", fieldName=" + fieldObject.name + ", fieldType=" + fieldObject.type + "]");
        if (!fieldType.validateDefinition(fieldObject))
            throw _validateSchemaError("Invalid field definition  [collectionName=" + schemaObject.name + ", fieldName=" + fieldObject.name + "]");
    }

    const fieldNames: string[] = allFieldsObjects.map((f: any) => f.name);
    if (_areDuplicatesPresent(fieldNames))
        throw _validateSchemaError("Duplicate field name [collectionName=" + schemaObject.name + ", fieldNames=" + fieldNames + "]");
}

function _areDuplicatesPresent(a: string[]): boolean {
    for (let i = 0; i <= a.length; i++)
        for (let j = i; j <= a.length; j++)
            if (i != j && a[i] == a[j])
                return true;
    return false;
}

function _getSchemaObject(that: Schema): any {
    return privates.get(that).schema;
}

function _getFields(that: Schema): any {
    return _getSchemaObject(that).fields;
}


function _getFieldTypeRegistry(that: Schema): FieldTypeRegistry {
    return privates.get(that).fieldTypeRegistry;
}

function _getFieldType(that: Schema, type: string): FieldType | undefined {
    return _getFieldTypeRegistry(that).getFieldType(type);
}

function _getCollectionRegistry(that: Schema): CollectionRegistry {
    return privates.get(that).collectionRegistry;
}

function _getCollection(that: Schema, collectionName: string): Collection {
    const col = _getCollectionRegistry(that).getCollection(collectionName);
    if (!col)
        throw Error("[Schema::_getCollection] Collection not found");
    return col;
}

function _hasCollection(that: Schema, collectionName: string): boolean {
    return _getCollectionRegistry(that).hasCollection(collectionName);
}