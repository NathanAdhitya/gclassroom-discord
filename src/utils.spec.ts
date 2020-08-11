import * as base from "./utils";

describe("Convert Google's DueDate and DueTime format", () => {
    test("Treat optional time as 0", () => {
        const currentDate = new Date();
        const result = base.convertDue({
            year: currentDate.getUTCFullYear(),
            month: currentDate.getUTCMonth() + 1,
            day: currentDate.getUTCDate(),
        }, {}).getTime();
        currentDate.setUTCHours(0, 0, 0, 0);
        expect(result).toBe(currentDate.getTime());
    });
});

describe("Cut data for updates", () => {
    test("expect original return when all data are after the last update", () => {
        const testData = [
            {updateTime: new Date(3).toISOString()},
            {updateTime: new Date(2).toISOString()},
            {updateTime: new Date(1).toISOString()},
        ];
        const result = base.cutLastUpdate(testData, 0);
        expect(result).toEqual(testData);
    })

    test("expect to return the data after the last update", () => {
        const testData = [
            {updateTime: new Date(3).toISOString()},
            {updateTime: new Date(2).toISOString()},
            {updateTime: new Date(1).toISOString()},
        ];
        const result = base.cutLastUpdate(testData, 2);
        expect(result).toEqual([{updateTime: new Date(3).toISOString()}]);
        expect(result).toHaveLength(1);
    })
});