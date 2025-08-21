"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  getProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
} from "@/lib/api";
import type {
  ProductCategoryCreateInput,
  ProductCategoryUpdateInput,
} from "@/lib/validation/link-in-bio";

export default function ProductCategoriesStudioPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const form = useForm<ProductCategoryCreateInput | ProductCategoryUpdateInput>(
    {
      defaultValues: {
        name: "",
        slug: "",
        description: "",
        icon: "",
        isActive: true,
        sortOrder: 0,
      },
    }
  );

  const isEditing = useMemo(() => !!selectedId, [selectedId]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const list = await getProductCategories();
      setItems(list);
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
      name: "",
      slug: "",
      description: "",
      icon: "",
      isActive: true,
      sortOrder: 0,
    });
  }

  function onSelect(cat: any) {
    setSelectedId(cat.id);
    form.reset({
      id: cat.id,
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      icon: cat.icon || "",
      isActive: cat.isActive ?? true,
      sortOrder: cat.sortOrder ?? 0,
    } as any);
  }

  async function onSubmit(values: any) {
    setLoading(true);
    setError(null);
    try {
      if (isEditing) {
        await updateProductCategory({
          ...(values as ProductCategoryUpdateInput),
          id: selectedId as string,
        });
      } else {
        await createProductCategory(values as ProductCategoryCreateInput);
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
      await deleteProductCategory(id);
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
      <h2>/studio/product-categories</h2>
      {error ? <div>{error}</div> : null}

      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <button type="button" onClick={onNew} disabled={loading}>
            New Category
          </button>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {isEditing ? (
              <div>Editing: {selectedId}</div>
            ) : (
              <div>Creating new category</div>
            )}

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
              <label>Icon</label>
              <input {...form.register("icon")} />
            </div>
            <div>
              <label>Active</label>
              <input type="checkbox" {...form.register("isActive")} />
            </div>
            <div>
              <label>Sort Order</label>
              <input
                type="number"
                {...form.register("sortOrder", { valueAsNumber: true })}
              />
            </div>

            <div>
              <button type="submit" disabled={loading}>
                {isEditing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
        <div style={{ flex: 1 }}>
          <div>Categories</div>
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
                <div>Active: {String(it.isActive)}</div>
                <div>Sort: {it.sortOrder}</div>
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
