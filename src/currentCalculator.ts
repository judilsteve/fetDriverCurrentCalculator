function IndexOfFirst<T>(list: Array<T>, predicate: (T) => boolean): number {
    for(let i = 0; i < list.length; i++) {
        if(predicate(list[i])) return i;
    }
    return -1;
}

export class EmitterDataPoint {
    ForwardVoltage: number; // Volts
    CurrentDraw: number; // Amps
    Output: number; // Lumens

    constructor(forwardVoltage: number, currentDraw: number, output: number) {
        this.ForwardVoltage = forwardVoltage;
        this.CurrentDraw = currentDraw;
        this.Output = output;
    }
}

export class Battery {
    Voltage: number; // Volts
    InternalResistance: number; // Ohms

    constructor(voltage: number, internalResistance: number) {
        this.Voltage = voltage;
        this.InternalResistance = internalResistance;
    }
}

class EstimatedResult {
    Result: number;
    WasExtrapolated: boolean; // True if @Result was extrapolated, false if it was interpolated

    constructor(result: number, wasExtrapolated: boolean) {
        this.Result = result;
        this.WasExtrapolated = wasExtrapolated;
    }
}

export class EmitterDataTable {
    SortedByCurrentAscending: Array<EmitterDataPoint>;
    InitialVoltageGradient: number;
    FinalVoltageGradient: number;

    constructor(dataPoints : Array<EmitterDataPoint>) {
        this.SortedByCurrentAscending = dataPoints.sort( (p1, p2) =>
            p1.CurrentDraw - p2.CurrentDraw);

        const first = this.SortedByCurrentAscending[0];
        const second = this.SortedByCurrentAscending[1];
        let dV = (second.ForwardVoltage - first.ForwardVoltage);
        let dA = (second.CurrentDraw - first.CurrentDraw);
        this.InitialVoltageGradient = dV / dA;

        const last = this.SortedByCurrentAscending[this.SortedByCurrentAscending.length - 1];
        const secondLast = this.SortedByCurrentAscending[this.SortedByCurrentAscending.length - 2];
        dV = (last.ForwardVoltage - secondLast.ForwardVoltage);
        dA = (last.CurrentDraw - secondLast.CurrentDraw);
        this.FinalVoltageGradient = dV / dA;
    }

    /// <summary>
    /// Calculates forward voltage that will draw the given current
    /// by looking up values in the data table, interpolating
    /// or extrapolating if necessary.
    /// </summary>
    /// <param name="current">Current draw (A) of the emitter</param>
    /// <returns>Estimated forward voltage (V) at which the emitter will draw the given current</returns>
    getForwardVoltageForCurrentDraw(current: number): EstimatedResult {
        const indexOfFirst = IndexOfFirst(this.SortedByCurrentAscending, p =>
            p.CurrentDraw >= current);

        if(indexOfFirst == this.SortedByCurrentAscending.length - 1 || indexOfFirst == -1) {
            // The last (or none) of the data points had current draw at or above the given current
            // Extrapolate the value from the data point with the highest current
            const lastPoint = this.SortedByCurrentAscending[this.SortedByCurrentAscending.length - 1];
            return new EstimatedResult (
                lastPoint.ForwardVoltage + this.FinalVoltageGradient * (current - lastPoint.CurrentDraw),
                true);
        } else if(indexOfFirst == 0) {
            // The first data point had current draw at or above the given current
            // Extrapolate the value from the data point with the lowest current
            const firstPoint = this.SortedByCurrentAscending[0];
            return new EstimatedResult (
                firstPoint.ForwardVoltage - this.InitialVoltageGradient * (firstPoint.CurrentDraw - current),
                true);
        }

        const lowerPoint = this.SortedByCurrentAscending[indexOfFirst - 1];
        const upperPoint = this.SortedByCurrentAscending[indexOfFirst];
        let forwardVoltage;

        // Avoid dividing by zero
        if(upperPoint.CurrentDraw - lowerPoint.CurrentDraw == 0.0) {
            forwardVoltage = (upperPoint.ForwardVoltage + lowerPoint.ForwardVoltage) / 2.0;
        } else {
            const dV = upperPoint.ForwardVoltage - lowerPoint.ForwardVoltage;
            const dA = upperPoint.CurrentDraw - lowerPoint.CurrentDraw;
            const interpolationGradient = dV / dA;
            forwardVoltage = lowerPoint.ForwardVoltage + (current - lowerPoint.CurrentDraw) * interpolationGradient;
        }

        return new EstimatedResult (
            forwardVoltage,
            false);
    }
}

export class IterationResult {
    CurrentDraw: number;
    VoltageError: number;
    WasExtrapolated: boolean;

    constructor(currentDraw: number, voltageError: number, wasExtrapolated: boolean) {
        this.CurrentDraw = currentDraw;
        this.VoltageError = voltageError;
        this.WasExtrapolated = wasExtrapolated;
    }
}

export class CurrentCalculator {
    Battery: Battery;
    Emitter: EmitterDataTable;
    EmitterCount: number;
    EmittersInParallel: boolean;

    constructor(battery: Battery, emitter: EmitterDataTable, emitterCount: number, emittersInParallel: boolean) {
        this.Battery = battery;
        this.Emitter = emitter;
        this.EmitterCount = emitterCount;
        this.EmittersInParallel = emittersInParallel;
    }

    tryCurrent(current: number): IterationResult {
        /**
         * The following equation describes the circuit:
         *
         *     V_cell = I_total*R_internal + V_led(I_total)
         *
         * where V_led (the forward voltage of the LED) is a function of
         * the current through the circuit. Rearranging slightly:
         *
         *     V_led(I_total) = V_cell - I_total*R_internal
         *
         * Since V_led is a table of values from experimental data,
         * gradient descent is used to solve for I_total.
         */

        // Calculate the right hand side of the rearranged equation
        var rightHandForwardVoltage = this.Battery.Voltage - (current * this.Battery.InternalResistance);

        // Now do an interpolated/extrapolated lookup into the LED table to calculate the right hand side
        const currentPerEmitter = this.EmittersInParallel ? current / this.EmitterCount : current;
        const result = this.Emitter.getForwardVoltageForCurrentDraw(currentPerEmitter);
        const leftHandForwardVoltage = this.EmittersInParallel ? result.Result : result.Result * this.EmitterCount;
        const wasExtrapolated = result.WasExtrapolated;
        const voltageError = Math.abs(rightHandForwardVoltage - leftHandForwardVoltage);

        return new IterationResult(current, voltageError, wasExtrapolated);
    }

    sampleForLowestError(
        minCurrent: number,
        maxCurrent: number,
        samples: number): IterationResult[] {

        let lowestError = new IterationResult(Number.NaN, Number.POSITIVE_INFINITY, false);
        let secondLowestError = new IterationResult(Number.NaN, Number.POSITIVE_INFINITY, false);
        for(let current = minCurrent; current <= maxCurrent; current += (maxCurrent - minCurrent) / samples) {
            const result = this.tryCurrent(current);

            if(result.VoltageError < lowestError.VoltageError) {
                secondLowestError = lowestError;
                lowestError = result;
            }
        }
        return [ lowestError, secondLowestError ];
    }

    estimateCurrent(
        twoBestGuesses: IterationResult[],
        moveSpeed: number,
        iterations: number,
        errorThreshold: number) {

        let allIterations = twoBestGuesses;

        for(let iteration = 0; iteration < iterations; iteration++) {
            const lastIteration = allIterations[allIterations.length - 1];
            const secondLastIteration = allIterations[allIterations.length - 2];

            const voltageErrorGradient = (lastIteration.VoltageError - secondLastIteration.VoltageError) / (lastIteration.CurrentDraw - secondLastIteration.CurrentDraw);
            const nextCurrentToTry = lastIteration.CurrentDraw - (voltageErrorGradient * moveSpeed);

            allIterations.push(this.tryCurrent(nextCurrentToTry));

            if(allIterations[allIterations.length - 1].VoltageError <= errorThreshold) {
                break;
            }
        }

        return allIterations;
    }
}
