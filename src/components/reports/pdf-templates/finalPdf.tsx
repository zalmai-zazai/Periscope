import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontSize: 10,
    lineHeight: 1.4,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2pt solid #1e40af",
    paddingBottom: 15,
  },
  companyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 2,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#374151",
  },
  reportSubtitle: {
    fontSize: 11,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 12,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1e40af",
    backgroundColor: "#f3f4f6",
    padding: 6,
    borderLeft: "3pt solid #1e40af",
  },
  twoColumn: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontWeight: "bold",
    width: "30%",
    color: "#374151",
    fontSize: 9,
  },
  value: {
    width: "70%",
    color: "#4b5563",
    fontSize: 9,
  },
  areaSection: {
    marginBottom: 20,
    border: "1pt solid #e5e7eb",
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#fafafa",
    // REMOVED: breakInside: "avoid" - Allow areas to break across pages
  },
  areaHeader: {
    backgroundColor: "#1e40af",
    padding: 8,
    margin: -10,
    marginBottom: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  areaName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  areaDetails: {
    marginBottom: 10,
  },
  damageInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  damageItem: {
    fontSize: 9,
    color: "#4b5563",
  },
  // NEW: Flexible line items container
  lineItemsContainer: {
    marginTop: 8,
    marginBottom: 10,
  },
  lineItemCard: {
    border: "1pt solid #e5e7eb",
    borderRadius: 3,
    marginBottom: 8, // Increased spacing
    backgroundColor: "#ffffff",
    padding: 6,
    // REMOVED: breakInside: "avoid" - Allow cards to break naturally
  },
  lineItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    borderBottom: "1pt solid #f3f4f6",
    paddingBottom: 4,
  },
  lineItemName: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    flex: 1,
  },
  lineItemDetails: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
  },
  lineItemDetail: {
    fontSize: 8,
    color: "#6b7280",
  },
  lineItemNotes: {
    fontSize: 8,
    color: "#4b5563",
    lineHeight: 1.4, // Increased line height for better readability
    marginTop: 4,
    padding: 4,
    backgroundColor: "#f9fafb",
    border: "0.5pt solid #f3f4f6",
    borderRadius: 2,
  },
  iicrcReference: {
    fontSize: 8,
    color: "#1e40af",
    fontWeight: "bold",
    marginTop: 2,
  },
  equipmentSection: {
    marginTop: 8,
    padding: 6,
    backgroundColor: "#f0f9ff",
    border: "1pt solid #e0f2fe",
    borderRadius: 2,
  },
  equipmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  sketchSection: {
    marginTop: 10,
    padding: 8,
    border: "1pt solid #d1d5db",
    backgroundColor: "#f9fafb",
    // REMOVED: breakInside: "avoid" - Allow sketches to break
  },
  sketchContainer: {
    marginTop: 6,
  },
  sketchLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#374151",
  },
  sketchImage: {
    width: "100%",
    height: 200,
    border: "1pt solid #d1d5db",
  },
  photoSection: {
    marginTop: 10,
    marginBottom: 15, // Added bottom margin to separate from line items
    // REMOVED: breakInside: "avoid" - Allow photos to break
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  photoContainer: {
    width: "48%",
    marginBottom: 6,
  },
  photoLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 3,
  },
  photoImage: {
    width: "100%",
    height: 100,
    border: "1pt solid #d1d5db",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#6b7280",
    borderTop: "1pt solid #d1d5db",
    paddingTop: 10,
  },
  pageNumber: {
    position: "absolute",
    bottom: 10,
    left: 30,
    fontSize: 8,
    color: "#6b7280",
  },
  signatureSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: "1pt solid #d1d5db",
  },
  signatureLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  signatureField: {
    width: "45%",
  },
  signatureLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#374151",
  },
  signatureSpace: {
    height: 1,
    backgroundColor: "#000",
    marginBottom: 4,
  },
  signatureText: {
    fontSize: 8,
    color: "#6b7280",
  },
  noLineItems: {
    textAlign: "center",
    padding: 20,
    color: "#6b7280",
    fontSize: 9,
    fontStyle: "italic",
  },
  // NEW: Area content wrapper to control order
  areaContent: {
    marginBottom: 10,
  },
});

// Simple date formatter
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

interface InsuranceClaimPDFProps {
  reportData: any;
}

// Component for individual line item card
const LineItemCard = ({ item, index }: { item: any; index: number }) => (
  <View key={index} style={styles.lineItemCard}>
    <View style={styles.lineItemHeader}>
      <Text style={styles.lineItemName}>
        {index + 1}. {item.name}
      </Text>
      <View style={styles.lineItemDetails}>
        <Text style={styles.lineItemDetail}>Code: {item.itemCode}</Text>
        <Text style={styles.lineItemDetail}>Qty: {item.quantity}</Text>
        <Text style={styles.lineItemDetail}>Unit: {item.unit}</Text>
        {/* Uncomment if you want to show costs later
          {item.unitCost && (
            <Text style={styles.lineItemDetail}>
              Unit: {formatCurrency(item.unitCost)}
            </Text>
          )}
          {item.totalCost && (
            <Text style={styles.lineItemDetail}>
              Total: {formatCurrency(item.totalCost)}
            </Text>
          )}
          */}
      </View>
    </View>

    {item.iicrcReference && (
      <Text style={styles.iicrcReference}>
        IICRC Reference: {item.iicrcReference}
      </Text>
    )}

    {item.notes && <Text style={styles.lineItemNotes}>{item.notes}</Text>}
  </View>
);

export function InsuranceClaimPDF({ reportData }: InsuranceClaimPDFProps) {
  const { company, project, team, assessment, visualContent, metadata } =
    reportData;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={true}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyHeader}>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>
                {company?.name || "Damage Assessment Report"}
              </Text>
              {company?.address && (
                <Text style={styles.companyDetails}>{company.address}</Text>
              )}
              {company?.phone && (
                <Text style={styles.companyDetails}>
                  Phone: {company.phone}
                </Text>
              )}
              {company?.email && (
                <Text style={styles.companyDetails}>
                  Email: {company.email}
                </Text>
              )}
            </View>
            <View>
              <Text style={styles.companyDetails}>
                Generated: {formatDate(metadata.generatedAt)}
              </Text>
              <Text style={styles.companyDetails}>
                Report ID: {project.projectNumber}-CLAIM
              </Text>
            </View>
          </View>

          <Text style={styles.reportTitle}>
            Insurance Claim Damage Assessment Report
          </Text>
          <Text style={styles.reportSubtitle}>
            Professional Property Damage Evaluation & Cost Estimation
          </Text>
        </View>

        {/* Project Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Information</Text>

          <View style={styles.twoColumn}>
            <Text style={styles.label}>Project Name:</Text>
            <Text style={styles.value}>{project.name}</Text>
          </View>
          <View style={styles.twoColumn}>
            <Text style={styles.label}>Project Number:</Text>
            <Text style={styles.value}>{project.projectNumber}</Text>
          </View>
          <View style={styles.twoColumn}>
            <Text style={styles.label}>Client Name:</Text>
            <Text style={styles.value}>{project.clientName}</Text>
          </View>
          <View style={styles.twoColumn}>
            <Text style={styles.label}>Property Address:</Text>
            <Text style={styles.value}>{project.clientAddress}</Text>
          </View>
          {project.dateOfLoss && (
            <View style={styles.twoColumn}>
              <Text style={styles.label}>Date of Loss:</Text>
              <Text style={styles.value}>{formatDate(project.dateOfLoss)}</Text>
            </View>
          )}
          <View style={styles.twoColumn}>
            <Text style={styles.label}>Type of Loss:</Text>
            <Text style={styles.value}>{project.typeOfLoss}</Text>
          </View>
          {project.insuranceCarrier && (
            <View style={styles.twoColumn}>
              <Text style={styles.label}>Insurance Carrier:</Text>
              <Text style={styles.value}>{project.insuranceCarrier}</Text>
            </View>
          )}
          {project.claimNumber && (
            <View style={styles.twoColumn}>
              <Text style={styles.label}>Claim Number:</Text>
              <Text style={styles.value}>{project.claimNumber}</Text>
            </View>
          )}
        </View>

        {/* Team Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Team</Text>

          <View style={styles.twoColumn}>
            <Text style={styles.label}>Inspector:</Text>
            <Text style={styles.value}>{team.inspector}</Text>
          </View>
          <View style={styles.twoColumn}>
            <Text style={styles.label}>Mitigation Technician:</Text>
            <Text style={styles.value}>{team.mitigationTech}</Text>
          </View>
          <View style={styles.twoColumn}>
            <Text style={styles.label}>Estimator:</Text>
            <Text style={styles.value}>{team.estimator}</Text>
          </View>
        </View>

        {/* Damage Assessment - Area by Area */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Detailed Damage Assessment by Area
          </Text>

          {assessment.areas.map((area: any, areaIndex: number) => (
            <View key={areaIndex} style={styles.areaSection}>
              {/* Area Header */}
              <View style={styles.areaHeader}>
                <Text style={styles.areaName}>
                  Area {areaIndex + 1}: {area.areaName}
                </Text>
              </View>

              {/* Area Description */}
              {area.description && (
                <View style={styles.areaDetails}>
                  <Text style={styles.label}>Description:</Text>
                  <Text style={styles.value}>{area.description}</Text>
                </View>
              )}

              {/* Damage Assessment Details */}
              <View style={styles.areaDetails}>
                <View style={styles.damageInfo}>
                  <Text style={styles.damageItem}>
                    <Text style={{ fontWeight: "bold" }}>Category:</Text>{" "}
                    {area.damageCategory} -{" "}
                    {area.damageCategory === "1"
                      ? "Clean Water"
                      : area.damageCategory === "2"
                      ? "Gray Water"
                      : "Black Water"}
                  </Text>
                  <Text style={styles.damageItem}>
                    <Text style={{ fontWeight: "bold" }}>Class:</Text>{" "}
                    {area.damageClass} -{" "}
                    {area.damageClass === "1"
                      ? "Limited Area"
                      : area.damageClass === "2"
                      ? "Medium Area"
                      : area.damageClass === "3"
                      ? "Large Area"
                      : "Deeply Held"}
                  </Text>
                </View>
                <View style={styles.damageInfo}>
                  <Text style={styles.damageItem}>
                    <Text style={{ fontWeight: "bold" }}>
                      Materials Affected:
                    </Text>{" "}
                    {area.materialsAffectedPercent}%
                  </Text>
                  <Text style={styles.damageItem}>
                    <Text style={{ fontWeight: "bold" }}>Containment:</Text>{" "}
                    {area.containmentNeeded ? "Required" : "Not Required"}
                  </Text>
                </View>
                {area.measurements &&
                  (area.measurements.length || area.measurements.width) && (
                    <View style={styles.damageInfo}>
                      <Text style={styles.damageItem}>
                        <Text style={{ fontWeight: "bold" }}>Dimensions:</Text>{" "}
                        {area.measurements.length || 0} ×{" "}
                        {area.measurements.width || 0} {area.measurements.unit}
                      </Text>
                      <Text style={styles.damageItem}>
                        <Text style={{ fontWeight: "bold" }}>Total Area:</Text>{" "}
                        {area.measurements.totalArea || 0}{" "}
                        {area.measurements.unit}²
                      </Text>
                    </View>
                  )}
              </View>

              {/* AREA PHOTOS FIRST */}
              {metadata.options.includePhotos &&
                area.photos &&
                area.photos.length > 0 && (
                  <View style={styles.photoSection}>
                    <Text style={styles.sketchLabel}>
                      Area Photos ({area.photos.length})
                    </Text>
                    <View style={styles.photoGrid}>
                      {area.photos.map((photo: string, photoIndex: number) => (
                        <View key={photoIndex} style={styles.photoContainer}>
                          <Text style={styles.photoLabel}>
                            Photo {photoIndex + 1}
                          </Text>
                          <Image src={photo} style={styles.photoImage} />
                        </View>
                      ))}
                    </View>
                  </View>
                )}

              {/* LINE ITEMS AFTER PHOTOS */}
              {metadata.options.includeAmounts && area.lineItems.length > 0 && (
                <View style={styles.lineItemsContainer}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "bold",
                      marginBottom: 8,
                    }}
                  >
                    Damage Items ({area.lineItems.length}):
                  </Text>

                  {area.lineItems.map((item: any, itemIndex: number) => (
                    <LineItemCard
                      key={itemIndex}
                      item={item}
                      index={itemIndex}
                    />
                  ))}
                </View>
              )}

              {metadata.options.includeAmounts &&
                area.lineItems.length === 0 && (
                  <View style={styles.noLineItems}>
                    <Text>No line items recorded for this area</Text>
                  </View>
                )}

              {/* Equipment Recommendations */}
              {metadata.options.includeEquipment &&
                area.equipment.length > 0 && (
                  <View style={styles.equipmentSection}>
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: "bold",
                        marginBottom: 4,
                      }}
                    >
                      Recommended Equipment:
                    </Text>
                    {area.equipment.map((equip: any, equipIndex: number) => (
                      <View key={equipIndex} style={styles.equipmentItem}>
                        <Text style={styles.damageItem}>{equip.name}:</Text>
                        <Text style={styles.damageItem}>
                          Quantity: {equip.quantity}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
            </View>
          ))}
        </View>

        {/* Project Sketches */}
        {metadata.options.includeSketches &&
          visualContent.sketches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Project Sketches & Diagrams
              </Text>
              {visualContent.sketches.map((sketch: any, index: number) => (
                <View key={index} style={styles.sketchSection}>
                  <Text style={styles.sketchLabel}>Sketch {index + 1}</Text>
                  <View style={styles.sketchContainer}>
                    <Image src={sketch.url} style={styles.sketchImage} />
                  </View>
                </View>
              ))}
            </View>
          )}

        {/* Prepared By Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Preparation</Text>
          <View style={styles.twoColumn}>
            <Text style={styles.label}>Prepared By:</Text>
            <Text style={styles.value}>{assessment.preparedBy}</Text>
          </View>
          <View style={styles.twoColumn}>
            <Text style={styles.label}>Role:</Text>
            <Text style={styles.value}>
              {assessment.preparerRole?.charAt(0).toUpperCase() +
                assessment.preparerRole?.slice(1) || "N/A"}
            </Text>
          </View>
          <View style={styles.twoColumn}>
            <Text style={styles.label}>Date Prepared:</Text>
            <Text style={styles.value}>{formatDate(metadata.generatedAt)}</Text>
          </View>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureLine}>
            <View style={styles.signatureField}>
              <Text style={styles.signatureLabel}>Prepared By Signature</Text>
              <View style={styles.signatureSpace} />
              <Text style={styles.signatureText}>{assessment.preparedBy}</Text>
            </View>
            <View style={styles.signatureField}>
              <Text style={styles.signatureLabel}>Date</Text>
              <View style={styles.signatureSpace} />
              <Text style={styles.signatureText}>
                {formatDate(metadata.generatedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            This report was generated by PeriScope Professional Assessment
            System. All estimates are based on professional evaluation and IICRC
            standards. Photos and sketches provide visual documentation of
            damage assessment.
          </Text>
        </View>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
