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

interface ClientEstimatePDFProps {
  reportData: any;
}

export function ClientEstimatePDF({ reportData }: ClientEstimatePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text>Client Estimate PDF - To be implemented</Text>
      </Page>
    </Document>
  );
}
