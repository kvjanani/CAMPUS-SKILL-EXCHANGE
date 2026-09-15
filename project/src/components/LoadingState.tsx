import Spinner from './Spinner';

export default function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Spinner className="h-8 w-8 text-emerald-600" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
