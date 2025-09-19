export default function Hero() {
  return (
    <section>
      <img
        className="w-[1920px] h-[1080px]"
        src="https://placehold.co/1920x1080"
      />
      <div className="w-[1002px] h-52 bg-black/40 rounded-full blur-[88.50px]" />
      <div
        data-property-1="Default"
        className="w-72 h-16 p-2 bg-white inline-flex justify-center items-center gap-2"
      >
        <div className="text-center justify-center text-stone-900 text-2xl font-normal font-['Inter'] capitalize leading-none tracking-tight">
          каталог
        </div>
      </div>

      <div className="w-[1920px] h-[1080px] bg-[url('https://placehold.co/1920x1080')"></div>
    </section>
  );
}
