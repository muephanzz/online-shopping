"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminLayout from "@/components/AdminLayout";
import withAdminAuth from "@/components/withAdminAuth";
import toast from "react-hot-toast";

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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(category)");
    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data);
    }
  };

  const handleChange = (e) => {
    setNewProduct((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const removeImage = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const filePreviews = selectedFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePreviews).then(setPreviews);
  };

  const uploadImages = async () => {
    const sanitizeFileName = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const imageUrls = await Promise.all(
      files.map(async (file) => {
        const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(`images/${fileName}`, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData, error: urlError } = supabase.storage
          .from("products")
          .getPublicUrl(`images/${fileName}`);

        if (urlError) throw new Error(urlError.message);

        return urlData.publicUrl;
      })
    );

    return imageUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, brand, state, stock, price, category_id } = newProduct;

    if (!name || !brand || !state || !stock || !price || !category_id) {
      toast.error("Please fill in all fields!");
      return;
    }

    setUploading(true);
    try {
      let imageUrls = editingProduct?.image_urls || [];

      if (files.length > 0) {
        imageUrls = await uploadImages();
      }

      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        image_urls: imageUrls,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("product_id", editingProduct.product_id);

        if (error) throw new Error(error.message);

        toast.success("Product updated successfully!");
      } else {
        const { error } = await supabase
          .from("products")
          .insert([productData]);

        if (error) throw new Error(error.message);

        toast.success("Product added successfully!");
      }

      fetchProducts();
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Operation failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("product_id", productId);

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
    setNewProduct({ ...product });
    setFiles([]);
    setPreviews(product.image_urls || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      brand: "",
      state: "",
      phone: "",
      description: "",
      specification: "",
      stock: "",
      price: "",
      image_urls: [],
      category_id: "",
    });
    setFiles([]);
    setPreviews([]);
    setEditingProduct(null);
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          name="brand"
          placeholder="Product Brand"
          value={newProduct.brand}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        />

        <select
          name="category_id"
          onChange={handleChange}
          value={newProduct.category_id}
          required
          className="border p-2 w-full rounded"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.category}
            </option>
          ))}
        </select>

        <select
          name="state"
          onChange={handleChange}
          value={newProduct.state}
          required
          className="border p-2 w-full rounded"
        >
          <option value="">Select State</option>
          <option value="Brand New">Brand New</option>
          <option value="Refurbished">Refurbished</option>
        </select>

        <textarea
          name="description"
          placeholder="Description"
          value={newProduct.description}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        />

        <textarea
          name="specification"
          placeholder="Specification"
          value={newProduct.specification}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        />

        <input
          type="number"
          name="stock"
          min={1}
          placeholder="Stock"
          value={newProduct.stock}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        />

        <input
          type="text"
          name="phone"
          maxLength={10}
          placeholder="Seller's Phone Number"
          value={newProduct.phone}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        />

        <input
          type="number"
          name="price"
          min={1}
          placeholder="Price"
          value={newProduct.price}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="w-full"
        />

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {previews.map((src, i) => (
              <div key={i} className="relative w-24 h-24">
                <img
                  src={src}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          {uploading
            ? "Uploading..."
            : editingProduct
            ? "Update Product"
            : "Add Product"}
        </button>
      </form>

      {/* Product List */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin blur-sm" />
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-400 animate-spin" />
          </div>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            products.map((product) => (
              <li
                key={product.product_id}
                className="border p-4 rounded-lg space-y-1"
              >
                <h2 className="text-xl font-semibold">
                  <strong>Product Name:</strong> {product.name}
                </h2>
                <p><strong>Brand:</strong> {product.brand}</p>
                <p><strong>Category:</strong> {product.categories?.category}</p>
                <p><strong>State:</strong> {product.state}</p>
                <p><strong>Seller's Phone:</strong> {product.phone}</p>
                <p><strong>Description:</strong> {product.description}</p>
                <p><strong>Specification:</strong> {product.specification}</p>
                <p><strong>Stock:</strong> {product.stock}</p>
                <p><strong>Price:</strong> KES {product.price}</p>
                {product.image_urls?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.image_urls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Product"
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.product_id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </AdminLayout>
  );
};

export default withAdminAuth(ManageProducts);
