import dbConnect from "@/lib/mongodb";
import LineItemCatalog from "@/models/LineItemCatalog";

export async function seedLineItemCatalog() {
  await dbConnect();

  const sampleCatalog = [
    // Water Damage Category
    {
      code: "WD-DRYWALL-RMV",
      description: "Drywall removal, water damaged",
      unit: "sqft",
      category: "water-damage",
      iicrcReference: "S500",
      defaultNotes: "Remove and dispose of water damaged drywall",
    },
    {
      code: "WD-CARPET-RMV",
      description: "Carpet removal, water damaged",
      unit: "sqft",
      category: "water-damage",
      iicrcReference: "S500",
      defaultNotes: "Remove and dispose of water damaged carpet",
    },
    {
      code: "WD-BASE-RMV",
      description: "Baseboard removal, water damaged",
      unit: "linear-ft",
      category: "water-damage",
      iicrcReference: "S500",
      defaultNotes: "Remove and dispose of water damaged baseboards",
    },
    {
      code: "WD-DRYING-EQ",
      description: "Air mover placement and monitoring",
      unit: "day",
      category: "water-damage",
      iicrcReference: "S500",
      defaultNotes: "Commercial air mover, daily monitoring included",
    },

    // Fire Damage Category
    {
      code: "FD-DEMO",
      description: "Fire damaged material demolition",
      unit: "sqft",
      category: "fire-damage",
      iicrcReference: "S700",
      defaultNotes: "Demolition of fire compromised structural materials",
    },
    {
      code: "FD-CLEAN",
      description: "Soot and smoke residue cleaning",
      unit: "sqft",
      category: "fire-damage",
      iicrcReference: "S700",
      defaultNotes: "Chemical cleaning of soot and smoke residues",
    },
    {
      code: "FD-ODOR",
      description: "Odor removal treatment",
      unit: "each",
      category: "fire-damage",
      iicrcReference: "S700",
      defaultNotes: "Ozone or hydroxyl treatment for odor elimination",
    },

    // Mold Category
    {
      code: "MOLD-REMEDIATE",
      description: "Mold remediation and treatment",
      unit: "sqft",
      category: "mold",
      iicrcReference: "S520",
      defaultNotes:
        "Containment, removal, and treatment of mold affected areas",
    },
    {
      code: "MOLD-HEPA",
      description: "HEPA air scrubbing",
      unit: "day",
      category: "mold",
      iicrcReference: "S520",
      defaultNotes: "HEPA air filtration during remediation",
    },

    // Structural Category
    {
      code: "STRUCT-FRAMING",
      description: "Structural framing repair",
      unit: "linear-ft",
      category: "structural",
      iicrcReference: "ANSI/IICRC S500",
      defaultNotes: "Repair or replacement of structural framing members",
    },
    {
      code: "STRUCT-SHEETROCK",
      description: "Drywall installation and finishing",
      unit: "sqft",
      category: "structural",
      iicrcReference: "ANSI/IICRC S500",
      defaultNotes: "New drywall installation, tape, and finish",
    },

    // Content Category
    {
      code: "CONTENT-PACK",
      description: "Content packing and removal",
      unit: "hour",
      category: "content",
      iicrcReference: "S500",
      defaultNotes: "Professional packing and removal of contents",
    },
    {
      code: "CONTENT-CLEAN",
      description: "Content cleaning and restoration",
      unit: "each",
      category: "content",
      iicrcReference: "S500",
      defaultNotes: "Ultrasonic or manual cleaning of salvageable contents",
    },

    // Equipment Category
    {
      code: "EQ-DEHUMID",
      description: "Dehumidifier placement",
      unit: "day",
      category: "equipment",
      iicrcReference: "S500",
      defaultNotes: "LGR dehumidifier, daily monitoring included",
    },
    {
      code: "EQ-AIRSCRUB",
      description: "Air scrubber operation",
      unit: "day",
      category: "equipment",
      iicrcReference: "S500",
      defaultNotes: "HEPA air scrubber for particulate control",
    },
  ];

  try {
    // Clear existing catalog
    await LineItemCatalog.deleteMany({});

    // Insert new catalog items
    await LineItemCatalog.insertMany(sampleCatalog);

    console.log(`✅ Successfully seeded ${sampleCatalog.length} catalog items`);
    return { success: true, count: sampleCatalog.length };
  } catch (error) {
    console.error("❌ Error seeding catalog:", error);
    return { success: false, error };
  }
}
