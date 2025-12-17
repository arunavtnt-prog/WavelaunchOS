'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '../../schemas/application'
import { Label } from '../../components/ui/label'
import { Checkbox } from '../../components/ui/checkbox'
import { Upload } from 'lucide-react'
import { useState } from 'react'
import { formatFileSize } from '@/lib/utils'

interface StepProps {
  form: UseFormReturn<ApplicationFormData>
  zipFile: File | null
  setZipFile: (file: File | null) => void
}

export function StepLogistics({ form, zipFile, setZipFile }: StepProps) {
  const { formState: { errors }, setValue, watch } = form
  const [uploadError, setUploadError] = useState<string | null>(null)

  const termsAccepted = watch('termsAccepted')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadError(null)

    if (!file) {
      setZipFile(null)
      return
    }

    // Validate file type
    if (!file.name.endsWith('.zip')) {
      setUploadError('File must be a ZIP file')
      setZipFile(null)
      return
    }

    // Validate file size (25MB)
    const maxSize = 25 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError(`File size must be less than 25 MB (current: ${formatFileSize(file.size)})`)
      setZipFile(null)
      return
    }

    setZipFile(file)
  }

  const handleRemoveFile = () => {
    setZipFile(null)
    setUploadError(null)
    const fileInput = document.getElementById('zipFile') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <Label htmlFor="zipFile">
          Media Kit
        </Label>

        <div className="border border-white/20 p-10 text-center hover:border-white/40 transition-colors">
          {!zipFile ? (
            <label
              htmlFor="zipFile"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <Upload className="w-6 h-6 text-foreground/30" />
              <div>
                <p className="text-sm text-foreground/60">
                  Upload ZIP file
                </p>
                <p className="text-xs text-foreground/30 mt-2">
                  Max 25 MB
                </p>
              </div>
              <input
                id="zipFile"
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Upload className="w-6 h-6 text-foreground/50" />
              <div>
                <p className="text-sm text-foreground/70">{zipFile.name}</p>
                <p className="text-xs text-foreground/30 mt-1">{formatFileSize(zipFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {uploadError && (
          <p className="text-xs text-red-400/80">{uploadError}</p>
        )}
      </div>

      <div className="border-t border-white/10 pt-10">
        <div className="flex items-start space-x-4">
          <Checkbox
            id="termsAccepted"
            checked={termsAccepted}
            onCheckedChange={(checked) => setValue('termsAccepted', checked as boolean)}
          />
          <div className="grid gap-2 leading-none">
            <Label
              htmlFor="termsAccepted"
              className="text-sm font-normal normal-case tracking-normal text-foreground/70 leading-relaxed cursor-pointer"
            >
              I accept the terms and privacy policy <span className="text-foreground/30">*</span>
            </Label>
            <p className="text-xs text-foreground/40 leading-relaxed">
              By submitting, I agree to Wavelaunch Studio's{' '}
              <a
                href={`${process.env.NEXT_PUBLIC_WAVELAUNCH_URL || 'https://wavelaunch.vc'}/terms`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/50 hover:text-foreground/70 underline underline-offset-2"
              >
                Terms
              </a>{' '}
              and{' '}
              <a
                href={`${process.env.NEXT_PUBLIC_WAVELAUNCH_URL || 'https://wavelaunch.vc'}/privacy`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/50 hover:text-foreground/70 underline underline-offset-2"
              >
                Privacy Policy
              </a>.
            </p>
          </div>
        </div>
        {errors.termsAccepted && (
          <p className="text-xs text-red-400/80 mt-3">{errors.termsAccepted.message}</p>
        )}
      </div>

      <div className="border-t border-white/10 pt-8">
        <p className="text-xs text-foreground/30 leading-relaxed">
          Your progress is automatically saved.
        </p>
      </div>
    </div>
  )
}
