
export const downloadPDF = (fileName: string, displayName?: string) => {
  try {
    const link = document.createElement('a');
    link.href = `/documents/${fileName}`;
    link.download = displayName || fileName;
    link.target = '_blank';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`Download triggered for: ${fileName}`);
  } catch (error) {
    console.error('Download failed:', error);
    alert('Download failed. Please try again.');
  }
};
