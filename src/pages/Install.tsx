import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Check } from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.error("Install prompt tidak tersedia. Coba buka dari browser.");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      toast.success("Aplikasi berhasil diinstall!");
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Install BalanceSiaga</CardTitle>
          <CardDescription>
            Install aplikasi ini di perangkat Anda untuk pengalaman yang lebih baik
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isInstalled ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-muted-foreground">
                Aplikasi sudah terinstall di perangkat Anda!
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Akses Offline</h3>
                    <p className="text-sm text-muted-foreground">
                      Gunakan aplikasi tanpa koneksi internet
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Akses Cepat</h3>
                    <p className="text-sm text-muted-foreground">
                      Buka langsung dari home screen perangkat Anda
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Notifikasi</h3>
                    <p className="text-sm text-muted-foreground">
                      Dapatkan pengingat dan update penting
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleInstall}
                disabled={!deferredPrompt}
                className="w-full"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Install Aplikasi
              </Button>

              {!deferredPrompt && (
                <div className="text-sm text-center text-muted-foreground space-y-2">
                  <p>Untuk menginstall aplikasi ini:</p>
                  <div className="text-left space-y-1 bg-muted/50 p-3 rounded-lg">
                    <p><strong>iOS:</strong> Tap tombol Share, lalu "Add to Home Screen"</p>
                    <p><strong>Android:</strong> Buka menu browser, pilih "Install app" atau "Add to Home screen"</p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;