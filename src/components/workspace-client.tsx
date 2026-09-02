"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaceGenerator } from "@/components/face-generator";
import { FaceGallery } from "@/components/face-gallery";
import { PostGenerator } from "@/components/post-generator";

export interface IFaceCollection {
  id: string;
  frontUrl: string;
  sideUrl: string;
}

export function WorkspaceClient({ initialFaces }: { initialFaces: IFaceCollection[] }) {
  const [faces, setFaces] = useState<IFaceCollection[]>(initialFaces);
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);

  function handleFaceSaved(newFace: IFaceCollection) {
    setFaces((prev) => [...prev, newFace]);
    setSelectedFaceId(newFace.id); // Automatically select newly generated face
    setActiveTab("gallery");
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8 w-full">
      <div className="flex justify-center w-full">
        <TabsList className="inline-flex w-full overflow-x-auto no-scrollbar justify-start sm:justify-center max-w-[800px] !h-auto p-2 rounded-2xl sm:rounded-full bg-slate-200/50 dark:bg-slate-900/80 shadow-inner border border-slate-200 dark:border-slate-800 gap-2 sm:gap-0">
          <TabsTrigger value="generate" className="flex-1 min-w-fit sm:w-auto py-2 px-4 sm:py-3 sm:px-6 rounded-xl sm:rounded-full text-sm sm:text-base font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-md transition-all">Generate Face</TabsTrigger>
          <TabsTrigger value="gallery" className="flex-1 min-w-fit sm:w-auto py-2 px-4 sm:py-3 sm:px-6 rounded-xl sm:rounded-full text-sm sm:text-base font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-md transition-all">Select Face</TabsTrigger>
          <TabsTrigger value="post" className="flex-1 min-w-fit sm:w-auto py-2 px-4 sm:py-3 sm:px-6 rounded-xl sm:rounded-full text-sm sm:text-base font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-md transition-all">Create Post</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="generate" className="mt-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="max-w-2xl mx-auto w-full">
          <FaceGenerator onSave={handleFaceSaved} onNext={() => setActiveTab("gallery")} />
        </div>
      </TabsContent>

      <TabsContent value="gallery" className="mt-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        <FaceGallery faces={faces} setFaces={setFaces} selectedFaceId={selectedFaceId} setSelectedFaceId={setSelectedFaceId} onNext={() => setActiveTab("post")} />
      </TabsContent>
      
      <TabsContent value="post" className="mt-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        <PostGenerator faces={faces} selectedFaceId={selectedFaceId} setSelectedFaceId={setSelectedFaceId} />
      </TabsContent>
    </Tabs>
  );
}
