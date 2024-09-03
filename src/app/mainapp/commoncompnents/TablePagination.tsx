import React from "react";
import Pagination from "./pagination";
import Dropdown from "./DropDown";
import useFormStore from "@/store/formdata";

export default function TablePagination({ parentComponent }: { parentComponent: string }) {
  const { userTable, updateUserTable, feedbackTable, updateFeedbackTable, sourceTable, updateSourceTable } = useFormStore();

  let table = parentComponent === "userstable" ? userTable : parentComponent === "feedbacktable" ? feedbackTable : sourceTable;
  let updateTable = parentComponent === "userstable" ? updateUserTable : parentComponent === "feedbacktable" ? updateFeedbackTable : updateSourceTable;
  let data = parentComponent === "userstable" ? table.users : parentComponent === "feedbacktable" ? table.feedbacks : table.sources;

  const handleDropdownChange = (newLimit) => {
    updateTable("limit", parseInt(newLimit, 10));
    updateTable("page", 1); // Reset to first page upon limit change
  };

  const handlePageChange = (newPage) => {
    updateTable("page", newPage);
  };

  return (
    <div className="mt-4 flex md:flex-row gap-2 flex-col justify-between">
      <div className=" flex">
        <div className="w-24">
          <Dropdown options={["10", "50", "100"]} value={table.limit.toString()} onChange={handleDropdownChange} />
        </div>
        <span className="ml-3 text-nowrap">{`Total ${data?.length || 0} items`}</span>

      </div>
      <Pagination current={table.page} total={table.totalPages} onChange={handlePageChange} />
    </div>
  );
}