export function SquigglyDivider() {
  return (
    <div className="w-full flex justify-center py-8">
      <svg viewBox="0 0 400 20" className="w-full max-w-3xl h-6 text-black fill-transparent stroke-current drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
        <path
          d="M0,10 Q25,0 50,10 T100,10 T150,10 T200,10 T250,10 T300,10 T350,10 T400,10"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
