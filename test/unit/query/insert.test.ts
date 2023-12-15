import {
  afterAll,
  assert,
  assertEquals,
  assertStrictEquals,
  beforeAll,
  describe,
  it
} from "../../test.deps.ts";
import { Temporal } from "npm:@js-temporal/polyfill";

import { ODMConnection, Record } from "../../../mod.ts";
import { Session } from "../../test.utils.ts";

describe({
  name: "INSERT Query",
  sanitizeResources: false,
  sanitizeOps: false,
  fn: () => {
    let conn: ODMConnection;
    const cleanTableList: string[] = [];
    let johnRecord: Record;

    let itDepartment: any, hrDepartment: any;

    beforeAll(async () => {
      conn = await Session.getConnection();
      await conn.defineTable({
        name: "department",
        columns: [
          {
            name: "name",
            type: "string",
            unique: true
          },
          {
            name: "description",
            type: "string"
          }
        ]
      });
      const departmentTable = conn.table("department");
      itDepartment = departmentTable.createNewRecord();
      itDepartment.set("name", "IT");
      await itDepartment.insert();

      hrDepartment = departmentTable.createNewRecord();
      hrDepartment.set("name", "HR");
      await hrDepartment.insert();

      cleanTableList.push("department");
    });

    afterAll(async () => {
      const conn = await Session.getConnection();
      for (const table of cleanTableList) {
        await conn.dropTable(table);
      }
      await conn.closeConnection();
    });

    it("#defineCollection with different field types", async () => {
      await conn.defineTable({
        name: "employee",
        columns: [
          {
            name: "name",
            type: "string",
            unique: true
          },
          {
            name: "department",
            type: "uuid",
            foreign_key: {
              table: "public.department",
              column: "id",
              on_delete: "CASCADE"
            }
          },
          {
            name: "salary",
            /*  maximum: 10000,*/
            type: "integer",
            not_null: true
          },
          {
            name: "birth_date",
            type: "date"
          },
          {
            name: "created_on",
            type: "datetime"
          },
          {
            name: "gender",
            type: "boolean"
          },
          {
            name: "address",
            type: "json"
          },
          {
            name: "rating",
            type: "number",
            default: 4.5
          }
        ]
      });

      cleanTableList.push("employee");
    });

    it("#Table::getName", function () {
      const employeeTable = conn.table("employee");
      assertEquals(employeeTable.getName(), "employee", "Invalid table name");
    });

    /**
     * CREATE
     */
    it("#insert", async () => {
      const employeeTable = conn.table("employee");
      const employee = employeeTable.createNewRecord();
      const empId = employee.getID();
      employee.set("name", "John");
      employee.set("emp_no", conn.generateRecordId());
      employee.set("department", itDepartment.getID());
      employee.set("birth_date", Temporal.Now.plainDateISO());
      employee.set("created_on", Temporal.Now.plainDateTimeISO());
      employee.set("gender", true);
      employee.set("salary", 5000);
      employee.set("address", {
        street: "test",
        zipcode: 500000
      });
      johnRecord = await employee.insert();

      const johnObject = johnRecord.toJSON();
      assertEquals(
        johnObject.id + "",
        empId,
        "id is expected to be same as initialized value"
      );
      assertEquals(johnObject.name, "John", "name is expected to be John");
      assertEquals(johnObject.rating, 4.5, "default is expected to be 4.5");
    });

    it("#::insert not null error", async () => {
      const employeeTable = conn.table("employee");
      const employee = employeeTable.createNewRecord();
      employee.set("name", "Unique Name");
      try {
        await employee.insert();
      } catch (_error) {
        return;
      }
      assert(false, "not null error");
    });

    it("#::insert unique error", async () => {
      const employeeTable = conn.table("employee");
      const employee = employeeTable.createNewRecord();
      employee.set("name", "John");
      employee.set("salary", 500);
      try {
        await employee.insert();
      } catch (_error) {
        return;
      }
      assert(false, "duplicate key error");
    });

    /**
     * UPDATE
     */
    it("#update", async () => {
      johnRecord.set("salary", 200);
      try {
        const rec = await johnRecord.update();
        assert(rec.get("salary") === 200, "record not updated");
      } catch (_error) {
        assert(false, "duplicate key error");
      }
    });

    /* it("#findById", async () => {
      const employeeTable = conn.table("employee");
      const employee: Record = await employeeTable.findById(johnRecord.getID());
      assertEquals(employee.length, 1);
    });*/

    it("#getRecordById", async () => {
      const employeeTable = conn.table("employee");
      const employee: Record | undefined = await employeeTable.getRecordById(
        johnRecord.getID()
      );
      assert(!!employee, "record not found");
      assertStrictEquals(
        employee.get("name"),
        "John",
        "name is expected to be John"
      );
    });

    /*
   it("#Collection::findOne", async () => {
   const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
   const employee: Record | undefined = await employeeCollection.findOne({
   name: "John"
   });
   assert(!!employee && employee.getID() === johnRecord.getID());
   });

   it("#Record::delete", async () => {
   const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
   await johnRecord.delete();
   const employee: Record | undefined = await employeeCollection.findById(
   johnRecord.getID()
   );
   assert(!employee);
   });

   /!**
   * SORT
   *!/
   it("#Collection::Cursor::sort", async () => {
   odm.defineCollection({
   name: "sort_test",
   fields: [
   {
   name: "number",
   type: "integer"
   }
   ]
   });
   const sortCollection = odm.collection("sort_test");
   let rec = sortCollection.createNewRecord();
   rec.set("number", 2);
   await rec.insert();
   rec = sortCollection.createNewRecord();
   rec.set("number", 1);
   await rec.insert();
   const recs: Record[] = await sortCollection
   .find({})
   .sort([["number", 1]])
   .toArray();
   let expected = 1;
   recs.forEach(function (rec: Record) {
   assert(rec.get("number") == expected, "Not expected value");
   expected++;
   });
   });

   it("#Collection::Cursor::sort 2", async () => {
   const sortCollection = odm.collection("sort_test");
   const recs: Record[] = await sortCollection
   .find({}, { sort: { number: 1 } })
   .toArray();

   let expected = 1;
   recs.forEach(function (rec: Record) {
   assert(rec.get("number") == expected, "Not expected value");
   expected++;
   });
   });

   it("#Collection::Aggregation", async () => {
   const employeeCollection = odm.collection(EMPLOYEE_MODEL_NAME);
   const empRecord = employeeCollection.createNewRecord();
   empRecord.set("name", "John");
   empRecord.set("emp_no", odm.generateObjectId());
   empRecord.set("birth_date", new Date().toISOString());
   empRecord.set("created_on", new Date().toISOString());
   empRecord.set("gender", true);
   empRecord.set("salary", 5000);
   empRecord.set("rating", 4.5);
   empRecord.set("address", {
   street: "test",
   zipcode: 500000
   });
   await empRecord.insert();
   const recs: any = await employeeCollection
   .aggregate([
   {
   $group: {
   _id: "$name",
   count: { $count: {} }
   }
   }
   ])
   .toArray();
   console.log(recs);
   assert(recs[0].count == 1, "Not expected value");
   });*/
  }
});
