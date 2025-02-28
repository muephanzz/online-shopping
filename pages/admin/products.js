import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/AdminLayout";
import withAdminAuth from '../../components/withAdminAuth';
import { Loader2 } from "lucide-react";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
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

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(category)");
    if (error) console.error("Error fetching products:", error);
    else setProducts(data);
    setLoading(false);
  };

  // Fetch categories from Supabase
  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) console.error("Error fetching categories:", error);
    else setCategories(data);
  };

  // Handle input changes
  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  // Handle file change (multiple images)
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const filePreviews = selectedFiles.map((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
      });
    });

    Promise.all(filePreviews).then((results) => setPreviews(results));
  };

  // Upload images to Supabase storage
  const uploadImages = async () => {
    const imageUrls = await Promise.all(
      files.map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(`images/${fileName}`, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = supabase.storage.from("products").getPublicUrl(`images/${fileName}`);
        return urlData.publicUrl;
      })
    );

    return imageUrls;
  };

  // Add or Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.price || !newProduct.category_id) {
      return alert("Please fill in all fields!");
    }

    setUploading(true);
    try {
      let imageUrls = editingProduct?.image_urls || [];

      // Upload new images if provided
      if (files.length > 0) {
        imageUrls = await uploadImages();
      }

      if (editingProduct) {
        // Update existing product
        const { error: updateError } = await supabase.from("products").update({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          image_urls: imageUrls,
          category_id: newProduct.category_id,
        }).eq("product_id", editingProduct.product_id);

        if (updateError) throw new Error(updateError.message);

        alert("Product updated successfully!");
      } else {
        // Add new product
        const { error: insertError } = await supabase.from("products").insert([
          {
            name: newProduct.name,
            description: newProduct.description,
            price: parseFloat(newProduct.price),
            image_urls: imageUrls,
            category_id: newProduct.category_id,
          },
        ]);

        if (insertError) throw new Error(insertError.message);

        alert("Product added successfully!");
      }

      fetchProducts();
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Operation failed: " + error.message);
    }

    setUploading(false);
  };

  // Delete a product
  const handleDelete = async (productId) => {
    const confirmation = window.confirm("Are you sure you want to delete this product?");
    if (!confirmation) return;

    const { error } = await supabase.from("products").delete().eq("product_id", productId);

    if (error) {
      console.error("Error deleting product:", error.message);
      alert("Error deleting product: " + error.message);
    } else {
      alert("Product deleted successfully!");
      fetchProducts();
    }
  };

  // Populate form for editing
  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      image_urls: product.image_urls,
      category_id: product.category_id,
    });
    setFiles([]);
    setPreviews(product.image_urls);
  };

  // Reset form
  const resetForm = () => {
    setNewProduct({ name: "", description: "", price: "", image_urls: [], category_id: "" });
    setFiles([]);
    setPreviews([]);
    setEditingProduct(null);
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

      {/* Product Form */}
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

        <select
          name="category_id"
          onChange={handleChange}
          value={newProduct.category_id}
          required
          className="border p-2 w-full rounded"
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.category}</option>
          ))}
        </select>

        <textarea
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

        <input type="file" accept="image/*" multiple onChange={handleFileChange} className="w-full" />

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {previews.map((preview, index) => (
              <img key={index} src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border" />
            ))}
          </div>
        )}

        <button type="submit" disabled={uploading} className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
          {uploading ? "Uploading..." : editingProduct ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* Product List */}
      {loading ? (
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      ) : (
        <ul className="mt-8 space-y-4">
          {products.map((product) => (
            <li key={product.product_id} className="border p-4 rounded-lg">
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p>{product.description}</p>
              <p className="text-green-600">${product.price}</p>
              <div className="flex gap-2 mt-3">
                {product.image_urls.map((url, index) => (
                  <img key={index} src={url} alt="Product" className="w-24 h-24 object-cover rounded-lg border" />
                ))}
              </div>
              <button onClick={() => handleEdit(product)}>Edit</button>
              <button onClick={() => handleDelete(product.product_id)} className="text-red-500 mt-2">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
};

export default withAdminAuth(ManageProducts);
