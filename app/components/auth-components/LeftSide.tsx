"use client"

export default function LeftSide() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 to-emerald-800 items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-transparent bg-grid-white/[0.1] flex items-center justify-center">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-emerald-950[mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      </div>

      <div className="w-full text-white flex flex-col items-center justify-center relative z-10">
        <h1 className="text-7xl font-bold text-center">SimpleFinance</h1>

        <div className="w-full">
          <p className="mt-8 text-xl font-light text-center">
            Gerencie suas finanças de forma simples e eficiente
          </p>
        </div>
      </div>
    </div>
  )
}
