export default function ProductsForm({categories, editingProduct, newProduct, setNewProduct, files, previews}) {
  const [uploading, setUploading] = useState(false);
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

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.brand || !newProduct.state || !newProduct.stock || !newProduct.price || !newProduct.category_id) {
      toast.error("Please fill in all fields!");
    }

    setUploading(true);
    try {
      let imageUrls = editingProduct?.image_urls || [];

      if (files.length > 0) {
        imageUrls = await uploadImages();
      }

      if (editingProduct) {
        const { error: updateError } = await supabase.from("products").update({
          name: newProduct.name,
          phone: newProduct.phone,
          brand: newProduct.brand,
          state: newProduct.state,
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
        const { error: insertError } = await supabase.from("products").insert([
          {
            phone: newProduct.phone,
            name: newProduct.name,
            brand: newProduct.brand,
            state: newProduct.state,
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
      }

      fetchProducts();
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Operation failed: " + error.message);
    }

    setUploading(false);
  };

  const resetForm = () => {
    setNewProduct({ name: "", brand: "", state: "", phone: "", description: "", specification: "", stock: "", price: "", image_urls: [], category_id: "" });
    setFiles([]);
    setPreviews([]);
    setEditingProduct(null);
  };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Product Name" value={newProduct.name} onChange={handleChange} required className="border p-2 w-full rounded" />

        <input type="text" name="brand" placeholder="Product Brand" value={newProduct.brand} onChange={handleChange} required className="border p-2 w-full rounded" />

        <select name="category_id" onChange={handleChange} value={newProduct.category_id} required className="border p-2 w-full rounded">
            <option value="">Select Category</option>
            {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.category}</option>
            ))}
        </select>

        <select 
            name="state"
            className="border p-2 w-full rounded"
            onChange={handleChange}
            value={newProduct.state} 
            required
        >
            <option value="">Select State</option>
            <option value="Brand New">Brand New</option>
            <option value="Refurbished">Refurbished</option>
        </select>


        <textarea name="description" placeholder="Description" value={newProduct.description} onChange={handleChange} required className="border p-2 w-full rounded" />

        <textarea name="specification" placeholder="Specification" value={newProduct.specification} onChange={handleChange} required className="border p-2 w-full rounded" />

        <input type="number" name="stock" min={1} placeholder="Stock" value={newProduct.stock} onChange={handleChange} required className="border p-2 w-full rounded" />

        <input type="phone" name="phone" max={10}  placeholder="Seller's Phone Number" value={newProduct.phone} onChange={handleChange} required className="border p-2 w-full rounded" />

        <input type="number" name="price" min={1} placeholder="Price" value={newProduct.price} onChange={handleChange} required className="border p-2 w-full rounded" />

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
    );
  }
  