"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/AdminLayout";
import withAdminAuth from '../../components/withAdminAuth';
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import ProductsForm from "../../components/ProductsForm";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    phone: "",
    state: "",
    brand: "",
    description: "",
    specification: "",
    stock: "",
    price: "",
    image_urls: [],
    category_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(category)");
    if (error) console.error("Error fetching products:", error);
    else setProducts(data);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) console.error("Error fetching categories:", error);
    else setCategories(data);
  };

  const handleDelete = async (productId) => {
    const confirmation = window.confirm("Are you sure you want to delete this product?");
    if (!confirmation) return;

    const { error } = await supabase.from("products").delete().eq("product_id", productId);

    if (error) {
      console.error("Error deleting product:", error.message);
      toast.error("Error deleting product: " + error.message);
    } else {
      toast.success("Product deleted successfully!");
      fetchProducts();
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      phone: product.phone,
      name: product.name,
      brand: product.brand,
      state: product.state,
      description: product.description,
      specification: product.specification,
      stock: product.stock,
      price: product.price,
      image_urls: product.image_urls,
      category_id: product.category_id,
    });
    setFiles([]);
    setPreviews(product.image_urls);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

      <ProductsForm categories={categories} editingProduct={editingProduct} newProduct={newProduct} files={files} previews={previews}/>

      {/* Product List */}
      {loading ? (
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      ) : (
        <ul className="mt-8 space-y-4">
          {products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            products.map((product) => (
              <li key={product.product_id} className="border p-4 rounded-lg">
                <AdminProductCard product={product} />
                <button onClick={() => handleEdit(product)} className="text-white bg-blue-500 mt-2 px-4 py-2 rounded">Edit</button>
                <button onClick={() => handleDelete(product.product_id)} className="text-white bg-red-500 px-4 py-2 rounded ml-2">Delete</button>
              </li>
            ))
          )}
        </ul>
      )}
    </AdminLayout>
  );
};

export default withAdminAuth(ManageProducts);
