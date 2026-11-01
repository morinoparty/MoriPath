import APCACheck, { type ConformanceThresholdFn } from "./apca";

const APCABronzeConformanceThresholdFn: ConformanceThresholdFn = (fontSize) => {
    const size = Number.parseFloat(fontSize);
    switch (true) {
        case size >= 32:
            return 45;
        case size >= 16:
            return 60;
        default:
            return 75;
    }
};

export const bronze = APCACheck("bronze", APCABronzeConformanceThresholdFn);
