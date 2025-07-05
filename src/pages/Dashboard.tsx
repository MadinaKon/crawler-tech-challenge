import { columns } from "@/components/columns";
import { DataTable } from "@/components/data-table";
import { mockData } from "../data/mockData";

export default function Dashboard() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Web Crawler Dashboard</h1>
      <DataTable columns={columns} data={mockData} />
    </div>
  );
}
