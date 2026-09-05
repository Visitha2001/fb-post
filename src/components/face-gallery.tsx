"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UploadCloud, Trash2 } from "lucide-react";
import { Loader } from "./ui/loader";
import { ScrollArea } from "@/components/ui/scroll-area";

import { IFaceCollection } from "./workspace-client";
import { v4 as uuidv4 } from "uuid";

export function FaceGallery({ 
  faces, 
  setFaces,
  selectedFaceId,
  setSelectedFaceId,
  onNext 
}: { 
  faces: IFaceCollection[], 
  setFaces: (f: IFaceCollection[]) => void,
  selectedFaceId?: string | null,
  setSelectedFaceId?: (id: string | null) => void,
  onNext?: () => void
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [localSelectedFaceId, setLocalSelectedFaceId] = useState<string | null>(null);

  const currentSelectedFaceId = selectedFaceId !== undefined ? selectedFaceId : localSelectedFaceId;

  const handleSelectFace = (id: string | null) => {
    if (setSelectedFaceId) setSelectedFaceId(id);
    else setLocalSelectedFaceId(id);
  };
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayCount, setDisplayCount] = useState(6);
  const visibleFaces = faces.slice(0, displayCount);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result;

        const uploadRes = await fetch("/api/upload-face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64data }),
        });
        const uploadData = await uploadRes.json();
        
        if (uploadData.url) {
          const newCollection = {
            id: uuidv4(),
            frontUrl: uploadData.url,
            sideUrl: uploadData.url // Temporary: Use same image for both until multi-upload UI is built
          };
          const saveRes = await fetch("/api/user/faces", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCollection),
          });
          const saveData = await saveRes.json();
          if (saveData.faces) setFaces(saveData.faces);
        }
      };
    } catch (err) {
      setErrorMsg("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function executeDelete() {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    
    if (currentSelectedFaceId === id) handleSelectFace(null);
    try {
      const res = await fetch("/api/user/faces", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.faces) setFaces(data.faces);
    } catch (e) {
      setErrorMsg("Failed to delete face collection");
    }
  }

  return (
    <>
      <Card className="h-[600px] flex flex-col shadow-lg border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <CardTitle className="font-[family-name:var(--font-outfit)]">My Face Gallery</CardTitle>
            <CardDescription>Select a face collection to use for posts, or upload a new one.</CardDescription>
          </div>
          {/* Upload feature temporarily hidden
          <div className="relative">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? <Loader className="mr-2 h-4 w-4" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Upload Custom
            </Button>
          </div>
          */}
        </CardHeader>
        <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
          <ScrollArea className="flex-1 w-full">
            <div className="p-6 h-full">
              {faces.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-20">
                  <p className="text-lg font-medium font-[family-name:var(--font-outfit)]">Your gallery is empty.</p>
                  <p className="text-sm">Generate or upload a face to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                  {visibleFaces.map((collection, i) => {
                    const isSelected = currentSelectedFaceId === collection.id;
                    return (
                      <div 
                        key={collection.id} 
                        onClick={() => handleSelectFace(collection.id)}
                        className={`group relative w-full rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer ring-2 ring-offset-[4px] ring-offset-slate-50 dark:ring-offset-slate-950 bg-white dark:bg-slate-900 p-2 ${
                          isSelected 
                            ? "ring-blue-500 shadow-blue-500/30" 
                            : "ring-transparent hover:ring-blue-400"
                        }`}
                      >
                        <div className="flex gap-2">
                          <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <Image src={collection.frontUrl} alt="Front View" fill className="object-cover" />
                          </div>
                          <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <Image src={collection.sideUrl} alt="Side View" fill className="object-cover" />
                          </div>
                        </div>
                        
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-3xl transition-opacity flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                          <Button size="sm" variant="default" className="w-32 font-medium shadow-lg hover:scale-105 transition-transform bg-white text-slate-900 hover:bg-slate-100">
                            {isSelected ? "Selected" : "Use Collection"}
                          </Button>
                          <Button size="icon" variant="destructive" className="h-10 w-10 absolute top-4 right-4 rounded-full shadow-lg hover:scale-110 transition-transform" onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(collection.id); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {displayCount < faces.length && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center mt-4 pb-4">
                      <Button variant="secondary" onClick={() => setDisplayCount(prev => prev + 6)}>
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
          {onNext && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <Button variant="outline" className="w-full h-12 text-md font-semibold" onClick={onNext} disabled={!currentSelectedFaceId}>
                Next Phase: Create Post →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Face Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this face collection? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={executeDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
