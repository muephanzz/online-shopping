// pages/admin/products.js
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/AdminLayout";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error("Error fetching products:", error);
    else setProducts(data);
    setLoading(false);
  };

  // Handle input changes
  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  // Add a new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("products").insert([newProduct]);
    if (error) alert("Error adding product: " + error.message);
    else {
      alert("Product added successfully!");
      fetchProducts();
      setNewProduct({ name: "", description: "", price: "", image_url: "" });
    }
  };

  // Delete a product
  const handleDelete = async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert("Error deleting product: " + error.message);
    else fetchProducts();
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

      {/* Add Product Form */}
      <form onSubmit={handleAddProduct} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={newProduct.description}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={newProduct.price}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          name="image_url"
          placeholder="Image URL"
          value={newProduct.image_url}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Add Product
        </button>
      </form>

      {/* Product List */}
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {products.map((product) => (
            <li key={product.id} className="border p-4 rounded-lg">
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p>{product.description}</p>
              <p className="text-green-600">${product.price}</p>
              <button
                onClick={() => handleDelete(product.id)}
                className="text-red-500 mt-2"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
}
