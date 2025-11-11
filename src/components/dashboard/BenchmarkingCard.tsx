import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BenchmarkingCardProps {
  tipo: "local" | "lancamento" | "perpetuo";
  onBenchmarksGenerated: (benchmarks: any) => void;
}

export function BenchmarkingCard({ tipo, onBenchmarksGenerated }: BenchmarkingCardProps) {
  const [segmento, setSegmento] = useState("");
  const [regiao, setRegiao] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [explicacao, setExplicacao] = useState("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!segmento.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o segmento/nicho",
        variant: "destructive",
      });
      return;
    }

    if (tipo === "local" && !regiao.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe a região de atuação",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setExplicacao("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-benchmarks", {
        body: { tipo, segmento, regiao }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Erro ao gerar benchmarks");
      }

      if (!data) {
        throw new Error("Nenhum dado retornado");
      }

      console.log("Benchmarks received:", data);
      setExplicacao(data.explicacao);
      onBenchmarksGenerated(data);

      toast({
        title: "Benchmarks gerados!",
        description: "Os valores foram preenchidos automaticamente",
      });
    } catch (error) {
      console.error("Error generating benchmarks:", error);
      toast({
        title: "Erro ao gerar benchmarks",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Benchmarking Inteligente</h3>
            <p className="text-sm text-muted-foreground">
              IA sugere valores baseados no seu mercado
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="segmento" className="text-sm font-semibold">
              Segmento / Nicho *
            </Label>
            <Input
              id="segmento"
              placeholder="Ex: Clínica odontológica, Infoproduto de emagrecimento..."
              value={segmento}
              onChange={(e) => setSegmento(e.target.value)}
              disabled={isLoading}
              className="border-2 focus:border-primary"
            />
          </div>

          {tipo === "local" && (
            <div className="space-y-2">
              <Label htmlFor="regiao" className="text-sm font-semibold">
                Região de Atuação *
              </Label>
              <Input
                id="regiao"
                placeholder="Ex: São Paulo - Zona Sul, Rio de Janeiro - Barra..."
                value={regiao}
                onChange={(e) => setRegiao(e.target.value)}
                disabled={isLoading}
                className="border-2 focus:border-primary"
              />
            </div>
          )}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando benchmarks...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Gerar Benchmarks com IA
            </>
          )}
        </Button>

        {explicacao && (
          <Card className="p-4 bg-accent/10 border-accent/30">
            <div className="flex gap-2">
              <TrendingUp className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  Análise do Mercado:
                </p>
                <p className="text-sm text-muted-foreground">{explicacao}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}
