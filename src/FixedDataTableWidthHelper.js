/**
 * Copyright Schrodinger, LLC
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule FixedDataTableWidthHelper
 * @typechecks
 */

'use strict';

/**
 * A recursive column definition
 * @typedef  {Object}              RecursiveColumnType
 * @property {number}              flexGrow
 * @property {number}              width
 * @property {boolean}             [isGroup]
 * @property {RecursiveColumnType} [columns]
 */

/**
 * @param  {!Array.<RecursiveColumnType>} columns
 * @return {number}
 */
function sumPropWidths(columns) {
  return columns.reduce((accum, column) => accum + column.props.width, 0);
}

/**
 * @param  {!Array.<RecursiveColumnType>} columns
 * @return {number}
 */
function getTotalWidth(columns) {
  return columns.reduce((accum, column) => accum + column.width, 0);
}

/**
 * @param  {!Array.<RecursiveColumnType>} columns
 * @return {number}
 */
function getTotalFlexGrow(columns) {
  return columns.reduce((accum, column) => accum + (column.flexGrow || 0), 0);
}

/**
 * Flatten nested columns

 * @param  {!Array.<RecursiveColumnType>} columns
 * @param  {!Array.<RecursiveColumnType>} initial
 * @return {!Array.<RecursiveColumnType>}
 */
function getNestedColumns(columns, initial) {
  return columns.reduce((accum, currentElement) => {
    if (currentElement.isGroup) {
      return getNestedColumns(
        currentElement.columns,
        accum,
      );
    }

    return accum.concat(currentElement);
  }, initial || []);
}

/**
 * Calculate new width including flexWidth
 * 
 * @param  {number}  width 
 * @param  {number}  [columnFlexGrow=0] 
 * @param  {number}  unitFlexWidth 
 * @return {number}
 */
function addFlexWidth(width, columnFlexGrow = 0, unitFlexWidth) {
  const columnFlexWidth = columnFlexGrow * unitFlexWidth;
  return width + columnFlexWidth;
}


/**
 * @param  {!Array.<RecursiveColumnType>} columns
 * @param  {number} unitFlexWidth
 * @return {!Array.<RecursiveColumnType>}
 */
function adjustColumnWidths(columns, unitFlexWidth) {
  return columns.map((column) => {
    const newProps = {};

    if (column.isGroup) {
      // return deeper
      const newColumns = adjustColumnWidths(column.columns, unitFlexWidth);

      newProps.width = getTotalWidth(newColumns);
      newProps.columns = newColumns;
    } else {
      newProps.width = addFlexWidth(
        column.width,
        column.flexGrow,
        unitFlexWidth
      );
    }

    return Object.assign({}, column, newProps);
  });
}

/**
 * Divide total available flexWidth by total number of flexGrow
 * 
 * @param  {any}    columns 
 * @param  {number} totalFlexWidth
 * @return {number} 
 */
function calcUnitFlexWidth(totalFlexGrow, totalFlexWidth) {
  return (totalFlexGrow > 0) ? (totalFlexWidth / totalFlexGrow) : 0;
}

/**
 * @param  {!Array.<RecursiveColumnType>} columns 
 * @param  {number}                       expectedWidth 
 * @return {!Array.<RecursiveColumnType>}
 */
function adjustColumnGroupWidths(columnsList, expectedWidth) {
  const allColumns = getNestedColumns(columnsList.columns);
  const totalFlexWidth = expectedWidth - getTotalWidth(allColumns);
  const totalFlexGrow = getTotalFlexGrow(allColumns);
  const unitFlexWidth = calcUnitFlexWidth(totalFlexGrow, totalFlexWidth);
  const newColumnGroups = adjustColumnWidths(
    columnsList.columns,
    unitFlexWidth
  );

  return {
    columnGroups: newColumnGroups,
    allColumns: getNestedColumns(newColumnGroups),
  };
}

const FixedDataTableWidthHelper = {
  sumPropWidths,
  getTotalWidth,
  adjustColumnGroupWidths,
  getNestedColumns,
};

module.exports = FixedDataTableWidthHelper;
