import { use } from "react";
import { useState, useEffect, useRef } from "react";
import {
  GiNextButton,
  GiPreviousButton,
  GiPlayButton,
  GiPauseButton,
} from "react-icons/gi";

function Timeline({ allowedYears, setNewYear }) {
  const timelineStart = Math.min(...allowedYears) - 1; // One year before the minimum year
  const timelineEnd = Math.max(...allowedYears) + 1; // One year after the maximum year

  const [allYears, setAllYears] = useState(false);
  // console.log(allowedYears);
  const [rangeValue, setRangeValue] = useState(allowedYears[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  // console.log("range value", rangeValue, allowedYears[0]);

  useEffect(() => {
    setRangeValue(allowedYears[0]);
  }, [allowedYears]);

  // useEffect(() => {
  //   console.log("Timeline range updated:", timelineStart, timelineEnd);
  // }, [allowedYears]);
  // Map year to proportional range value
  const yearToValue = (year) =>
    ((year - timelineStart) / (timelineEnd - timelineStart)) * 100;

  // Find closest year when slider moves
  const snapToYear = (value) => {
    const year = Math.round(
      (value / 100) * (timelineEnd - timelineStart) + timelineStart
    );
    return allowedYears.reduce((closest, curr) =>
      Math.abs(curr - year) < Math.abs(closest - year) ? curr : closest
    );
  };

  const handleRangeChange = (e) => {
    if (!allYears) {
      const snappedYear = snapToYear(e.target.value);
      setRangeValue(snappedYear);
      setNewYear(snappedYear);
    }
  };

  // Logic for Next and Prev year buttons
  const handleNextYear = () => {
    if (allYears) return;
    const currentIndex = allowedYears.indexOf(rangeValue);
    if (currentIndex < allowedYears.length - 1) {
      const nextYear = allowedYears[currentIndex + 1];
      setRangeValue(nextYear);
      setNewYear(nextYear);
    }
  };

  const handlePrevYear = () => {
    if (allYears) return;
    const currentIndex = allowedYears.indexOf(rangeValue);
    if (currentIndex > 0) {
      const prevYear = allowedYears[currentIndex - 1];
      setRangeValue(prevYear);
      setNewYear(prevYear);
    }
  };

  // logic for play/pause button
  const handlePlay = () => {
    if (isPlaying || allYears) {
      setIsPlaying(false);
      if (window.playInterval) {
        clearInterval(window.playInterval); // Clear the interval immediately
        window.playInterval = null; // Reset the reference
      }
      return;
    }

    setIsPlaying(true);
    let index = allowedYears.indexOf(rangeValue);

    window.playInterval = setInterval(() => {
      if (index >= allowedYears.length - 1) {
        clearInterval(window.playInterval);
        setIsPlaying(false);
        window.playInterval = null; // Reset the reference
        return;
      }
      index += 1;
      const nextYear = allowedYears[index];
      setRangeValue(nextYear);
      setNewYear(nextYear);
    }, 800);
  };

  useEffect(() => {
    if (allYears) {
      handlePlay;
    }
  }, [allYears]);

  // create 10 year ticks
  const tick = Math.round((timelineEnd - timelineStart) / 5);

  // ensure tick is at least 1 year (to avoid infinite loop)
  const gapForTicks = tick < 1 ? 1 : tick;
  const constantYearTicks = [];

  for (let year = timelineStart; year <= timelineEnd; year += gapForTicks) {
    constantYearTicks.push(year);
  }
  const bigYearTicks = [];
  for (let year = timelineStart; year <= timelineEnd; year += gapForTicks) {
    bigYearTicks.push(year);
  }

  // TODO7: add ticks for all allowed years
  // // const allYearTicks = [...constantYearTicks, ...allowedYears];
  // const allYearTicks = allowedYears;

  const timelineRef = useRef(null);
  const [timelineWidth, setTimelineWidth] = useState(0);

  useEffect(() => {
    // Update the timeline width whenever the component is mounted or resized
    if (timelineRef.current) {
      setTimelineWidth(timelineRef.current.offsetWidth);
    }
  }, [timelineRef.current]);

  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.closest('button')) {
      return;
    }
    
    const container = containerRef.current;
    const parent = container.parentElement;
    const containerRect = container.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    console.log("containerRect:", containerRect);
    console.log("parentRect:", parentRect);
    // preserve visual position before removing right/bottom
    container.style.left = `${containerRect.left - parentRect.left}px`;
    container.style.top = `${containerRect.top - parentRect.top}px`;
    container.style.bottom = "auto";
    container.style.right = "auto";

    const offsetX = e.clientX - containerRect.left;
    const offsetY = e.clientY - containerRect.top;

    const handleMouseMove = (e) => {
      // Get the bounds of the parent container
      const parentRect = parent.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const newLeft = e.clientX - parentRect.left - offsetX;
      const newTop = e.clientY - parentRect.top - offsetY;

      // Calculate boundaries
      const minLeft = 242; // 0 if don't care abt sidebar
      const maxLeft = parentRect.width - containerRect.width;
      const minTop = 0;
      const maxTop = parentRect.height - containerRect.height;

      // Apply bounds
      container.style.left = `${Math.min(
        Math.max(newLeft, minLeft),
        maxLeft
      )}px`;
      container.style.top = `${Math.min(Math.max(newTop, minTop), maxTop)}px`;
    };

    const handleMouseUp = () => {
      container.classList.remove("dragging");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className="overflow-hidden absolute bottom-2.5 right-2.5 z-10 cursor-grab bg-base-100
      shadow-md border border-primary p-2.5 rounded-md w-96 select-none ${isDragging ? 'dragging' : ''}"
      ref={containerRef}
      onMouseDown={handleMouseDown}
    >
      <div className="flex flex-row w-full h-4 mb-2 items-center justify-center">
        <div className="justify-center items-center text-center font-semibold text-sm">
          {allYears
            ? "all years (" +
              Math.min(...allowedYears) +
              "-" +
              Math.max(...allowedYears) +
              ")"
            : "current year: " + rangeValue}
        </div>
        <div
          // onClick={handlePlayAllYears}
          className="absolute left-3/4"
        >
          <div className="form-control">
            <label className="label cursor-pointer space-x-2">
              <input
                type="checkbox"
                // defaultChecked
                onChange={(e) => {
                  if (e.target.checked) {
                    setAllYears(true);
                    setNewYear(["all years"]);
                  } else {
                    setAllYears(false);
                    setNewYear([rangeValue]); // Reset to range value when unchecked
                  }
                }}
                className="checkbox checkbox-xs"
              />
              <span className="label-text"> all years</span>
            </label>
          </div>
        </div>
      </div>

      {/* Existing Timeline content */}
      <input
        type="range"
        min={0}
        max="100"
        value={allYears ? timelineEnd : yearToValue(rangeValue)}
        onChange={handleRangeChange}
        className={`range range-xs px-1 range-primary py-2 ${
          allYears ? "opacity-50" : ""
        }`}
      />
      <div
        ref={timelineRef}
        className="relative w-full h-10 flex items-center justify-between text-xs right-1"
      >
        {constantYearTicks.map((year, index) => {
          const yearRange = (timelineEnd - timelineStart) * 1.05;
          const position = ((year - timelineStart) / yearRange) * timelineWidth;

          return (
            <div
              key={index}
              className="flex flex-col items-center absolute"
              style={{ left: `${position}px` }}
            >
              {/* {bigYearTicks.includes(year) ? (
                <div className="flex flex-col  items-center justify-center">
                  <div className="h-4 w-px mt-1 bg-black"></div>
                  <span className="mt-1">{year}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-4 w-px -mt-3 bg-black"></div>
              )} */}
              <div className="h-4 w-px mt-1 bg-black"></div>
              <span className="mt-1">{year}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center mt-2">
        <button
          onClick={handlePrevYear}
          className={`btn btn-sm btn-ghost disabled:btn-ghost disabled:opacity-50 ${
            isPlaying ? "" : "-mr-1"
          }`}
          disabled={allowedYears.indexOf(rangeValue) === 0 || isPlaying}
        >
          <GiPreviousButton />
        </button>
        <button
          onClick={handlePlay}
          className={`btn btn-sm btn-ghost ${isPlaying ? "" : "ml-1"}`}
        >
          {isPlaying ? <GiPauseButton /> : <GiPlayButton />}
        </button>
        <button
          onClick={handleNextYear}
          className="btn btn-sm btn-ghost disabled:btn-ghost disabled:opacity-50"
          disabled={
            allowedYears.indexOf(rangeValue) === allowedYears.length - 1 ||
            isPlaying
          }
        >
          <GiNextButton />
        </button>
      </div>
    </div>
  );
}

export default Timeline;
