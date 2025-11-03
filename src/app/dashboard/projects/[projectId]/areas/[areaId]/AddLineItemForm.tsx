"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AddLineItemFormProps {
  areaId: string;
  projectId: string;
}

interface CatalogItem {
  _id: string;
  code: string;
  description: string;
  unit: string;
  category: string;
  iicrcReference?: string;
  defaultNotes?: string;
}

export function AddLineItemForm({ areaId, projectId }: AddLineItemFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    unit: "each",
    quantity: 1,
    notes: "",
    iicrcReference: "",
  });

  // AI Justification function
  const handleAIJustify = async () => {
    if (!formData.name.trim()) {
      alert("Please enter an item name first");
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/justify-line-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemName: formData.name,
          unit: formData.unit,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          notes: result.data.notes,
          iicrcReference: result.data.iicrcReference,
        }));
      } else {
        alert("AI justification failed: " + result.error);
      }
    } catch (error) {
      alert("Failed to get AI justification");
    } finally {
      setAiLoading(false);
    }
  };

  // Search catalog items when search term changes
  useEffect(() => {
    const searchCatalog = async () => {
      if (searchTerm.length < 2) {
        setCatalogItems([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/areas/${areaId}/line-items/catalog?search=${encodeURIComponent(
            searchTerm
          )}`
        );
        const result = await response.json();

        if (result.success) {
          setCatalogItems(result.data);
          setShowCatalog(true);
        }
      } catch (error) {
        console.error("Search catalog error:", error);
      }
    };

    const timeoutId = setTimeout(searchCatalog, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleCatalogSelect = (item: CatalogItem) => {
    setFormData({
      name: item.description,
      unit: item.unit,
      quantity: 1,
      notes: item.defaultNotes || "",
      iicrcReference: item.iicrcReference || "",
    });
    setSearchTerm(item.code);
    setShowCatalog(false);
    setCatalogItems([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/areas/${areaId}/line-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setFormData({
          name: "",
          unit: "each",
          quantity: 1,
          notes: "",
          iicrcReference: "",
        });
        setSearchTerm("");
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const value =
      e.target.type === "number"
        ? parseFloat(e.target.value) || 0
        : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Add Damage Item
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Catalog Search */}
        <div>
          <label
            htmlFor="catalogSearch"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Search Catalog (optional)
          </label>
          <input
            type="text"
            id="catalogSearch"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Search by code or description..."
          />

          {/* Catalog Dropdown */}
          {showCatalog && catalogItems.length > 0 && (
            <div className="mt-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 max-h-60 overflow-y-auto">
              {catalogItems.map((item) => (
                <div
                  key={item._id}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                  onClick={() => handleCatalogSelect(item)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.code}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {item.description}
                      </div>
                    </div>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {item.unit}
                    </span>
                  </div>
                  {item.iicrcReference && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      IICRC: {item.iicrcReference}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual Entry Fields */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Item Name *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Water damaged drywall, Carpet removal"
            />
            <button
              type="button"
              onClick={handleAIJustify}
              disabled={aiLoading || !formData.name.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {aiLoading ? "AI..." : "AI Justify"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="0"
              step="0.1"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="unit"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Unit *
            </label>
            <select
              id="unit"
              name="unit"
              required
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="each">Each</option>
              <option value="sqft">Square Foot</option>
              <option value="linear-ft">Linear Foot</option>
              <option value="hour">Hour</option>
              <option value="day">Day</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="iicrcReference"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            IICRC Reference
          </label>
          <input
            type="text"
            id="iicrcReference"
            name="iicrcReference"
            value={formData.iicrcReference}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="IICRC standard reference"
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Additional details about the damage..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Adding Item..." : "Add Damage Item"}
        </button>
      </form>
    </div>
  );
}
