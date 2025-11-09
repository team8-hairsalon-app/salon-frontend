export default function StyleCard({ style, onClick }) {
  // fallback to snake_case if camelCase missing
  const imageUrl = style.imageUrl ?? style.image_url;
  const priceMin = style.priceMin ?? style.price_min;
  const priceMax = style.priceMax ?? style.price_max;
  const durationMins = style.durationMins ?? style.duration_mins;
  const ratingAvg = style.ratingAvg ?? style.rating_avg;

  return (
    <button
      type="button"
      onClick={() => onClick?.(style)}
      className="card text-left ring-1 ring-rose-100 hover:ring-rose-200 transition"
    >
      {/* Fixed aspect ratio + object-contain so images show fully */}
      <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-white">
        <img
          src={imageUrl}
          alt={style.name}
          loading="lazy"
          className="h-full w-full object-contain p-2 transition group-hover:scale-[1.02]"
        />
        {ratingAvg ? (
          <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            ★ {Number(ratingAvg).toFixed(1)}
          </span>
        ) : null}
      </div>

      <div className="mt-3">
        <h3 className="text-base font-semibold text-salon-dark">{style.name}</h3>
        <p className="text-sm text-salon-dark/70">
          ${priceMin}–{priceMax} • {durationMins} mins
        </p>
      </div>
    </button>
  );
}
