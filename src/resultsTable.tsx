import { h, Component } from 'preact';
import { IterationResult } from './currentCalculator';

interface ResultsTableProps {
    data: IterationResult[]
}

export default class ResultsTable extends Component<ResultsTableProps, any> {
    render() {
        return(
            <div >
                <div class="table">
                    <div class="iterationNumber">Iteration Number</div>
                    <div class="currentCell">Estimated Current Draw (A)</div>
                    <div class="voltageErrorCell">Calculator Error (V)</div>
                    <div class="derivationCell">Derivation Method</div>
                </div>
                {this.props.data.map( (result, index) => (
                    <div class="table" key={index.toString()}>
                        <div class="iterationNumber">{index}</div>
                        <div class="currentCell">{result.CurrentDraw.toFixed(5)}</div>
                        <div class="voltageErrorCell">{result.VoltageError.toFixed(5)}</div>
                        <div class={result.WasExtrapolated ? "extrapolatedCell derivationCell" : "interpolatedCell derivationCell"}>{result.WasExtrapolated ? "Extrapolated" : "Interpolated"}</div>
                    </div>))}
            </div>
        );
    }
}