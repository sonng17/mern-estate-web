import { FaPhoneVolume } from "react-icons/fa6";
import { SiHelpdesk } from "react-icons/si";
import { FaQuestionCircle } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-slate-200 shadow-md h-40">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] pt-6 mx-auto ">
        <div className="pl-20">
          <span className="text-slate-500 text-3xl font-bold ">Hanoi</span>
          <span className="text-slate-700 text-3xl font-bold ">Apartment</span>
          <div className="flex gap-3">
            <FaLocationDot className="size-4" />
            <div className="font-semibold text-black">
              Bắc Từ Liêm, Hà Nội
            </div>
          </div>
        </div>

        {/* Here */}
        <div className="flex gap-4">
          <div className="flex items-center justify-center">
            <FaPhoneVolume className="size-8" />
          </div>
          <div className="flex justify-center flex-col">
            <div className="font-semibold text-sm sm:text-xl text-slate-500">
              Hotline
            </div>
            <div className="font-semibold text-black">0989170425</div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center justify-center">
            <FaQuestionCircle className="size-8" />
          </div>
          <div className="flex justify-center flex-col">
            <div className="font-semibold text-sm sm:text-xl text-slate-500">
              Hỗ trợ khách hàng
            </div>
            <div className="font-semibold text-black">
              trogiup.hanoiapartment.com
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center justify-center">
            <SiHelpdesk className="size-8" />
          </div>
          <div className="flex justify-center flex-col">
            <div className="font-semibold text-sm sm:text-xl text-slate-500">
              Chăm sóc khách hàng
            </div>
            <div className="font-semibold text-black">
              hotro@hanoiapartment.com
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
