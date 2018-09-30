/**
 * Компонент таблицы для проведения сравнительных анализов
 */
import React from 'react';
import {arrayOf, number, shape, string} from 'prop-types';
import styles from './AnalysisTable.scss';
import localeCompare from 'string-localecompare';

class AnalysisTable extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      rows: [],
      sortableCol: null,
      error: false,
    };
  }

  componentDidCatch(error, info) {
    this.setState({error, info});
  }

  componentWillMount() {
    this.setState({
      columns: this.props.columns,
      rows: this.props.rows,
    });
  }

  componentWillReceiveProps(nextProps) {
    if(this.props !== nextProps) {
      this.setState({
        columns: nextProps.columns,
        rows: nextProps.rows,
        sortableCol: null,
      });
    }
  }

  onSortData = (event, key) => {
    const rows = this.state.rows;
    const sortableCol = this.state.sortableCol;
    const direction = !sortableCol && key !== Math.abs(sortableCol) - 2 ? 1 : -Math.sign(sortableCol);

    switch (key) {
      case Infinity+2: {
        rows.sort((a, b) => direction * (a.deviation - b.deviation));
        break;
      }
      case 1: {
        rows.sort((a, b) => direction * (a.sMeasDelta_RU - b.sMeasDelta_RU));
        break;
      }
      default: {
        rows.sort((a, b) => direction * localeCompare(a.axis.r[key - 2].sName_RU, b.axis.r[key - 2].sName_RU));
        break;
      }
    }

    this.setState({
      ...rows,
      sortableCol: direction * (key + 2)
    });
  };

  render() {
    if (this.state.info && this.state.info.componentStack) {
      console.log(this.state.info.componentStack);
    }

    if (this.state.error) {
      return <h2>Error: {this.state.error.toString()}</h2>;
    }

    const {
      columns,
      rows,
    } = this.state;

    return (
      <table>
        <thead>
        <tr>
          {columns.map((colData, index) => (
            <th onClick={e => this.onSortData(e, index+2)} key={`th${index+2}`}
                data-item={colData}>{colData.sAxisName}</th>
          ))}
          <th onClick={e => this.onSortData(e, 1)}>Валюта</th>
          <th colSpan="3" onClick={e => this.onSortData(e, Infinity)}>Отклонение от плана</th>
        </tr>
        </thead>
        <tbody>
        {rows.map((rowData, rowIndex) => {
          const fDeltaPlan = rowData.fDeltaPlan;
          const directionPlan = Math.sign(fDeltaPlan);
          const deviation = rowData.deviation;

          return (
            <tr key={`tr${rowIndex}`} data-item={rowData}>
              {columns.map((colData, colIndex) => {
                const title = rowData.axis.r[colData.nAxisID - 2].sName_RU;

                return (
                  <td key={`td${rowIndex}.${colIndex + 2}`} data-title={title}>{title}</td>
                )
              })}
              <td key={`td${rowIndex}.1`}>{rowData.sMeasDelta_RU}</td>
              <td key={`td${rowIndex}.neg`}>{directionPlan < 0 ? deviation : 0}</td>
              <td key={`td${rowIndex}.deviation`} data-title={fDeltaPlan}>{fDeltaPlan}</td>
              <td key={`td${rowIndex}.pos`}>{directionPlan > 0 ? deviation : 0}</td>
            </tr>
          )
        })}

        </tbody>
      </table>
    );
  }
}

AnalysisTable.propTypes = {

  columns: arrayOf(shape({
    sAxisName: string.isRequired,
    nAxisID: number.isRequired,
  })).isRequired,

  rows: arrayOf(shape({
    fDeltaPlan: number.isRequired,
    axis: shape({
      r: arrayOf(shape({
        'sName_RU': string.isRequired
      }))
    }),
    'sMeasDelta_RU': string.isRequired
  })).isRequired,

};

export default AnalysisTable;