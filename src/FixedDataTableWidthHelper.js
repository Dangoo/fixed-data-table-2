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
 * @property {RecursiveColumnType} columns
 */

import forEach from 'lodash/forEach';
import reduce from 'lodash/reduce';

/**
 * @param  {!Array.<RecursiveColumnType>} columns
 * @return {number}
 */
function sumPropWidths(columns) {
  return reduce(columns, (accum, column) => accum + column.props.width, 0);
}

/**
 * @param  {!Array.<RecursiveColumnType>} columns
 * @return {number}
 */
function getTotalWidth(columns) {
  return reduce(columns, (accum, column) => accum + column.width, 0);
}

/**
 * @param  {!Array.<RecursiveColumnType>} columns
 * @return {number}
 */
function getTotalFlexGrow(columns) {
  return reduce(columns, (accum, column) => accum + (column.flexGrow || 0), 0);
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

function distributeFlexWidth(columns, flexWidth, flexGrow) {
  if (flexWidth <= 0) {
    return {
      columns,
      width: getTotalWidth(columns),
    };
  }

  let remainingFlexWidth = flexWidth;
  let remainingFlexGrow = flexGrow;

  const columnWidths = [];
  let totalWidth = 0;
  forEach(columns, (column) => {
    if (!column.flexGrow) {
      totalWidth += column.width;
      columnWidths.push(column.width);
      return;
    }

    const columnFlexWidth = Math.floor(
      (column.flexGrow / remainingFlexGrow) * remainingFlexWidth);
    const newColumnWidth = Math.floor(column.width + columnFlexWidth);
    totalWidth += newColumnWidth;

    remainingFlexGrow -= column.flexGrow;
    remainingFlexWidth -= columnFlexWidth;

    columnWidths.push(newColumnWidth);
  });

  return {
    columnWidths,
    width: totalWidth,
  };
}

/**
 * @param  {!Array.<RecursiveColumnType>} columns
 * @param  {number} expectedWidth
 * @return {!Array.<RecursiveColumnType>}
 */
function adjustColumnGroupWidths(columns, expectedWidth) {
  const allColumns = getNestedColumns(columns);

  let remainingFlexGrow = getTotalFlexGrow(allColumns);
  if (remainingFlexGrow === 0) {
    return allColumns;
  }

  const columnsWidth = getTotalWidth(allColumns);
  let remainingFlexWidth = Math.max(expectedWidth - columnsWidth, 0);

  forEach(columns, (column) => {
    const currentColumns = column.columns;
    const columnGroupFlexGrow = getTotalFlexGrow(currentColumns);
    const columnGroupFlexWidth = Math.floor(
      (columnGroupFlexGrow / remainingFlexGrow) * remainingFlexWidth);

    const newColumnSettings = distributeFlexWidth(
      currentColumns, columnGroupFlexWidth, columnGroupFlexGrow);
    remainingFlexGrow -= columnGroupFlexGrow;
    remainingFlexWidth -= columnGroupFlexWidth;

    column.width = newColumnSettings.width;

    forEach(newColumnSettings.columnWidths, (newWidth, index) => {
      currentColumns[index].width = newWidth;
    });
  });
  return allColumns;
}

const FixedDataTableWidthHelper = {
  sumPropWidths,
  getTotalWidth,
  adjustColumnGroupWidths,
};

module.exports = FixedDataTableWidthHelper;
