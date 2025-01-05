"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function BentoImage({ src, alt, className }: { 
  src: string; 
  alt: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden relative group",
      className
    )}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
    </div>
  );
} 