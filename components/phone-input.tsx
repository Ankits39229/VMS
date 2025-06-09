"use client"

import { forwardRef } from "react"
import PhoneInputComponent from "react-phone-number-input"
import { Input } from "@/components/ui/input"
import "react-phone-number-input/style.css"

interface PhoneInputProps {
  value?: string
  onChange?: (value: string | undefined) => void
  placeholder?: string
  className?: string
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, placeholder, className, ...props }, ref) => {
    return (
      <PhoneInputComponent
        international
        countryCallingCodeEditable={false}
        defaultCountry="US"
        value={value}
        onChange={onChange}
        inputComponent={Input}
        placeholder={placeholder}
        className={className}
        {...props}
      />
    )
  },
)

PhoneInput.displayName = "PhoneInput"
