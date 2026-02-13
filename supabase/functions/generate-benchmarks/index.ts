import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const requestSchema = z.object({
  tipo: z.enum(["local", "lancamento", "perpetuo", "ecommerce"]),
  segmento: z.string().trim().min(1).max(100),
  produto: z.string().trim().min(1).max(200),
  regiao: z.string().trim().max(100).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    const validationResult = requestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: "Dados de entrada inválidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { tipo, segmento, regiao, produto } = validationResult.data;

    // Try Perplexity first, fallback to Lovable AI
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!PERPLEXITY_API_KEY && !LOVABLE_API_KEY) {
      throw new Error("Nenhuma API key configurada");
    }

    const systemPrompts: Record<string, string> = {
      local: `Você é um especialista em marketing digital para negócios locais no Brasil. Pesquise dados REAIS e ATUAIS de benchmarks de Meta Ads e Google Ads para o segmento, produto e região fornecidos. Use dados de mercado brasileiro. Retorne APENAS um JSON válido sem markdown.`,
      lancamento: `Você é um especialista em lançamentos digitais no Brasil. Pesquise dados REAIS e ATUAIS de benchmarks de Meta Ads e Google Ads para o segmento e produto fornecidos. Retorne APENAS um JSON válido sem markdown.`,
      perpetuo: `Você é um especialista em tráfego pago perpétuo no Brasil. Pesquise dados REAIS e ATUAIS de benchmarks de Meta Ads e Google Ads para o segmento e produto fornecidos. Retorne APENAS um JSON válido sem markdown.`,
      ecommerce: `Você é um especialista em e-commerce e tráfego pago no Brasil. Pesquise dados REAIS e ATUAIS de benchmarks de Meta Ads e Google Ads para e-commerce no segmento e produto fornecidos. Inclua métricas de funil (view content, add to cart, checkout, purchase), CPC, ticket médio e ROAS médio do setor. Retorne APENAS um JSON válido sem markdown.`,
    };

    const userPrompts: Record<string, string> = {
      local: `Segmento: ${segmento}\nProduto/Serviço: ${produto}\nRegião: ${regiao || "Brasil"}\n\nRetorne JSON com esta estrutura exata:\n{"meta":{"cpm":0,"cpc":0,"ctr":0,"custoLead":0,"custoAquisicaoCliente":0},"google":{"cpm":0,"cpc":0,"ctr":0,"custoLead":0,"custoAquisicaoCliente":0},"taxaAgendamento":0,"taxaComparecimento":0,"taxaFechamento":0,"ticketMedio":0,"investimentoExemplo":3000,"taxaConversao":0,"explicacao":"texto"}`,
      lancamento: `Segmento: ${segmento}\nProduto/Serviço: ${produto}\n\nRetorne JSON com esta estrutura exata:\n{"meta":{"cpm":0,"cpc":0,"ctr":0,"custoLead":0},"google":{"cpm":0,"cpc":0,"ctr":0,"custoLead":0},"explicacao":"texto"}`,
      perpetuo: `Segmento: ${segmento}\nProduto/Serviço: ${produto}\n\nRetorne JSON com esta estrutura exata:\n{"meta":{"cpm":0,"cpc":0,"ctr":0,"custoAquisicaoCliente":0},"google":{"cpm":0,"cpc":0,"ctr":0,"custoAquisicaoCliente":0},"explicacao":"texto"}`,
      ecommerce: `Segmento: ${segmento}\nProduto/Serviço: ${produto}\n\nRetorne JSON com esta estrutura exata:\n{"meta":{"cpm":0,"cpc":0,"ctr":0,"custoAquisicaoCliente":0},"google":{"cpm":0,"cpc":0,"ctr":0,"custoAquisicaoCliente":0},"cpc":0,"taxaViewContent":0,"taxaAddToCart":0,"taxaCheckout":0,"taxaPurchase":0,"ticketMedio":0,"investimentoExemplo":5000,"explicacao":"texto"}`,
    };

    let benchmarks: any;

    if (PERPLEXITY_API_KEY) {
      // Use Perplexity for real-time web search data
      console.log("Using Perplexity API");
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            { role: "system", content: systemPrompts[tipo] },
            { role: "user", content: userPrompts[tipo] },
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Perplexity error [${response.status}]: ${errText}`);
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in Perplexity response");
      }
      benchmarks = JSON.parse(jsonMatch[0]);

      // Add citations if available
      if (data.citations && data.citations.length > 0) {
        benchmarks.fontes = data.citations.slice(0, 5);
      }
    } else {
      // Fallback to Lovable AI
      console.log("Falling back to Lovable AI");
      const tools: Record<string, any> = {
        local: {
          type: "function",
          function: {
            name: "retornar_benchmarks_local",
            description: "Retorna benchmarks de Meta e Google Ads para negócio local",
            parameters: {
              type: "object",
              properties: {
                meta: { type: "object", properties: { cpm: { type: "number" }, cpc: { type: "number" }, ctr: { type: "number" }, custoLead: { type: "number" }, custoAquisicaoCliente: { type: "number" } }, required: ["cpc", "ctr", "custoLead", "custoAquisicaoCliente"] },
                google: { type: "object", properties: { cpm: { type: "number" }, cpc: { type: "number" }, ctr: { type: "number" }, custoLead: { type: "number" }, custoAquisicaoCliente: { type: "number" } }, required: ["cpc", "ctr", "custoLead", "custoAquisicaoCliente"] },
                taxaAgendamento: { type: "number" }, taxaComparecimento: { type: "number" }, taxaFechamento: { type: "number" }, ticketMedio: { type: "number" }, investimentoExemplo: { type: "number" }, taxaConversao: { type: "number" }, explicacao: { type: "string" }
              },
              required: ["meta", "google", "taxaAgendamento", "taxaComparecimento", "taxaFechamento", "ticketMedio", "investimentoExemplo", "explicacao"]
            }
          }
        },
        lancamento: {
          type: "function",
          function: {
            name: "retornar_benchmarks_lancamento",
            description: "Retorna benchmarks de Meta e Google Ads para lançamento",
            parameters: {
              type: "object",
              properties: {
                meta: { type: "object", properties: { cpm: { type: "number" }, cpc: { type: "number" }, ctr: { type: "number" }, custoLead: { type: "number" } }, required: ["cpm", "cpc", "ctr", "custoLead"] },
                google: { type: "object", properties: { cpm: { type: "number" }, cpc: { type: "number" }, ctr: { type: "number" }, custoLead: { type: "number" } }, required: ["cpm", "cpc", "ctr", "custoLead"] },
                explicacao: { type: "string" }
              },
              required: ["meta", "google", "explicacao"]
            }
          }
        },
        perpetuo: {
          type: "function",
          function: {
            name: "retornar_benchmarks_perpetuo",
            description: "Retorna benchmarks de Meta e Google Ads para perpétuo",
            parameters: {
              type: "object",
              properties: {
                meta: { type: "object", properties: { cpm: { type: "number" }, cpc: { type: "number" }, ctr: { type: "number" }, custoAquisicaoCliente: { type: "number" } }, required: ["cpm", "cpc", "ctr", "custoAquisicaoCliente"] },
                google: { type: "object", properties: { cpm: { type: "number" }, cpc: { type: "number" }, ctr: { type: "number" }, custoAquisicaoCliente: { type: "number" } }, required: ["cpm", "cpc", "ctr", "custoAquisicaoCliente"] },
                explicacao: { type: "string" }
              },
              required: ["meta", "google", "explicacao"]
            }
          }
        },
        ecommerce: {
          type: "function",
          function: {
            name: "retornar_benchmarks_ecommerce",
            description: "Retorna benchmarks de Meta e Google Ads para e-commerce",
            parameters: {
              type: "object",
              properties: {
                meta: { type: "object", properties: { cpm: { type: "number" }, cpc: { type: "number" }, ctr: { type: "number" }, custoAquisicaoCliente: { type: "number" } }, required: ["cpm", "cpc", "ctr", "custoAquisicaoCliente"] },
                google: { type: "object", properties: { cpm: { type: "number" }, cpc: { type: "number" }, ctr: { type: "number" }, custoAquisicaoCliente: { type: "number" } }, required: ["cpm", "cpc", "ctr", "custoAquisicaoCliente"] },
                cpc: { type: "number" }, taxaViewContent: { type: "number" }, taxaAddToCart: { type: "number" }, taxaCheckout: { type: "number" }, taxaPurchase: { type: "number" }, ticketMedio: { type: "number" }, investimentoExemplo: { type: "number" }, explicacao: { type: "string" }
              },
              required: ["meta", "google", "cpc", "taxaViewContent", "taxaAddToCart", "taxaCheckout", "taxaPurchase", "ticketMedio", "explicacao"]
            }
          }
        }
      };

      const tool = tools[tipo];
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
            { role: "user", content: userPrompts[tipo] },
          ],
          tools: [tool],
          tool_choice: { type: "function", function: { name: tool.function.name } },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        throw new Error("Erro ao gerar benchmarks");
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("Resposta da IA não contém benchmarks");
      benchmarks = JSON.parse(toolCall.function.arguments);
    }

    return new Response(JSON.stringify(benchmarks), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
