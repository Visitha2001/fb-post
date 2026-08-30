/**
 * Prompt for generating initial face portraits using Pollinations (free).
 * Self-contained — does not reference any other prompt file.
 */
export const getFaceGenerationPrompt = (gender: string, userPrompt: string = "") => {
  const userDetails = userPrompt ? userPrompt + ', ' : '';

  const basePrompt = `${userDetails}photorealistic candid portrait of a ${gender}, distinct and consistent facial features, highly detailed eyes and hair, natural skin tone with visible pores and imperfections, unretouched, shot on 35mm film, soft natural lighting, realistic, cinematic, 8k resolution`;

  const frontPrompt = encodeURIComponent(`${basePrompt}, looking straight at camera, neutral expression, plain solid bright green background, green screen`);
  const sidePrompt = encodeURIComponent(`${basePrompt}, side profile view, neutral expression, plain solid bright green background, green screen`);

  return { frontPrompt, sidePrompt };
};
