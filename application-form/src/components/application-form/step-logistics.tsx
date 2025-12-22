'use client'

import { UseFormReturn } from 'react-hook-form'
import { ApplicationFormData } from '@/schemas/application'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="zipFile">
          Upload Media Kit & Supporting Documents
        </Label>
        <p className="text-sm text-slate-600">
          Upload a ZIP file containing your media kit, previous collaborations, brand photos,
          and any other relevant materials (max 25 MB).
        </p>

        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          {!zipFile ? (
            <label
              htmlFor="zipFile"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  ZIP file only, max 25 MB
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
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{zipFile.name}</p>
                <p className="text-xs text-slate-500 mt-1">{formatFileSize(zipFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Remove file
              </button>
            </div>
          )}
        </div>

        {uploadError && (
          <p className="text-sm text-red-500">{uploadError}</p>
        )}
      </div>

      <div className="border-t pt-6">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="termsAccepted"
            checked={termsAccepted}
            onCheckedChange={(checked) => setValue('termsAccepted', checked as boolean)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="termsAccepted"
              className="text-sm font-medium leading-relaxed cursor-pointer"
            >
              I accept the terms and privacy policy
            </Label>
            <p className="text-sm text-slate-500">
              By submitting this application, I agree to Wavelaunch Studio's{' '}
              <a
                href={`${process.env.NEXT_PUBLIC_WAVELAUNCH_URL || 'https://wavelaunch.vc'}/terms`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href={`${process.env.NEXT_PUBLIC_WAVELAUNCH_URL || 'https://wavelaunch.vc'}/privacy`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Privacy Policy
              </a>
              . I understand that my application will be reviewed and I may be contacted for
              further discussion.
            </p>
          </div>
        </div>
        {errors.termsAccepted && (
          <p className="text-sm text-red-500 mt-2">{errors.termsAccepted.message}</p>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="text-sm text-slate-700 leading-relaxed">
          <strong>Note:</strong> Your application progress is automatically saved. You can safely
          close this page and return later to complete your application. All your answers will be
          preserved.
        </p>
      </div>
    </div>
  )
}
