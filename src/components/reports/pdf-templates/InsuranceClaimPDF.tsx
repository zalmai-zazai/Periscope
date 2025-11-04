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
    fontSize: 10, // Increased font size
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
    fontSize: 18, // Increased
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9, // Increased
    color: "#4b5563",
    marginBottom: 2,
  },
  reportTitle: {
    fontSize: 16, // Increased
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#374151",
  },
  reportSubtitle: {
    fontSize: 11, // Increased
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 12,
  },
  section: {
    marginBottom: 15, // Increased
  },
  sectionTitle: {
    fontSize: 12, // Increased
    fontWeight: "bold",
    marginBottom: 8, // Increased
    color: "#1e40af",
    backgroundColor: "#f3f4f6",
    padding: 6, // Increased
    borderLeft: "3pt solid #1e40af",
  },
  twoColumn: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4, // Increased
  },
  label: {
    fontWeight: "bold",
    width: "30%",
    color: "#374151",
    fontSize: 9, // Increased
  },
  value: {
    width: "70%",
    color: "#4b5563",
    fontSize: 9, // Increased
  },
  areaSection: {
    marginBottom: 20, // Increased
    border: "1pt solid #e5e7eb",
    borderRadius: 4,
    padding: 10, // Increased
    backgroundColor: "#fafafa",
    breakInside: "avoid", // Prevent area sections from breaking across pages
  },
  areaHeader: {
    backgroundColor: "#1e40af",
    padding: 8, // Increased
    margin: -10, // Adjusted for increased padding
    marginBottom: 10, // Increased
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  areaName: {
    fontSize: 12, // Increased
    fontWeight: "bold",
    color: "#ffffff",
  },
  areaDetails: {
    marginBottom: 10, // Increased
  },
  damageInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6, // Increased
  },
  damageItem: {
    fontSize: 9, // Increased
    color: "#4b5563",
  },
  lineItemsTable: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 8, // Increased
    marginBottom: 10, // Increased
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4, // Increased
  },
  tableColHeader: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
  },
  tableCell: {
    margin: "auto",
    fontSize: 8, // Increased
  },
  lineItemNotes: {
    fontSize: 7, // Increased
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 2, // Increased
  },
  equipmentSection: {
    marginTop: 8, // Increased
    padding: 6, // Increased
    backgroundColor: "#f0f9ff",
    border: "1pt solid #e0f2fe",
    borderRadius: 2,
  },
  equipmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3, // Increased
  },
  sketchSection: {
    marginTop: 10, // Increased
    padding: 8, // Increased
    border: "1pt solid #d1d5db",
    backgroundColor: "#f9fafb",
    breakInside: "avoid", // Prevent sketch sections from breaking
  },
  sketchContainer: {
    marginTop: 6, // Increased
  },
  sketchLabel: {
    fontSize: 10, // Increased
    fontWeight: "bold",
    marginBottom: 4, // Increased
    color: "#374151",
  },
  sketchImage: {
    width: "100%",
    height: 200, // Increased
    border: "1pt solid #d1d5db",
  },
  photoSection: {
    marginTop: 10, // Increased
    breakInside: "avoid", // Prevent photo sections from breaking across pages
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6, // Increased
    marginTop: 6, // Increased
  },
  photoContainer: {
    width: "48%",
    marginBottom: 6, // Increased
  },
  photoLabel: {
    fontSize: 8, // Increased
    color: "#6b7280",
    marginBottom: 3, // Increased
  },
  photoImage: {
    width: "100%",
    height: 100, // Increased
    border: "1pt solid #d1d5db",
  },
  totalSection: {
    marginTop: 15, // Increased
    padding: 10, // Increased
    backgroundColor: "#e5e7eb",
    border: "1pt solid #d1d5db",
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8, // Increased
    color: "#6b7280",
    borderTop: "1pt solid #d1d5db",
    paddingTop: 10, // Increased
  },
  pageNumber: {
    position: "absolute",
    bottom: 10,
    left: 30,
    fontSize: 8, // Increased
    color: "#6b7280",
  },
  signatureSection: {
    marginTop: 20, // Increased
    paddingTop: 15, // Increased
    borderTop: "1pt solid #d1d5db",
  },
  signatureLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25, // Increased
  },
  signatureField: {
    width: "45%",
  },
  signatureLabel: {
    fontSize: 10, // Increased
    fontWeight: "bold",
    marginBottom: 15, // Increased
    color: "#374151",
  },
  signatureSpace: {
    height: 1,
    backgroundColor: "#000",
    marginBottom: 4, // Increased
  },
  signatureText: {
    fontSize: 8, // Increased
    color: "#6b7280",
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
            <View key={areaIndex} style={styles.areaSection} wrap={false}>
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

              {/* Line Items Table - EXPANDED COLUMNS */}
              {metadata.options.includeAmounts && area.lineItems.length > 0 && (
                <View>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "bold",
                      marginBottom: 6,
                    }}
                  >
                    Line Items:
                  </Text>
                  <View style={styles.lineItemsTable}>
                    {/* Table Header - EXPANDED WIDTHS */}
                    <View style={[styles.tableRow, styles.tableColHeader]}>
                      <View style={[styles.tableCol, { width: "45%" }]}>
                        <Text style={styles.tableCell}>Item Description</Text>
                      </View>
                      <View style={[styles.tableCol, { width: "12%" }]}>
                        <Text style={styles.tableCell}>Qty</Text>
                      </View>
                      <View style={[styles.tableCol, { width: "18%" }]}>
                        <Text style={styles.tableCell}>Unit</Text>
                      </View>
                      {/* Commented out for now
                      <View style={[styles.tableCol, { width: "15%" }]}>
                        <Text style={styles.tableCell}>Unit Cost</Text>
                      </View>
                      <View style={[styles.tableCol, { width: "15%" }]}>
                        <Text style={styles.tableCell}>Total</Text>
                      </View>
                      */}
                      <View style={[styles.tableCol, { width: "25%" }]}>
                        <Text style={styles.tableCell}>IICRC Reference</Text>
                      </View>
                    </View>

                    {/* Table Rows */}
                    {area.lineItems.map((item: any, itemIndex: number) => (
                      <View key={itemIndex} style={styles.tableRow}>
                        <View style={[styles.tableCol, { width: "45%" }]}>
                          <Text style={styles.tableCell}>{item.name}</Text>
                          {item.notes && (
                            <Text style={styles.lineItemNotes}>
                              {item.notes}
                            </Text>
                          )}
                        </View>
                        <View style={[styles.tableCol, { width: "12%" }]}>
                          <Text style={styles.tableCell}>{item.quantity}</Text>
                        </View>
                        <View style={[styles.tableCol, { width: "18%" }]}>
                          <Text style={styles.tableCell}>{item.unit}</Text>
                        </View>
                        {/* Commented out for now
                        <View style={[styles.tableCol, { width: "15%" }]}>
                          <Text style={styles.tableCell}>
                            {item.unitCost
                              ? formatCurrency(item.unitCost)
                              : "N/A"}
                          </Text>
                        </View>
                        <View style={[styles.tableCol, { width: "15%" }]}>
                          <Text style={styles.tableCell}>
                            {item.totalCost
                              ? formatCurrency(item.totalCost)
                              : "N/A"}
                          </Text>
                        </View>
                        */}
                        <View style={[styles.tableCol, { width: "25%" }]}>
                          <Text style={styles.tableCell}>
                            {item.iicrcReference || "N/A"}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Area Total - Commented out for now
                  <View style={[styles.totalSection, { marginTop: 6 }]}>
                    <View style={styles.totalRow}>
                      <Text style={styles.tableCell}>Area Total:</Text>
                      <Text style={styles.tableCell}>
                        {formatCurrency(area.totalCost)}
                      </Text>
                    </View>
                  </View>
                  */}
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

              {/* Area Photos - ACTUAL IMAGES with page break prevention */}
              {metadata.options.includePhotos &&
                area.photos &&
                area.photos.length > 0 && (
                  <View style={styles.photoSection} wrap={false}>
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
            </View>
          ))}
        </View>

        {/* Project Sketches - ACTUAL IMAGES with page break prevention */}
        {metadata.options.includeSketches &&
          visualContent.sketches.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Project Sketches & Diagrams
              </Text>
              {visualContent.sketches.map((sketch: any, index: number) => (
                <View key={index} style={styles.sketchSection} wrap={false}>
                  <Text style={styles.sketchLabel}>Sketch {index + 1}</Text>
                  <View style={styles.sketchContainer}>
                    <Image src={sketch.url} style={styles.sketchImage} />
                  </View>
                </View>
              ))}
            </View>
          )}

        {/* Project Total - Commented out for now
        {metadata.options.includeAmounts && (
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                TOTAL PROJECT COST:
              </Text>
              <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                {formatCurrency(assessment.totalProjectCost)}
              </Text>
            </View>
          </View>
        )}
        */}

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
            This report was generated by DamageScope Professional Assessment
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
