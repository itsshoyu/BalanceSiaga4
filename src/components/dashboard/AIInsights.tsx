import { useState } from 'react';
import { useTransactions } from '@/contexts/TransactionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  Target, 
  Calendar,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface AIInsightsData {
  summary: string;
  patterns: {
    highestCategory: string;
    mostExpensiveDay: string;
    trend: 'increasing' | 'stable' | 'decreasing';
    trendExplanation: string;
  };
  recommendations: Array<{
    tip: string;
    potentialSavings: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  financeScore: {
    score: number;
    explanation: string;
    factors: {
      incomeExpenseRatio: string;
      stability: string;
      trend: string;
    };
  };
  prediction: {
    estimatedExpense: number;
    marginOfError: number;
    explanation: string;
    confidence: string;
  };
}

export const AIInsights = () => {
  const { transactions } = useTransactions();
  const [insights, setInsights] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    if (transactions.length === 0) {
      toast({
        title: 'Tidak Ada Data',
        description: 'Tambahkan transaksi terlebih dahulu untuk mendapatkan insights AI.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: { transactions }
      });

      if (error) throw error;

      setInsights(data);
      toast({
        title: 'Insights Berhasil Dibuat!',
        description: 'AI telah menganalisis transaksi Anda.',
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: 'Gagal Membuat Insights',
        description: 'Terjadi kesalahan saat menganalisis data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-destructive/10 border-destructive';
    if (priority === 'medium') return 'bg-warning/10 border-warning';
    return 'bg-primary/10 border-primary';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI Insights
          </h2>
          <p className="text-muted-foreground mt-1">
            Analisis keuangan cerdas menggunakan AI
          </p>
        </div>
        <Button onClick={generateInsights} disabled={loading} size="lg">
          <Sparkles className="h-5 w-5 mr-2" />
          {loading ? 'Menganalisis...' : 'Generate Insights'}
        </Button>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !insights && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Belum Ada Insights</h3>
            <p className="text-muted-foreground text-center mb-4">
              Klik tombol "Generate Insights" untuk mendapatkan analisis AI
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && insights && (
        <>
          {/* AI Summary */}
          <Card className="border-primary/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Ringkasan Bulanan
              </CardTitle>
              <CardDescription>Insight AI untuk transaksi bulan ini</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{insights.summary}</p>
            </CardContent>
          </Card>

          {/* Pattern Detection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Pola Pengeluaran
              </CardTitle>
              <CardDescription>Analisis pola transaksi Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground mb-1">Kategori Tertinggi</p>
                  <p className="text-lg font-semibold">{insights.patterns.highestCategory}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground mb-1">Hari Paling Boros</p>
                  <p className="text-lg font-semibold">{insights.patterns.mostExpensiveDay}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 mb-2">
                  {insights.patterns.trend === 'increasing' ? (
                    <TrendingUp className="h-5 w-5 text-destructive" />
                  ) : insights.patterns.trend === 'decreasing' ? (
                    <TrendingDown className="h-5 w-5 text-success" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-warning" />
                  )}
                  <p className="text-sm text-muted-foreground">Tren Pengeluaran</p>
                </div>
                <p className="text-foreground">{insights.patterns.trendExplanation}</p>
              </div>
            </CardContent>
          </Card>

          {/* Finance Score */}
          <Card className="border-success/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-success" />
                Skor Keuangan
              </CardTitle>
              <CardDescription>Penilaian kesehatan keuangan Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-5xl font-bold ${getScoreColor(insights.financeScore.score)}`}>
                    {insights.financeScore.score}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">dari 100</p>
                </div>
              </div>
              <Progress value={insights.financeScore.score} className="h-3" />
              <p className="text-foreground">{insights.financeScore.explanation}</p>
              <div className="grid gap-3 mt-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Rasio Pemasukan/Pengeluaran</span>
                  <span className="font-semibold capitalize">{insights.financeScore.factors.incomeExpenseRatio}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Stabilitas</span>
                  <span className="font-semibold capitalize">{insights.financeScore.factors.stability}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Tren</span>
                  <span className="font-semibold capitalize">{insights.financeScore.factors.trend}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning" />
                Rekomendasi Penghematan
              </CardTitle>
              <CardDescription>Tips hemat dari AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                          {rec.priority === 'high' ? 'Prioritas Tinggi' : 
                           rec.priority === 'medium' ? 'Prioritas Sedang' : 'Prioritas Rendah'}
                        </span>
                      </div>
                      <p className="text-foreground">{rec.tip}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Potensi Hemat</p>
                      <p className="text-lg font-bold text-success">
                        Rp {rec.potentialSavings.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Prediction */}
          <Card className="border-warning/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-warning" />
                Prediksi Bulan Depan
              </CardTitle>
              <CardDescription>Estimasi pengeluaran berdasarkan tren</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estimasi Pengeluaran</p>
                  <p className="text-3xl font-bold text-warning">
                    Rp {insights.prediction.estimatedExpense.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ± Rp {insights.prediction.marginOfError.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Tingkat Keyakinan</p>
                  <p className="text-lg font-semibold capitalize">{insights.prediction.confidence}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <p className="text-sm text-foreground">{insights.prediction.explanation}</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
