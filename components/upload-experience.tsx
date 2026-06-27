'use client';

import { useState } from 'react';
import { UploadCloud, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export function UploadExperience() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(event.dataTransfer.files).filter(
      (file) =>
        file.name.toLowerCase().endsWith('.pdf') ||
        file.name.toLowerCase().endsWith('.docx')
    );
    setFiles(droppedFiles);
    setMessage('');
    setProgress(0);
  };

  const onSubmit = async () => {
    if (!files.length) return;

    setIsUploading(true);
    setMessage('');
    setMessageType('');
    setProgress(0);

    // Process files one by one so we can show per-file progress
    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFile(file.name);

      // Progress: start of this file
      const baseProgress = Math.round((i / files.length) * 100);
      setProgress(baseProgress);

      const formData = new FormData();
      formData.append('files', file);

      try {
        const response = await fetch('/api/process', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          const errMsg = data.errors?.[0] || data.error || 'Failed to process';
          errors.push(`${file.name}: ${errMsg}`);
        } else {
          successCount += data.processed ?? 1;
        }
      } catch (err) {
        errors.push(`${file.name}: Network error`);
      }

      // Progress: end of this file
      const endProgress = Math.round(((i + 1) / files.length) * 100);
      setProgress(endProgress);
    }

    setProgress(100);
    setCurrentFile('');
    setIsUploading(false);

    if (errors.length === 0) {
      setMessageType('success');
      setMessage(`Successfully processed ${successCount} candidate profile(s).`);
    } else if (successCount > 0) {
      setMessageType('success');
      setMessage(
        `Processed ${successCount} of ${files.length} file(s). ${errors.length} failed.`
      );
    } else {
      setMessageType('error');
      setMessage(`All files failed. First error: ${errors[0]}`);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-black/20">
        <div className="flex items-center gap-3 text-sky-400">
          <Sparkles size={20} />
          <p className="text-sm font-semibold uppercase tracking-[0.3em]">Talent Pool Search</p>
        </div>
        <h1 className="mt-4 text-4xl font-semibold">
          Upload resumes and unlock structured candidate insights.
        </h1>
        <p className="mt-3 max-w-2xl text-base text-slate-400">
          Drag in resumes, scrub sensitive contact data before AI analysis, and store candidate
          profiles in Supabase.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Drop zone */}
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`rounded-3xl border-2 border-dashed p-10 text-center transition ${
            isDragging
              ? 'border-sky-500 bg-slate-800/80'
              : 'border-slate-700 bg-slate-900/50'
          }`}
        >
          <UploadCloud className="mx-auto mb-4 text-sky-400" size={40} />
          <h2 className="text-xl font-semibold">Drop resumes here</h2>
          <p className="mt-2 text-slate-400">Supports multiple PDF and DOCX files at once.</p>
          <label className="mt-6 inline-flex cursor-pointer rounded-full bg-sky-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-sky-400">
            Choose files
            <input
              type="file"
              accept=".pdf,.docx"
              multiple
              className="hidden"
              onChange={(event) =>
                setFiles(
                  Array.from(event.target.files ?? []).filter(
                    (file) =>
                      file.name.toLowerCase().endsWith('.pdf') ||
                      file.name.toLowerCase().endsWith('.docx')
                  )
                )
              }
            />
          </label>
        </div>

        {/* Right panel */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold">Selected files</h3>

          {/* File list */}
          <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto">
            {files.length ? (
              files.map((file) => (
                <li
                  key={file.name}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm"
                >
                  <span className="truncate pr-2">{file.name}</span>
                  <CheckCircle2 className="shrink-0 text-emerald-400" size={16} />
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500">No files selected yet.</li>
            )}
          </ul>

          {/* Progress bar — shown while uploading */}
          {isUploading && (
            <div className="mt-5">
              <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                <span className="truncate pr-2">
                  {currentFile ? `Processing: ${currentFile}` : 'Starting…'}
                </span>
                <span className="shrink-0 font-semibold text-sky-400">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-2 rounded-full bg-sky-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-slate-500">
                Please wait — extracting and analysing resume data…
              </p>
            </div>
          )}

          {/* Process button */}
          <button
            onClick={onSubmit}
            disabled={isUploading || !files.length}
            className="mt-5 w-full rounded-full bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Processing {progress}%…
              </span>
            ) : (
              'Process resumes'
            )}
          </button>

          {/* Result message */}
          {message && !isUploading && (
            <div
              className={`mt-4 flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${
                messageType === 'success'
                  ? 'bg-emerald-950/50 text-emerald-400'
                  : 'bg-red-950/50 text-red-400'
              }`}
            >
              {messageType === 'success' ? (
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              ) : (
                <XCircle size={16} className="mt-0.5 shrink-0" />
              )}
              <span>{message}</span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}