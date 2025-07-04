import { useParams } from "react-router-dom";

export default function Detail() {
  const { id } = useParams();

  console.log(id)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Crawler Result Details</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">ID: {id}</p>
        <p className="text-gray-600">Detailed view coming soon...</p>
      </div>
    </div>
  );
}
