/**
 * Компонент таблицы
 */
import React from 'react';
import {arrayOf, number, shape, string} from 'prop-types';
import styles from './AnalysisTable.css';
import localeCompare from 'string-localecompare';
import Indicator from '../Indicator/Indicator';
import {ERR_TEXT} from '../common/settings';

// из-за столбца "Валюта" с ID = 1 остальные столбцы отсчитываются с 2
const COUNTDOWN_NUMBER_COL = 2;

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
    if (this.props !== nextProps) {
      this.setState({
        columns: nextProps.columns,
        rows: nextProps.rows,
        sortableCol: null,
      });
    }
  }

  /**
   * Функция сортировки
   * @param event - событие
   * @param {number} key - номер столбца
   */
  onSortData = (event, key) => {
    const rows = this.state.rows;
    const sortableCol = this.state.sortableCol;
    const direction = !sortableCol && key !== Math.abs(sortableCol) - COUNTDOWN_NUMBER_COL ? 1 : -Math.sign(sortableCol);

    try {
      switch (key) {
        case Infinity: { // последний столбец
          rows.sort((a, b) => direction * (a.deviationPercent - b.deviationPercent));
          break;
        }
        case 1: { // первый столбец
          rows.sort((a, b) => direction * (a.sMeasDelta_RU - b.sMeasDelta_RU));
          break;
        }
        default: { // другой столбец
          rows.sort((a, b) => direction * localeCompare(
            a.axis.r[key - COUNTDOWN_NUMBER_COL].sName_RU,
            b.axis.r[key - COUNTDOWN_NUMBER_COL].sName_RU
          ));
          break;
        }
      }

      this.setState({
        ...rows,
        sortableCol: direction * (key + COUNTDOWN_NUMBER_COL)
      });
    } catch (err) {
      console.log('Data is corrupted');
    }
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

    let firstColSortClass = null; // столбц "ВАЛЮТА" имеет ID = 1
    let lastColSortClass = null; // столбц "ОТКЛОНЕНИЕ ОТ ПЛАНА" имеет ID = Infinity

    if (Math.abs(this.state.sortableCol) === 1 + COUNTDOWN_NUMBER_COL) { // 1 (ID of first col) + 2
      firstColSortClass = Math.sign(this.state.sortableCol) > 0 ? styles.asc : styles.desc;
    }

    if (Math.abs(this.state.sortableCol) === Infinity) { // Infinity (ID of last col)
      lastColSortClass = Math.sign(this.state.sortableCol) > 0 ? styles.asc : styles.desc;
    }

    return (
      <table className={styles.table}>
        <thead>
        <tr>
          {columns.map((colData, index) => {
            let sortClass = null;

            // из-за столбца "ВАЛЮТА" с ID = 1 остальные столбцы отсчитываются с 2, за исключением последнего столбца, у которого ID = Infinity
            if (Math.abs(this.state.sortableCol) - COUNTDOWN_NUMBER_COL === index + COUNTDOWN_NUMBER_COL) {
              sortClass = Math.sign(this.state.sortableCol) > 0 ? styles.asc : styles.desc;
            }

            return (
              <th className={sortClass} onClick={e => this.onSortData(e, index + COUNTDOWN_NUMBER_COL)}
                  key={`th${index + COUNTDOWN_NUMBER_COL}`}
                  data-item={colData}>{colData.sAxisName}</th>
            )
          })}
          <th className={firstColSortClass} onClick={e => this.onSortData(e, 1)}>ВАЛЮТА</th>
          <th className={lastColSortClass} colSpan="3" onClick={e => this.onSortData(e, Infinity)}>ОТКЛОНЕНИЕ ОТ ПЛАНА</th>
        </tr>
        </thead>
        <tbody>
        {rows.map((rowData, rowIndex) => {
          const fDeltaPlan = rowData.fDeltaPlan;
          const directionPlan = Math.sign(fDeltaPlan);
          const deviationPercent = rowData.deviationPercent;
          const sMeasDeltaRU = rowData.sMeasDelta_RU ? rowData.sMeasDelta_RU : ERR_TEXT;
          const deviationValue = (directionPlan > 0 ? '+' : '-') + ' ' + Math.abs(fDeltaPlan);

          return (
            <tr key={`tr${rowIndex}`} data-item={rowData}>
              {columns.map((colData, colIndex) => {
                let title;

                try {
                  title = rowData.axis.r[colData.nAxisID - COUNTDOWN_NUMBER_COL].sName_RU;
                } catch (err) {
                  title = ERR_TEXT;
                }

                return (
                  <td key={`td${rowIndex}.${colIndex + COUNTDOWN_NUMBER_COL}`} data-title={title}>
                    <div className={styles['text-content']}>{title}</div>
                  </td>
                )
              })}
              <td key={`td${rowIndex}.1`}>{sMeasDeltaRU}</td>
              <td key={`td${rowIndex}.neg`}>
                <Indicator percent={directionPlan < 0 ? deviationPercent : 0} direction={-1}/>
              </td>
              <td key={`td${rowIndex}.deviationPercent`} data-title={fDeltaPlan}>{deviationValue}</td>
              <td key={`td${rowIndex}.pos`}>
                <Indicator percent={directionPlan > 0 ? deviationPercent : 0}/>
              </td>
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