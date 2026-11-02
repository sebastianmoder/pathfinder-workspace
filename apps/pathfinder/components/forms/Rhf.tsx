"use client";

import React from "react";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import InputMessage from "./InputMessage";
import Slider from "./InputSlider";
import ModelSelect from "./ModelSelect";
import SendButton from "./SendButton";

type Inputs = {
  model: string;
  temperature: number;
  maxTokens: number;
  topK: number;
  message: string;
};

export default function Rhf() {
  const [data, setData] = useState<Inputs>();

  // Initialize the useForm hook from react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      model: "gpt-3.5-turbo",
      temperature: 1,
      maxTokens: 256,
      topK: 2,
      message: "",
    },
  });

  // This is where you'd send the data to your API
  const processForm: SubmitHandler<Inputs> = (data) => {
    setData(data);
    console.log(data);
    // Process the form data here (e.g., send it to an API)
  };

  return (
    <section className="max-w-screen-xl mx-auto p-4">
      <form
        onSubmit={handleSubmit(processForm)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <ModelSelect id="model" label="Select Model" control={control} />

        <Slider
          control={control}
          id="temperature"
          label="Temperature"
          min={0}
          max={2}
          step={0.1}
          defaultValue={1}
        />

        <Slider
          control={control}
          id="maxTokens"
          label="Max. Tokens"
          min={128}
          max={2048}
          step={128}
          defaultValue={256}
        />

        <Slider
          control={control}
          id="topK"
          label="Similarity Top K"
          min={1}
          max={20}
          step={1}
          defaultValue={2}
        />

        <div className="sm:col-span-2">
          <InputMessage id="message" label="Message" control={control} />
        </div>

        <SendButton
          id="submit"
          onClick={handleSubmit(processForm)}
          control={control}
        />
      </form>
      <div>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </section>
  );
}
