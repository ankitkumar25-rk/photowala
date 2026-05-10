export default function FileUploadOption({
  fileOption,
  setFileOption,
  attachedFile,
  setFile,
  emailForFile,
  setEmailForFile,
}) {
  const FileInput = require('../FileInput').default;
  
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-800">5. Select File Option</p>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="radio"
          checked={fileOption === 'attach'}
          onChange={() => setFileOption('attach')}
          className="accent-brand-primary"
        />
        â˜ï¸ Attach File Online
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="radio"
          checked={fileOption === 'email'}
          onChange={() => setFileOption('email')}
          className="accent-brand-primary"
        />
        âœ‰ï¸ Send via Email
      </label>

      {fileOption === 'attach' ? (
        <div className="rounded-xl border border-dashed border-cream-300 p-3">
          <FileInput
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            selectedFileName={attachedFile?.name}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="email"
            value={emailForFile}
            onChange={(e) => setEmailForFile(e.target.value)}
            className="input-field"
            placeholder="Send file to: email@example.com"
          />
          <p className="text-xs font-medium text-amber-700">Extra Charges - ₹10.00 applicable</p>
        </div>
      )}
    </div>
  );
}
