import { useEffect, useState } from 'react';
import { Package, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

interface Product {
    id: string;
    name: string;
    category_slug: string;
    created_at: string;
    price: number;
    has_content: boolean;
}

export default function ProductManager() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/products`);
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
                    <p className="text-xs text-slate-500">
                        {products.filter(p => p.has_content).length} Published / {products.length} Total
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-slate-500 border-b border-slate-100">
                            <th className="py-2 font-medium">Product Name</th>
                            <th className="py-2 font-medium">Category</th>
                            <th className="py-2 font-medium">Status</th>
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
                                    <div className="flex items-center gap-2">
                                        <div className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                                            {product.name}
                                        </div>
                                        {product.has_content && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                                                ✓ Live
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-slate-400">ID: {product.id.slice(0, 8)}...</div>
                                </td>
                                <td className="py-3 px-2">
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                        {product.category_slug}
                                    </span>
                                </td>
                                <td className="py-3 px-2">
                                    {product.has_content ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <CheckCircle size={12} />
                                            Published
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                            <AlertCircle size={12} />
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="py-3 px-2 text-slate-500 text-xs">
                                    {new Date(product.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-3 pl-2 text-right">
                                    {product.has_content ? (
                                        <Link
                                            to={`/compare/${product.id}`}
                                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium px-3 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                        >
                                            View Page
                                        </Link>
                                    ) : (
                                        <span className="text-slate-400 text-xs px-3 py-1">
                                            Processing...
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
