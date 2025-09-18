export default function StyleCard({ style, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(style)}
      className="card text-left ring-1 ring-rose-100 hover:ring-rose-200"
    >
      <div className="relative rounded-xl overflow-hidden">
        <img
          src={style.imageUrl}
          alt={style.name}
          className="h-40 w-full object-cover transition group-hover:scale-[1.02]"
        />
        {style.ratingAvg ? (
          <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            ★ {style.ratingAvg.toFixed(1)}
          </span>
        ) : null}
      </div>
      <div className="mt-3">
        <h3 className="text-base font-semibold text-salon-dark">{style.name}</h3>
        <p className="text-sm text-salon-dark/70">
          ${style.priceMin}–{style.priceMax} • {style.durationMins} mins
        </p>
      </div>
    </button>
  );
}
