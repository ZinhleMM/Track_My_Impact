/*
CM3070 Computer Science Final Project Track My Impact: Data Driven Waste Management
BSc Computer Science, Goldsmiths, University of London
CM3070 Final Project in Data Science (CM3050)
with Extended Features in Machine Learning and Neural Networks (CM3015) and Databases and Advanced Data Techniques (CM3010)
by
Zinhle Maurice-Mopp (210125870)
zm140@student.london.ac.uk

sheet.tsx: Radix sheet wrapper ensuring consistent slide-over styling across tools.
*/
"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;
const SheetOverlay = SheetPrimitive.Overlay;
const SheetBaseContent = SheetPrimitive.Content;
const SheetTitle = SheetPrimitive.Title;
const SheetDescription = SheetPrimitive.Description;

const sheetVariants = cva(
  "fixed inset-y-0 z-50 flex flex-col bg-white shadow-lg transition-transform duration-300",
  {
    variants: {
      side: {
        top: "inset-x-0 justify-start rounded-b-lg",
        bottom: "inset-x-0 justify-end rounded-t-lg",
        left: "left-0 h-full w-3/4 border-r border-gray-200 sm:max-w-sm",
        right: "right-0 h-full w-3/4 border-l border-gray-200 sm:max-w-sm",
      },
    },
    defaultVariants: { side: "right" },
  }
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(
  ({ side = "right", className, children, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
      <SheetBaseContent
        ref={ref}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        <SheetPrimitive.Close
          className="absolute right-3 top-3 rounded-full p-2 text-gray-500 transition hover:text-gray-700"
        >
          <X className="h-4 w-4" aria-hidden />
          <span className="sr-only">Close panel</span>
        </SheetPrimitive.Close>
        <div className="h-full overflow-y-auto px-6 py-8">{children}</div>
      </SheetBaseContent>
    </SheetPortal>
  )
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

/**
 * Opinionated wrapper around Radix UI sheet used for slide-in panels within the dashboard.
 */
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetTitle,
  SheetDescription,
};
