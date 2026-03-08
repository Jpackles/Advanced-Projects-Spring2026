"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";

// Each idea needs a unique id so we can remove the right one later
type Idea = {
  id: number;
  text: string;
};

export default function IdeaBoard() {
  // State 1: holds whatever the user is typing in the input field
  const [inputValue, setInputValue] = useState<string>("");

  // State 2: holds the array of submitted ideas
  const [ideas, setIdeas] = useState<Idea[]>([]);

  // ADDING an idea — uses the spread operator to build a brand-new array
  const handleAddIdea = () => {
    if (inputValue.trim() === "") return; // don't add empty ideas

    const newIdea: Idea = {
      id: Date.now(), // quick unique id using the current timestamp
      text: inputValue.trim(),
    };

    // ✅ Spread operator: copy all existing ideas + add the new one at the end
    setIdeas([...ideas, newIdea]);

    // Clear the input field after submitting
    setInputValue("");
  };

  // REMOVING an idea — uses .filter() to create a new array without the deleted idea
  const handleDeleteIdea = (idToRemove: number) => {
    // ✅ .filter(): keep every idea whose id does NOT match the one we want to remove
    const filteredIdeas = ideas.filter((idea) => idea.id !== idToRemove);
    setIdeas(filteredIdeas);
  };

  // Allow pressing Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddIdea();
    }
  };

  return (
        <main className="min-h-screen bg-blue-900 p-8">
        <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">💡 Idea Board</h1>
        <p className="text-gray-500 mb-8">Submit your project ideas and manage them below.</p>

        {/* ── Input Area ── */}
        <div className="flex gap-3 mb-8">
          <Input
            placeholder="Type your idea here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button color="primary" onPress={handleAddIdea}>
            Add Idea
          </Button>
        </div>

        {/* ── Display Area ── */}
        {ideas.length === 0 ? (
          <p className="text-center text-gray-400 mt-16">
            No ideas yet. Add one above!
          </p>
        ) : (
          <div className="grid gap-4">
            {/* ✅ .map(): loop over the ideas array to render a Card for each one */}
            {ideas.map((idea) => (
              <Card key={idea.id} shadow="sm">
                <CardHeader className="pb-0">
                  <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                    Project Idea
                  </span>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-800 text-lg">{idea.text}</p>
                </CardBody>
                <CardFooter className="pt-0 justify-end">
                  <Button
                    color="danger"
                    variant="light"
                    size="sm"
                    onPress={() => handleDeleteIdea(idea.id)}
                  >
                    Dismiss
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}