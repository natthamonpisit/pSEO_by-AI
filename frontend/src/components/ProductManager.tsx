import { useEffect, useState } from 'react';
import { Package, MoreHorizontal, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

// ... (rest of imports)

// ... (fetchProducts function)

// ... (JSX map)
<td className="py-3 pl-2 text-right">
    <Link
        to={`/compare/${product.id}`}
        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium px-3 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
    >
        Details
    </Link>
</td>
