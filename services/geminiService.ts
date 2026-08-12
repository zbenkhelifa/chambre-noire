import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getHintFromGemini = async (
  context: string,
  userCode: string
): Promise<string> => {
  const client = getClient();
  if (!client) return "Erreur: Clé API manquante. Vérifiez votre configuration.";

  const prompt = `
    Tu es un professeur expert en photographie numérique et en programmation Python pour des lycéens.
    L'élève est bloqué dans un escape game éducatif.
    
    Contexte du niveau : ${context}
    
    Code actuel de l'élève :
    \`\`\`python
    ${userCode}
    \`\`\`
    
    Donne un indice court, encourageant et pédagogique sans donner la réponse directement (le code exact).
    Explique le concept (RVB, Pixel, boucle, etc.) si nécessaire.
    Réponds en français. Max 2 phrases.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Désolé, je ne peux pas analyser le code pour le moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erreur de communication avec le tuteur IA.";
  }
};
