/**
 * Copyright Schrodinger, LLC
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule columns
 */
import { createSelector } from 'reselect';
import partition from 'lodash/partition';
import WidthHelper from '../FixedDataTableWidthHelper';
import availableViewportWidth from './availableViewportWidth';

/**
 * A recursive column definition
 * @typedef  {Object}              RecursiveColumnType
 * @property {number}              flexGrow
 * @property {number}              width
 * @property {boolean}             [isGroup]
 * @property {RecursiveColumnType} [columns]
 */

/**
 * @param {{
 *   columnGroups: {
 *     columns: !Array.<RecursiveColumnType>,
 *   },
 *   width: number,
 * }} state
 * @return {{
 *   columnGroups: !Array.<RecursiveColumnType>,
 *   allColumns: !Array.<RecursiveColumnType>,
 *   fixedColumns: !Array.<RecursiveColumnType>,
 *   scrollableColumns: !Array.<RecursiveColumnType>,
 * }} A list of all the columns
 */
export default createSelector([
  state => state.columnGroups,
  availableViewportWidth,
], (columnGroups, availableViewportWidth) => {
  const { columnGroups: newColumnGroups, allColumns } = WidthHelper.adjustColumnGroupWidths(columnGroups, availableViewportWidth);
  const [fixedColumns, scrollableColumns] = partition(WidthHelper.getNestedColumns(newColumnGroups), column => column.fixed);
  return {
    columnGroups: newColumnGroups,
    allColumns,
    fixedColumns,
    scrollableColumns,
  };
});
