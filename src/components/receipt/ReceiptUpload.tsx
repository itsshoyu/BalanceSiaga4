import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Camera, X } from 'lucide-react';
import { useTransactions } from '@/contexts/TransactionContext';
import { createWorker } from 'tesseract.js';
import { toast } from '@/hooks/use-toast';

export const ReceiptUpload = () => {
  const { addTransaction } = useTransactions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const extractNumbersFromText = (text: string): number => {
    // Normalize text to lowercase for easier matching
    const normalizedText = text.toLowerCase();
    const lines = text.split('\n');
    
    // Keywords yang menandakan total pembayaran (urutan prioritas)
    const totalKeywords = [
      'grand total',
      'total bayar',
      'total pembayaran',
      'total belanja',
      'jumlah bayar',
      'total',
      'subtotal',
      'sub total',
      'amount',
      'total amount',
      'total price',
      'harga total'
    ];
    
    // Cari baris yang mengandung kata kunci total
    for (const keyword of totalKeywords) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        
        if (line.includes(keyword)) {
          // Ekstrak semua angka dari baris ini dan baris berikutnya (case struk dengan format multiline)
          const searchLines = [lines[i], lines[i + 1] || ''].join(' ');
          
          // Pattern untuk menangkap berbagai format angka:
          // 50.000, 50,000, 50000, Rp 50.000, etc
          const numberPattern = /(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi;
          const matches = searchLines.matchAll(numberPattern);
          
          const amounts: number[] = [];
          for (const match of matches) {
            // Bersihkan angka: hapus titik/koma sebagai separator ribuan, pertahankan desimal
            let numStr = match[1];
            
            // Jika ada titik DAN koma, asumsikan titik = ribuan, koma = desimal (format ID)
            if (numStr.includes('.') && numStr.includes(',')) {
              numStr = numStr.replace(/\./g, '').replace(',', '.');
            }
            // Jika hanya ada titik dan lebih dari 3 digit setelahnya atau 3 digit grup, asumsikan ribuan
            else if (numStr.includes('.')) {
              const parts = numStr.split('.');
              if (parts.length > 2 || (parts[1] && parts[1].length === 3)) {
                numStr = numStr.replace(/\./g, '');
              }
            }
            // Jika hanya ada koma
            else if (numStr.includes(',')) {
              numStr = numStr.replace(/,/g, '');
            }
            
            const amount = parseFloat(numStr);
            if (!isNaN(amount) && amount > 500) { // Filter noise kecil
              amounts.push(amount);
            }
          }
          
          // Ambil angka terbesar dari baris yang mengandung keyword
          if (amounts.length > 0) {
            const maxAmount = Math.max(...amounts);
            console.log(`✅ Detected amount from keyword "${keyword}": ${maxAmount}`);
            return maxAmount;
          }
        }
      }
    }
    
    // Fallback: jika tidak ada kata kunci, ambil angka terbesar yang masuk akal
    console.log('⚠️ No keyword found, using fallback detection');
    const numbers = text.match(/\d+[.,]?\d*/g);
    if (numbers && numbers.length > 0) {
      const amounts = numbers
        .map(n => parseFloat(n.replace(/[.,]/g, '')))
        .filter(n => n > 1000 && n < 100000000); // Filter range masuk akal
      
      if (amounts.length > 0) {
        const fallbackAmount = Math.max(...amounts);
        console.log(`Fallback detected amount: ${fallbackAmount}`);
        return fallbackAmount;
      }
    }
    
    console.log('❌ No amount detected');
    return 0;
  };

  const processImage = async (imageSource: File | Blob) => {
    setIsProcessing(true);
    toast({ title: 'Memproses...', description: 'Sedang membaca struk dengan AI OCR' });

    try {
      const worker = await createWorker('ind');
      const { data: { text } } = await worker.recognize(imageSource);
      await worker.terminate();

      console.log('=== OCR Result ===');
      console.log(text);
      console.log('==================');

      setExtractedText(text);
      
      const extractedAmount = extractNumbersFromText(text);
      if (extractedAmount > 0) {
        setAmount(extractedAmount.toString());
        toast({ 
          title: 'Berhasil!', 
          description: `Jumlah terdeteksi: Rp ${extractedAmount.toLocaleString('id-ID')}` 
        });
      } else {
        toast({ 
          title: 'Peringatan', 
          description: 'Jumlah tidak terdeteksi, silakan input manual',
          variant: 'destructive'
        });
      }

      // Ambil nama toko atau deskripsi dari baris pertama yang meaningful
      const lines = text.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 5 && 
               !trimmed.toLowerCase().includes('total') &&
               !/^\d+$/.test(trimmed); // Skip pure numbers
      });
      
      if (lines.length > 0) {
        setDescription(lines[0].trim().substring(0, 50));
      }

    } catch (error) {
      console.error('OCR Error:', error);
      toast({ 
        title: 'Gagal', 
        description: 'Gagal memproses gambar',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImage(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({ 
        title: 'Gagal', 
        description: 'Tidak dapat mengakses kamera',
        variant: 'destructive'
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (blob) {
        stopCamera();
        await processImage(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleSaveTransaction = () => {
    if (!amount || !description) {
      toast({ 
        title: 'Peringatan', 
        description: 'Mohon isi jumlah dan deskripsi',
        variant: 'destructive'
      });
      return;
    }

    addTransaction({
      type: 'expense',
      amount: parseFloat(amount),
      category: 'Lainnya',
      description,
      date,
    });

    // Reset form
    setExtractedText('');
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Struk (AI OCR)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="receipt">Upload Foto Struk</Label>
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              id="receipt"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isProcessing || isCameraOpen}
            />
            <Button 
              type="button" 
              variant="outline"
              disabled={isProcessing || isCameraOpen}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="outline"
              disabled={isProcessing}
              onClick={isCameraOpen ? stopCamera : startCamera}
            >
              {isCameraOpen ? <X className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isCameraOpen && (
          <div className="space-y-2">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="w-full rounded-lg border"
            />
            <canvas ref={canvasRef} className="hidden" />
            <Button onClick={captureImage} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Capture
            </Button>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Memproses gambar...</p>
          </div>
        )}

        {extractedText && (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium text-sm">Teks Terdeteksi:</span>
              </div>
              <pre className="text-xs whitespace-pre-wrap max-h-32 overflow-y-auto">
                {extractedText}
              </pre>
            </div>

            <div className="space-y-2">
              <Label htmlFor="extracted-amount">Jumlah (Rp)</Label>
              <Input
                id="extracted-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Masukkan jumlah"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extracted-description">Deskripsi</Label>
              <Input
                id="extracted-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Masukkan deskripsi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extracted-date">Tanggal</Label>
              <Input
                id="extracted-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <Button onClick={handleSaveTransaction} className="w-full">
              Simpan Transaksi
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
