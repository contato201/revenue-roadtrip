import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LancamentoTab } from "@/components/dashboard/tabs/LancamentoTab";
import { PerpetuoTab } from "@/components/dashboard/tabs/PerpetuoTab";
import { NegocioLocalTab } from "@/components/dashboard/tabs/NegocioLocalTab";
import { Rocket, RefreshCw, Store, BarChart3 } from "lucide-react";
import logoRT from "@/assets/logo-rt.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  Dashboard de Previsão
                </h1>
                <p className="text-muted-foreground">
                  Simule e planeje seus investimentos em marketing digital
                </p>
              </div>
            </div>
            <img 
              src={logoRT} 
              alt="Reproduzindo Talentos" 
              className="h-16 object-contain"
            />
          </div>
        </div>

        <Tabs defaultValue="local" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50">
            <TabsTrigger 
              value="local" 
              className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-md py-3"
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Negócio Local</span>
              <span className="sm:hidden">Local</span>
            </TabsTrigger>
            <TabsTrigger 
              value="lancamento"
              className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-md py-3"
            >
              <Rocket className="w-4 h-4" />
              <span className="hidden sm:inline">Lançamento</span>
              <span className="sm:hidden">Lanç.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="perpetuo"
              className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-md py-3"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Perpétuo</span>
              <span className="sm:hidden">Perp.</span>
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
