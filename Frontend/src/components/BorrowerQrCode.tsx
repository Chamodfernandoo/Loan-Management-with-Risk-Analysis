import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Share2 } from 'lucide-react';
import { generateQRCode, generateProfileQrData } from '@/utils/qrCode';

interface BorrowerQrCodeProps {
  userId: string;
  name: string;
  phone: string;
}

const BorrowerQrCode: React.FC<BorrowerQrCodeProps> = ({ userId, name, phone }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const generateQr = async () => {
    setLoading(true);
    try {
      // Generate the QR code data string
      const qrData = generateProfileQrData(userId, name, phone);
      
      // Generate QR code as data URL with increased size for better scanning
      const dataUrl = await generateQRCode(qrData);
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateQr();
  }, [userId, name, phone]);

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `borrower-qr-${userId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!qrDataUrl || typeof navigator.share !== 'function') return;
    
    try {
      // Convert the data URL to a Blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      
      // Create a File object from the Blob
      const file = new File([blob], 'borrower-qr.png', { type: 'image/png' });
      
      // Share the QR code
      await navigator.share({
        title: 'My Borrower Profile QR',
        text: 'Scan this QR code to access my borrower profile',
        files: [file]
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>Your Profile QR Code</CardTitle>
        <CardDescription>
          Show this QR code to lenders to quickly share your information for loans.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {loading ? (
          <div className="w-64 h-64 flex items-center justify-center">
            <RefreshCw className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg border">
            <img src={qrDataUrl} alt="Borrower QR Code" className="w-64 h-64" />
          </div>
        )}
        
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <Button onClick={generateQr} disabled={loading} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button onClick={handleDownload} disabled={!qrDataUrl}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          {typeof navigator.share === 'function' && (
            <Button onClick={handleShare} disabled={!qrDataUrl} variant="secondary">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mt-4 text-center">
          This QR code contains your basic profile information for loan applications.
        </p>
      </CardContent>
    </Card>
  );
};

export default BorrowerQrCode;