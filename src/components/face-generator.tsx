"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Save } from "lucide-react";
import { Loader } from "./ui/loader";

import { IFaceCollection } from "./workspace-client";
import { v4 as uuidv4 } from "uuid";

export function FaceGenerator({ onSave, onNext }: { onSave: (f: IFaceCollection) => void, onNext?: () => void }) {
  const [gender, setGender] = useState<"male" | "female" | "neutral">("female");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ frontImage: string, sideImage: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    setGeneratedImages(null);
    try {
      const res = await fetch("/api/generate-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender, prompt }),
      });
      const data = await res.json();
      if (data.frontImage && data.sideImage) {
        setGeneratedImages({ frontImage: data.frontImage, sideImage: data.sideImage }); 
      } else {
        setErrorMsg(data.error || "Generation failed.");
      }
    } catch (e) {
      setErrorMsg("Error generating face.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!generatedImages) return;
    setIsSaving(true);
    try {
      const uploadResFront = await fetch("/api/upload-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: generatedImages.frontImage }),
      });
      const uploadDataFront = await uploadResFront.json();
      
      const uploadResSide = await fetch("/api/upload-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: generatedImages.sideImage }),
      });
      const uploadDataSide = await uploadResSide.json();

      if (!uploadDataFront.url || !uploadDataSide.url) throw new Error("Upload failed");

      const newCollection = {
        id: uuidv4(),
        frontUrl: uploadDataFront.url,
        sideUrl: uploadDataSide.url
      };

      const saveRes = await fetch("/api/user/faces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCollection),
      });
      
      if (saveRes.ok) {
        onSave(newCollection);
        setGeneratedImages(null);
        setPrompt("");
      }
    } catch (e) {
      setErrorMsg("Error saving face to gallery.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Card className="w-full shadow-lg border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl font-[family-name:var(--font-outfit)]">AI Face Generator</CardTitle>
          <CardDescription className="text-base">Generate a new photorealistic face to use for your influencer profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Select Gender</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              {(["female", "male", "neutral"] as const).map((g) => (
                <Button
                  key={g}
                  variant={gender === g ? "default" : "outline"}
                  onClick={() => setGender(g)}
                  className="capitalize flex-1 h-12 text-md"
                >
                  {g}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Custom Details (Optional)</Label>
            <Input 
              className="h-12"
              placeholder="e.g. blue eyes, blonde hair, freckles..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <Button 
            className="w-full h-12 text-md font-semibold bg-indigo-600 hover:bg-indigo-700 text-white" 
            onClick={handleGenerate} 
            disabled={isGenerating}
          >
            {isGenerating ? <Loader className="mr-2 h-5 w-5" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {isGenerating ? "Generating..." : "Generate AI Face"}
          </Button>

          {generatedImages && (
            <div className="mt-8 space-y-6 border-2 border-indigo-100 dark:border-slate-800 rounded-xl p-6 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
              <h3 className="font-semibold text-lg w-full text-center text-slate-800 dark:text-slate-200">Result</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm text-slate-500 font-medium">Front View</span>
                  <div className="relative h-48 w-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                    <Image src={generatedImages.frontImage} alt="Front Face" fill className="object-cover" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm text-slate-500 font-medium">Side View</span>
                  <div className="relative h-48 w-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                    <Image src={generatedImages.sideImage} alt="Side Face" fill className="object-cover" />
                  </div>
                </div>
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="w-full h-12" variant="default">
                {isSaving ? <Loader className="mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
                {isSaving ? "Saving to Gallery..." : "Save Collection to Gallery"}
              </Button>
            </div>
          )}

          {onNext && (
            <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" className="w-full h-12 text-md font-semibold" onClick={onNext}>
                Next Phase: Select Face →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!errorMsg} onOpenChange={(open) => !open && setErrorMsg(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>{errorMsg}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="default" onClick={() => setErrorMsg(null)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
