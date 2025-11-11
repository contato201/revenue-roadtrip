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
  const [produto, setProduto] = useState("");
  const [regiao, setRegiao] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [explicacao, setExplicacao] = useState("");
  const [kpis, setKpis] = useState<any>(null);
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

    if (!produto.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o produto/serviço específico",
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
    setKpis(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-benchmarks", {
        body: { tipo, segmento, produto, regiao }
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
      setKpis(data);
      onBenchmarksGenerated(data);

      toast({
        title: "Benchmarks gerados!",
        description: "Os valores e KPIs foram preenchidos automaticamente",
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

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="segmento" className="text-sm font-semibold">
                Segmento / Nicho *
              </Label>
              <Input
                id="segmento"
                placeholder="Ex: Saúde, Educação, Emagrecimento..."
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
                disabled={isLoading}
                className="border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="produto" className="text-sm font-semibold">
                Produto / Serviço *
              </Label>
              <Input
                id="produto"
                placeholder="Ex: Implante dentário, Curso online, Treino personalizado..."
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
                disabled={isLoading}
                className="border-2 focus:border-primary"
              />
            </div>
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

        {kpis && (
          <div className="space-y-3">
            {/* KPIs de Anúncios */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                KPIs de Anúncios Online:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {kpis.cpc && (
                  <div>
                    <p className="text-muted-foreground">CPC Médio</p>
                    <p className="font-bold text-foreground">R$ {kpis.cpc.toFixed(2)}</p>
                  </div>
                )}
                {kpis.ctr && (
                  <div>
                    <p className="text-muted-foreground">CTR Médio</p>
                    <p className="font-bold text-foreground">{kpis.ctr.toFixed(2)}%</p>
                  </div>
                )}
                {kpis.cpm && (
                  <div>
                    <p className="text-muted-foreground">CPM Médio</p>
                    <p className="font-bold text-foreground">R$ {kpis.cpm.toFixed(2)}</p>
                  </div>
                )}
                {kpis.impressoesPorLead && (
                  <div>
                    <p className="text-muted-foreground">Impressões/Lead</p>
                    <p className="font-bold text-foreground">{kpis.impressoesPorLead.toLocaleString()}</p>
                  </div>
                )}
                {kpis.impressoesPorConversao && (
                  <div>
                    <p className="text-muted-foreground">Impressões/Venda</p>
                    <p className="font-bold text-foreground">{kpis.impressoesPorConversao.toLocaleString()}</p>
                  </div>
                )}
                {kpis.cliquesParaConversao && (
                  <div>
                    <p className="text-muted-foreground">Cliques/Venda</p>
                    <p className="font-bold text-foreground">{kpis.cliquesParaConversao}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Análise */}
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
        )}
      </div>
    </Card>
  );
}
