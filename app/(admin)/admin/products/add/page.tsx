import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
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
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Form Elements | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function FormElements() {
  return (
    <div>
      <PageBreadcrumb pageTitle="From Elements" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div>
          <Label>Name</Label>
          <Input type="text" />
        </div>
        {/* <div className="space-y-6">
          <DefaultInputs />
          <SelectInputs />
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
    </div>
  );
}
