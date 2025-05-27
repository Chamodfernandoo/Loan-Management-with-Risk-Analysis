import QRCode from 'qrcode';

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    // Generate QR code as data URL with improved settings for better scanning
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 300,         // Larger size
      margin: 4,          // Increased margin
      errorCorrectionLevel: 'H',  // Highest error correction for better scanning
      color: {
        dark: '#000000',  // Black modules
        light: '#ffffff'  // White background
      }
    });
    return qrDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return '';
  }
};

export const generateProfileQrData = (userId: string, name: string, phone: string): string => {
  // Create a JSON object with the essential user information
  const qrData = {
    userId,
    name,
    phone,
    type: 'borrower-profile',
    timestamp: new Date().toISOString(),
  };
  
  // Return as encoded string
  return JSON.stringify(qrData);
};