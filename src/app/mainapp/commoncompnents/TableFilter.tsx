import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Search, SlidersHorizontal } from "lucide-react";
import useFormStore from "@/store/formdata";

interface TableFilterProps {
  FilterComponent?: React.ComponentType; // Assumes FilterComponent is a React component
  parentComponent: string; // Added prop to identify the parent component
}

const TableFilter: React.FC<TableFilterProps> = ({ FilterComponent, parentComponent }) => {
  const { userTable, updateUserTable, feedbackTable, updateFeedbackTable, sourceTable, updateSourceTable } = useFormStore();

  // Determine the current table and update function based on parentComponent
  let table = parentComponent === "userstable" ? userTable : parentComponent === "feedbacktable" ? feedbackTable : sourceTable;
  let updateTable = parentComponent === "userstable" ? updateUserTable : parentComponent === "feedbacktable" ? updateFeedbackTable : updateSourceTable;
  return (
    <div className="flex justify-between">
      <div className="flex w-1/3 items-center gap-4">
        <div className="flex  items-center rounded-md border border-slate-300 px-1 md:px-3">
          <Search strokeWidth="2" className="text-slate-400" />
          <input
            value={table.search}
            onChange={(e) => {
              updateTable('search', e.target.value)
              console.log("here i am", updateTable)

            }}
            type="text"
            className="md:px-2 py-2 text-xs md:text-sm outline-none"
            placeholder="Search ..."
          />
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-slate-400">
                <SlidersHorizontal strokeWidth="2" />
              </button>
            </PopoverTrigger>
            <PopoverContent sideOffset={250} side="left" className="w-auto p-4 absolute z-50" align="start">
              {FilterComponent && <FilterComponent />}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default TableFilter;