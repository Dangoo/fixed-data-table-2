/**
 * Copyright Schrodinger, LLC
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule columnDetails
 */
import { createSelector } from 'reselect';
import forEach from 'lodash/forEach';
import columnsSelector from './columns';

/**
 * @typedef {{
 *   props: !Object,
 *   template: ReactElement,
 * }}
 */
let cellTemplate;

/**
 * @typedef {{
 *   cell: !Array.<cellDetails>,
 *   footer: !Array.<cellDetails>,
 *   header: !Array.<cellDetails>,
 * }}
 */
let columnTemplates;

/**
 * @param {{
 *   columns: !Array.<{
 *     columns: !Array.<{
 *       flexGrow: number,
 *       width: number
 *     }>,
 *   }>,
 *   elementTemplates: {
 *     cell: !Array.<ReactElement>,
 *     footer: !Array.<ReactElement>,
 *     groupHeader !Array.<ReactElement>,
 *     header !Array.<ReactElement>,
 *   },
 *   width: number,
 * }} state
 * @return {{
 *   fixedColumnGroups: !Array.<cellTemplate>,
 *   scrollableColumnGroups: !Array.<cellTemplate>,
 *   fixedColumns: !Array.<columnTemplates>,
 *   scrollableColumns: !Array.<columnTemplates>,
 * }} Lists of details for the fixed and scrollable columns and column groups
 */
export default createSelector([
  columnsSelector,
  state => state.columnGroups.elementTemplates,
], (columns, elementTemplates) => {
  const { columnGroups, allColumns } = columns;

  // Ugly transforms to extract data into a row consumable format.
  // TODO (jordan) figure out if this can efficiently be merged with the result of convertColumnElementsToData.
  const fixedColumnGroups = [];
  const scrollableColumnGroups = [];
  const fixedColumns = {
    cell: [],
    header: [],
    footer: [],
  };
  const scrollableColumns = {
    cell: [],
    header: [],
    footer: [],
  };

  forEach(columnGroups, (column, index) => {
    // Array.prototype.push.apply(columnsElementTemplates, column.elementTemplates);

    if (column.isGroup) {
      const groupData = {
        props: column,
        template: elementTemplates.header[index],
      };

      if (column.fixed) {
        fixedColumnGroups.push(groupData);
      } else {
        scrollableColumnGroups.push(groupData);
      }

      column.columns.forEach((col, i) => {
        assignCols(col, column.elementTemplates, i, fixedColumns, scrollableColumns);
      });
    } else {
      assignCols(column, elementTemplates, index, fixedColumns, scrollableColumns);
    }
  });

  return {
    fixedColumnGroups,
    fixedColumns,
    scrollableColumnGroups,
    scrollableColumns,
  };
});

function assignCols(column, templates, counter, fixed, scrollable) {
  let columnContainer = scrollable;
  if (column.fixed) {
    columnContainer = fixed;
  }

  columnContainer.cell.push({
    props: column,
    template: templates.cell[counter],
  });
  columnContainer.header.push({
    props: column,
    template: templates.header[counter],
  });
  columnContainer.footer.push({
    props: column,
    template: templates.footer[counter],
  });
}
