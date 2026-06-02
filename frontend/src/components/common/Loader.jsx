import BrandLogo from './BrandLogo';

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <div className="mx-auto mb-4 w-28">
          <BrandLogo className="mx-auto" variant="full" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="travel-loader-dot" />
          <span className="travel-loader-dot" />
          <span className="travel-loader-dot" />
        </div>
        <p className="mt-3 text-sm text-slate-600">Preparing your Weekend Mojo…</p>
      </div>
    </div>
  );
}