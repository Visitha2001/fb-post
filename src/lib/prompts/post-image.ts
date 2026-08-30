/**
 * Prompt for generating the post image using Pollinations (free).
 * Takes the Gemini-generated face description and scene settings,
 * and produces a URL-encoded prompt for the image generator.
 * Self-contained — does not reference any other prompt file.
 */
export const getPostImagePrompt = ({
  clothing,
  background,
  style,
  description,
  faceDescription,
}: {
  clothing: string;
  background: string;
  style: string;
  description?: string;
  faceDescription: string;
}) => {
  // Put the scene, action, and style FIRST so they don't get truncated or ignored
  let imagePrompt = `Photorealistic ${style} style photo of a person wearing ${clothing}, located at ${background}. `;
  
  if (description) {
    imagePrompt += `Context: ${description}. `;
  }

  // Append the massive character description afterward
  imagePrompt += `The person MUST EXACTLY match this physical description: ${faceDescription}. 
shot on 35mm lens, f/1.8 aperture, full body or half body shot, candid moment, unposed, highly detailed, raw photo, ultra realistic. 
[Negative_Prompt: close up portrait, headshot, mutated face, different person, wrong ethnicity, changed hair color, deformed, illustration, painting, cartoon, 3d, fake, plastic skin]`;

  return encodeURIComponent(imagePrompt);
};
