export default function YouMightLike() {
  return (
    <section className="max-w-[1920px] w-full mx-auto">
      <div className="flex flex-col gap-10">
        <div className="mx-10 justify-center text-neutral-900 text-7xl font-normal font-['Inter'] leading-[84.91px]">
          Вам може сподобатися
        </div>

        <div className="flex justify-around">
          {Array.from({ length: 4 }, (_, i) => (
            <div className="w-96 h-[682px] relative">
              <img
                className="w-96 h-[613px]"
                src="https://placehold.co/432x613"
              />
              <div className="justify-center text-xl font-normal font-['Inter'] capitalize leading-normal">
                шовкова сорочка без рукавів
              </div>
              <div className="w-24 h-4 justify-center text-xl font-normal font-['Inter'] leading-none">
                1,780.00 ₴
              </div>
            </div>
          ))}
        </div>

        <div className="w-[1824px] h-[679px] bg-gray-300 relative overflow-hidden mx-auto">
          <div className="w-80 h-16 p-2 left-[738px] top-[502px] absolute bg-white inline-flex justify-center items-center gap-2">
            <div className="text-center justify-center text-black text-2xl font-normal font-['Inter'] uppercase leading-none tracking-tight">
              більше товарів
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
