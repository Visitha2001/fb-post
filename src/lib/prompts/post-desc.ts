export const getSocialMediaTextPrompt = (title: string, description: string, language: string) => {
  return `
You are an expert social media manager.
Based on the provided image and the user's short instructions below, write a highly engaging Facebook post description. 
Include suitable, real Facebook hashtags.
Ensure the response is exclusively in this language: ${language}.
Do NOT output any conversational filler or "Here is the post...". Output ONLY the final post text.

User's short instructions/title: ${title}. ${description || ""}
  `.trim();
};
