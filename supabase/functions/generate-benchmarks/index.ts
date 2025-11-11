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
    const { tipo, segmento, regiao }: { 
      tipo: "local" | "lancamento" | "perpetuo", 
      segmento: string, 
      regiao: string 
    } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating benchmarks for:", { tipo, segmento, regiao });

    // Sistema de prompts diferente para cada tipo
    const systemPrompts = {
      local: `Você é um especialista em marketing digital para negócios locais no Brasil. 
Analise o segmento e região fornecidos e retorne benchmarks realistas baseados em dados de mercado.
Considere: custo de vida da região, competição no segmento, ticket médio típico do setor.`,
      
      lancamento: `Você é um especialista em lançamentos digitais no Brasil.
Analise o segmento fornecido e retorne benchmarks realistas para campanhas de lançamento.
Considere: CPM médio para o nicho, taxa de conversão típica, ticket médio do mercado.`,
      
      perpetuo: `Você é um especialista em negócios perpétuos e evergreen no Brasil.
Analise o segmento fornecido e retorne benchmarks realistas para vendas contínuas.
Considere: custo por lead, taxa de conversão recorrente, ticket médio sustentável.`
    };

    const userPrompts = {
      local: `Segmento: ${segmento}
Região: ${regiao}

Forneça benchmarks realistas para este negócio local considerando a realidade brasileira.`,
      
      lancamento: `Segmento: ${segmento}

Forneça benchmarks realistas para um lançamento digital neste segmento.`,
      
      perpetuo: `Segmento: ${segmento}

Forneça benchmarks realistas para um negócio perpétuo neste segmento.`
    };

    const tools = {
      local: {
        type: "function",
        function: {
          name: "retornar_benchmarks_local",
          description: "Retorna benchmarks para negócio local",
          parameters: {
            type: "object",
            properties: {
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
              explicacao: {
                type: "string",
                description: "Breve explicação sobre os valores sugeridos"
              }
            },
            required: ["custoLead", "taxaAgendamento", "taxaComparecimento", "taxaFechamento", "ticketMedio", "explicacao"],
            additionalProperties: false
          }
        }
      },
      lancamento: {
        type: "function",
        function: {
          name: "retornar_benchmarks_lancamento",
          description: "Retorna benchmarks para lançamento",
          parameters: {
            type: "object",
            properties: {
              cpm: {
                type: "number",
                description: "CPM médio em R$"
              },
              taxaConversao: {
                type: "number",
                description: "Taxa de conversão média em %"
              },
              ticket: {
                type: "number",
                description: "Ticket médio em R$"
              },
              explicacao: {
                type: "string",
                description: "Breve explicação sobre os valores sugeridos"
              }
            },
            required: ["cpm", "taxaConversao", "ticket", "explicacao"],
            additionalProperties: false
          }
        }
      },
      perpetuo: {
        type: "function",
        function: {
          name: "retornar_benchmarks_perpetuo",
          description: "Retorna benchmarks para negócio perpétuo",
          parameters: {
            type: "object",
            properties: {
              custoMensagem: {
                type: "number",
                description: "Custo por mensagem em R$"
              },
              taxaConversao: {
                type: "number",
                description: "Taxa de conversão média em %"
              },
              ticket: {
                type: "number",
                description: "Ticket médio em R$"
              },
              explicacao: {
                type: "string",
                description: "Breve explicação sobre os valores sugeridos"
              }
            },
            required: ["custoMensagem", "taxaConversao", "ticket", "explicacao"],
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
