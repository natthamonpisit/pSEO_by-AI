import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { generateSpecTemplate } from '../services/geminiService';
import { Product, CategoryDefinition } from '../types';
import { Plus, Trash2, Search, Tag, Settings, FolderPlus, List, Loader2, Sparkles, MessageSquare } from 'lucide-react';

const ProductManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  
  // Product State
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Category State
  const [categories, setCategories] = useState<CategoryDefinition[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isGeneratingSpecs, setIsGeneratingSpecs] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setProducts(dataService.getProducts());
    setCategories(dataService.getCategories());
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      setIsGeneratingSpecs(true);
      
      try {
        // 🧠 AI MAGIC: Auto-Architect
        const { fields, tone } = await generateSpecTemplate(newCategoryName);
        
        // ✨ CLEAN CODE: Use Service
        dataService.addCategory(newCategoryName, fields, tone);
        
      } catch (error) {
        console.error("Failed to generate specs, using defaults", error);
        dataService.addCategory(newCategoryName); // Fallback
      }
      
      setIsGeneratingSpecs(false);
      setNewCategoryName('');
      refreshData();
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Are you sure? This might affect products linked to this category.')) {
      dataService.deleteCategory(id);
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Database Manager</h2>
          <p className="text-slate-500">Manage Products & Dynamic Taxonomy.</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-lg">
           <button 
             onClick={() => setActiveTab('products')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${
               activeTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             <Tag size={16} className="mr-2" />
             Products
           </button>
           <button 
             onClick={() => setActiveTab('categories')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${
               activeTab === 'categories' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             <Settings size={16} className="mr-2" />
             Categories
           </button>
        </div>
      </div>

      {activeTab === 'products' ? (
        // --- PRODUCT TABLE ---
        <>
          <div className="flex justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center shadow-sm font-medium">
              <Plus size={18} className="mr-2" />
              Add Product
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Tags (AI Metadata)</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center space-x-3">
                        <img src={product.imageUrl} alt="" className="w-10 h-10 rounded-md object-cover bg-slate-100 border border-slate-200" />
                        <span>{product.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border border-slate-200">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {product.tags.map((tag, i) => (
                            <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-red-500 transition-colors p-2">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center">
                           <Search size={48} className="mb-2 opacity-20" />
                           <p>No products found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        // --- CATEGORY MANAGER ---
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <FolderPlus className="mr-2 text-blue-500" />
              Add New Category
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Expand your business into new territories. 
              <span className="block mt-2 text-blue-600 font-semibold bg-blue-50 p-2 rounded border border-blue-100">
                ✨ AI will automatically determine specs & brand voice.
              </span>
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Drone, EV Car, Skincare" 
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  disabled={isGeneratingSpecs}
                />
              </div>
              <button 
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim() || isGeneratingSpecs}
                className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isGeneratingSpecs ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Analyzing Market...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2" size={18} />
                    Create Category
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
             {categories.map((cat) => (
               <div key={cat.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div className="bg-indigo-50 text-indigo-700 p-2 rounded-lg">
                       <Tag size={20} />
                    </div>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg">{cat.name}</h4>
                  <div className="flex items-center space-x-2 mb-3">
                    <code className="text-xs text-slate-400 bg-slate-50 px-1 py-0.5 rounded">/{cat.slug}</code>
                  </div>
                  
                  {/* AI Generated Tone */}
                  {cat.contentTone && (
                     <div className="mb-3 flex items-start text-xs text-slate-500 bg-purple-50 p-2 rounded border border-purple-100">
                        <MessageSquare size={14} className="mr-2 mt-0.5 text-purple-500 flex-shrink-0" />
                        <span>Voice: <span className="font-semibold text-purple-700">{cat.contentTone}</span></span>
                     </div>
                  )}

                  <div className="mt-auto border-t border-slate-100 pt-3">
                     <div className="text-xs font-semibold text-slate-500 uppercase flex items-center mb-2">
                        <List size={12} className="mr-1" /> Comparison Fields
                     </div>
                     <div className="flex flex-wrap gap-1">
                        {cat.comparisonFields?.slice(0, 4).map((field, i) => (
                           <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                             {field}
                           </span>
                        ))}
                        {cat.comparisonFields?.length > 4 && (
                          <span className="text-[10px] text-slate-400 pl-1">+{cat.comparisonFields.length - 4} more</span>
                        )}
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
