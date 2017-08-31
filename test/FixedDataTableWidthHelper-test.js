/**
 * Copyright Schrodinger, LLC
 */
import { assert } from 'chai';
import FixedDataTableWidthHelper from '../src/FixedDataTableWidthHelper';

describe('FixedDataTableWidthHelper', () => {
  let fixedColumns;
  let scrollableGroup1;
  let columnGroups;
  let innerGroup;

  beforeEach(() => {
    fixedColumns = [
      {
        id: 1,
        fixed: true,
        flexGrow: 10,
        width: 50,
      }, {
        id: 2,
        fixed: true,
        width: 60,
      },
    ];

    innerGroup = {
      isGroup: true,
      columns: [
        {
          id: 5,
          fixed: false,
          flexGrow: 1,
          width: 100,
        },
        {
          id: 6,
          fixed: false,
          flexGrow: 1,
          width: 100,
        },
      ],
    };

    scrollableGroup1 = {
      isGroup: true,
      columns: [
        {
          id: 3,
          fixed: false,
          flexGrow: 5,
          width: 50,
        },
        {
          id: 4,
          fixed: false,
          flexGrow: 10,
          width: 20,
        },
      ],
    };

    columnGroups = {
      columns: [...fixedColumns, scrollableGroup1],
    };
  });

  describe('adjustColumnGroupWidths', () => {
    it('should return correct structure for single nesting level', () => {
      const result = FixedDataTableWidthHelper.adjustColumnGroupWidths(
        columnGroups,
        180
      );
      assert.deepEqual(result.columnGroups, [
        { id: 1, fixed: true, flexGrow: 10, width: 50 },
        { id: 2, fixed: true, width: 60 },
        {
          isGroup: true,
          width: 70,
          columns: [
            { id: 3, fixed: false, flexGrow: 5, width: 50 },
            { id: 4, fixed: false, flexGrow: 10, width: 20 },
          ],
        },
      ]);
    });

    it('should return correct structure for multiple nesting levels', () => {
      columnGroups.columns[2].columns.push(innerGroup);

      const result = FixedDataTableWidthHelper.adjustColumnGroupWidths(
        columnGroups,
        380
      );
      assert.deepEqual(result.columnGroups, [
        { id: 1, fixed: true, flexGrow: 10, width: 50 },
        { id: 2, fixed: true, width: 60 },
        {
          isGroup: true,
          width: 270,
          columns: [
            { id: 3, fixed: false, flexGrow: 5, width: 50 },
            { id: 4, fixed: false, flexGrow: 10, width: 20 },
            {
              isGroup: true,
              width: 200,
              columns: [
                { id: 5, fixed: false, flexGrow: 1, width: 100 },
                { id: 6, fixed: false, flexGrow: 1, width: 100 },
              ],
            },
          ],
        },
      ]);
    });

    it('should not mutate the original object', () => {
      FixedDataTableWidthHelper.adjustColumnGroupWidths(
        columnGroups,
        180
      );

      assert.deepEqual(columnGroups, {
        columns: [
          { id: 1, fixed: true, flexGrow: 10, width: 50 },
          { id: 2, fixed: true, width: 60 },
          {
            isGroup: true,
            columns: [
              { id: 3, fixed: false, flexGrow: 5, width: 50 },
              { id: 4, fixed: false, flexGrow: 10, width: 20 },
            ],
          },
        ],
      });
    });
  });
});
