export default function AboutUs() {
  return (
    <section
      id="about"
      className="max-w-[1920px] mx-auto w-full px-4 py-12 lg:h-[625px] relative overflow-hidden flex flex-col items-center gap-8 lg:gap-15 justify-center"
    >
      {/* Title */}
      <div className="text-[#8C7461] text-center text-2xl lg:text-5xl font-medium lg:font-normal lg:font-['Inter'] uppercase">
        Про нас
      </div>

      {/* Text Block */}
      <div className="max-w-[90%] lg:w-[1743px] text-center text-sm lg:text-3xl font-normal lg:font-['Inter'] leading-snug lg:leading-13 ">
        CHARS — український бренд чоловічого одягу, заснований у серпні 2023 року в Києві.
        <br />
        Ми з’явилися під час війни, коли майбутнє було невизначеним, але мрії залишалися сильними.
        <br />
        Шиємо те, що самі хочемо носити — без компромісів.
        <br />
        У власному цеху контролюємо кожен етап виробництва, поєднуючи смарт-кежуал, кежуал-класик і трохи спорту.
        <br />
        Створюємо одяг для різних чоловіків — стриманих і сміливих, класичних і нестандартних.
        <br />
        Різні, але справжні.
      </div>
    </section>
  );
}
