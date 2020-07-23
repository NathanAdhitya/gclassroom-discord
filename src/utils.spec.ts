import * as base from "./utils";

describe("Convert Google's DueDate and DueTime format", () => {
    test("Treat optional time as 0", () => {
        const currentDate = new Date();
        const result = base.convertDue({
            year: currentDate.getUTCFullYear(),
            month: currentDate.getUTCMonth(),
            day: currentDate.getUTCDate(),
        }, {}).getTime();
        currentDate.setUTCHours(0, 0, 0, 0);
        expect(result).toBe(currentDate.getTime());
    });
});

