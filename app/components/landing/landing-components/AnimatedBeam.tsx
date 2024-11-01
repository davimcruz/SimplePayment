"use client"

import React, { forwardRef, useRef } from "react"
import { cn } from "@/lib/utils"
import { AnimatedBeam } from "@/app/components/ui/animated-beam"
import { Building2, Wallet, CreditCard, PiggyBank } from "lucide-react"

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        "dark:bg-gray-900 dark:border-gray-700",
        className
      )}
    >
      {children}
    </div>
  )
})

Circle.displayName = "Circle"

interface AnimatedBeamDemoProps {
  className?: string;
}

export function AnimatedBeamMultipleOutputDemo({ className }: AnimatedBeamDemoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const bank1Ref = useRef<HTMLDivElement>(null)
  const bank2Ref = useRef<HTMLDivElement>(null)
  const walletRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  return (
    <div
      className={cn(
        "relative flex w-full h-full items-center justify-center overflow-hidden",
        className
      )}
      ref={containerRef}
    >
      <div className="flex w-full h-full flex-col items-stretch justify-between">
        <div className="flex flex-row justify-between px-12">
          <Circle ref={bank1Ref} className="text-[#2662d9]">
            <Building2 size={24} />
          </Circle>
          <Circle ref={bank2Ref} className="text-[#2662d9]">
            <PiggyBank size={24} />
          </Circle>
        </div>

        <div className="flex flex-row justify-center">
          <Circle ref={centerRef} className="text-[#2662d9]">
            <Wallet size={24} />
          </Circle>
        </div>

        <div className="flex flex-row justify-between px-12">
          <Circle ref={walletRef} className="text-[#2662d9]">
            <CreditCard size={24} />
          </Circle>
          <Circle ref={cardRef} className="text-[#2662d9]">
            <Building2 size={24} />
          </Circle>
        </div>
      </div>

      {/* Conexões superiores */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={bank1Ref}
        toRef={centerRef}
        startYOffset={10}
        endYOffset={-10}
        curvature={20}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={bank2Ref}
        toRef={centerRef}
        startYOffset={10}
        endYOffset={-10}
        curvature={-20}
      />

      {/* Conexões inferiores */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={centerRef}
        toRef={walletRef}
        startYOffset={10}
        endYOffset={-10}
        curvature={20}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={centerRef}
        toRef={cardRef}
        startYOffset={10}
        endYOffset={-10}
        curvature={-20}
      />
    </div>
  )
}
