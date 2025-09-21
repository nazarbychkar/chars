export default function SocialMedia() {
  return (
    <section className="max-w-[1920px] mx-auto w-full h-[977px] relative bg-stone-100 overflow-hidden">
      <img
        className="w-80 h-[700.25px] left-[636.38px] top-[158.44px] absolute rounded-[46.43px]"
        src="https://placehold.co/323x700"
      />
      <img
        className="w-96 h-[725.39px] left-[619.94px] top-[145.87px] absolute"
        src="https://placehold.co/352x725"
      />
      <img
        className="w-80 h-[709.92px] left-[247.57px] top-[145.87px] absolute rounded-[53.20px]"
        src="https://placehold.co/327x710"
      />
      <img
        className="w-96 h-[725.39px] left-[235px] top-[142px] absolute"
        src="https://placehold.co/352x725"
      />
      <div className="w-[625px] left-[1061px] top-[217px] absolute inline-flex flex-col justify-start items-start gap-10">
        <div className="self-stretch justify-center">
          <span className="text-stone-500 text-8xl font-normal font-['Inter']">
            Ми ближче,{" "}
          </span>
          <span className="text-black text-8xl font-normal font-['Inter']">
            ніж здається!
          </span>
        </div>
        <div className="w-[465px] justify-center text-black text-3xl font-normal font-['Inter'] capitalize leading-9">
          Лімітована колекція — для тих кому важлива унікальність.
        </div>
      </div>
      <div className="w-20 h-16 left-[1443px] top-[614px] absolute" />
      <img
        className="w-11 h-11 left-[1459px] top-[627px] absolute"
        src="https://placehold.co/46x46"
      />
      <div
        data-property-1="Default"
        className="w-80 h-16 p-2 left-[1061px] top-[613.63px] absolute bg-stone-900 inline-flex justify-center items-center gap-2"
      >
        <div className="text-center justify-center text-white text-2xl font-normal font-['Inter'] uppercase leading-none tracking-tight">
          МИ В TIKTOK
        </div>
      </div>
      <div className="w-20 h-16 left-[1443px] top-[713px] absolute" />
      <img
        className="w-10 h-10 left-[1462px] top-[729px] absolute"
        src="https://placehold.co/39x39"
      />
      <div
        data-property-1="Default"
        className="w-80 h-16 p-2 left-[1061px] top-[713px] absolute bg-stone-900 inline-flex justify-center items-center gap-2"
      >
        <div className="text-center justify-center text-white text-2xl font-normal font-['Inter'] uppercase leading-none tracking-tight">
          МИ В iNSTAGRAM
        </div>
      </div>
    </section>
  );
}
