/**
 * Главный компонент приложения
 */
import React from 'react';
import styles from './App.css';
import AnalysisTable from './AnalysisTable/AnalysisTable';

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      rows: [],
      error: false,
    };
  }

  componentDidCatch(error, info) {
    this.setState({error, info});
  }

  componentDidMount() {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        this.setState({
          ...this.parseJSON(data)
        });
      })
      .catch(throws => console.log(throws))
  }

  /**
   * Парсер столбцов
   * @param {*[]} cols - данные о столбцах
   */
  parseCols = cols => cols.map(colData => ({
    ...colData,
    sAxisName: colData.sAxisName.toUpperCase()
  }));

  /**
   * Парсер строк
   * @param {*[]} rows - данных о строках
   * @param {number} maxABSDeltaPlan - максимальное по модулю значение
   */
  parseRows = (rows, maxABSDeltaPlan) => rows.map(rowData => {
    if (
      !rowData.hasOwnProperty('fDeltaPlan')
    ) {
      throw new Error('Data is corrupted');
    }

    return {
      ...rowData,
      deviationPercent: Math.ceil(rowData.fDeltaPlan * 100 / maxABSDeltaPlan)
    }
  });

  /**
   * Парсер данных JSON. Разбирает данные на столбцы и строки.
   * @param {{fa: {nDynamicTypeID: number, fa_data: {r: *[], axis: {r: *[]}}}}} data - данные JSON для таблицы
   * @returns {{columns: *, rows: *}}
   */
  parseJSON = data => {
    try {
      const defCols = data.fa.fa_data.axis.r;
      const columns = this.parseCols(defCols);
      const defRows = data.fa.fa_data.r;
      const rows = this.parseRows(defRows, this.getMaxABSDeltaPlan(defRows));

      return {columns, rows};
    } catch (err) {
      this.setState({
        error: 'Unknown format data'
      });
    }
  };

  /**
   * Геттер максимальное по модулю значение
   * @param {*[]} rows - данных о строках
   */
  getMaxABSDeltaPlan = rows => rows.reduce(
    (maxDeltaPlan, curRow) =>
      Math.abs(curRow.fDeltaPlan) > maxDeltaPlan ?
        Math.abs(curRow.fDeltaPlan) :
        maxDeltaPlan,
    0
  );

  render() {
    if (this.state.info && this.state.info.componentStack) {
      console.log(this.state.info.componentStack);
    }

    if (this.state.error) {
      return <div className={styles.App}>
        <h2>Error: {this.state.error.toString()}</h2>
      </div>;
    }

    const {
      columns,
      rows,
    } = this.state;

    return (
      <div className={styles.App}>
        {columns.length > 0 && (
          <AnalysisTable columns={columns} rows={rows}/>
        )}
      </div>
    );
  }
}

export default App;
