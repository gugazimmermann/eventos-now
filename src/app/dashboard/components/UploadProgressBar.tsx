interface UploadProgressBarProps {
  progress: number;
}

export default function UploadProgressBar({ progress }: UploadProgressBarProps) {
  return (
    <div className="fixed inset-0 bg-slate-100/75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
          <div
            className="bg-text-strong h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-center text-slate-700">Enviando... {progress}%</p>
      </div>
    </div>
  );
}
