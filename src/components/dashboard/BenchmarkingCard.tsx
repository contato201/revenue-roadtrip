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
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-benchmarks`;
      console.log("🔵 Chamando função:", functionUrl);
      console.log("📤 Enviando:", { tipo, segmento, produto, regiao });
      
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ tipo, segmento, produto, regiao }),
      });

      console.log("📡 Status da resposta:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro da API:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const responseText = await response.text();
      console.log("📥 Resposta bruta:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Erro ao parsear JSON:", parseError);
        throw new Error("Resposta inválida do servidor");
      }

      if (!data) {
        throw new Error("Nenhum dado retornado");
      }

      console.log("✅ Benchmarks recebidos:", data);
      setExplicacao(data.explicacao || "");
      setKpis(data);
      onBenchmarksGenerated(data);

      toast({
        title: "Benchmarks gerados!",
        description: "Os valores e KPIs foram preenchidos automaticamente",
      });
    } catch (error) {
      console.error("❌ Erro completo:", error);
      setExplicacao("");
      setKpis(null);
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
    <Card className="p-6 border-2 border-border bg-card shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-foreground tracking-tight">Benchmarking Inteligente</h3>
            <p className="text-sm text-muted-foreground font-medium">
              IA sugere valores baseados no seu mercado
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="segmento" className="text-base font-display font-semibold text-foreground">
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
              <Label htmlFor="produto" className="text-base font-display font-semibold text-foreground">
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
              <Label htmlFor="regiao" className="text-base font-display font-semibold text-foreground">
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
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
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
          <div className="space-y-4 mt-6">
            {/* Investimento e Taxas Gerais */}
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30">
              <div className="space-y-3">
                <p className="text-base text-foreground">
                  Investimento de exemplo:{" "}
                  <span className="text-xl font-bold text-foreground">
                    R$ {kpis.investimentoExemplo?.toLocaleString() || '0'}
                  </span>
                  , com um orçamento médio diário de{" "}
                  <span className="font-bold text-foreground">
                    R$ {((kpis.investimentoExemplo || 0) / 30).toFixed(0)}
                  </span>
                </p>
                
                {kpis.taxaConversao && (
                  <div className="text-sm text-muted-foreground">
                    Taxa de conversão média: <strong className="text-foreground">{kpis.taxaConversao.toFixed(2)}%</strong>
                  </div>
                )}
              </div>
            </Card>

            {/* Meta Ads e Google Ads lado a lado - Com descrições */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Meta Ads */}
              {kpis.meta && (
                <Card className="p-5 border-2 border-blue-500/30 bg-blue-500/5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <h4 className="text-lg font-bold text-foreground">Meta Ads</h4>
                    </div>

                    <div className="space-y-4">
                      {kpis.meta.cpm && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-muted-foreground">Custo por mil impressões no feed</span>
                            <span className="text-lg font-bold text-foreground">
                              R$ {kpis.meta.cpm.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-muted-foreground">Quanto você paga por cada clique</span>
                          <span className="text-lg font-bold text-foreground">
                            R$ {kpis.meta.cpc?.toFixed(2) || '—'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-muted-foreground">% de pessoas que clicam no anúncio</span>
                          <span className="text-lg font-bold text-foreground">
                            {kpis.meta.ctr ? `${kpis.meta.ctr.toFixed(2)}%` : '—'}
                          </span>
                        </div>
                      </div>
                      {kpis.meta.custoLead && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-muted-foreground">Custo para captar um lead qualificado</span>
                            <span className="text-lg font-bold text-foreground">
                              R$ {kpis.meta.custoLead.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                      {kpis.meta.custoAquisicaoCliente && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-muted-foreground">Custo médio para converter em cliente</span>
                            <span className="text-lg font-bold text-foreground">
                              R$ {kpis.meta.custoAquisicaoCliente.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Google Ads */}
              {kpis.google && (
                <Card className="p-5 border-2 border-green-500/30 bg-green-500/5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <h4 className="text-lg font-bold text-foreground">Google Ads</h4>
                    </div>

                    <div className="space-y-4">
                      {kpis.google.cpm && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-muted-foreground">Custo por mil impressões na rede</span>
                            <span className="text-lg font-bold text-foreground">
                              R$ {kpis.google.cpm.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-muted-foreground">Quanto você paga por cada clique</span>
                          <span className="text-lg font-bold text-foreground">
                            R$ {kpis.google.cpc?.toFixed(2) || '—'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-muted-foreground">% de pessoas que clicam no anúncio</span>
                          <span className="text-lg font-bold text-foreground">
                            {kpis.google.ctr ? `${kpis.google.ctr.toFixed(2)}%` : '—'}
                          </span>
                        </div>
                      </div>
                      {kpis.google.custoLead && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-muted-foreground">Custo para captar um lead qualificado</span>
                            <span className="text-lg font-bold text-foreground">
                              R$ {kpis.google.custoLead.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                      {kpis.google.custoAquisicaoCliente && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-muted-foreground">Custo médio para converter em cliente</span>
                            <span className="text-lg font-bold text-foreground">
                              R$ {kpis.google.custoAquisicaoCliente.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Análise */}
            {explicacao && (
              <Card className="p-4 bg-accent/5 border-accent/30">
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
