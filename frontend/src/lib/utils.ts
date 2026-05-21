export const exportToCSV = (data, fileName) => {
  try {
    if (!data || !data.length) return;

    // Create headers
    const headers = Object.keys(data[0]).join(",");

    // Create rows and escape special characters
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => {
          const strValue = value === null || value === undefined ? "" : String(value);
          return `"${strValue.replace(/"/g, '""')}"`; // Proper CSV escaping
        })
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");
    
    // Add UTF-8 BOM for Excel compatibility
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    
    // Use the newer URL method
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;
    
    // Append, click, and remove
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (err) {
    console.error("CSV Export Error:", err);
  }
};