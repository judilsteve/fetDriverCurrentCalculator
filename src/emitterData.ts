import { EmitterDataTable, EmitterDataPoint } from './currentCalculator'

export const EMITTERS: { [name: string] : EmitterDataTable } = {
    "Nichia 319A 6500K R7000 D440 (Texas_Ace)": new EmitterDataTable([
        new EmitterDataPoint(2.75, 0.15,   91),
        new EmitterDataPoint(2.79, 0.25,  140),
        new EmitterDataPoint(2.89, 0.50,  249),
        new EmitterDataPoint(2.95, 0.75,  350),
        new EmitterDataPoint(3.00, 1.00,  445),
        new EmitterDataPoint(3.05, 1.25,  531),
        new EmitterDataPoint(3.09, 1.50,  616),
        new EmitterDataPoint(3.12, 1.75,  695),
        new EmitterDataPoint(3.15, 2.00,  772),
        new EmitterDataPoint(3.18, 2.25,  843),
        new EmitterDataPoint(3.20, 2.50,  911),
        new EmitterDataPoint(3.22, 2.75,  975),
        new EmitterDataPoint(3.25, 3.00, 1038),
        new EmitterDataPoint(3.26, 3.25, 1095),
        new EmitterDataPoint(3.28, 3.50, 1151),
        new EmitterDataPoint(3.30, 3.75, 1200),
        new EmitterDataPoint(3.32, 4.00, 1248),
        new EmitterDataPoint(3.32, 4.25, 1291),
        new EmitterDataPoint(3.34, 4.50, 1331),
        new EmitterDataPoint(3.35, 4.75, 1365),
        new EmitterDataPoint(3.36, 5.00, 1394),
        new EmitterDataPoint(3.37, 5.25, 1419),
        new EmitterDataPoint(3.39, 5.50, 1441),
        new EmitterDataPoint(3.40, 5.75, 1453),
        new EmitterDataPoint(3.40, 6.00, 1462),
        new EmitterDataPoint(3.42, 6.25, 1462),
        new EmitterDataPoint(3.43, 6.50, 1460),
        new EmitterDataPoint(3.43, 6.75, 1449),
        new EmitterDataPoint(3.44, 7.00, 1434)])
};