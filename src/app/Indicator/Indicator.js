/**
 * Компонент отображения индикатора
 */
import React from 'react';
import {number, oneOf} from 'prop-types';
import classNames from 'classnames';
import styles from './Indicator.scss';

const Indicator = (props) => {
  const {
    percent,
    direction,
  } = props;
  const style = direction === -1 ?
    {left: `${100 + percent}%`,} :
    {right: `${100 - percent}%`,};
  const scaleClass = classNames({
    [styles.scale]: true,
    [styles.negative]: (direction === -1),
  });

  return (
    <div className={scaleClass}>
      <div className={styles.fill} style={style}>&nbsp;</div>
    </div>
  );
};

Indicator.propTypes = {
  percent: number.isRequired,
  direction: oneOf([1, -1])
};

export default Indicator;