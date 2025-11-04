import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontSize: 10,
  },
  // Basic styles - we'll implement full template later
});

interface FieldReportPDFProps {
  reportData: any;
}

export function FieldReportPDF({ reportData }: ClientEstimatePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text>Field Report PDF - To be implemented</Text>
      </Page>
    </Document>
  );
}
