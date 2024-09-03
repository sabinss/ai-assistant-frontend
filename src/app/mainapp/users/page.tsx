"use client"
import UsersTable from "./UserTable";


interface PageProps {
}

const Page: React.FC<PageProps> = () => {

  return (
    <div className="h-fit w-full rounded-lg border bg-white px-5 py-6">
      <h1 className="text-2xl">Users</h1>
      <>
        <UsersTable />
      </>
    </div>
  );
};


export default Page;
