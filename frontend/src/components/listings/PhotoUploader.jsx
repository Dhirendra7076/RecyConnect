import { useRef, useState } from 'react'
import { uploadImage } from '../../api/uploads'
import { useToast } from '../../hooks/useToast'

const MAX_PHOTOS = 3
const MAX_MB = 5

export default function PhotoUploader({ value = [], onChange }) {
  const toast = useToast()
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(fileList) {
    const files = Array.from(fileList || [])
    if (!files.length) return

    const remaining = MAX_PHOTOS - value.length
    if (remaining <= 0) {
      toast.warning(`Up to ${MAX_PHOTOS} photos`)
      return
    }

    setUploading(true)
    const uploaded = []
    for (const file of files.slice(0, remaining)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        continue
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        toast.error(`${file.name} is larger than ${MAX_MB} MB`)
        continue
      }
      try {
        const { url } = await uploadImage(file)
        uploaded.push(url)
      } catch (err) {
        toast.error(err.message || `Failed to upload ${file.name}`)
      }
    }
    setUploading(false)
    if (uploaded.length) onChange([...value, ...uploaded])
    // Clear the input so selecting the same file again re-fires onChange
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeAt(i) {
    onChange(value.filter((_, idx) => idx !== i))
  }

  return (
    <div className="form-control w-full">
      <label className="label pb-1">
        <span className="label-text font-medium">
          Photos{' '}
          <span className="opacity-60 font-normal">
            (optional, up to {MAX_PHOTOS})
          </span>
        </span>
      </label>

      <div className="grid grid-cols-3 gap-2">
        {value.map((url, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-xl overflow-hidden border border-base-300 bg-base-200"
          >
            <img
              src={url}
              alt={`Upload ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              className="btn btn-xs btn-circle btn-error absolute top-1 right-1"
              onClick={() => removeAt(i)}
              aria-label={`Remove photo ${i + 1}`}
            >
              ✕
            </button>
          </div>
        ))}

        {value.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-base-300 hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-1 text-xs opacity-70 hover:opacity-100 transition-colors"
          >
            {uploading ? (
              <span className="loading loading-spinner loading-sm text-primary" />
            ) : (
              <>
                <span className="text-2xl" aria-hidden="true">📷</span>
                <span>Add photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}