import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LancamentoTab } from "@/components/dashboard/tabs/LancamentoTab";
import { PerpetuoTab } from "@/components/dashboard/tabs/PerpetuoTab";
import { NegocioLocalTab } from "@/components/dashboard/tabs/NegocioLocalTab";
import { Rocket, RefreshCw, Store, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Minimalista */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-display font-bold text-lg">RT</span>
                </div>
                <span className="text-foreground font-display font-semibold text-lg">Reproduzindo Talentos</span>
              </div>
              <div className="border-l border-border pl-4 ml-4">
                <h1 className="text-2xl font-display font-semibold text-foreground tracking-tight">
                  Dashboard de Previsão
                </h1>
                <p className="text-sm text-muted-foreground">
                  Simule seus investimentos em marketing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-12 px-6 max-w-7xl">

        <Tabs defaultValue="local" className="space-y-8">
          <TabsList className="inline-flex h-auto p-1 bg-muted rounded-lg border border-border">
            <TabsTrigger 
              value="local" 
              className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border px-6 py-2.5 rounded-md transition-all"
            >
              <Store className="w-4 h-4" />
              <span className="font-medium">Negócio Local</span>
            </TabsTrigger>
            <TabsTrigger 
              value="lancamento"
              className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border px-6 py-2.5 rounded-md transition-all"
            >
              <Rocket className="w-4 h-4" />
              <span className="font-medium">Lançamento</span>
            </TabsTrigger>
            <TabsTrigger 
              value="perpetuo"
              className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border px-6 py-2.5 rounded-md transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="font-medium">Perpétuo</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="space-y-4">
            <NegocioLocalTab />
          </TabsContent>

          <TabsContent value="lancamento" className="space-y-4">
            <LancamentoTab />
          </TabsContent>

          <TabsContent value="perpetuo" className="space-y-4">
            <PerpetuoTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
