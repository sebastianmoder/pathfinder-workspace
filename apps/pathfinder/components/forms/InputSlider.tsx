import React from "react";
import { Controller } from "react-hook-form";
import { InputLabel } from "@mui/material";
import Slider from "@mui/material/Slider";

type SliderProps = {
  control: any;
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
};

export default function InputSlider(props: SliderProps) {
  return (
    <Controller
      name={props.id}
      control={props.control}
      render={({ field }) => (
        <div id={props.id}>
          <InputLabel id="">{props.label}</InputLabel>
          <Slider
            {...field}
            id={props.id}
            aria-label={props.label}
            min={props.min}
            max={props.max}
            step={props.step}
            defaultValue={props.defaultValue}
            valueLabelDisplay="auto"
          />
        </div>
      )}
    />
  );
}
