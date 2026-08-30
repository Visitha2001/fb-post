/**
 * Prompt sent to Gemini Vision to analyze a face image and produce
 * an extremely detailed text description of the person's appearance.
 * This description is then used by the image generator to recreate the same person.
 * Self-contained — does not reference any other prompt file.
 */
export const getFaceDescriptionPrompt = () => {
  return `You are a forensic-level portrait analyst. Study the person in this image and produce a detailed physical description.
DO NOT use any of the examples provided as your actual answer unless they genuinely match the image. Look closely at the image to determine the true gender, age, and facial hair.

MANDATORY details to include (extract ALL of these):
1. Exact gender
2. Exact estimated age
3. Specific ethnicity
4. Skin tone (shade, undertone)
5. Skin texture (pores, smoothness, wrinkles)
6. Face shape (oval, round, square, heart, long, diamond)
7. Forehead height and width
8. Forehead slope
9. Hairline shape (widows peak, straight, receding)
10. Hair color (primary and highlights)
11. Hair length
12. Hair texture (straight, wavy, curly, coiled)
13. Hair thickness/volume
14. Hair style (parting, tied, loose, fade)
15. Eyebrow shape (arched, straight, rounded)
16. Eyebrow thickness
17. Eyebrow color
18. Eyebrow spacing (unibrow, wide set)
19. Eye color (exact shade)
20. Eye shape (almond, round, monolid, hooded)
21. Eye size
22. Eye spacing (wide set, close set)
23. Eyelash length and thickness
24. Eyelid type
25. Under-eye appearance (bags, dark circles, smooth)
26. Nose bridge (flat, high, prominent)
27. Nose width
28. Nose tip (upturned, droopy, bulbous, pointed)
29. Nostril shape and size
30. Cheekbone prominence (high, low, flat)
31. Cheek volume (hollow, full, chubby)
32. Jawline shape (sharp, soft, square, rounded)
33. Jaw width
34. Chin shape (cleft, pointed, square, receding)
35. Lip thickness (upper lip vs lower lip)
36. Lip width (wide mouth, narrow mouth)
37. Lip shape (cupids bow prominence)
38. Lip color/pigmentation
39. Philtrum depth and length
40. Facial hair presence (clean shaven, stubble, beard, mustache, goatee)
41. Facial hair exact style/shape
42. Facial hair density/thickness
43. Facial hair color
44. Ear size
45. Ear prominence (sticking out, flat)
46. Ear lobe shape (attached, detached)
47. Facial asymmetry (is one eye higher, jaw skewed?)
48. Freckles or moles (exact locations)
49. Scars or blemishes
50. Neck thickness and length

RULES:
- You MUST output ONLY a valid JSON object. No markdown formatting, no code blocks, no backticks, no explanations. Just raw JSON.
- The JSON must have exactly one key: "description".
- The value of "description" must be a single, highly dense paragraph containing ALL 50 biological details requested above. Do NOT use a list format in the output, it must be a dense paragraph.
- Do NOT mention clothing, background, or lighting. Focus 100% on the biological face and body.`;
};
