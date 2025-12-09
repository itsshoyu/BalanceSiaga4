import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing transactions:", transactions.length);

    // Prepare transaction data for AI analysis
    const transactionSummary = transactions.map((t: any) => ({
      type: t.type,
      amount: t.amount,
      category: t.category,
      date: t.date
    }));

    const prompt = `Analyze the following financial transactions and provide insights in Indonesian language:

${JSON.stringify(transactionSummary, null, 2)}

Please provide a comprehensive financial analysis including:

1. **Monthly Summary**: Brief overview of spending patterns this month
2. **Pattern Detection**: Identify the highest spending category, most expensive day, and spending trends (increasing/decreasing)
3. **Savings Recommendations**: Provide 3 actionable tips based on the transaction data with potential savings amounts
4. **Finance Score**: Calculate a score from 1-100 based on income/expense ratio, spending stability, and trends. Consider:
   - Income vs Expense ratio (higher income relative to expenses = better score)
   - Consistency (stable spending = better score)
   - Trend direction (decreasing expenses over time = better score)
5. **Next Month Prediction**: Predict next month's expenses based on current trends with a margin of error

Format your response as a valid JSON object with this exact structure:
{
  "summary": "string",
  "patterns": {
    "highestCategory": "string",
    "mostExpensiveDay": "string",
    "trend": "increasing|stable|decreasing",
    "trendExplanation": "string"
  },
  "recommendations": [
    {
      "tip": "string",
      "potentialSavings": number,
      "priority": "high|medium|low"
    }
  ],
  "financeScore": {
    "score": number (1-100),
    "explanation": "string",
    "factors": {
      "incomeExpenseRatio": "good|fair|poor",
      "stability": "high|medium|low",
      "trend": "improving|stable|declining"
    }
  },
  "prediction": {
    "estimatedExpense": number,
    "marginOfError": number,
    "explanation": "string",
    "confidence": "high|medium|low"
  }
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a financial advisor AI that provides insights in Indonesian language. Always respond with valid JSON only, no additional text." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log("AI Response:", aiResponse);

    // Parse JSON response from AI
    let insights;
    try {
      // Try to extract JSON from response if AI included extra text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        insights = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return new Response(JSON.stringify({ error: "Failed to parse AI insights" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ai-insights function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
