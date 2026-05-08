import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300">
      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
        <div className="relative flex items-center justify-center">
          {/* Outer rotating ring */}
          <div className="absolute w-24 h-24 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          
          {/* Inner pulse */}
          <div className="absolute w-12 h-12 bg-primary/10 rounded-full animate-ping"></div>
          
          {/* Center icon */}
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
            W.Y.A?
          </h2>
          <p className="text-sm font-medium text-muted-foreground animate-pulse flex items-center">
            loading 
            <span className="inline-flex ml-1 space-x-1">
              <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
