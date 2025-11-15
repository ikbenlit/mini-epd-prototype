'use client'

import { useState } from 'react'
import { Send, CheckCircle, XCircle } from 'lucide-react'
import type { FormSection } from '@/content/schemas/manifesto'
import type { LeadFormData } from '@/app/api/leads/route'

interface ContactFormProps {
  content: FormSection
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export function ContactForm({ content }: ContactFormProps) {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    company: '',
    projectType: '',
    budget: '',
    message: '',
  })

  const validateField = (name: keyof LeadFormData, value: string): string | null => {
    const field = content.fields[name]

    if (field.required && !value.trim()) {
      return field.error || `${field.label} is verplicht`
    }

    if (name === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return 'Ongeldig email adres'
      }
    }

    if (name === 'message' && value && field.minLength) {
      if (value.length < field.minLength) {
        return `Minimaal ${field.minLength} karakters vereist`
      }
    }

    return null
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error on change
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    const error = validateField(name as keyof LeadFormData, value)

    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors: Record<string, string> = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key as keyof LeadFormData, formData[key as keyof LeadFormData] || '')
      if (error) {
        newErrors[key] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Submit form
    setStatus('submitting')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Er ging iets mis')
      }

      setStatus('success')
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        projectType: '',
        budget: '',
        message: '',
      })
    } catch (error) {
      console.error('Form submission error:', error)
      setStatus('error')
    }
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          {content.success.title}
        </h3>
        <p className="text-slate-600 mb-6">
          {content.success.message}
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          {content.success.cta}
        </a>
      </div>
    )
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          {content.error.title}
        </h3>
        <p className="text-slate-600 mb-6">
          {content.error.message}
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          {content.error.retry}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
          {content.fields.name.label} {content.fields.name.required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={content.fields.name.placeholder}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
            errors.name ? 'border-red-500' : 'border-slate-300'
          }`}
          disabled={status === 'submitting'}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
          {content.fields.email.label} {content.fields.email.required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={content.fields.email.placeholder}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
            errors.email ? 'border-red-500' : 'border-slate-300'
          }`}
          disabled={status === 'submitting'}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Company */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
          {content.fields.company.label}
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder={content.fields.company.placeholder}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          disabled={status === 'submitting'}
        />
      </div>

      {/* Project Type */}
      <div>
        <label htmlFor="projectType" className="block text-sm font-medium text-slate-700 mb-2">
          {content.fields.projectType.label} {content.fields.projectType.required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="projectType"
          name="projectType"
          value={formData.projectType}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
            errors.projectType ? 'border-red-500' : 'border-slate-300'
          }`}
          disabled={status === 'submitting'}
        >
          <option value="">{content.fields.projectType.placeholder}</option>
          {content.fields.projectType.options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {errors.projectType && (
          <p className="mt-1 text-sm text-red-600">{errors.projectType}</p>
        )}
      </div>

      {/* Budget */}
      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-slate-700 mb-2">
          {content.fields.budget.label}
        </label>
        <select
          id="budget"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          disabled={status === 'submitting'}
        >
          <option value="">{content.fields.budget.placeholder}</option>
          {content.fields.budget.options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
          {content.fields.message.label} {content.fields.message.required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={content.fields.message.placeholder}
          rows={6}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
            errors.message ? 'border-red-500' : 'border-slate-300'
          }`}
          disabled={status === 'submitting'}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message}</p>
        )}
        <p className="mt-1 text-sm text-slate-500">
          {formData.message.length} / {content.fields.message.minLength} minimum
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {status === 'submitting' ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {content.buttons.submitting}
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            {content.buttons.submit}
          </>
        )}
      </button>
    </form>
  )
}
