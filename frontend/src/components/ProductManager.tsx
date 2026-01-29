import { useEffect, useState } from 'react';
import { Package, MoreHorizontal, CheckCircle, AlertCircle } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    category_slug: string;
    created_at: string;
    price: number;
}

export default function ProductManager() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        📦 Product Manager
                    </h2>
                    <p className="text-xs text-slate-500">Verified Database ({products.length} items)</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-slate-500 border-b border-slate-100">
                            <th className="py-2 font-medium">Product Name</th>
                            <th className="py-2 font-medium">Category</th>
                            <th className="py-2 font-medium">Date Added</th>
                            <th className="py-2 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {products.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-400">Database is empty.</td>
                            </tr>
                        )}
                        {products.map((product) => (
                            <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50 group">
                                <td className="py-3 pr-2">
                                    <div className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                                        {product.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400">ID: {product.id.slice(0, 8)}...</div>
                                </td>
                                <td className="py-3 px-2">
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                        {product.category_slug}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-slate-500 text-xs">
                                    {new Date(product.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-3 pl-2 text-right">
                                    <button className="text-indigo-600 hover:text-indigo-800 text-xs font-medium px-3 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                                        Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
