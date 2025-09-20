import Link from "next/link";

export default function TopSale() {
  return (
    <section className="mx-auto w-[1885px] h-[977px] relative overflow-hidden flex flex-col gap-10">
      <div className="flex justify-between mt-20 mx-10 items-center">
        <div className=" text-center justify-center text-5xl font-normal font-['Inter'] uppercase">
          Топ продажів | CHARS
        </div>
        <div className="opacity-70  justify-center  text-xl font-normal font-['Inter'] capitalize leading-normal">
          Улюблені образи наших клієнтів.
        </div>
      </div>

      <div className="w-[1819px] h-0 mx-auto outline-1 outline-offset-[-0.50px]" />

      <div className=" inline-flex justify-around items-center gap-8 mx-10">
        {Array.from({ length: 4 }, (_, i) => (
          <Link
            href="/product"
            key={i}
            className="w-[432px] h-[682px] relative flex flex-col gap-3 group"
          >
            <img
              className="w-[432px] h-[682px] group-hover:filter group-hover:brightness-90 transition brightness duration-300"
              src="https://placehold.co/432x613"
            />
            <div className=" justify-center text-xl font-normal font-['Inter'] capitalize leading-normal">
              шовкова сорочка без рукавів <br />
              1,780.00 ₴
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
