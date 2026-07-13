import React, { useState, useEffect } from 'react';
import { formatTime } from '../../utils/sudokuHelpers';

const Timer = ({ seconds }) => {
  return (
    <div className="rounded-full font-bold tabular-nums tracking-wide bg-white/7 border-[1.5px] border-white/12 px-[0.9rem] py-[0.3rem] text-[0.82rem] text-white/55 flex items-center gap-1.5">
      <span>⏱️</span>
      <span>{formatTime(seconds)}</span>
    </div>
  );
};

export default Timer;
