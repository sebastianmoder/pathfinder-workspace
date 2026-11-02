import React from "react";
import { Controller } from "react-hook-form";
import { Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface SendButtonProps {
  id: string;
  control: any;
  onClick: any;
}

export default function SendButton(props: SendButtonProps) {
  return (
    <Controller
      name={props.id}
      control={props.control}
      render={({ field }) => (
        <Button {...field} endIcon={<SendIcon />} onClick={props.onClick}>
          Submit
        </Button>
      )}
    />
  );
}
