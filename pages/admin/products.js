import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import AdminLayout from "../../components/AdminLayout";
import withAdminAuth from '../../components/withAdminAuth';
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
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

    if (!newProduct.name || !newProduct.brand || !newProduct.stock || !newProduct.price || !newProduct.category_id) {
      toast.error("Please fill in all fields!");
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
          brand: newProduct.brand,
          description: newProduct.description,
          specification: newProduct.specification,
          stock: newProduct.stock,
          price: parseFloat(newProduct.price),
          image_urls: imageUrls,
          category_id: newProduct.category_id,
        }).eq("product_id", editingProduct.product_id);

        if (updateError) throw new Error(updateError.message);

        toast.success("Product updated successfully!");
      } else {
        // Add new product
        const { error: insertError } = await supabase.from("products").insert([
          {
            name: newProduct.name,
            brand: newProduct.brand,
            description: newProduct.description,
            specification: newProduct.specification,
            stock: newProduct.stock,
            price: parseFloat(newProduct.price),
            image_urls: imageUrls,
            category_id: newProduct.category_id,
          },
        ]);

        if (insertError) throw new Error(insertError.message);

        toast.success("Product added successfully!");
        t
      }

      fetchProducts();
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Operation failed: " + error.message);
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
      toast.error("Error deleting product: " + error.message);
    } else {
      toast.success("Product deleted successfully!");
      
      fetchProducts();
    }
  };

  // Populate form for editing
  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      brand: product.brand,
      description: product.description,
      specification: product.specification,
      price: product.price,
      image_urls: product.image_urls,
      category_id: product.category_id,
    });
    setFiles([]);
    setPreviews(product.image_urls);
  };

  // Reset form
  const resetForm = () => {
    setNewProduct({ name: "", brand: "", description: "", specification: "", price: "", image_urls: [], category_id: "" });
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
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.category}</option>
          ))}
        </select>

        <textarea
          name="description"
          placeholder="description"
          value={newProduct.description}
          onChange={handleChange}
          required
          className="border p-2 w-full rounded"
        />

        <textarea
          name="specification"
          placeholder="specification"
          value={newProduct.specification}
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
          type="number"
          name="stock"
          min={1}
          placeholder="In stock"
          value={newProduct.stock}
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
              <h2 className="text-green-600 text-xl font-semibold"><strong>Product Name:</strong> {product.name}</h2>
              <p className="text-green-600 mt-4"><strong>Brand:</strong> {product.brand || "Not Specified" }</p>
              <p className="mt-2 mb-4"><strong>Description</strong><br></br>{product.description}</p>
              <p><strong>Specification</strong><br></br>{product.specification}</p>
              <p className="text-green-600 my-4">Ksh {product.price}</p>
              <p className="text-green-600"><strong>In Stock:</strong> {product.stock}</p>
              <div className="flex gap-2 mt-3">
                {product.image_urls.map((url, index) => (
                  <img key={index} src={url} alt="Product" className="w-24 h-24 object-cover rounded-lg border" />
                ))}
              </div>
              <div className="flex gap-4 mt-4">
                <button onClick={() => handleEdit(product)} className="text-white px-10 bg-blue-500 rounded">Edit</button>
                <button onClick={() => handleDelete(product.product_id)} className="text-red-800 px-10 bg-blue-500 rounded">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
};

export default withAdminAuth(ManageProducts);
