export default function Product() {
  return (
    <section>
      <div className="flex justify-around p-10">
        <div className="relative">
          <img
            className="w-[800px] h-[1160px]"
            src="https://placehold.co/800x1160"
          />
          <button className="text-7xl absolute top-1/24 left-1/8">{"<"}</button>
          <button className="text-7xl absolute top-1/24 right-1/8">
            {">"}
          </button>
        </div>

        <div className="flex flex-col gap-10">
          <div className="justify-center text-xl font-normal font-['Helvetica'] leading-relaxed tracking-wide">
            В наявності
          </div>
          <div className="w-[467px] justify-center text-7xl font-normal font-['Inter'] capitalize leading-[84.91px]">
            Спортивні штани(039)
          </div>
          <div className="w-full flex justify-start border-b p-5">
            <div className="w-36 h-6 justify-center text-red-500 text-2xl font-normal font-['Helvetica'] leading-relaxed tracking-wide">
              3,380.00 ₴
            </div>
            <div className="w-32 h-6 justify-center text-2xl font-normal font-['Helvetica'] line-through leading-relaxed tracking-wide">
              3,380.00 ₴
            </div>
          </div>

          <div className="w-52 h-3.5 justify-center text-2xl font-normal font-['Inter'] uppercase leading-none tracking-tight">
            Оберіть розмір
          </div>
          <div className="flex justify-around gap-3">
            <div className="w-24 p-4 border  flex text-center justify-center text-xl font-normal font-['Inter'] uppercase leading-none tracking-tight">
              xl
            </div>
            <div className="w-24 p-4 border  flex text-center justify-center text-xl font-normal font-['Inter'] uppercase leading-none tracking-tight">
              l
            </div>
            <div className="w-24 p-4 border  flex text-center justify-center text-xl font-normal font-['Inter'] uppercase leading-none tracking-tight">
              m
            </div>
            <div className="w-24 p-4 border  flex text-center justify-center text-xl font-normal font-['Inter'] uppercase leading-none tracking-tight">
              s
            </div>
            <div className="w-24 p-4 border  flex text-center justify-center text-xl font-normal font-['Inter'] uppercase leading-none tracking-tight">
              xs
            </div>
          </div>

          <div className="left-[291px] bg-black p-3 text-center justify-center text-white text-2xl font-medium font-['Inter'] uppercase leading-snug tracking-tight">
            в кошик
          </div>

          <div className="w-[522px] h-64 ">
            <div className="mb-5 justify-center text-3xl font-normal font-['Inter'] uppercase leading-none tracking-tight">
              опис
            </div>
            <div className="w-[521px] h-52 justify-center text-2xl font-normal font-['Inter'] leading-9 tracking-wide">
              Базова сорочка з шифону на ґудзиках. Колір шоколадний. Склад
              тканини: 80% віскоза, 20% шовк. Розміри S,M,L,XL. Виготовлено в
              Україні. Сезоність: літо, осінь, весна, зима
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
