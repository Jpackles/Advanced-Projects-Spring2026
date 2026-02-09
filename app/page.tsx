"use client";

import { Card } from "@heroui/react";
import { Divider } from "@heroui/react";
import { Checkbox } from "@heroui/react";
import { Button } from "@heroui/react";
import { Spacer } from "@heroui/react";

export default function Home() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <Card className="p-5 w-80">
        <h1 className="text-sm font-medium">My Todo List</h1>

        <Spacer y={1} />

        <Divider />

        <Spacer y={1} />

        <div className="flex flex-col gap-3">
          <Checkbox className="w-full">Finish homework</Checkbox>
          <Checkbox className="w-full">Study for test</Checkbox>
          <Checkbox className="w-full">Lift</Checkbox>
          <Checkbox className="w-full">Swim practice</Checkbox>
          <Checkbox className="w-full">Email teacher</Checkbox>
          <Checkbox className="w-full">Work on project</Checkbox>
        </div>

        <Spacer y={1.5} />

        <Button size="sm" fullWidth>
          Done
        </Button>
      </Card>
    </div>
  );
}