import dbConnect from "./mongodb";
import LineItemCatalog from "@/models/LineItemCatalog";
import catalogData from "./catalog-template.json";

export async function seedLineItemCatalog() {
  try {
    console.log("🟡 Starting catalog import from JSON file...");
    await dbConnect();

    const items = catalogData.items;
    console.log(`🟡 Found ${items.length} items to import`);

    // Clear existing catalog
    console.log("🟡 Clearing existing catalog...");
    await LineItemCatalog.deleteMany({});

    // Add isActive field to all items
    const itemsWithActive = items.map((item) => ({
      ...item,
      isActive: true,
    }));

    // Insert all items
    console.log("🟡 Inserting new catalog items...");
    await LineItemCatalog.insertMany(itemsWithActive);

    console.log(`✅ Successfully imported ${items.length} catalog items`);
    return {
      success: true,
      count: items.length,
      message: `Imported ${items.length} catalog items from JSON file`,
    };
  } catch (error) {
    console.error("❌ Catalog import error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
