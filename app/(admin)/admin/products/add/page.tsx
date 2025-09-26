"use client";

import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
import MultiSelect from "@/components/admin/form/MultiSelect";
import CheckboxComponents from "@/components/admin/form/form-elements/CheckboxComponents";
import DefaultInputs from "@/components/admin/form/form-elements/DefaultInputs";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";
import FileInputExample from "@/components/admin/form/form-elements/FileInputExample";
import InputGroup from "@/components/admin/form/form-elements/InputGroup";
import InputStates from "@/components/admin/form/form-elements/InputStates";
import RadioButtons from "@/components/admin/form/form-elements/RadioButtons";
import SelectInputs from "@/components/admin/form/form-elements/SelectInputs";
import TextAreaInput from "@/components/admin/form/form-elements/TextAreaInput";
import ToggleSwitch from "@/components/admin/form/form-elements/ToggleSwitch";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import { Metadata } from "next";
import React, { useState } from "react";

// export const metadata: Metadata = {
//   title: "Next.js Form Elements | TailAdmin - Next.js Dashboard Template",
//   description:
//     "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
// };

const multiOptions = [
  { value: "1", text: "XL", selected: false },
  { value: "2", text: "L", selected: false },
  { value: "3", text: "M", selected: false },
  { value: "4", text: "S", selected: false },
  { value: "5", text: "XS", selected: false },
];

export default function FormElements() {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");

  return (
    <div>
      <PageBreadcrumb pageTitle="Додати Товар" />
      <div className="flex justify-around">
        <div className="w-1/2 p-4">
          <ComponentCard title="Заповніть дані">
            <Label>Назва Товару</Label>
            <Input type="text" />
            <Label>Опис</Label>
            <TextArea
              value={message}
              onChange={(value) => setMessage(value)}
              rows={6}
            />
            <Label>Ціна</Label>
            <Input type="number" />
            <Label>Розміри</Label>
            <MultiSelect
              label="Multiple Select Options"
              options={multiOptions}
              defaultSelected={["1", "3"]}
              onChange={(values) => setSelectedValues(values)}
            />
          </ComponentCard>
        </div>

        <div className="w-1/2 p-4">
          <DropzoneComponent />
        </div>
      </div>
      {/* <div className="space-y-6"> */}
      {/* <DefaultInputs /> */}
      {/* <SelectInputs />
          <TextAreaInput />
          <InputStates />
        </div>
        <div className="space-y-6">
          <InputGroup />
          <FileInputExample />
          <CheckboxComponents />
          <RadioButtons />
          <ToggleSwitch />
          <DropzoneComponent />
        </div> */}
    </div>
  );
}
