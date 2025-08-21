"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
} from "@/lib/api";
import type {
  ProductCreateInput,
  ProductUpdateInput,
} from "@/lib/validation/link-in-bio";

export default function ProductsStudioPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const form = useForm<ProductCreateInput | ProductUpdateInput>({
    defaultValues: {
      categoryId: "",
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      thumbnail: "",
      gallery: [],
      previewFiles: [],
      price: "0",
      originalPrice: "",
      currency: "IDR",
      files: [],
      isActive: true,
      isPublic: true,
      stock: undefined,
      downloadLimit: undefined,
      seoTitle: "",
      seoDescription: "",
    } as any,
  });

  const [galleryText, setGalleryText] = useState("");
  const [previewText, setPreviewText] = useState("");

  const isEditing = useMemo(() => !!selectedId, [selectedId]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [list, cats] = await Promise.all([
        getProducts(),
        getProductCategories(),
      ]);
      setItems(list);
      setCategories(cats);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function onNew() {
    setSelectedId(null);
    form.reset({
      categoryId: "",
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      thumbnail: "",
      gallery: [],
      previewFiles: [],
      price: "0",
      originalPrice: "",
      currency: "IDR",
      files: [],
      isActive: true,
      isPublic: true,
      stock: undefined,
      downloadLimit: undefined,
      seoTitle: "",
      seoDescription: "",
    } as any);
    setGalleryText("");
    setPreviewText("");
  }

  function onSelect(p: any) {
    setSelectedId(p.id);
    form.reset({
      id: p.id,
      categoryId: p.categoryId || "",
      name: p.name || "",
      slug: p.slug || "",
      description: p.description || "",
      shortDescription: p.shortDescription || "",
      thumbnail: p.thumbnail || "",
      gallery: p.gallery || [],
      previewFiles: p.previewFiles || [],
      price: p.price?.toString?.() || String(p.price || "0"),
      originalPrice: p.originalPrice?.toString?.() || "",
      currency: p.currency || "IDR",
      files: p.files || [],
      isActive: p.isActive ?? true,
      isPublic: p.isPublic ?? true,
      stock: p.stock || undefined,
      downloadLimit: p.downloadLimit || undefined,
      seoTitle: p.seoTitle || "",
      seoDescription: p.seoDescription || "",
    } as any);
    setGalleryText((p.gallery || []).join(","));
    setPreviewText((p.previewFiles || []).join(","));
  }

  async function onSubmit(values: any) {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...values,
        gallery: galleryText.trim()
          ? galleryText.split(",").map((s) => s.trim())
          : [],
        previewFiles: previewText.trim()
          ? previewText.split(",").map((s) => s.trim())
          : [],
      } as any;
      if (isEditing) {
        await updateProduct({
          ...(payload as ProductUpdateInput),
          id: selectedId as string,
        });
      } else {
        await createProduct(payload as ProductCreateInput);
      }
      await refresh();
      onNew();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function onRemove(id: string) {
    setLoading(true);
    setError(null);
    try {
      await deleteProduct(id);
      await refresh();
      if (selectedId === id) onNew();
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>/studio/products</h2>
      {error ? <div>{error}</div> : null}

      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <button type="button" onClick={onNew} disabled={loading}>
            New Product
          </button>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {isEditing ? (
              <div>Editing: {selectedId}</div>
            ) : (
              <div>Creating new product</div>
            )}

            <div>
              <label>Category</label>
              <select {...form.register("categoryId")}>
                <option value="">(None)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Name</label>
              <input {...form.register("name", { required: true })} />
            </div>
            <div>
              <label>Slug</label>
              <input {...form.register("slug", { required: true })} />
            </div>
            <div>
              <label>Description</label>
              <textarea {...form.register("description")} />
            </div>
            <div>
              <label>Short Description</label>
              <textarea {...form.register("shortDescription")} />
            </div>

            <div>
              <label>Thumbnail (URL)</label>
              <input {...form.register("thumbnail")} />
            </div>

            <div>
              <label>Gallery (comma-separated URLs)</label>
              <input
                value={galleryText}
                onChange={(e) => setGalleryText(e.target.value)}
              />
            </div>

            <div>
              <label>Preview Files (comma-separated URLs)</label>
              <input
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
              />
            </div>

            <div>
              <label>Price</label>
              <input {...form.register("price")} />
            </div>
            <div>
              <label>Original Price</label>
              <input {...form.register("originalPrice")} />
            </div>
            <div>
              <label>Currency</label>
              <input {...form.register("currency")} />
            </div>

            <div>
              <label>Active</label>
              <input type="checkbox" {...form.register("isActive")} />
            </div>
            <div>
              <label>Public</label>
              <input type="checkbox" {...form.register("isPublic")} />
            </div>

            <div>
              <label>Stock</label>
              <input
                type="number"
                {...form.register("stock", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label>Download Limit</label>
              <input
                type="number"
                {...form.register("downloadLimit", { valueAsNumber: true })}
              />
            </div>

            <div>
              <label>SEO Title</label>
              <input {...form.register("seoTitle")} />
            </div>
            <div>
              <label>SEO Description</label>
              <textarea {...form.register("seoDescription")} />
            </div>

            <div>
              <button type="submit" disabled={loading}>
                {isEditing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>

        <div style={{ flex: 1 }}>
          <div>Products</div>
          <button type="button" onClick={refresh} disabled={loading}>
            Refresh
          </button>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {items.map((it) => (
              <li
                key={it.id}
                style={{ border: "1px solid #ddd", padding: 8, marginTop: 8 }}
              >
                <div>
                  <strong>{it.name}</strong> ({it.slug})
                </div>
                <div>ID: {it.id}</div>
                <div>Price: {String(it.price)}</div>
                <div>
                  Active: {String(it.isActive)} Public: {String(it.isPublic)}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => onSelect(it)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(it.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
