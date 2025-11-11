import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tipo, segmento, regiao, produto }: { 
      tipo: "local" | "lancamento" | "perpetuo", 
      segmento: string, 
      regiao: string,
      produto: string
    } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating benchmarks for:", { tipo, segmento, regiao, produto });

    // Sistema de prompts diferente para cada tipo
    const systemPrompts = {
      local: `Você é um especialista em marketing digital para negócios locais no Brasil com acesso a dados de Meta Ads e Google Ads. 
Analise o segmento, produto/serviço e região fornecidos e retorne benchmarks REALISTAS SEPARADOS para Meta Ads e Google Ads.
Use dados reais do mercado brasileiro considerando: custo de vida da região, competição no segmento, comportamento digital local.
Seja ESPECÍFICO com números baseados em dados reais de campanhas. RETORNE DADOS SEPARADOS PARA META E GOOGLE.
Calcule também o POTENCIAL DE CONVERSÕES para um investimento de exemplo (R$ 3.000) PARA CADA PLATAFORMA.`,
      
      lancamento: `Você é um especialista em lançamentos digitais no Brasil com acesso a dados de Meta Ads e Google Ads.
Analise o segmento e produto fornecidos e retorne benchmarks REALISTAS SEPARADOS para Meta Ads e Google Ads.
Use métricas reais de CPM, CPC, CTR para o nicho específico. Seja preciso com os números. RETORNE DADOS SEPARADOS PARA META E GOOGLE.
Calcule também o POTENCIAL DE CONVERSÕES para um investimento de exemplo (R$ 5.000) PARA CADA PLATAFORMA.`,
      
      perpetuo: `Você é um especialista em negócios perpétuos no Brasil com acesso a dados de Meta Ads e Google Ads.
Analise o segmento e produto fornecidos e retorne benchmarks REALISTAS SEPARADOS para Meta Ads e Google Ads.
Use dados reais de custo por lead, CPC médio, CTR típico do nicho. Seja específico. RETORNE DADOS SEPARADOS PARA META E GOOGLE.
Calcule também o POTENCIAL DE CONVERSÕES para um investimento de exemplo (R$ 3.000) PARA CADA PLATAFORMA.`
    };

    const userPrompts = {
      local: `Segmento: ${segmento}
Produto/Serviço: ${produto}
Região: ${regiao}

Forneça KPIs REAIS SEPARADOS de Meta Ads e Google Ads para esta região e produto específico. 
RETORNE DOIS CONJUNTOS COMPLETOS DE DADOS: um para Meta Ads e outro para Google Ads.
Inclua para cada plataforma: CPC médio, CTR esperado, custo por lead realista, taxas de conversão do funil completo.`,
      
      lancamento: `Segmento: ${segmento}
Produto/Serviço: ${produto}

Forneça KPIs REAIS SEPARADOS de Meta Ads e Google Ads para lançamento deste produto.
RETORNE DOIS CONJUNTOS COMPLETOS DE DADOS: um para Meta Ads e outro para Google Ads.
Inclua para cada plataforma: CPM médio do nicho, CPC, CTR, taxa de conversão realista para landing pages de lançamento.`,
      
      perpetuo: `Segmento: ${segmento}
Produto/Serviço: ${produto}

Forneça KPIs REAIS SEPARADOS de Meta Ads e Google Ads para tráfego pago perpétuo para este produto.
RETORNE DOIS CONJUNTOS COMPLETOS DE DADOS: um para Meta Ads e outro para Google Ads.
Inclua para cada plataforma: custo por mensagem/lead, CPC médio, CTR, taxa de conversão para funil evergreen.`
    };

    const tools = {
      local: {
        type: "function",
        function: {
          name: "retornar_benchmarks_local",
          description: "Retorna benchmarks separados de Meta Ads e Google Ads para negócio local",
          parameters: {
            type: "object",
            properties: {
              meta: {
                type: "object",
                description: "Benchmarks específicos do Meta Ads",
                properties: {
                  cpc: { type: "number", description: "CPC médio em R$ no Meta Ads" },
                  ctr: { type: "number", description: "CTR médio em % no Meta Ads" },
                  custoLead: { type: "number", description: "Custo médio por lead em R$ no Meta Ads" },
                  impressoesPorLead: { type: "number", description: "Impressões necessárias para 1 lead no Meta" },
                  conversoesPotenciais: { type: "number", description: "Conversões potenciais no Meta" },
                  custoAquisicaoCliente: { type: "number", description: "CAC no Meta em R$" }
                },
                required: ["cpc", "ctr", "custoLead", "impressoesPorLead", "conversoesPotenciais", "custoAquisicaoCliente"]
              },
              google: {
                type: "object",
                description: "Benchmarks específicos do Google Ads",
                properties: {
                  cpc: { type: "number", description: "CPC médio em R$ no Google Ads" },
                  ctr: { type: "number", description: "CTR médio em % no Google Ads" },
                  custoLead: { type: "number", description: "Custo médio por lead em R$ no Google Ads" },
                  impressoesPorLead: { type: "number", description: "Impressões necessárias para 1 lead no Google" },
                  conversoesPotenciais: { type: "number", description: "Conversões potenciais no Google" },
                  custoAquisicaoCliente: { type: "number", description: "CAC no Google em R$" }
                },
                required: ["cpc", "ctr", "custoLead", "impressoesPorLead", "conversoesPotenciais", "custoAquisicaoCliente"]
              },
              taxaAgendamento: { type: "number", description: "Taxa de agendamento média em %" },
              taxaComparecimento: { type: "number", description: "Taxa de comparecimento média em %" },
              taxaFechamento: { type: "number", description: "Taxa de fechamento média em %" },
              ticketMedio: { type: "number", description: "Ticket médio em R$" },
              investimentoExemplo: { type: "number", description: "Valor do investimento (3000)" },
              explicacao: { type: "string", description: "Explicação dos KPIs" }
            },
            required: ["meta", "google", "taxaAgendamento", "taxaComparecimento", "taxaFechamento", "ticketMedio", "investimentoExemplo", "explicacao"],
            additionalProperties: false
          }
        }
      },
      lancamento: {
        type: "function",
        function: {
          name: "retornar_benchmarks_lancamento",
          description: "Retorna benchmarks separados de Meta Ads e Google Ads para lançamento",
          parameters: {
            type: "object",
            properties: {
              meta: {
                type: "object",
                description: "Benchmarks específicos do Meta Ads",
                properties: {
                  cpm: { type: "number", description: "CPM médio em R$ no Meta" },
                  cpc: { type: "number", description: "CPC médio em R$ no Meta" },
                  ctr: { type: "number", description: "CTR médio em % no Meta" },
                  impressoesPorConversao: { type: "number", description: "Impressões para 1 conversão no Meta" },
                  conversoesPotenciais: { type: "number", description: "Conversões potenciais no Meta" },
                  custoAquisicaoCliente: { type: "number", description: "CPA no Meta em R$" }
                },
                required: ["cpm", "cpc", "ctr", "impressoesPorConversao", "conversoesPotenciais", "custoAquisicaoCliente"]
              },
              google: {
                type: "object",
                description: "Benchmarks específicos do Google Ads",
                properties: {
                  cpm: { type: "number", description: "CPM médio em R$ no Google" },
                  cpc: { type: "number", description: "CPC médio em R$ no Google" },
                  ctr: { type: "number", description: "CTR médio em % no Google" },
                  impressoesPorConversao: { type: "number", description: "Impressões para 1 conversão no Google" },
                  conversoesPotenciais: { type: "number", description: "Conversões potenciais no Google" },
                  custoAquisicaoCliente: { type: "number", description: "CPA no Google em R$" }
                },
                required: ["cpm", "cpc", "ctr", "impressoesPorConversao", "conversoesPotenciais", "custoAquisicaoCliente"]
              },
              taxaConversao: { type: "number", description: "Taxa de conversão média em %" },
              ticket: { type: "number", description: "Ticket médio em R$" },
              investimentoExemplo: { type: "number", description: "Valor do investimento (5000)" },
              explicacao: { type: "string", description: "Explicação dos KPIs" }
            },
            required: ["meta", "google", "taxaConversao", "ticket", "investimentoExemplo", "explicacao"],
            additionalProperties: false
          }
        }
      },
      perpetuo: {
        type: "function",
        function: {
          name: "retornar_benchmarks_perpetuo",
          description: "Retorna benchmarks separados de Meta Ads e Google Ads para negócio perpétuo",
          parameters: {
            type: "object",
            properties: {
              meta: {
                type: "object",
                description: "Benchmarks específicos do Meta Ads",
                properties: {
                  cpc: { type: "number", description: "CPC médio em R$ no Meta" },
                  ctr: { type: "number", description: "CTR médio em % no Meta" },
                  custoMensagem: { type: "number", description: "Custo por mensagem/lead em R$ no Meta" },
                  cliquesParaConversao: { type: "number", description: "Cliques para 1 conversão no Meta" },
                  conversoesPotenciais: { type: "number", description: "Conversões potenciais no Meta" },
                  custoAquisicaoCliente: { type: "number", description: "CPA no Meta em R$" }
                },
                required: ["cpc", "ctr", "custoMensagem", "cliquesParaConversao", "conversoesPotenciais", "custoAquisicaoCliente"]
              },
              google: {
                type: "object",
                description: "Benchmarks específicos do Google Ads",
                properties: {
                  cpc: { type: "number", description: "CPC médio em R$ no Google" },
                  ctr: { type: "number", description: "CTR médio em % no Google" },
                  custoMensagem: { type: "number", description: "Custo por mensagem/lead em R$ no Google" },
                  cliquesParaConversao: { type: "number", description: "Cliques para 1 conversão no Google" },
                  conversoesPotenciais: { type: "number", description: "Conversões potenciais no Google" },
                  custoAquisicaoCliente: { type: "number", description: "CPA no Google em R$" }
                },
                required: ["cpc", "ctr", "custoMensagem", "cliquesParaConversao", "conversoesPotenciais", "custoAquisicaoCliente"]
              },
              taxaConversao: { type: "number", description: "Taxa de conversão média em %" },
              ticket: { type: "number", description: "Ticket médio em R$" },
              investimentoExemplo: { type: "number", description: "Valor do investimento (3000)" },
              explicacao: { type: "string", description: "Explicação dos KPIs" }
            },
            required: ["meta", "google", "taxaConversao", "ticket", "investimentoExemplo", "explicacao"],
            additionalProperties: false
          }
        }
      }
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompts[tipo] },
          { role: "user", content: userPrompts[tipo] }
        ],
        tools: [tools[tipo]],
        tool_choice: { 
          type: "function", 
          function: { name: tools[tipo].function.name } 
        }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Adicione créditos na sua conta." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao gerar benchmarks");
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data, null, 2));
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("Resposta da IA não contém benchmarks");
    }

    const benchmarks = JSON.parse(toolCall.function.arguments);
    console.log("Benchmarks generated:", benchmarks);

    return new Response(JSON.stringify(benchmarks), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-benchmarks:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
