import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, AlertCircle } from 'lucide-react';

interface QrScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (data: any) => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ isOpen, onClose, onScanResult }) => {
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(false); // Track if scanning is active
  const qrBoxSize = 250; // Size of the scanning box

  // Use a separate effect to initialize the scanner after the dialog is open and DOM is ready
  useEffect(() => {
    // Only initialize when dialog opens
    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        initializeScanner();
      }, 300);
      
      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      // Clean up when dialog closes
      cleanupScanner();
    }
    
    // Main cleanup on component unmount
    return () => {
      cleanupScanner();
    };
  }, [isOpen]);

  // Safe scanner cleanup function
  const cleanupScanner = () => {
    if (scannerRef.current && isScanningRef.current) {
      try {
        scannerRef.current.stop()
          .then(() => {
            console.log("Scanner stopped successfully");
            isScanningRef.current = false;
          })
          .catch(err => {
            console.warn("Error stopping scanner:", err);
          });
      } catch (error) {
        console.warn("Exception when stopping scanner:", error);
      }
    }
    // Reset scanner reference
    scannerRef.current = null;
    setCameraActive(false);
  };

  const initializeScanner = async () => {
    // Clean up any previous scanner instance first
    await cleanupScanner();
    
    setError(null);
    setCameraActive(false);

    // Check if container exists in DOM
    if (!document.getElementById('qr-reader-container')) {
      console.error("Scanner container not found in DOM");
      setError("Scanner element not found. Please try again later.");
      return;
    }

    try {
      // Create scanner instance
      const scanner = new Html5Qrcode('qr-reader-container');
      scannerRef.current = scanner;

      // Start scanning with the camera
      await scanner.start(
        { facingMode: 'environment' }, // Use back camera when available
        {
          fps: 10,
          qrbox: { width: qrBoxSize, height: qrBoxSize },
        },
        (decodedText) => {
          // On successful scan
          try {
            const data = JSON.parse(decodedText);
            
            // Check if this is a borrower profile QR code
            if (data && data.type === 'borrower-profile') {
              // Mark as not scanning before stopping
              isScanningRef.current = false;
              
              // Stop scanner safely
              if (scanner) {
                scanner.stop()
                  .then(() => {
                    onScanResult(data);
                    onClose();
                  })
                  .catch(error => {
                    console.error("Error stopping scanner after successful scan:", error);
                    // Still pass the data and close even if stopping fails
                    onScanResult(data);
                    onClose();
                  });
              } else {
                // If scanner is not available, still process the data
                onScanResult(data);
                onClose();
              }
            } else {
              setError('Invalid QR code format. Please scan a borrower profile QR code.');
            }
          } catch (err) {
            setError('Could not parse QR code data. Please try again.');
          }
        },
        () => {
          // This is just for monitoring scanning process, no need to handle errors here
        }
      );
      
      // Mark as actively scanning
      isScanningRef.current = true;
      setCameraActive(true);
    } catch (err: any) {
      console.error('Error initializing scanner:', err);
      
      // Enhanced error handling for permissions
      if (err.name === 'NotAllowedError') {
        setError(
          'Camera access was denied. Please allow camera access in your browser settings. ' +
          'In Edge/Chrome, click the lock/info icon in the address bar → Site permissions → Camera → Allow'
        );
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else {
        setError(`Error accessing camera: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleRetry = () => {
    initializeScanner();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        // Clean up scanner before closing
        cleanupScanner();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Camera className="mr-2 h-5 w-5" />
            Scan Borrower QR Code
          </DialogTitle>
          <DialogDescription>
            Position the QR code within the camera viewfinder to scan.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4 flex flex-col items-start">
            <div className="flex items-start mb-2">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <Button size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        )}
        
        <div className="relative w-full overflow-hidden rounded-lg bg-gray-100">
          {/* Camera Feed Container */}
          <div 
            id="qr-reader-container" 
            className="w-full aspect-square"
            style={{ minHeight: '300px' }}
          ></div>
          
          {/* Scanning Indicator */}
          {cameraActive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div 
                className="border-2 border-blue-500 rounded-lg" 
                style={{ 
                  width: `${qrBoxSize}px`, 
                  height: `${qrBoxSize}px`,
                  boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div className="w-full h-full border border-white border-dashed rounded-lg"></div>
              </div>
            </div>
          )}
          
          {/* Camera Status Message */}
          {!cameraActive && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 text-white">
              <div className="text-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Activating camera...</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => {
            cleanupScanner();
            onClose();
          }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrScanner;