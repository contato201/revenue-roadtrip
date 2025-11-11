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
      local: `Você é um especialista em marketing digital para negócios locais no Brasil com dados de Meta Ads e Google Ads. 
Analise o segmento, produto/serviço e região fornecidos e retorne benchmarks REALISTAS de anúncios online.
Use dados reais do mercado brasileiro considerando: custo de vida da região, competição no segmento, comportamento digital local.
Seja ESPECÍFICO com números baseados em dados reais de campanhas.`,
      
      lancamento: `Você é um especialista em lançamentos digitais no Brasil com expertise em Meta Ads e Google Ads.
Analise o segmento e produto fornecidos e retorne benchmarks REALISTAS baseados em dados reais de mercado.
Use métricas reais de CPM, CPC, CTR para o nicho específico. Seja preciso com os números.`,
      
      perpetuo: `Você é um especialista em negócios perpétuos no Brasil com expertise em Meta Ads e Google Ads.
Analise o segmento e produto fornecidos e retorne benchmarks REALISTAS de tráfego pago contínuo.
Use dados reais de custo por lead, CPC médio, CTR típico do nicho. Seja específico.`
    };

    const userPrompts = {
      local: `Segmento: ${segmento}
Produto/Serviço: ${produto}
Região: ${regiao}

Forneça KPIs REAIS de Meta Ads e Google Ads para esta região e produto específico. 
Inclua: CPC médio, CTR esperado, custo por lead realista, taxas de conversão do funil completo.`,
      
      lancamento: `Segmento: ${segmento}
Produto/Serviço: ${produto}

Forneça KPIs REAIS de tráfego pago para lançamento deste produto.
Inclua: CPM médio do nicho, CPC, CTR, taxa de conversão realista para landing pages de lançamento.`,
      
      perpetuo: `Segmento: ${segmento}
Produto/Serviço: ${produto}

Forneça KPIs REAIS de tráfego pago perpétuo para este produto.
Inclua: custo por mensagem/lead, CPC médio, CTR, taxa de conversão para funil evergreen.`
    };

    const tools = {
      local: {
        type: "function",
        function: {
          name: "retornar_benchmarks_local",
          description: "Retorna benchmarks completos para negócio local",
          parameters: {
            type: "object",
            properties: {
              cpc: {
                type: "number",
                description: "CPC médio em R$ para anúncios nesta região"
              },
              ctr: {
                type: "number",
                description: "CTR médio em % para anúncios nesta região"
              },
              custoLead: {
                type: "number",
                description: "Custo médio por lead em R$"
              },
              taxaAgendamento: {
                type: "number",
                description: "Taxa de agendamento média em %"
              },
              taxaComparecimento: {
                type: "number",
                description: "Taxa de comparecimento média em %"
              },
              taxaFechamento: {
                type: "number",
                description: "Taxa de fechamento média em %"
              },
              ticketMedio: {
                type: "number",
                description: "Ticket médio em R$"
              },
              impressoesPorLead: {
                type: "number",
                description: "Número aproximado de impressões necessárias para gerar 1 lead"
              },
              explicacao: {
                type: "string",
                description: "Explicação detalhada sobre os KPIs baseados em dados da região e produto"
              }
            },
            required: ["cpc", "ctr", "custoLead", "taxaAgendamento", "taxaComparecimento", "taxaFechamento", "ticketMedio", "impressoesPorLead", "explicacao"],
            additionalProperties: false
          }
        }
      },
      lancamento: {
        type: "function",
        function: {
          name: "retornar_benchmarks_lancamento",
          description: "Retorna benchmarks completos para lançamento",
          parameters: {
            type: "object",
            properties: {
              cpm: {
                type: "number",
                description: "CPM médio em R$ para o nicho"
              },
              cpc: {
                type: "number",
                description: "CPC médio em R$ para o nicho"
              },
              ctr: {
                type: "number",
                description: "CTR médio em % para anúncios de lançamento"
              },
              taxaConversao: {
                type: "number",
                description: "Taxa de conversão média da landing page em %"
              },
              ticket: {
                type: "number",
                description: "Ticket médio em R$"
              },
              impressoesPorConversao: {
                type: "number",
                description: "Número aproximado de impressões para gerar 1 conversão"
              },
              explicacao: {
                type: "string",
                description: "Explicação detalhada sobre os KPIs baseados em dados do nicho e produto"
              }
            },
            required: ["cpm", "cpc", "ctr", "taxaConversao", "ticket", "impressoesPorConversao", "explicacao"],
            additionalProperties: false
          }
        }
      },
      perpetuo: {
        type: "function",
        function: {
          name: "retornar_benchmarks_perpetuo",
          description: "Retorna benchmarks completos para negócio perpétuo",
          parameters: {
            type: "object",
            properties: {
              cpc: {
                type: "number",
                description: "CPC médio em R$ para tráfego perpétuo"
              },
              ctr: {
                type: "number",
                description: "CTR médio em % para o nicho"
              },
              custoMensagem: {
                type: "number",
                description: "Custo por mensagem/lead em R$"
              },
              taxaConversao: {
                type: "number",
                description: "Taxa de conversão média em %"
              },
              ticket: {
                type: "number",
                description: "Ticket médio em R$"
              },
              cliquesParaConversao: {
                type: "number",
                description: "Número médio de cliques necessários para 1 conversão"
              },
              explicacao: {
                type: "string",
                description: "Explicação detalhada sobre os KPIs baseados em dados do nicho e produto"
              }
            },
            required: ["cpc", "ctr", "custoMensagem", "taxaConversao", "ticket", "cliquesParaConversao", "explicacao"],
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
