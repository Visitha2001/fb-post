"use client";

import { useState } from "react";
import { IFaceCollection } from "./workspace-client";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { Globe, MoreHorizontal, ThumbsUp, MessageSquare, Share2, Loader2, Download, Save, Copy } from "lucide-react";
import Image from "next/image";

interface PostGeneratorProps {
  faces: IFaceCollection[];
}

export function PostGenerator({ faces }: PostGeneratorProps) {
  const [selectedFaceId, setSelectedFaceId] = useState<string>("");
  const [title, setTitle] = useState("My Awesome Post");
  const [language, setLanguage] = useState("English");
  const [style, setStyle] = useState("Casual");
  const [clothing, setClothing] = useState("Everyday wear");
  const [background, setBackground] = useState("City street");
  const [description, setDescription] = useState("Feeling great today! #vibes");
  const [aspectRatio, setAspectRatio] = useState("1:1");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [faceDescription, setFaceDescription] = useState<string | null>(null);

  const selectedFace = faces.find((f) => f.id === selectedFaceId);

  const handleGenerate = async () => {
    if (!selectedFaceId) return alert("Please select a face first.");
    setIsGenerating(true);
    setGeneratedImage(null);
    setGeneratedText(null);
    setFaceDescription(null);

    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          language,
          style,
          clothing,
          background,
          description,
          aspectRatio,
          faceUrl: selectedFace?.frontUrl
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate");
      }
      const data = await res.json();
      setGeneratedImage(data.imageUrl);
      setGeneratedText(data.generatedText);
      setFaceDescription(data.faceDescription);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error generating post");
    } finally {
      setIsGenerating(false);
    }
  };

  // Derive aspect ratio class for preview
  let aspectRatioClass = "aspect-square";
  if (aspectRatio === "4:5") aspectRatioClass = "aspect-[4/5]";
  if (aspectRatio === "16:9") aspectRatioClass = "aspect-video";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Panel: Input Controls */}
      <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Post Settings</h2>

        <div className="space-y-4">
          {/* Face Selector */}
          <div className="space-y-2">
            <Label>Select Face Identity</Label>
            {faces.length === 0 ? (
              <p className="text-sm text-slate-500">No faces available. Please generate one first.</p>
            ) : (
              <ScrollArea className="w-full whitespace-nowrap rounded-md border border-slate-200 dark:border-slate-800">
                <div className="flex w-max space-x-4 p-4">
                  {faces.map((face) => (
                    <button
                      key={face.id}
                      onClick={() => setSelectedFaceId(face.id)}
                      className={`relative w-20 h-20 rounded-full overflow-hidden border-4 transition-all ${
                        selectedFaceId === face.id ? "border-blue-500 scale-110" : "border-transparent hover:border-slate-300"
                      }`}
                    >
                      <Image src={face.frontUrl} alt="Face" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
            
            {faceDescription && (
              <details className="text-sm bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 mt-2">
                <summary className="font-medium cursor-pointer text-slate-700 dark:text-slate-300">
                  View Generated Face Description
                </summary>
                <div className="mt-2 text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {faceDescription}
                </div>
              </details>
            )}
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Post Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter post title" />
          </div>

          {/* Language and Aspect Ratio (2 columns) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={(val) => setLanguage(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Sinhala">Sinhala</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={(val) => setAspectRatio(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Ratio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="4:5">4:5 (Portrait)</SelectItem>
                  <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Style and Clothing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Input id="style" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="e.g., Fitness, Business" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clothing">Clothing</Label>
              <Input id="clothing" value={clothing} onChange={(e) => setClothing(e.target.value)} placeholder="e.g., Suit, Gym wear" />
            </div>
          </div>

          {/* Background */}
          <div className="space-y-2">
            <Label htmlFor="background">Background Scene</Label>
            <Input id="background" value={background} onChange={(e) => setBackground(e.target.value)} placeholder="e.g., Beach, Office, City" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Post Description (Instructions)</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="What should the post say?"
              className="resize-none h-24"
            />
          </div>

          <Button className="w-full mt-4" size="lg" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
              </>
            ) : (
              "Generate Post"
            )}
          </Button>
        </div>
      </div>

      {/* Right Panel: Facebook Preview Shell */}
      <div className="flex flex-col items-center justify-start p-4 w-full">
        <div className="w-full max-w-[500px] bg-white dark:bg-slate-950 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          
          {/* Facebook Post Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                {selectedFace ? (
                  <Image src={selectedFace.frontUrl} alt="Profile" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-100 dark:bg-blue-900" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {title || "AI Influencer"}
                </h3>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-1">
                  <span>Just now</span>
                  <span>·</span>
                  <Globe className="w-3 h-3" />
                </div>
              </div>
            </div>
            <button className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Post Text */}
          <div className="px-4 pb-3 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
            {generatedText || description || "Your post description will appear here."}
          </div>

          {/* Image Placeholder */}
          <div className={`w-full bg-slate-100 dark:bg-slate-900 relative ${aspectRatioClass} flex items-center justify-center border-y border-slate-200 dark:border-slate-800`}>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <span className="text-sm">Creating image...</span>
              </div>
            ) : generatedImage ? (
              <Image src={generatedImage} alt="Generated Post" fill className="object-cover" />
            ) : (
              <div className="text-center text-slate-400">
                <div className="text-sm font-medium mb-1">Image Preview</div>
                <div className="text-xs">
                  {style && `${style} style, `}
                  {clothing && `wearing ${clothing}, `}
                  {background && `at ${background}`}
                </div>
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3 mb-1">
              <div className="flex items-center space-x-1">
                <div className="bg-blue-500 p-1 rounded-full">
                  <ThumbsUp className="w-3 h-3 text-white fill-current" />
                </div>
                <span className="text-xs">You and others</span>
              </div>
              <div className="text-xs space-x-3">
                <span>0 comments</span>
                <span>0 shares</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-1">
              <button className="flex-1 flex items-center justify-center space-x-2 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                <ThumbsUp className="w-5 h-5" />
                <span className="text-sm font-medium">Like</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-medium">Comment</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {generatedImage && generatedText && (
          <div className="w-full max-w-[500px] mt-4 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => navigator.clipboard.writeText(generatedText)}>
              <Copy className="w-4 h-4 mr-2" /> Copy Text
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => {
              const a = document.createElement("a");
              a.href = generatedImage;
              a.download = "generated-post.jpg";
              a.click();
            }}>
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
            <Button className="flex-1">
              <Save className="w-4 h-4 mr-2" /> Save to DB
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
