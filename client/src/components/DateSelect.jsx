import React, { useState } from "react";
import BlurCircle from "./BlurCircle";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DateSelect = ({ dateTime, id }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const onBookHandler = () => {
    if (!selected) {
      return toast("Please select a date!");
    }
    navigate(`/movies/${id}/${selected}`);
    scrollTo(0, 0);
  };
  return (
    <div id="dateSelect" className="pt-30 ">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle top="100px" right="0px" />
        <div className="max-md:max-w-[290px]">
          <p className="text-lg font-semibold max-md:ml-2">Choose Date</p>
          <div className="flex items-center  gap-4 text-sm mt-5">
            <ChevronLeftIcon
              size={35}
              strokeWidth={3}
              className="text-primary "
            />
            <span className="flex md:max-w-lg max-w-[220px] gap-5 overflow-x-scroll">
              {Object.keys(dateTime).map((date) => (
                <button
                  onClick={() => setSelected(date)}
                  key={date}
                  className={`flex flex-col items-center justify-center h-14 w-14  aspect-square rounded cursor-pointer ${selected === date ? "bg-primary text-white" : "border border-primary/70"}`}
                >
                  {" "}
                  <span>{new Date(date).getDate()}</span>
                  <span>
                    {new Date(date).toLocaleString("en-US", { month: "short" })}
                  </span>
                </button>
              ))}
            </span>
            <ChevronRightIcon
              size={35}
              strokeWidth={3}
              className="text-primary"
            />
          </div>
        </div>
        <button
          onClick={onBookHandler}
          className="bg-primary text-white px-8 py-2 md:mt-10 rounded hover:bg-primary/90 transition-all cursor-pointer"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default DateSelect;
