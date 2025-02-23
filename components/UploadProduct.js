import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function UploadProduct() {
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async () => {
    if (!productName || !productCategory || !description || !price || files.length === 0) {
      return alert("Please fill in all fields!");
    }

    setUploading(true);
    let imageUrls = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(`images/${fileName}`, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        alert("Image upload failed!");
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("products").getPublicUrl(`images/${fileName}`);
      imageUrls.push(urlData.publicUrl);
    }

    try {
      // Ensure category exists or insert it (with UUID)
      let { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("category", productCategory)
        .single();

      if (categoryError && categoryError.code === "PGRST116") {
        // Category doesn't exist, insert it and fetch the new UUID
        const { data: newCategory, error: insertError } = await supabase
          .from("categories")
          .insert([{ category: productCategory }])
          .select("id")
          .single();
        if (insertError) throw insertError;

        categoryData = newCategory; // Use newly created category
      }

      // Ensure category UUID is available
      if (!categoryData?.id) {
        throw new Error("Failed to retrieve category UUID.");
      }

      // Save product with category_id (UUID)
      const { error: productError } = await supabase.from("products").insert([
        {
          name: productName,
          category_id: categoryData.id, // Use UUID
          description,
          price: parseFloat(price),
          image_urls: imageUrls,
        },
      ]);

      if (productError) throw productError;

      alert("Product uploaded successfully!");
      setProductName("");
      setProductCategory("");
      setDescription("");
      setPrice("");
      setFiles([]);
      setPreviews([]);
    } catch (error) {
      console.error("Error:", error.message);
      alert("Failed to save product!");
    }

    setUploading(false);
  };

  return (
    <div className="mt-28 mb-4 pt-4 max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-2xl font-semibold text-center mb-4">⚡Upload Product⚡</h2>
      <div className="px-4 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
        <label className="pl-2 font-semibold">Choose Category</label>
        <table><tbody><tr><td><select
          onChange={(e) => setProductCategory(e.target.value)}
          value={productCategory}
          className="w-full p-2 border rounded-md"
        >
          <option value="Smartphones">Smartphones</option>
          <option value="Laptops">Laptops</option>
          <option value="Woofers">Woofers</option>
          <option value="Amplifiers">Amplifiers</option>
        </select></td></tr></tbody></table>

        <textarea
          placeholder="Product Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-md h-24"
        />

        <input
          type="number"
          placeholder="Price (Ksh)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 border rounded-md"
        />

        <input type="file" accept="image/*" multiple onChange={handleFileChange} className="w-full" />

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {previews.map((preview, index) => (
              <im key={index} src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border" />
            ))}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="my-4 w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition"
        >
          {uploading ? "Uploading..." : "Upload Product"}
        </button>
      </div>
    </div>
  );
}
