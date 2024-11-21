// app/page.tsx
import { filterStocks } from './actions';

export default async function Home({
  searchParams
}: {
  searchParams: { query?: string }
}) {
  const initialQuery = `Market Capitalization > 100 AND
ROE > 15 AND
P/E Ratio < 20`;

  const query = searchParams.query || initialQuery;
  const { results, error } = await filterStocks(query);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Stock Query Tool</h1>
      
      <form>
        <div className="mb-4">
          <textarea
            name="query"
            defaultValue={query}
            className="w-full h-32 p-2 border rounded shadow-sm"
            placeholder="Enter your query here..."
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
        >
          Run Query
        </button>
      </form>
      
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
      
      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                {Object.keys(results[0]).map((header) => (
                  <th key={header} className="border border-gray-200 p-2 text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((stock, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {Object.values(stock).map((value, i) => (
                    <td key={i} className="border border-gray-200 p-2">
                      {typeof value === 'number' ? value.toFixed(2) : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}