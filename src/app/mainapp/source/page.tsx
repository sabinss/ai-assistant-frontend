import SourcesTable from "./SourceTable";
export default function Page() {
    return (
        <div className="w-full h-fit border bg-white px-5 py-6 rounded-lg">
            <h1 className="text-2xl">Sources</h1>
            <SourcesTable />
        </div>
    );
}
