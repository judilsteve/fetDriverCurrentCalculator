import * as React from 'react';
import { Battery, CurrentCalculator, IterationResult } from './currentCalculator';
import { EMITTERS } from './emitterData';
import ResultsTable from './resultsTable';

interface CalculatorUIState {
    cellVoltage: number,
    cellInternalResistance: number,
    cellCount: number,
    cellWiring: string,
    emitterType: string,
    emitterCount: number,
    emitterWiring: string,
    searchRangeMin: number,
    searchRangeMax: number,
    initialSamples: number,
    refinementRate: number,
    refinementIterations: number,
    refinementThreshold: number,
    calculationResults: IterationResult[]
};

export default class CalculatorUI extends React.Component<any, CalculatorUIState> {
    constructor(props: any) {
        super(props);
        this.state = {
            cellVoltage: 4.2,
            cellInternalResistance: 0.05,
            cellCount: 1,
            cellWiring: "parallel",
            emitterType: "Nichia 319A 6500K R7000 D440 (Texas_Ace)",
            emitterCount: 3,
            emitterWiring: "parallel",
            searchRangeMin: 0.01,
            searchRangeMax: 30,
            initialSamples: 60,
            refinementRate: 0.1,
            refinementIterations: 200,
            refinementThreshold: 0.0005,
            calculationResults: []
        };
    }

    runCalculator() {
        const  parallel = this.state.cellWiring == "parallel";
        const batteryVoltage = parallel ?
            this.state.cellVoltage :
            this.state.cellVoltage * this.state.cellCount;
        const batteryInternalResistance = parallel ?
            1 / (this.state.cellCount / this.state.cellInternalResistance) :
            this.state.cellInternalResistance * this.state.cellCount;

        const calculator = new CurrentCalculator(
            new Battery(batteryVoltage, batteryInternalResistance),
            EMITTERS[this.state.emitterType],
            this.state.emitterCount,
            this.state.emitterWiring == "parallel"
        );

        const twoBestGuesses = calculator.sampleForLowestError(
            this.state.searchRangeMin,
            this.state.searchRangeMax,
            this.state.initialSamples
        );

        const calculationResults = calculator.estimateCurrent(
            twoBestGuesses,
            this.state.refinementRate,
            this.state.refinementIterations,
            this.state.refinementThreshold);

        this.setState({
            calculationResults
        });
    }

    updateConfig(e, mustBeInteger: boolean, mustBePositive: boolean) {
        const target = e.target;
        const newValue = target.value;
        const stateField = target.name;

        if(mustBeInteger && !Number.isInteger(Number.parseFloat(newValue))) {
            return;
        }
        if(mustBePositive && newValue <= 0) {
            return;
        }

        this.setState({
            [stateField]: newValue
        });
    }

    render() {
        const configBlock = {
            display: "grid",
            width: "50%"
        };
        const configTitle = {
            gridColumnStart: 1,
            gridColumnEnd: 2
        };
        const configInput = {
            gridColumnStart: 2,
            gridColumnEnd: 3
        };

        // TODO Refactor each configuration block into its own component,
        // because this is atrocious
        return(
            <div>
                <h4>Battery Configuration:</h4>
                <div style={configBlock}>

                    <div style={configTitle}>Cell voltage (V)</div>
                    <div style={configInput}>
                        <input
                            type="number"
                            name="cellVoltage"
                            value={this.state.cellVoltage}
                            step={0.1}
                            onChange={(e) => this.updateConfig(e, false, true)}/>
                    </div>

                    <div style={configTitle}>Internal resistance (Ohms)</div>
                    <div style={configInput}>
                        <input
                            type="number"
                            name="cellInternalResistance"
                            step={0.01}
                            value={this.state.cellInternalResistance}
                            onChange={(e) => this.updateConfig(e, false, true)}/>
                    </div>

                    <div style={configTitle}>Number of cells</div>
                    <div style={configInput}>
                        <input
                            type="number"
                            name="cellCount"
                            value={this.state.cellCount}
                            onChange={(e) => this.updateConfig(e, true, true)}/>
                    </div>

                    <div style={configTitle}>Cell configuration:</div>
                    <div style={configInput}>
                        <label>Parallel <input
                            type="radio"
                            value="parallel"
                            name="cellWiring"
                            checked={this.state.cellWiring == "parallel"}
                            onChange={(e) => this.updateConfig(e, false, false)}/>
                        </label>
                        <label>Series <input
                            type="radio"
                            value="series"
                            name="cellWiring"
                            checked={this.state.cellWiring == "series"}
                            onChange={(e) => this.updateConfig(e, false, false)}/>
                        </label>
                    </div>

                </div>

                <div style={configBlock}>
                    <h4>Emitter Configuration:</h4>

                    <div style={configTitle}>Emitter</div>
                    <div style={configInput}>
                        <select
                            value={this.state.emitterType}
                            name="emitterType"
                            onChange={(e) => this.updateConfig(e, false, false)}>
                                {Object.keys(EMITTERS).map( name => <option value={name} key={name}>{name}</option> )}
                        </select>
                    </div>

                    <div style={configTitle}>Number of emitters</div>
                    <div style={configInput}>
                        <input
                            type="number"
                            value={this.state.emitterCount}
                            name="emitterCount"
                            onChange={(e) => this.updateConfig(e, true, true)}/>
                    </div>

                    <div style={configTitle}>Emitter configuration</div>
                    <div style={configInput}>
                        <label>Parallel<input
                            type="radio"
                            value="parallel"
                            name="emitterWiring"
                            checked={this.state.emitterWiring == "parallel"}
                            onChange={(e) => this.updateConfig(e, false, false)}/>
                        </label>
                        <label>Series<input
                            type="radio"
                            value="series"
                            name="emitterWiring"
                            checked={this.state.emitterWiring == "series"}
                            onChange={(e) => this.updateConfig(e, false, false)}/>
                        </label>
                    </div>

                </div>

                <div style={configBlock}>
                    <h4>Gradient Descent Configuration:</h4>

                    <div style={configTitle}>Search range min (A)</div>
                    <div style={configInput}>
                        <input
                            type="number"
                            name="searchRangeMin"
                            value={this.state.searchRangeMin}
                            onChange={(e) => this.updateConfig(e, false, true)}/><br/>
                    </div>

                    <div style={configTitle}>Search range max (A)</div>
                    <div style={configInput}>
                        <input
                            type="number"
                            name="searchRangeMax"
                            value={this.state.searchRangeMax}
                            onChange={(e) => this.updateConfig(e, false, true)}/><br/>
                    </div>

                    <div style={configTitle}>Initial samples</div>
                    <div style={configInput}>
                        <input
                            type="number"
                            name="initialSamples"
                            step={10}
                            value={this.state.initialSamples}
                            onChange={(e) => this.updateConfig(e, true, true)}/><br/>
                    </div>

                    <div style={configTitle}>Refinement rate</div>
                    <div style={configInput}>
                        <input
                            type="number"
                            name="refinementRate"
                            value={this.state.refinementRate}
                            step={0.1}
                            onChange={(e) => this.updateConfig(e, false, true)}/><br/>
                    </div>

                    <div style={configTitle}>Refinement iterations</div>
                    <div style={configInput}>
                        <input
                            type="number"
                            name="refinementIterations"
                            step={10}
                            value={this.state.refinementIterations}
                            onChange={(e) => this.updateConfig(e, true, true)}/><br/>
                    </div>

                    <div style={configTitle}>Refinement threshold (min error, V)</div>
                    <div style={configInput}>
                        <input
                            type="number"
                            name="refinementThreshold"
                            value={this.state.refinementThreshold}
                            step={0.0001}
                            onChange={(e) => this.updateConfig(e, false, true)}/>
                    </div>

                </div>

                <button
                    type="button"
                    onClick={() => this.runCalculator()}>
                    Calculate Current Draw
                </button>

                <h4>Results:</h4>
                <ResultsTable data={this.state.calculationResults}/>
        </div>);
    }
}