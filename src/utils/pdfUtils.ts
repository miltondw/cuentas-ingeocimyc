/**
 * PDF utilities for service requests
 */

import { generateServiceRequestPdf } from "@/api/serviceRequestsApi";

/**
 * Download a service request as PDF
 * @param id The ID of the service request
 */
export const downloadServiceRequestPdf = async (id: number): Promise<void> => {
  try {
    // Get the PDF blob from the API
    const pdfBlob = await generateServiceRequestPdf(id);

    // Create a URL for the blob object
    const url = URL.createObjectURL(pdfBlob);

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = url;
    link.download = `solicitud-servicio-${id}.pdf`;

    // Append the link to the body, click it and remove it
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error downloading PDF for service request ${id}:`, error);
    throw error;
  }
};

/**
 * Open the service request PDF in a new tab
 * @param id The ID of the service request
 */
export const openServiceRequestPdf = async (id: number): Promise<void> => {
  try {
    // Get the PDF blob from the API
    const pdfBlob = await generateServiceRequestPdf(id);

    // Create a URL for the blob object
    const url = URL.createObjectURL(pdfBlob);

    // Open the URL in a new tab
    window.open(url, "_blank");

    // Clean up after a delay to ensure the PDF has loaded
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);
  } catch (error) {
    console.error(`Error opening PDF for service request ${id}:`, error);
    throw error;
  }
};
