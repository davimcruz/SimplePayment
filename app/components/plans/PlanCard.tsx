import { Check } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { cn } from "@/lib/utils"

interface PlanFeature {
  text: string
  included: boolean
}

interface PlanCardProps {
  name: string
  price: string
  description: string
  features: PlanFeature[]
  popular?: boolean
  buttonText: string
  onSelect: () => void
}

const PlanCard = ({
  name,
  price,
  description,
  features,
  popular,
  buttonText,
  onSelect,
}: PlanCardProps) => {
  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-gradient-to-t from-background/10 to-primary/10 p-6 shadow-lg",
        popular && "border-emerald-500 shadow-emerald-500/20"
      )}
    >
      {popular && (
        <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-emerald-700 px-4 py-1 text-sm font-semibold text-white">
          Mais Popular
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-2xl font-bold">{name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{price}</span>
          {price !== "Grátis" && (
            <span className="text-muted-foreground">/mês</span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check
                className={cn(
                  "h-4 w-4",
                  feature.included
                    ? "text-emerald-500"
                    : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  !feature.included && "text-muted-foreground"
                )}
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        <Button
          onClick={onSelect}
          variant={popular ? "default" : "outline"}
          className={cn(
            "mt-2",
            popular && "bg-emerald-500 hover:bg-emerald-600 font-semibold text-emerald-950"
          )}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  )
}

export default PlanCard
