/**
 * Главный компонент приложения
 */
import React from 'react';
import logo from '../logo.svg';
import styles from './App.scss';
import localeCompare from 'string-localecompare';

class App extends React.PureComponent {
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

  componentDidMount() {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        const rows = data.fa.fa_data.r;
        const maxABSDeltaPlan = this.getMaxABSDeltaPlan(rows);

        rows.map((rowData, rowIndex) => {
          rows[rowIndex].deviation = Math.ceil(rowData.fDeltaPlan * 100 / maxABSDeltaPlan);
        });

        this.setState({
          columns: data.fa.fa_data.axis.r,
          rows: rows,
        });
      })
      .catch(throws => console.log(throws))
  }

  getMaxABSDeltaPlan = rows => rows.reduce((maxDeltaPlan, curRow) => Math.abs(curRow.fDeltaPlan) > maxDeltaPlan ? Math.abs(curRow.fDeltaPlan) : maxDeltaPlan, 0);

  onSortData(event, key){
    const rows = this.state.rows;
    const sortableCol = this.state.sortableCol;
    const direction = !sortableCol && key !== Math.abs(sortableCol)-1 ? 1 : -Math.sign(sortableCol);

    rows.sort((a, b) => key === Infinity ?
      direction * (a.deviation - b.deviation) :
      direction * localeCompare(a.axis.r[key].sName_RU, b.axis.r[key].sName_RU)
    );
    this.setState({
      ...rows,
      sortableCol: direction * (key + 1)
    });
  }

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
      <div className={styles.App}>
        <header className={styles.header}>
          <img src={logo} className={styles.logo} alt="logo"/>
          <h1 className={styles.title}>Welcome to React</h1>
        </header>
        <p className={styles.intro}>
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        {columns.length > 0 && (
          <table>
            <thead>
            <tr>
              {columns.map((colData, index) => (
                <th onClick={e => this.onSortData(e, index)} key={`th${index}`} data-item={colData}>{colData.sAxisName}</th>
              ))}
              <th colSpan="3" onClick={e => this.onSortData(e, Infinity)}>Отклонение от плана, п.п.</th>
            </tr>
            </thead>
            <tbody>
            {rows.map((rowData, rowIndex) => {
              const directionPlan = Math.sign(rowData.fDeltaPlan);
              const deviation = rowData.deviation;

              return (
                <tr key={`tr${rowIndex}`} data-item={rowData}>
                  {columns.map((colData, colIndex) => {
                    const title = rowData.axis.r[colData.nAxisID - 2].sName_RU;

                    return (
                      <td key={`td${rowIndex}.${colIndex}`} data-title={title}>{title}</td>
                    )
                  })}
                  <td>{directionPlan < 0 ? deviation : 0}</td>
                  <td key={`td${rowIndex}.deviation`} data-title={deviation}>{deviation} п.п.</td>
                  <td>{directionPlan > 0 ? deviation : 0}</td>
                </tr>
              )
            })}

            </tbody>
          </table>
        )}
      </div>
    );
  }
}

export default App;
