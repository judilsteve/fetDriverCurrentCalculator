import * as React from 'react';
import { IterationResult } from './currentCalculator';

interface ResultsTableProps {
    data: IterationResult[]
}

export default class ResultsTable extends React.Component<ResultsTableProps, any> {
    render() {
        const table: React.CSSProperties = {
            display: "grid",
            width: "50%"
        };
        const iterationNumber: React.CSSProperties = {
            gridColumnStart: 1,
            gridColumnEnd: 2,
        }
        const currentCell: React.CSSProperties = {
            gridColumnStart: 2,
            gridColumnEnd: 3,
        };
        const voltageErrorCell: React.CSSProperties = {
            gridColumnStart: 3,
            gridColumnEnd: 4,
        };
        const derivationCell: React.CSSProperties = {
            gridColumnStart: 4,
            gridColumnEnd: 5,
        };
        const extrapolatedCell: React.CSSProperties = {
            ...derivationCell,
            color: "red",
        };
        const interpolatedCell: React.CSSProperties = {
            ...derivationCell,
            color: "green"
        };

        return(
            <div >
                <div style={table}>
                    <div style={iterationNumber}>Iteration Number</div>
                    <div style={currentCell}>Estimated Current Draw (A)</div>
                    <div style={voltageErrorCell}>Calculator Error (V)</div>
                    <div style={derivationCell}>Derivation Method</div>
                </div>
                {this.props.data.map( (result, index) => (
                    <div style={table} key={index}>
                        <div style={iterationNumber}>{index}</div>
                        <div style={currentCell}>{result.CurrentDraw.toFixed(5)}</div>
                        <div style={voltageErrorCell}>{result.VoltageError.toFixed(5)}</div>
                        <div style={result.WasExtrapolated ? extrapolatedCell : interpolatedCell}>{result.WasExtrapolated ? "Extrapolated" : "Interpolated"}</div>
                    </div>))}
            </div>
        );
    }
}