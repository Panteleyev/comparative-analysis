/**
 * Главный компонент приложения
 */
import React from 'react';
import styles from './App.scss';
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
        {columns.length > 0 && (
          <AnalysisTable columns={columns} rows={rows} />
        )}
      </div>
    );
  }
}

export default App;
