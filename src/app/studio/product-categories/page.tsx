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

// Type definition for product category
interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function ProductCategoriesStudioPage() {
  const [items, setItems] = useState<ProductCategory[]>([]);
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
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error &&
        "response" in e &&
        typeof e.response === "object" &&
        e.response &&
        "data" in e.response &&
        typeof e.response.data === "object" &&
        e.response.data &&
        "error" in e.response.data &&
        typeof e.response.data.error === "string"
          ? e.response.data.error
          : e instanceof Error
          ? e.message
          : "Failed to load";
      setError(errorMessage);
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

  function onSelect(cat: ProductCategory) {
    setSelectedId(cat.id);
    form.reset({
      id: cat.id,
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      icon: cat.icon || "",
      isActive: cat.isActive ?? true,
      sortOrder: cat.sortOrder ?? 0,
    });
  }

  async function onSubmit(
    values: ProductCategoryCreateInput | ProductCategoryUpdateInput
  ) {
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
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error &&
        "response" in e &&
        typeof e.response === "object" &&
        e.response &&
        "data" in e.response &&
        typeof e.response.data === "object" &&
        e.response.data &&
        "error" in e.response.data &&
        typeof e.response.data.error === "string"
          ? e.response.data.error
          : e instanceof Error
          ? e.message
          : "Failed to save";
      setError(errorMessage);
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
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error &&
        "response" in e &&
        typeof e.response === "object" &&
        e.response &&
        "data" in e.response &&
        typeof e.response.data === "object" &&
        e.response.data &&
        "error" in e.response.data &&
        typeof e.response.data.error === "string"
          ? e.response.data.error
          : e instanceof Error
          ? e.message
          : "Failed to delete";
      setError(errorMessage);
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
