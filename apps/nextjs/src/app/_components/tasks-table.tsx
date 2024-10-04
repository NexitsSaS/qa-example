"use client";

import React from "react";

import type { Task } from "@acme/db/schema";
import { tasks } from "@acme/db/schema";

import type { getTasks, getViews } from "../_lib/queries";
import type { DataTableFilterField } from "~/types";
import { DataTableAdvancedToolbar } from "~/components/data-table/advanced/data-table-advanced-toolbar";
import { DataTable } from "~/components/data-table/data-table";
import { TableInstanceProvider } from "~/components/data-table/table-instance-provider";
import { useDataTable } from "~/hooks/use-data-table";
import { getPriorityIcon, getStatusIcon } from "../_lib/utils";
import { getColumns } from "./tasks-table-columns";
import { TasksTableFloatingBar } from "./tasks-table-floating-bar";
import { TasksTableToolbarActions } from "./tasks-table-toolbar-actions";

interface TasksTableProps {
  tasksPromise: ReturnType<typeof getTasks>;
  viewsPromise: ReturnType<typeof getViews>;
}

export function TasksTable({ tasksPromise, viewsPromise }: TasksTableProps) {
  const { data, pageCount } = React.use(tasksPromise);
  const views = React.use(viewsPromise);

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo(() => getColumns(), []);

  /**
   * This component can render either a faceted filter or a search filter based on the `options` prop.
   *
   * @prop options - An array of objects, each representing a filter option. If provided, a faceted filter is rendered. If not, a search filter is rendered.
   *
   * Each `option` object has the following properties:
   * @prop {string} label - The label for the filter option.
   * @prop {string} value - The value for the filter option.
   * @prop {React.ReactNode} [icon] - An optional icon to display next to the label.
   * @prop {boolean} [withCount] - An optional boolean to display the count of the filter option.
   */
  const filterFields: DataTableFilterField<Task>[] = [
    {
      label: "Title",
      value: "title",
      placeholder: "Filter titles...",
    },
    {
      label: "Status",
      value: "status",
      options: tasks.status.enumValues.map((status) => ({
        label: status[0]?.toUpperCase() + status.slice(1),
        value: status,
        icon: getStatusIcon(status),
        withCount: true,
      })),
    },
    {
      label: "Priority",
      value: "priority",
      options: tasks.priority.enumValues.map((priority) => ({
        label: priority[0]?.toUpperCase() + priority.slice(1),
        value: priority,
        icon: getPriorityIcon(priority),
        withCount: true,
      })),
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    // optional props
    filterFields,
    defaultPerPage: 10,
    defaultSort: "createdAt.desc",
  });

  return (
    <TableInstanceProvider table={table}>
      <DataTable
        table={table}
        floatingBar={<TasksTableFloatingBar table={table} />}
      >
        <DataTableAdvancedToolbar filterFields={filterFields} views={views}>
          <TasksTableToolbarActions table={table} />
        </DataTableAdvancedToolbar>
      </DataTable>
    </TableInstanceProvider>
  );
}