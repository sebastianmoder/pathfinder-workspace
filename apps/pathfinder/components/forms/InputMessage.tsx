import React from "react";
import TextField from "@mui/material/TextField";
import { Controller } from "react-hook-form";

type InputMessageProps = {
  id: string;
  label: string;
  control: any;
};

export default function InputMessage(props: InputMessageProps) {
  return (
    <Controller
      name={props.id}
      control={props.control}
      render={({ field }) => (
        <TextField
          {...field}
          id={props.id}
          label={props.label}
          fullWidth
          multiline
          maxRows={6}
        />
      )}
    />
  );
}
