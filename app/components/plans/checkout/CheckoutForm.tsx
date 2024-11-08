"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Label } from "@/app/components/ui/label"
import { checkoutSchema, type CheckoutFormData } from "@/lib/validation"
import { maskCPF } from "@/utils/masks"
import { useEffect } from "react"

interface CheckoutFormProps {
  nome: string
  email: string
  cpf: string
  isLoading: boolean
  onSubmit: (data: CheckoutFormData) => void
}

export function CheckoutForm({
  nome,
  email,
  cpf,
  isLoading,
  onSubmit,
}: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      nome: "",
      email: "",
      cpf: "",
    }
  })

  const cpfValue = watch("cpf")
  useEffect(() => {
    if (cpfValue) {
      const formattedCPF = maskCPF(cpfValue)
      if (formattedCPF !== cpfValue) {
        setValue("cpf", formattedCPF)
      }
    }
  }, [cpfValue, setValue])

  useEffect(() => {
    setValue("nome", nome)
    setValue("email", email)
    setValue("cpf", cpf)
  }, [nome, email, cpf, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome Completo</Label>
        <Input
          id="nome"
          {...register("nome")}
          className="w-full"
          disabled
        />
        {errors.nome && (
          <p className="text-sm text-red-500">{errors.nome.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf">CPF</Label>
        <Input
          id="cpf"
          {...register("cpf")}
          placeholder="Digite seu CPF"
          className="w-full"
          maxLength={14} // 999.999.999-99
        />
        {errors.cpf && (
          <p className="text-sm text-red-500">{errors.cpf.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          {...register("email")}
          className="w-full"
          disabled
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="pt-4">
        <Button 
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
          disabled={isLoading}
        >
          Gerar QR Code PIX
        </Button>
      </div>
    </form>
  )
}
